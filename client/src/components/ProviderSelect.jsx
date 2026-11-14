import { Cpu } from "lucide-react";

export default function ProviderSelect({
  provider,
  setProvider,
  disabled,
  status,
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label
        htmlFor="provider"
        className="flex items-center gap-2 text-sm font-medium"
      >
        <Cpu size={18} />
        AI Provider
      </label>

      <select
        id="provider"
        value={provider}
        onChange={(event) => setProvider(event.target.value)}
        disabled={disabled}
        className="rounded-xl border border-ink-200
          bg-white px-4 py-3 text-sm outline-none
          focus:ring-2 focus:ring-brand-400"
      >
        <option value="openai">OpenAI — GPT</option>
        <option value="anthropic">Anthropic — Claude</option>
      </select>

      {status?.[provider] && (
        <span className={`text-xs ${
          status[provider].configured
            ? "text-emerald-600"
            : "text-red-600"
        }`}>
          {status[provider].configured
            ? "Configured"
            : "API key missing"}
        </span>
      )}
    </div>
  );
}