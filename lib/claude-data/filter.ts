import type { ToolCallEvent } from "./types";

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
