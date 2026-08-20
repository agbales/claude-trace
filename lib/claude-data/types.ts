export interface RawEnvelope {
  type?: string;
  uuid?: string;
  parentUuid?: string | null;
  sessionId?: string;
  cwd?: string;
  gitBranch?: string;
  version?: string;
  isSidechain?: boolean;
  timestamp?: string;
  agentId?: string;
  subtype?: string;
  content?: unknown;
  toolUseResult?: unknown;
  isMeta?: boolean;
  sourceToolUseID?: string;
  attachment?: { type?: string; [key: string]: unknown };
  message?: RawMessage;
  [key: string]: unknown;
}

export interface RawMessage {
  role?: "user" | "assistant";
  model?: string;
  content?: string | RawContentBlock[];
  usage?: RawUsage;
  [key: string]: unknown;
}

/**
 * Deliberately flat/loose rather than a discriminated union: real transcript
 * lines mix known and unknown block shapes, and the parser must tolerate both
 * without TS narrowing fights.
 */
export interface RawContentBlock {
  type: string;
  text?: string;
  thinking?: string;
  signature?: string;
  id?: string;
  name?: string;
  input?: Record<string, unknown>;
  tool_use_id?: string;
  content?: string | RawContentBlock[];
  is_error?: boolean;
  [key: string]: unknown;
}

export interface RawUsage {
  input_tokens?: number;
  output_tokens?: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  output_tokens_details?: { thinking_tokens?: number };
}

export interface Project {
  encodedDir: string;
  displayPath: string;
  sessionCount: number;
  lastActivityAt: string | null;
}

export interface SessionSummary {
  id: string;
  projectDir: string;
  cwd: string | null;
  startedAt: string | null;
  firstUserMessage: string | null;
  turnCount: number;
  hasSubagents: boolean;
  // Every tool name, skill name, and agent type called directly in this
  // session's own transcript (not inside subagent transcripts — those are
  // lazy-loaded and out of scope for this cheap per-session scan). Powers
  // the sidebar search.
  calledNames: string[];
}

export interface Session {
  id: string;
  projectDir: string;
  cwd: string | null;
  gitBranch: string | null;
  turns: Turn[];
  tokenUsage: TokenUsageTotals;
  stats: SessionStats;
}

// Counts keyed by name (tool name, skill name, subagent_type, mcp tool name).
// Deliberately raw counts rather than pre-sorted — sort at render time.
export interface SessionStats {
  totalToolCalls: number;
  toolCounts: Record<string, number>;
  skillCounts: Record<string, number>;
  mcpCounts: Record<string, number>;
  agentCounts: Record<string, number>;
  errorCount: number;
}

export interface Turn {
  id: string;
  question: string;
  timestamp: string | null;
  events: NormEvent[];
}

export type NormEvent = TextEvent | ThinkingEvent | ToolCallEvent | SystemEvent | UnknownEvent;

interface BaseEvent {
  uuid: string;
  timestamp: string | null;
}

export interface TextEvent extends BaseEvent {
  kind: "text";
  text: string;
}

export interface ThinkingEvent extends BaseEvent {
  kind: "thinking";
  text: string;
}

export interface ToolCallEvent extends BaseEvent {
  kind: "tool_call";
  toolUseId: string;
  name: string;
  input: Record<string, unknown>;
  result: ToolResult | null;
  subagent: SubagentSummary | null;
}

export interface ToolResult {
  isError: boolean;
  text: string;
  raw: unknown;
  toolSpecific: unknown;
}

// Server-side only (used to locate a subagent transcript file on disk) — never
// pass this across a client-component boundary; use SubagentSummary instead.
export interface SubagentRef {
  agentId: string;
  agentType: string;
  description: string;
  spawnDepth: number;
  transcriptPath: string;
}

// What a client component is allowed to see about a subagent invocation —
// deliberately excludes transcriptPath (a local absolute filesystem path).
export type SubagentSummary = Omit<SubagentRef, "transcriptPath">;

export interface SystemEvent extends BaseEvent {
  kind: "system";
  label: string;
  detail?: string;
}

export interface UnknownEvent extends BaseEvent {
  kind: "unknown";
  rawType: string;
  raw: unknown;
}

export interface TokenUsageTotals {
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  thinkingTokens: number;
}
