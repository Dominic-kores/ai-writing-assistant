import { useEffect, useState } from "react";
import { Settings2 } from "lucide-react";
import { fetchDefaultPrompt } from "../utils/api";

export default function PromptSettings({
  operation,
  options,
  customPrompt,
  onSave,
  disabled,
}) {
  const [defaultPrompt, setDefaultPrompt] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    setDefaultPrompt("");
    setDraft("");
    setError("");

    fetchDefaultPrompt({ operation, options })
      .then(({ prompt }) => {
        if (active) {
          setDefaultPrompt(prompt);
          setDraft(customPrompt || prompt);
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      });

    return () => {
      active = false;
    };
  }, [operation, options, customPrompt]);

  return (
    <details className="panel">
      <summary className="flex items-center gap-2
        font-semibold cursor-pointer">

        <Settings2 size={20} className="text-brand-600" />

        Advanced prompt settings
      </summary>

      <p className="text-sm text-ink-500 mt-3">
        Customize the AI instructions for the selected operation.
      </p>

      <textarea
        rows={6}
        maxLength={5000}
        value={draft}
        disabled={disabled || !defaultPrompt}
        onChange={(event) => setDraft(event.target.value)}
        aria-label="Custom system prompt"
        className="mt-4 w-full rounded-xl border
          border-ink-200 p-4 text-sm outline-none
          focus:ring-2 focus:ring-brand-400"
      />

      {error && (
        <p className="text-sm text-red-600 mt-2">{error}</p>
      )}

      <div className="flex gap-3 mt-3">
        <button
          className="primary-btn"
          disabled={disabled || !draft.trim() || !defaultPrompt}
          onClick={() => onSave(draft)}
        >
          Save prompt
        </button>

        <button
          className="secondary-btn"
          disabled={disabled || !defaultPrompt}
          onClick={() => {
            setDraft(defaultPrompt);
            onSave("");
          }}
        >
          Reset default
        </button>
      </div>

      {customPrompt && (
        <p className="text-xs text-emerald-600 mt-3">
          Custom prompt is active.
        </p>
      )}
    </details>
  );
}