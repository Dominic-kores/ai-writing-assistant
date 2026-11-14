import {
  History,
  ChevronRight,
  Trash2,
} from "lucide-react";

export default function HistoryPanel({
  history,
  onSelect,
  onClear,
  disabled,
}) {
  return (
    <section className="panel">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <History
            size={20}
            className="text-brand-600"
          />

          <h2 className="font-semibold">
            Recent history
          </h2>

          <span className="rounded-full bg-ink-100
            px-2 py-1 text-xs">
            {history.length}/20
          </span>
        </div>

        <button
          className="secondary-btn"
          onClick={onClear}
          disabled={disabled || history.length === 0}
        >
          <Trash2 size={15} />
          Clear history
        </button>
      </div>

      {history.length === 0 ? (
        <p className="text-sm text-ink-400 py-6 text-center">
          Your completed writing operations will appear here.
        </p>
      ) : (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              disabled={disabled}
              onClick={() => onSelect(item)}
              className="flex w-full items-center justify-between
                rounded-xl border border-ink-200 p-4
                text-left hover:bg-brand-50 transition"
            >
              <div className="min-w-0">
                <p className="font-medium capitalize text-sm">
                  {item.operation.replaceAll("-", " ")}
                </p>

                <p className="text-sm text-ink-500 truncate">
                  {item.inputPreview}
                </p>

                <p className="text-xs text-ink-400 mt-1">
                  {item.provider} ·{" "}
                  {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>

              <ChevronRight
                size={18}
                className="shrink-0 text-ink-400"
              />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}