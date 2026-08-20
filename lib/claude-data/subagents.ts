import { readFileSync, readdirSync } from "fs";
import path from "path";
import { parseTranscriptLines, type ParsedTranscript } from "./parse-transcript";
import type { SubagentRef } from "./types";

interface SubagentMeta {
  agentType?: string;
  description?: string;
  toolUseId?: string;
  spawnDepth?: number;
}

const META_SUFFIX = ".meta.json";
const AGENT_PREFIX = "agent-";

/**
 * Every meta.json for a whole session tree (including nested subagents-of-
 * subagents) lives in one flat `<session>/subagents/` directory, keyed by
 * the spawning tool_use id. Reusing the same map when parsing a subagent's
 * own transcript resolves further nesting for free.
 */
export function resolveSubagentIndex(sessionDir: string): Map<string, SubagentRef> {
  const index = new Map<string, SubagentRef>();
  const subagentsDir = path.join(sessionDir, "subagents");

  let entries: string[];
  try {
    entries = readdirSync(subagentsDir);
  } catch {
    return index;
  }

  for (const entry of entries) {
    if (!entry.endsWith(META_SUFFIX) || !entry.startsWith(AGENT_PREFIX)) continue;

    let meta: SubagentMeta;
    try {
      meta = JSON.parse(readFileSync(path.join(subagentsDir, entry), "utf-8")) as SubagentMeta;
    } catch {
      continue;
    }
    if (!meta.toolUseId) continue;

    const agentId = entry.slice(AGENT_PREFIX.length, -META_SUFFIX.length);
    index.set(meta.toolUseId, {
      agentId,
      agentType: meta.agentType ?? "agent",
      description: meta.description ?? "",
      spawnDepth: meta.spawnDepth ?? 1,
      transcriptPath: path.join(subagentsDir, `${AGENT_PREFIX}${agentId}.jsonl`),
    });
  }

  return index;
}

export function loadSubagentTranscript(
  sessionDir: string,
  agentId: string,
  subagentIndex: Map<string, SubagentRef>
): ParsedTranscript {
  const transcriptPath = path.join(sessionDir, "subagents", `${AGENT_PREFIX}${agentId}.jsonl`);
  const content = readFileSync(transcriptPath, "utf-8");
  return parseTranscriptLines(content.split("\n"), { subagentIndex });
}
