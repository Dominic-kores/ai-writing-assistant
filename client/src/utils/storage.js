const HISTORY_KEY = "writeflow-history";
const PROMPTS_KEY = "writeflow-prompts";

function readStorage(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

export function loadHistory() {
  const history = readStorage(HISTORY_KEY, []);

  return Array.isArray(history) ? history.slice(0, 20) : [];
}

export function saveHistory(history) {
  localStorage.setItem(
    HISTORY_KEY,
    JSON.stringify(history.slice(0, 20))
  );
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function loadPrompts() {
  return readStorage(PROMPTS_KEY, {});
}

export function savePrompts(prompts) {
  localStorage.setItem(
    PROMPTS_KEY,
    JSON.stringify(prompts)
  );
}