const API_URL = (
  import.meta.env.VITE_API_BASE_URL ||
  "https://ai-writing-assistant-production-5bbc1087.up.railway.app/api"
).replace(/\/$/, "");

// Standard API request helper
async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data;
}

export function checkHealth() {
  return request("/health");
}

export function transformText(payload) {
  return request("/transform", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchDefaultPrompt(payload) {
  return request("/prompts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

// Read real-time SSE responses
export async function streamTransform(
  payload,
  onChunk,
  signal
) {
  const response = await fetch(
    `${API_URL}/transform/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal,
    }
  );

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(error.error || "Streaming failed");
  }

  if (!response.body) {
    throw new Error("Streaming is not supported");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  let buffer = "";
  let finalResult = null;

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        buffer += decoder.decode();
        break;
      }

      buffer += decoder.decode(value, { stream: true });

      // Separate complete SSE messages
      const events = buffer.split("\n\n");

      // Preserve incomplete events for the next chunk
      buffer = events.pop() || "";

      for (const event of events) {
        if (!event.startsWith("data: ")) continue;

        const data = JSON.parse(event.slice(6));

        if (data.type === "chunk") {
          onChunk(data.text);
        }

        if (data.type === "done") {
          finalResult = data.result;
        }

        if (data.type === "error") {
          throw new Error(data.message);
        }
      }
    }

    if (!finalResult) {
      throw new Error("The response ended unexpectedly");
    }

    return finalResult;
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

// Send the same request to both AI providers
export function compareProviders(payload) {
  return Promise.all([
    transformText({
      ...payload,
      provider: "anthropic",
    }),

    transformText({
      ...payload,
      provider: "openai",
    }),
  ]);
}