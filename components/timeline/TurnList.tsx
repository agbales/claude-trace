"use client";

import { useState } from "react";
import type { Turn } from "@/lib/claude-data/types";
import { TurnCard } from "./TurnCard";

export function TurnList({
  turns,
  projectDir,
  sessionId,
}: {
  turns: Turn[];
  projectDir: string;
  sessionId: string;
}) {
  const [forceOpen, setForceOpen] = useState(false);
  const [epoch, setEpoch] = useState(0);

  function setAll(open: boolean) {
    setForceOpen(open);
    setEpoch((e) => e + 1);
  }

  return (
    <div>
      <div className="mb-2 flex justify-end gap-3 text-xs text-zinc-500">
        <button onClick={() => setAll(true)} className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Expand all
        </button>
        <button onClick={() => setAll(false)} className="hover:text-zinc-700 dark:hover:text-zinc-300">
          Collapse all
        </button>
      </div>
      {/* key={epoch}: forces a fresh mount so each TurnCard re-reads defaultOpen */}
      <div key={epoch}>
        {turns.map((turn) => (
          <TurnCard key={turn.id} turn={turn} projectDir={projectDir} sessionId={sessionId} defaultOpen={forceOpen} />
        ))}
      </div>
    </div>
  );
}
