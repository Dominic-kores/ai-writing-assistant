import { useState } from "react";
import ReactMarkdown from "react-markdown";

import {
  Copy,
  Download,
  Sparkles,
  Check,
} from "lucide-react";

import StreamingText from "./StreamingText";

export default function OutputDisplay({
  result,
  loading = false,
}) {
  const [message, setMessage] = useState("");

  const text = result?.text || "";
  const changes = result?.changes || [];

  const markdown = changes.length
    ? `${text}\n\n## Changes made\n\n${
        changes.map((change) => `- ${change}`).join("\n")
      }`
    : text;

  async function copyOutput(content) {
    try {
      await navigator.clipboard.writeText(content);
      setMessage("Copied!");
    } catch {
      setMessage("Unable to copy text");
    }
  }

  function exportOutput(extension) {
    const content = extension === "md" ? markdown : text;

    const blob = new Blob([content], {
      type: "text/plain;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `writeflow-output.${extension}`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(url), 1000);

    setMessage("Export started");
  }

  return (
    <section className="panel">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={20} className="text-brand-600" />

        <h2 className="font-semibold">
          AI output
        </h2>
      </div>

      <div className="min-h-80 max-h-144 overflow-y-auto
        rounded-xl border border-ink-200 bg-ink-50 p-4">

        {loading || !result ? (
          <StreamingText text={text} loading={loading} />
        ) : (
          <div className="markdown-content break-words">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}

        {!loading && changes.length > 0 && (
          <div className="mt-6 border-t border-ink-200 pt-4">
            <h3 className="font-semibold mb-3">
              Changes made
            </h3>

            {changes.map((change, index) => (
              <div
                key={index}
                className="flex items-start gap-2 mb-2 text-sm"
              >
                <Check
                  size={16}
                  className="shrink-0 text-emerald-600"
                />

                <span>{change}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {!loading && result?.model && (
        <div className="mt-4 rounded-xl bg-brand-50 p-4">
          <div className="flex flex-wrap gap-3 text-xs mb-3">
            <span className="font-semibold capitalize">
              {result.provider}
            </span>

            <span className="text-ink-600">
              {result.model}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ["Input tokens", result.usage?.inputTokens],
              ["Output tokens", result.usage?.outputTokens],
              ["Total tokens", result.usage?.totalTokens],
              [
                "Response time",
                result.responseTime != null
                  ? `${(result.responseTime / 1000).toFixed(2)}s`
                  : null,
              ],
            ].map(([label, value]) => (
              <div key={label}>
                <p className="text-xs text-ink-500">{label}</p>
                <p className="font-bold text-sm">{value ?? "—"}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          disabled={loading || !text}
          onClick={() => copyOutput(text)}
          className="secondary-btn"
        >
          <Copy size={15} />
          Copy
        </button>

        <button
          disabled={loading || !text}
          onClick={() => copyOutput(markdown)}
          className="secondary-btn"
        >
          Copy Markdown
        </button>

        <button
          disabled={loading || !text}
          onClick={() => exportOutput("txt")}
          className="secondary-btn"
        >
          <Download size={15} />
          TXT
        </button>

        <button
          disabled={loading || !text}
          onClick={() => exportOutput("md")}
          className="secondary-btn"
        >
          <Download size={15} />
          MD
        </button>
      </div>

      <p aria-live="polite" className="text-xs text-brand-600 mt-2">
        {message}
      </p>
    </section>
  );
}