import { randomUUID } from "crypto";
import { flattenContentToText } from "./format";
import type { RawEnvelope, SessionStats, SubagentRef, ToolCallEvent, TokenUsageTotals, Turn } from "./types";

// Known session-bookkeeping line types that carry no user-facing content —
// dropped silently rather than surfaced as unrecognized events. This build's
// harness produces many more of these than a stock transcript; observed by
// scanning a real session file rather than guessing.
const KNOWN_DROP_TOP_TYPES = new Set([
  "summary",
  "last-prompt",
  "mode",
  "permission-mode",
  "file-history-snapshot",
  "file-history-delta",
  "queue-operation",
  "atis-latch",
  "ai-title",
  "agent-name",
]);

// `attachment` lines (whether `type:"attachment"` or a bare `attachment` field
// with no top-level `type`) are, in every observed case, internal bookkeeping
// (token reminders, style hints, hook status, delta listings, ...) rather than
// conversational content — drop the whole line-shape rather than maintaining
// an allow-list of subtypes that keeps growing.
const SYNTHETIC_USER_PREFIXES = ["<task-notification>"];

export interface ParseTranscriptOptions {
  subagentIndex: Map<string, SubagentRef>;
}

export interface ParsedTranscript {
  turns: Turn[];
  tokenUsage: TokenUsageTotals;
  stats: SessionStats;
}

function bump(counts: Record<string, number>, key: string): void {
  counts[key] = (counts[key] ?? 0) + 1;
}

