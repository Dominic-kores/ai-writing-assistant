import { useEffect, useRef, useState } from "react";

import {
  PenTool,
  Sparkles,
  GitCompare,
  Square,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

import TextInput from "./components/TextInput";
import OperationsPanel from "./components/OperationsPanel";
import OutputDisplay from "./components/OutputDisplay";
import ProviderSelect from "./components/ProviderSelect";
import HistoryPanel from "./components/HistoryPanel";
import PromptSettings from "./components/PromptSettings";

import {
  checkHealth,
  streamTransform,
  compareProviders,
} from "./utils/api";

import {
  loadHistory,
  saveHistory,
  clearHistory,
  loadPrompts,
  savePrompts,
} from "./utils/storage";

import "./App.css";

export default function App() {
  // ===============================
  // Application state
  // ===============================

  const [text, setText] = useState("");
  const [operation, setOperation] = useState("summarize");
  const [provider, setProvider] = useState("openai");

  const [options, setOptions] = useState({
    length: "medium",
    tone: "professional",
    language: "english",
    platform: "linkedin",
  });

  const [result, setResult] = useState(null);
  const [comparison, setComparison] = useState([]);

  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);
  const [error, setError] = useState("");

  const [history, setHistory] = useState(loadHistory);
  const [customPrompts, setCustomPrompts] = useState(loadPrompts);

  const [providerStatus, setProviderStatus] = useState(null);
  const [serverOnline, setServerOnline] = useState(false);

  const controllerRef = useRef(null);

  const busy = loading || comparing;

  // Use a separate custom prompt for each operation variant
  const promptKey = [
    operation,
    operation === "summarize" ? options.length :
    operation === "change-tone" ? options.tone :
    operation === "translate" ? options.language :
    operation === "social-media" ? options.platform :
    "default",
  ].join(":");

  // ===============================
  // Check backend connection
  // ===============================

  useEffect(() => {
    checkHealth()
      .then((data) => {
        setProviderStatus(data.providers);
        setServerOnline(true);
      })
      .catch(() => {
        setServerOnline(false);
      });

    return () => {
      controllerRef.current?.abort();
    };
  }, []);

  // ===============================
  // Persist localStorage
  // ===============================

  useEffect(() => {
    try {
      saveHistory(history);
    } catch {
      setError("Unable to save history to browser storage.");
    }
  }, [history]);

  useEffect(() => {
    try {
      savePrompts(customPrompts);
    } catch {
      setError("Unable to save custom prompts.");
    }
  }, [customPrompts]);

  // ===============================
  // Create API request payload
  // ===============================

  function buildPayload() {
    return {
      text: text.trim(),
      operation,
      options,
      provider,
      customPrompt: customPrompts[promptKey] || undefined,
    };
  }

  // ===============================
  // Add completed result to history
  // ===============================

  function addToHistory(output, payload) {
    const item = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      operation: payload.operation,
      options: payload.options,
      inputPreview: payload.text.slice(0, 100),
      provider: output.provider,
      result: output,
    };

    setHistory((previous) => [
      item,
      ...previous,
    ].slice(0, 20));
  }

  // ===============================
  // Streaming transformation
  // ===============================

  async function handleTransform() {
    if (!text.trim() || busy) return;

    setLoading(true);
    setError("");
    setResult(null);
    setComparison([]);

    const controller = new AbortController();
    controllerRef.current = controller;

    const payload = buildPayload();

    try {
      const output = await streamTransform(
        payload,

        // Update the display for every incoming chunk
        (chunk) => {
          setResult((previous) => ({
            ...previous,
            text: (previous?.text || "") + chunk,
            provider: payload.provider,
          }));
        },

        controller.signal
      );

      setResult(output);
      addToHistory(output, payload);
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Generation stopped.");
      } else {
        setError(err.message);
      }

      // Avoid displaying incomplete text as a final result
      setResult(null);
    } finally {
      controllerRef.current = null;
      setLoading(false);
    }
  }

  function stopGeneration() {
    controllerRef.current?.abort();
  }

  // ===============================
  // Compare both providers
  // ===============================

  async function handleCompare() {
    if (!text.trim() || busy) return;

    setComparing(true);
    setError("");
    setResult(null);
    setComparison([]);

    const payload = buildPayload();

    try {
      const outputs = await compareProviders(payload);

      setComparison(outputs);

      outputs.forEach((output) => {
        addToHistory(output, payload);
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setComparing(false);
    }
  }

  // ===============================
  // History management
  // ===============================

  function handleHistorySelect(item) {
    setComparison([]);
    setResult(item.result);
    setOperation(item.operation);
    setOptions(item.options);
    setProvider(item.provider);
    setError("");
  }

  function handleClearHistory() {
    try {
      clearHistory();
      setHistory([]);
    } catch {
      setError("Unable to clear history.");
    }
  }

  // ===============================
  // Custom prompts
  // ===============================

  function handleSavePrompt(prompt) {
    setCustomPrompts((previous) => {
      const updated = { ...previous };

      if (prompt) {
        updated[promptKey] = prompt;
      } else {
        delete updated[promptKey];
      }

      return updated;
    });
  }

  // ===============================
  // Application interface
  // ===============================

  return (
    <div className="min-h-screen bg-ink-50 text-ink-800">

      {/* Navigation */}

      <header className="sticky top-0 z-20 border-b
        border-ink-200 bg-white/95 backdrop-blur">

        <div className="max-w-7xl mx-auto px-5 py-4
          flex items-center justify-between gap-3">

          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-brand-600
              p-3 text-white shadow-lg shadow-brand-200">

              <PenTool size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                WriteFlow <span className="text-brand-600">AI</span>
              </h1>

              <p className="text-xs text-ink-500">
                Your intelligent writing workspace
              </p>
            </div>
          </div>

          <span className={`flex items-center gap-2 text-xs
            rounded-full px-3 py-2 ${
              serverOnline
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}>

            <span className="w-2 h-2 rounded-full bg-current" />

            {serverOnline ? "Server online" : "Unavailable"}
          </span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-5 py-8 space-y-6">

        {/* Hero section */}

        <section className="rounded-3xl bg-linear-to-br
          from-ink-950 via-brand-950 to-brand-700
          p-8 md:p-12 text-white">

          <p className="text-brand-200 text-xs font-semibold
            tracking-widest uppercase mb-4">
            AI-powered productivity
          </p>

          <h2 className="text-3xl md:text-5xl font-bold
            tracking-tight max-w-2xl">
            Great writing starts with an idea.
          </h2>

          <p className="mt-4 max-w-xl text-brand-100
            leading-relaxed">
            Summarize, improve, translate and transform your
            content with the power of Claude and GPT.
          </p>
        </section>

        {/* Provider selection */}

        <section className="panel">
          <ProviderSelect
            provider={provider}
            setProvider={setProvider}
            disabled={busy}
            status={providerStatus}
          />
        </section>

        {/* Writing operations */}

        <OperationsPanel
          operation={operation}
          setOperation={setOperation}
          options={options}
          setOptions={setOptions}
          disabled={busy}
        />

        {/* Error notification */}

        {error && (
          <div role="alert" className="flex items-center gap-3
            rounded-xl border border-red-200 bg-red-50
            p-4 text-sm text-red-700">

            <AlertCircle size={20} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Input and output workspace */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TextInput
            text={text}
            setText={setText}
            disabled={busy}
          />

          <OutputDisplay
            result={result}
            loading={loading}
          />
        </div>

        {/* Action buttons */}

        <div className="flex flex-wrap gap-3">

          <button
            className="primary-btn"
            onClick={handleTransform}
            disabled={
              busy ||
              !text.trim() ||
              providerStatus?.[provider]?.configured === false
            }
          >
            {loading ? (
              <LoaderCircle size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}

            {loading ? "Transforming..." : "Transform text"}
          </button>

          <button
            className="secondary-btn"
            onClick={handleCompare}
            disabled={
              busy ||
              !text.trim() ||
              providerStatus?.openai?.configured === false ||
              providerStatus?.anthropic?.configured === false
            }
          >
            <GitCompare size={18} />

            {comparing ? "Comparing..." : "Compare providers"}
          </button>

          {loading && (
            <button
              className="secondary-btn text-red-600"
              onClick={stopGeneration}
            >
              <Square size={16} />
              Stop
            </button>
          )}
        </div>

        <p className="text-xs text-ink-500">
          AI-generated content may contain errors.
          Review important information before using it.
          Avoid submitting sensitive or confidential information.
        </p>

        {/* Side-by-side provider comparison */}

        {comparison.length > 0 && (
          <section>
            <h2 className="text-xl font-bold mb-4">
              Provider comparison
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {comparison.map((output) => (
                <OutputDisplay
                  key={output.provider}
                  result={output}
                />
              ))}
            </div>
          </section>
        )}

        {/* Advanced system prompts */}

        <PromptSettings
          operation={operation}
          options={options}
          customPrompt={customPrompts[promptKey] || ""}
          onSave={handleSavePrompt}
          disabled={busy}
        />

        {/* History */}

        <HistoryPanel
          history={history}
          onSelect={handleHistorySelect}
          onClear={handleClearHistory}
          disabled={busy}
        />

      </main>

      <footer className="border-t border-ink-200
        py-6 text-center text-sm text-ink-500">

        WriteFlow AI © {new Date().getFullYear()} |
        Built with React, Express, Claude and GPT

      </footer>
    </div>
  );
}