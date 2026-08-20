"use client";

import { useState } from "react";
import { truncate } from "@/lib/claude-data/format";

// Skill "results" are actually the skill's full loaded instructions markdown
// — often long. Always collapsed on its own, independent of the surrounding
// tool call's open/forced-open state; you rarely need to re-read the skill
// definition every time you look at where it was invoked.
export function SkillResult({ text }: { text: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border border-dashed border-zinc-300 text-xs dark:border-zinc-700">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-2.5 py-1.5 text-left text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
      >
        <span>{open ? "▾" : "▸"}</span>
        <span>Skill instructions ({text.length} chars)</span>
      </button>
      {open && (
        <pre className="whitespace-pre-wrap px-2.5 pb-2.5 text-zinc-600 dark:text-zinc-400">
          {truncate(text, 8000)}
        </pre>
      )}
    </div>
  );
}