export function parseTranscriptLines(lines: string[], opts: ParseTranscriptOptions): ParsedTranscript {
  const turns: Turn[] = [];
  let currentTurn: Turn | null = null;
  const pendingToolCalls = new Map<string, ToolCallEvent>();
  const tokenUsage: TokenUsageTotals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    thinkingTokens: 0,
  };
  const stats: SessionStats = {
    totalToolCalls: 0,
    toolCounts: {},
    skillCounts: {},
    mcpCounts: {},
    agentCounts: {},
    errorCount: 0,
  };

  for (const line of lines) {
    if (!line.trim()) continue;

    let raw: RawEnvelope;
    try {
      raw = JSON.parse(line) as RawEnvelope;
    } catch {
      continue;
    }

    const type = raw.type;
    const timestamp = typeof raw.timestamp === "string" ? raw.timestamp : null;
    const uuid = typeof raw.uuid === "string" ? raw.uuid : randomUUID();

    if (type && KNOWN_DROP_TOP_TYPES.has(type)) continue;
    if (raw.attachment && (!type || type === "attachment")) continue;

    if (type === "user") {
      const content = raw.message?.content;
      const blocks = Array.isArray(content) ? content : null;

      // Async-agent completion pings arrive as literal <task-notification>
      // text in a "user" line — not something a human typed. The subagent's
      // actual output is already shown via its tool_call/SubagentNode, so
      // drop these entirely rather than rendering them as a fake question.
      if (typeof content === "string" && SYNTHETIC_USER_PREFIXES.some((p) => content.trimStart().startsWith(p))) {
        continue;
      }

      // Resolve any tool_result blocks against calls seen so far, regardless
      // of whether this line also starts a new turn.
      if (blocks) {
        for (const block of blocks) {
          if (block.type === "tool_result" && typeof block.tool_use_id === "string") {
            const call = pendingToolCalls.get(block.tool_use_id);
            if (call) {
              const isError = Boolean(block.is_error);
              call.result = {
                isError,
                text: flattenContentToText(block.content),
                raw: block.content ?? null,
                toolSpecific: raw.toolUseResult ?? null,
              };
              if (isError) stats.errorCount += 1;
              pendingToolCalls.delete(block.tool_use_id);
            }
          }
        }
      }

      const isAllToolResult = blocks !== null && blocks.length > 0 && blocks.every((b) => b.type === "tool_result");

      if (!isAllToolResult) {
        const turn: Turn = {
          id: uuid,
          question: flattenContentToText(content as string | typeof blocks),
          timestamp,
          events: [],
        };
        turns.push(turn);
        currentTurn = turn;
      }
      continue;
    }

    if (type === "assistant") {
      const message = raw.message;
      const usage = message?.usage;
      if (usage) {
        tokenUsage.inputTokens += usage.input_tokens ?? 0;
        tokenUsage.outputTokens += usage.output_tokens ?? 0;
        tokenUsage.cacheCreationTokens += usage.cache_creation_input_tokens ?? 0;
        tokenUsage.cacheReadTokens += usage.cache_read_input_tokens ?? 0;
        tokenUsage.thinkingTokens += usage.output_tokens_details?.thinking_tokens ?? 0;
      }
      if (!currentTurn) continue;
      const turn = currentTurn;

      const content = message?.content;
      const blocks = Array.isArray(content)
        ? content
        : typeof content === "string"
          ? [{ type: "text", text: content }]
          : [];

      blocks.forEach((block, i) => {
        const eventUuid = `${uuid}-${i}`;
        if (block.type === "text" && typeof block.text === "string" && block.text.trim()) {
          turn.events.push({ kind: "text", uuid: eventUuid, timestamp, text: block.text });
        } else if (block.type === "thinking" && typeof block.thinking === "string" && block.thinking.trim()) {
          turn.events.push({ kind: "thinking", uuid: eventUuid, timestamp, text: block.thinking });
        } else if (block.type === "text" || block.type === "thinking") {
          // Empty text/thinking block — genuinely nothing to show, not even
          // as an unknown-event fallback.
        } else if (block.type === "tool_use" && typeof block.id === "string" && typeof block.name === "string") {
          const subagentRef = block.name === "Agent" ? (opts.subagentIndex.get(block.id) ?? null) : null;
          // Strip transcriptPath (a local filesystem path) before it enters
          // the event tree that client components render — the client only
          // ever needs agentId to hit the lazy-load API route.
          const subagent = subagentRef
            ? {
                agentId: subagentRef.agentId,
                agentType: subagentRef.agentType,
                description: subagentRef.description,
                spawnDepth: subagentRef.spawnDepth,
              }
            : null;
          const toolCall: ToolCallEvent = {
            kind: "tool_call",
            uuid: eventUuid,
            timestamp,
            toolUseId: block.id,
            name: block.name,
            input: block.input ?? {},
            result: null,
            subagent,
          };
          turn.events.push(toolCall);
          pendingToolCalls.set(block.id, toolCall);

          stats.totalToolCalls += 1;
          bump(stats.toolCounts, block.name);
          if (block.name === "Skill" && typeof block.input?.skill === "string") {
            bump(stats.skillCounts, block.input.skill);
          } else if (block.name === "Agent" && typeof block.input?.subagent_type === "string") {
            bump(stats.agentCounts, block.input.subagent_type);
          } else if (block.name.startsWith("mcp__")) {
            bump(stats.mcpCounts, block.name);
          }
        } else {
          turn.events.push({ kind: "unknown", uuid: eventUuid, timestamp, rawType: block.type, raw: block });
        }
      });
      continue;
    }

    if (type === "system") {
      // Pure timing telemetry, no content — not worth a chip.
      if (raw.subtype === "turn_duration") continue;
      if (!currentTurn) continue;
      currentTurn.events.push({
        kind: "system",
        uuid,
        timestamp,
        label: typeof raw.subtype === "string" ? raw.subtype : "system",
        detail: typeof raw.content === "string" ? raw.content : undefined,
      });
      continue;
    }

    // Anything else — including lines with no `type` at all — is a genuinely
    // novel shape. Never crash on it; show it collapsed instead.
    if (currentTurn) {
      currentTurn.events.push({
        kind: "unknown",
        uuid,
        timestamp,
        rawType: type ?? "(no type)",
        raw,
      });
    }
  }

  return { turns, tokenUsage, stats };
}
