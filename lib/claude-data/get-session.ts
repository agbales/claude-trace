import { readFileSync } from "fs";
import path from "path";
import { CLAUDE_PROJECTS_ROOT } from "./constants";
import { parseTranscriptLines, type ParsedTranscript } from "./parse-transcript";
import { loadSubagentTranscript, resolveSubagentIndex } from "./subagents";
import type { RawEnvelope, Session } from "./types";

export function getSession(encodedProjectDir: string, sessionId: string): Session | null {
  const projectPath = path.join(CLAUDE_PROJECTS_ROOT, encodedProjectDir);
  const filePath = path.join(projectPath, `${sessionId}.jsonl`);

  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  const lines = content.split("\n");
  const sessionDir = path.join(projectPath, sessionId);
  const subagentIndex = resolveSubagentIndex(sessionDir);
  const { turns, tokenUsage, stats } = parseTranscriptLines(lines, { subagentIndex });

  let cwd: string | null = null;
  let gitBranch: string | null = null;
  for (const line of lines) {
    if (!line.trim()) continue;
    let raw: RawEnvelope;
    try {
      raw = JSON.parse(line) as RawEnvelope;
    } catch {
      continue;
    }
    if (!cwd && typeof raw.cwd === "string") cwd = raw.cwd;
    if (!gitBranch && typeof raw.gitBranch === "string") gitBranch = raw.gitBranch;
    if (cwd && gitBranch) break;
  }

  return { id: sessionId, projectDir: encodedProjectDir, cwd, gitBranch, turns, tokenUsage, stats };
}

export function getSubagentTranscript(
  encodedProjectDir: string,
  sessionId: string,
  agentId: string
): ParsedTranscript | null {
  const projectPath = path.join(CLAUDE_PROJECTS_ROOT, encodedProjectDir);
  const sessionDir = path.join(projectPath, sessionId);
  const subagentIndex = resolveSubagentIndex(sessionDir);
  try {
    return loadSubagentTranscript(sessionDir, agentId, subagentIndex);
  } catch {
    return null;
  }
}
