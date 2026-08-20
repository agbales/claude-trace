"use client";

import { useState } from "react";
import type { SessionStats } from "@/lib/claude-data/types";

function sum(counts: Record<string, number>): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function StatGroup({ label, counts }: { label: string; counts: Record<string, number> }) {
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {entries.map(([name, count]) => (
          <li
            key={name}
            className="flex items-center justify-between gap-4 text-xs text-zinc-600 dark:text-zinc-400"
          >
            <span className="truncate">{name}</span>
            <span className="tabular-nums text-zinc-400">{count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatsPanel({ stats }: { stats: SessionStats }) {
  const [open, setOpen] = useState(false);

  const skillCalls = sum(stats.skillCounts);
  const mcpCalls = sum(stats.mcpCounts);
  const agentCalls = sum(stats.agentCounts);

  const summary = [
    `${stats.totalToolCalls} tool call${stats.totalToolCalls === 1 ? "" : "s"}`,
    skillCalls > 0 ? `${skillCalls} skill${skillCalls === 1 ? "" : "s"}` : null,
    mcpCalls > 0 ? `${mcpCalls} mcp` : null,
    agentCalls > 0 ? `${agentCalls} agent${agentCalls === 1 ? "" : "s"}` : null,
    stats.errorCount > 0 ? `${stats.errorCount} error${stats.errorCount === 1 ? "" : "s"}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="text-xs text-zinc-500">
      <button onClick={() => setOpen((v) => !v)} className="hover:text-zinc-700 dark:hover:text-zinc-300">
        {open ? "▾" : "▸"} {summary}
      </button>
      {open && (
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
          <StatGroup label="Tools" counts={stats.toolCounts} />
          <StatGroup label="Skills" counts={stats.skillCounts} />
          <StatGroup label="MCP tools" counts={stats.mcpCounts} />
          <StatGroup label="Agents" counts={stats.agentCounts} />
        </div>
      )}
    </div>
  );
}
