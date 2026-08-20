"use client";

import { useState } from "react";
import type { NormEvent, SystemEvent, Turn } from "@/lib/claude-data/types";
import { matchesFilter } from "@/lib/claude-data/filter";
import { EventNode } from "./EventNode";
import { SystemEventsGroup } from "./SystemEventsGroup";
import { useSessionFilter } from "./SessionFilterContext";

type RenderGroup = { kind: "system-group"; events: SystemEvent[] } | { kind: "single"; event: NormEvent };

function groupEvents(events: NormEvent[]): RenderGroup[] {
  const groups: RenderGroup[] = [];
  for (const event of events) {
    if (event.kind === "system") {
      const last = groups[groups.length - 1];
      if (last && last.kind === "system-group") {
        last.events.push(event);
        continue;
      }
      groups.push({ kind: "system-group", events: [event] });
    } else {
      groups.push({ kind: "single", event });
    }
  }
  return groups;
}

function summarizeEvents(events: NormEvent[]): string {
  const toolCalls = events.filter((e) => e.kind === "tool_call");
  const subagents = toolCalls.filter((e) => e.kind === "tool_call" && e.subagent).length;
  const parts: string[] = [];
  if (toolCalls.length > 0) parts.push(`${toolCalls.length} tool call${toolCalls.length === 1 ? "" : "s"}`);
  if (subagents > 0) parts.push(`${subagents} agent${subagents === 1 ? "" : "s"}`);
  return parts.join(" · ");
}

export function TurnCard({
  turn,
  projectDir,
  sessionId,
  defaultOpen = false,
}: {
  turn: Turn;
  projectDir: string;
  sessionId: string;
  defaultOpen?: boolean;
}) {
  const { filter } = useSessionFilter();
  const isFiltering = filter !== null;

  const events = isFiltering
    ? turn.events.filter((e) => e.kind === "tool_call" && matchesFilter(e, filter))
    : turn.events;

  const [open, setOpen] = useState(defaultOpen || isFiltering);
  const effectiveOpen = open || isFiltering;

  if (isFiltering && events.length === 0) return null;

  const groups = groupEvents(events);
  const summary = summarizeEvents(events);

  return (
    <div className="border-b border-black/5 pb-3 last:border-b-0 dark:border-white/5">
      <button onClick={() => setOpen((v) => !v)} className="flex w-full items-start gap-2 py-2 text-left">
        <span className="mt-1 shrink-0 text-zinc-400">{effectiveOpen ? "▾" : "▸"}</span>
        <span className="min-w-0 flex-1">
          <span
            className={`block font-medium text-zinc-900 dark:text-zinc-50 ${effectiveOpen ? "" : "line-clamp-3"}`}
          >
            {turn.question || "(no text)"}
          </span>
          {summary && <span className="mt-0.5 block text-xs text-zinc-500">{summary}</span>}
        </span>
      </button>

      {effectiveOpen && (
        <div className="space-y-2 py-1 pl-6">
          {groups.map((g, i) =>
            g.kind === "system-group" ? (
              <SystemEventsGroup key={`sys-${i}`} events={g.events} />
            ) : (
              <EventNode
                key={g.event.uuid}
                event={g.event}
                projectDir={projectDir}
                sessionId={sessionId}
                forceOpen={isFiltering}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
