import type { TokenUsageTotals } from "@/lib/claude-data/types";

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return `${n}`;
}

export function TokenUsageBadge({ usage }: { usage: TokenUsageTotals }) {
  return (
    <span className="text-xs text-zinc-500">
      {formatTokens(usage.inputTokens)} in · {formatTokens(usage.outputTokens)} out
      {usage.cacheReadTokens > 0 ? ` · ${formatTokens(usage.cacheReadTokens)} cache-read` : ""}
    </span>
  );
}
