import {
  AlignLeft,
  Expand,
  AudioLines,
  Languages,
  SpellCheck,
  Share2,
  Repeat2,
} from "lucide-react";

export const OPERATIONS = [
  {
    id: "summarize",
    label: "Summarize",
    icon: AlignLeft,
  },
  {
    id: "expand",
    label: "Expand",
    icon: Expand,
  },
  {
    id: "change-tone",
    label: "Change tone",
    icon: AudioLines,
  },
  {
    id: "translate",
    label: "Translate",
    icon: Languages,
  },
  {
    id: "fix-grammar",
    label: "Fix grammar",
    icon: SpellCheck,
  },
  {
    id: "social-media",
    label: "Social media",
    icon: Share2,
  },
  {
    id: "paraphrase",
    label: "Paraphrase",
    icon: Repeat2,
  },
];

const optionGroups = {
  summarize: {
    key: "length",
    label: "Summary length",
    values: ["short", "medium", "long"],
  },

  "change-tone": {
    key: "tone",
    label: "Select tone",
    values: [
      "formal",
      "casual",
      "professional",
      "friendly",
    ],
  },

  translate: {
    key: "language",
    label: "Target language",
    values: ["english", "swahili", "french"],
  },

  "social-media": {
    key: "platform",
    label: "Social platform",
    values: ["twitter", "linkedin", "instagram"],
  },
};

export default function OperationsPanel({
  operation,
  setOperation,
  options,
  setOptions,
  disabled,
}) {
  const group = optionGroups[operation];

  return (
    <section className="panel">
      <h2 className="font-semibold mb-4">
        Writing tools
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4
        xl:grid-cols-7 gap-3">

        {OPERATIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            disabled={disabled}
            onClick={() => setOperation(id)}
            aria-pressed={operation === id}
            className={`flex flex-col items-center justify-center
              gap-2 rounded-xl border p-4 text-sm transition
              ${
                operation === id
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-ink-200 hover:bg-ink-50"
              }`}
          >
            <Icon size={22} />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {group && (
        <div className="mt-5">
          <p className="text-sm font-medium mb-2">
            {group.label}
          </p>

          <div className="flex flex-wrap gap-2">
            {group.values.map((value) => (
              <button
                key={value}
                disabled={disabled}
                aria-pressed={options[group.key] === value}
                onClick={() =>
                  setOptions((previous) => ({
                    ...previous,
                    [group.key]: value,
                  }))
                }
                className={`rounded-lg px-4 py-2 text-sm capitalize
                  ${
                    options[group.key] === value
                      ? "bg-brand-600 text-white"
                      : "bg-ink-100 hover:bg-ink-200"
                  }`}
              >
                {value === "twitter" ? "Twitter/X" : value}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}