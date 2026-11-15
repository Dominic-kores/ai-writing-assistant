import "dotenv/config";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

const maxTokens = Number(process.env.MAX_TOKENS || 2048);

// Initialize providers only when API keys are available
const anthropic = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
      timeout: 60000,
      maxRetries: 1,
    })
  : null;

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 60000,
      maxRetries: 1,
    })
  : null;

const models = {
  anthropic: process.env.ANTHROPIC_MODEL || "claude-haiku-5-5",
  openai: process.env.OPENAI_MODEL || "gpt-4.1-mini",
};

// Report whether each provider is configured
export function getProviderStatus() {
  return {
    anthropic: {
      configured: Boolean(anthropic),
      model: models.anthropic,
    },
    openai: {
      configured: Boolean(openai),
      model: models.openai,
    },
  };
}

function validateProvider(provider) {
  const status = getProviderStatus();

  if (!status[provider]?.configured) {
    const error = new Error(`${provider} is not configured`);
    error.status = 503;
    throw error;
  }
}

// Standardize response structure
function normalizeResponse({
  text,
  provider,
  model,
  inputTokens,
  outputTokens,
  start,
}) {
  return {
    text,
    provider,
    model,
    usage: {
      inputTokens,
      outputTokens,
      totalTokens:
        inputTokens == null || outputTokens == null
          ? null
          : inputTokens + outputTokens,
    },
    responseTime: Date.now() - start,
  };
}

// ===============================
// Standard non-streaming response
// ===============================

export async function generateText({
  provider,
  systemPrompt,
  text,
  temperature = 0.5,
}) {
  validateProvider(provider);

  const start = Date.now();

  if (provider === "anthropic") {
    const response = await anthropic.messages.create({
      model: models.anthropic,
      max_tokens: maxTokens,
      // temperature, // Claude API (2026-10-21) rejects sampling params
      system: systemPrompt,
      messages: [
        { role: "user", content: text },
      ],
    });

    const output = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return normalizeResponse({
      text: output,
      provider,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      start,
    });
  }

  const response = await openai.chat.completions.create({
    model: models.openai,
    temperature,
    max_completion_tokens: maxTokens,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text },
    ],
  });

  return normalizeResponse({
    text: response.choices[0]?.message?.content || "",
    provider,
    model: response.model,
    inputTokens: response.usage?.prompt_tokens ?? null,
    outputTokens: response.usage?.completion_tokens ?? null,
    start,
  });
}

// ===============================
// Streaming response
// ===============================

export async function streamText({
  provider,
  systemPrompt,
  text,
  temperature = 0.5,
  onChunk,
  signal,
}) {
  validateProvider(provider);

  const start = Date.now();

  if (provider === "anthropic") {
    const stream = anthropic.messages.stream(
      {
        model: models.anthropic,
        max_tokens: maxTokens,
        // temperature, // Claude API (2026-10-21) rejects sampling params
        system: systemPrompt,
        messages: [
          { role: "user", content: text },
        ],
      },
      { signal }
    );

    // Send text as soon as it is generated
    stream.on("text", (chunk) => {
      onChunk(chunk);
    });

    const response = await stream.finalMessage();

    const output = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("");

    return normalizeResponse({
      text: output,
      provider,
      model: response.model,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
      start,
    });
  }

  const stream = await openai.chat.completions.create(
    {
      model: models.openai,
      temperature,
      max_completion_tokens: maxTokens,
      stream: true,
      stream_options: {
        include_usage: true,
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: text },
      ],
    },
    { signal }
  );

  let output = "";
  let inputTokens = null;
  let outputTokens = null;
  let model = models.openai;

  for await (const chunk of stream) {
    model = chunk.model || model;

    const content = chunk.choices[0]?.delta?.content || "";

    if (content) {
      output += content;
      onChunk(content);
    }

    if (chunk.usage) {
      inputTokens = chunk.usage.prompt_tokens;
      outputTokens = chunk.usage.completion_tokens;
    }
  }

  return normalizeResponse({
    text: output,
    provider,
    model,
    inputTokens,
    outputTokens,
    start,
  });
}