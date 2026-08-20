"use client";

import { useState } from "react";
import type { ThinkingEvent } from "@/lib/claude-data/types";

export function ThinkingBlock({ event }: { event: ThinkingEvent }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-dashed border-zinc-300 text-xs dark:border-zinc-700">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Thinking ({event.text.length} chars)</span>
      </button>
      {open && <pre className="whitespace-pre-wrap px-2.5 pb-2.5 text-zinc-500">{event.text}</pre>}
    </div>
  );
}
