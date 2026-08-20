"use client";

import { useState } from "react";
import type { ToolCallEvent } from "@/lib/claude-data/types";
import { truncate } from "@/lib/claude-data/format";
import { SubagentNode } from "./SubagentNode";
import { SkillResult } from "./SkillResult";

function summarizeInput(name: string, input: Record<string, unknown>): string {
  if (name === "Skill" && typeof input.skill === "string") return input.skill;
  if (name === "Agent" && typeof input.subagent_type === "string") return input.subagent_type;
  if (name === "Bash" && typeof input.command === "string") return truncate(input.command, 80);
  if ((name === "Read" || name === "Edit" || name === "Write") && typeof input.file_path === "string") {
    return input.file_path;
  }
  const first = Object.values(input)[0];
  return typeof first === "string" ? truncate(first, 80) : "";
}

export function ToolCallNode({
  event,
  projectDir,
  sessionId,
  defaultOpen = false,
}: {
  event: ToolCallEvent;
  projectDir: string;
  sessionId: string;
  defaultOpen?: boolean;
}) {
  const [manualOpen, setManualOpen] = useState(false);
  const open = manualOpen || defaultOpen;
  const summary = summarizeInput(event.name, event.input);

  return (
    <div className="rounded-md border border-zinc-200 dark:border-zinc-800">
      <button
        onClick={() => setManualOpen((v) => !v)}
        className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm hover:bg-black/[.02] dark:hover:bg-white/[.03]"
      >
        <span className="text-zinc-400">{open ? "▾" : "▸"}</span>
        <span className="font-medium text-zinc-700 dark:text-zinc-300">{event.name}</span>
        {summary && <span className="truncate text-zinc-500">{summary}</span>}
        {event.result?.isError && <span className="ml-auto shrink-0 text-xs text-red-500">error</span>}
      </button>

      {open && (
        <div className="space-y-2 border-t border-zinc-100 px-3 py-2 text-sm dark:border-zinc-900">
          {Object.keys(event.input).length > 0 && (
            <pre className="overflow-x-auto rounded bg-zinc-50 p-2 text-xs text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400">
              {JSON.stringify(event.input, null, 2)}
            </pre>
          )}

          {event.name === "Agent" && event.subagent ? (
            <SubagentNode subagent={event.subagent} projectDir={projectDir} sessionId={sessionId} />
          ) : event.name === "Skill" && event.result ? (
            <SkillResult text={event.result.text} />
          ) : event.result ? (
            <p
              className={`whitespace-pre-wrap text-xs ${
                event.result.isError ? "text-red-500" : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {truncate(event.result.text, 4000)}
            </p>
          ) : (
            <p className="text-xs italic text-zinc-400">No result recorded.</p>
          )}
        </div>
      )}
    </div>
  );
}
