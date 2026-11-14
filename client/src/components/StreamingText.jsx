export default function StreamingText({
  text,
  loading,
}) {
  return (
    <div className="whitespace-pre-wrap leading-relaxed
      text-ink-700 break-words">

      {text || (
        <span className="text-ink-400">
          {loading
            ? "Generating your response..."
            : "Your transformed text will appear here."}
        </span>
      )}

      {loading && (
        <span className="inline-block ml-1 w-2 h-5
          bg-brand-600 animate-pulse align-middle"
        />
      )}
    </div>
  );
}