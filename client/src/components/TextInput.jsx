import { FileText, Trash2 } from "lucide-react";

export default function TextInput({
  text,
  setText,
  disabled,
}) {
  const wordCount = text.trim()
    ? text.trim().split(/\s+/).length
    : 0;

  return (
    <section className="panel">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <FileText size={20} className="text-brand-600" />

          <h2 className="font-semibold">
            Source text
          </h2>
        </div>

        <button
          className="secondary-btn"
          onClick={() => setText("")}
          disabled={disabled || !text}
        >
          <Trash2 size={15} />
          Clear
        </button>
      </div>

      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        disabled={disabled}
        maxLength={15000}
        placeholder="Paste or type your content here..."
        aria-label="Source text"
        className="w-full min-h-80 resize-y rounded-xl border
          border-ink-200 bg-ink-50 p-4 outline-none
          focus:ring-2 focus:ring-brand-400 leading-relaxed"
      />

      <div className="flex justify-between mt-3 text-xs text-ink-500">
        <span>{wordCount} words</span>
        <span>{text.length.toLocaleString()} / 15,000 characters</span>
      </div>
    </section>
  );
}