"use client";

import { useState } from "react";
import type { SessionStats } from "@/lib/claude-data/types";
import type { SessionFilter } from "@/lib/claude-data/filter";
import { useSessionFilter } from "./SessionFilterContext";

function sum(counts: Record<string, number>): number {
  return Object.values(counts).reduce((a, b) => a + b, 0);
}

function isSameFilter(a: SessionFilter, b: SessionFilter): boolean {
  if (!a || !b) return false;
  return a.kind === b.kind && a.value === b.value;
}

function StatGroup({
  label,
  counts,
  kind,
}: {
  label: string;
  counts: Record<string, number>;
  kind: NonNullable<SessionFilter>["kind"];
}) {
  const { filter, setFilter } = useSessionFilter();
  const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) return null;

  return (
    <div>
      <p className="text-xs font-medium text-zinc-500">{label}</p>
      <ul className="mt-1 space-y-0.5">
        {entries.map(([name, count]) => {
          const entryFilter: SessionFilter = { kind, value: name };
          const active = isSameFilter(filter, entryFilter);
          return (
            <li key={name}>
              <button
                onClick={() => setFilter(active ? null : entryFilter)}
                className={`flex w-full items-center justify-between gap-4 rounded-lg px-1.5 py-1 text-left text-xs ${
                  active
                    ? "bg-violet-100 text-violet-800 dark:bg-violet-950/50 dark:text-violet-300"
                    : "text-zinc-600 hover:bg-black/[.04] dark:text-zinc-400 dark:hover:bg-white/[.06]"
                }`}
              >
                <span className="truncate">{name}</span>
                <span className="tabular-nums text-zinc-400">{count}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function StatsPanel({ stats }: { stats: SessionStats }) {
  const { filter } = useSessionFilter();
  const [open, setOpen] = useState(false);
  const effectiveOpen = open || filter !== null;

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
        {effectiveOpen ? "▾" : "▸"} {summary}
      </button>
      {effectiveOpen && (
        <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-3 rounded-xl border border-zinc-200 p-3.5 dark:border-white/10 dark:bg-zinc-900/40">
          <StatGroup label="Tools" counts={stats.toolCounts} kind="toolName" />
          <StatGroup label="Skills" counts={stats.skillCounts} kind="skill" />
          <StatGroup label="MCP tools" counts={stats.mcpCounts} kind="toolName" />
          <StatGroup label="Agents" counts={stats.agentCounts} kind="agentType" />
        </div>
      )}
    </div>
  );
}
