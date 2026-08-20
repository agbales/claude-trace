"use client";

import { useState } from "react";
import type { ParsedTranscript } from "@/lib/claude-data/parse-transcript";
import type { SubagentSummary } from "@/lib/claude-data/types";
import { TurnCard } from "./TurnCard";

export function SubagentNode({
  subagent,
  projectDir,
  sessionId,
}: {
  subagent: SubagentSummary;
  projectDir: string;
  sessionId: string;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<ParsedTranscript | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleToggle() {
    const next = !open;
    setOpen(next);
    if (next && !data && !loading) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/projects/${encodeURIComponent(projectDir)}/sessions/${encodeURIComponent(sessionId)}/subagents/${encodeURIComponent(subagent.agentId)}`
        );
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const json = (await res.json()) as ParsedTranscript;
        setData(json);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load subagent transcript");
      } finally {
        setLoading(false);
      }
    }
  }

  return (
    <div className="overflow-hidden rounded-xl border border-violet-200 bg-violet-50/40 dark:border-violet-900/60 dark:bg-violet-950/20">
      <button onClick={handleToggle} className="flex w-full items-center gap-2 px-3.5 py-2 text-left text-sm">
        <span className="text-violet-400">{open ? "▾" : "▸"}</span>
        <span className="font-medium text-violet-700 dark:text-violet-300">{subagent.agentType}</span>
        <span className="truncate text-violet-500">{subagent.description}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-violet-100 px-3.5 py-2.5 dark:border-violet-900/60">
          {loading && <p className="text-xs text-violet-400">Loading…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {data &&
            data.turns.map((turn) => (
              <TurnCard key={turn.id} turn={turn} projectDir={projectDir} sessionId={sessionId} defaultOpen />
            ))}
          {data && data.turns.length === 0 && (
            <p className="text-xs italic text-violet-400">No turns recorded for this subagent.</p>
          )}
        </div>
      )}
    </div>
  );
}
