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
    <div className="rounded-md border border-indigo-200 bg-indigo-50/40 dark:border-indigo-900 dark:bg-indigo-950/20">
      <button onClick={handleToggle} className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm">
        <span className="text-indigo-400">{open ? "▾" : "▸"}</span>
        <span className="font-medium text-indigo-700 dark:text-indigo-300">{subagent.agentType}</span>
        <span className="truncate text-indigo-500">{subagent.description}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-indigo-100 px-3 py-2 dark:border-indigo-900">
          {loading && <p className="text-xs text-indigo-400">Loading…</p>}
          {error && <p className="text-xs text-red-500">{error}</p>}
          {data &&
            data.turns.map((turn) => (
              <TurnCard key={turn.id} turn={turn} projectDir={projectDir} sessionId={sessionId} />
            ))}
          {data && data.turns.length === 0 && (
            <p className="text-xs italic text-indigo-400">No turns recorded for this subagent.</p>
          )}
        </div>
      )}
    </div>
  );
}
