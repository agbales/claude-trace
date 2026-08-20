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

// For the filtered debug view: the assistant text immediately preceding the
// first matching call (the "why"), then that call and everything from it
// onward to the end of the turn — the call's own result plus whatever the
// assistant did as a consequence (further tool calls, text, etc.). A skill
// or tool call rarely stands alone; what it led to is the point of filtering
// by it. Events before the first match that aren't its trigger are left out.
export function selectFilteredEvents(events: NormEvent[], filter: SessionFilter): NormEvent[] {
  if (!filter) return events;

  const firstMatchIndex = events.findIndex((e) => e.kind === "tool_call" && matchesFilter(e, filter));
  if (firstMatchIndex === -1) return [];

  const trigger = events[firstMatchIndex - 1];
  const rest = events.slice(firstMatchIndex);
  return trigger && trigger.kind === "text" ? [trigger, ...rest] : rest;
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
