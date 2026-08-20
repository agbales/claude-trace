import type { NormEvent, ToolCallEvent } from "./types";

export type SessionFilter =
  | { kind: "toolName"; value: string }
  | { kind: "skill"; value: string }
  | { kind: "agentType"; value: string }
  | null;

export function matchesFilter(event: ToolCallEvent, filter: SessionFilter): boolean {
  if (!filter) return false;
  switch (filter.kind) {
    case "toolName":
      return event.name === filter.value;
    case "skill":
      return event.name === "Skill" && event.input.skill === filter.value;
    case "agentType":
      return event.name === "Agent" && event.subagent?.agentType === filter.value;
  }
}

// For the filtered debug view: each matching tool call, plus the assistant
// text immediately preceding it (the "why" — what prompted the call), plus
// its own result (already carried on the ToolCallEvent). Non-adjacent text,
// thinking, and non-matching tool calls are left out.
export function selectFilteredEvents(events: NormEvent[], filter: SessionFilter): NormEvent[] {
  if (!filter) return events;

  const includedUuids = new Set<string>();
  const included: NormEvent[] = [];

  function include(e: NormEvent) {
    if (includedUuids.has(e.uuid)) return;
    includedUuids.add(e.uuid);
    included.push(e);
  }

  events.forEach((e, i) => {
    if (e.kind === "tool_call" && matchesFilter(e, filter)) {
      const prev = events[i - 1];
      if (prev && prev.kind === "text") include(prev);
      include(e);
    }
  });

  return included;
}

export function filterLabel(filter: NonNullable<SessionFilter>): string {
  switch (filter.kind) {
    case "toolName":
      return `${filter.value} calls`;
    case "skill":
      return `Skill: ${filter.value}`;
    case "agentType":
      return `Agent: ${filter.value}`;
  }
}
