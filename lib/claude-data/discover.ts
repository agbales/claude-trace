import { closeSync, openSync, readFileSync, readSync, readdirSync, statSync } from "fs";
import path from "path";
import { CLAUDE_PROJECTS_ROOT } from "./constants";
import { flattenContentToText } from "./format";
import type { Project, RawEnvelope, SessionSummary } from "./types";

export function listProjects(): Project[] {
  let entries: string[];
  try {
    entries = readdirSync(CLAUDE_PROJECTS_ROOT);
  } catch {
    return [];
  }

  const projects: Project[] = [];

  for (const encodedDir of entries) {
    const projectPath = path.join(CLAUDE_PROJECTS_ROOT, encodedDir);
    let stat;
    try {
      stat = statSync(projectPath);
    } catch {
      continue;
    }
    if (!stat.isDirectory()) continue;

    let files: string[];
    try {
      files = readdirSync(projectPath).filter((f) => f.endsWith(".jsonl"));
    } catch {
      continue;
    }
    if (files.length === 0) continue;

    let displayPath = encodedDir;
    let lastActivityAt: string | null = null;

    for (const file of files) {
      const filePath = path.join(projectPath, file);

      if (displayPath === encodedDir) {
        const firstLine = readFirstJsonLine(filePath);
        if (firstLine && typeof firstLine.cwd === "string") {
          displayPath = firstLine.cwd;
        }
      }

      try {
        const mtime = statSync(filePath).mtime.toISOString();
        if (!lastActivityAt || mtime > lastActivityAt) lastActivityAt = mtime;
      } catch {
        continue;
      }
    }

    projects.push({ encodedDir, displayPath, sessionCount: files.length, lastActivityAt });
  }

  projects.sort((a, b) => (b.lastActivityAt ?? "").localeCompare(a.lastActivityAt ?? ""));
  return projects;
}

export function listSessions(encodedProjectDir: string): SessionSummary[] {
  const projectPath = path.join(CLAUDE_PROJECTS_ROOT, encodedProjectDir);

  let entries: string[];
  try {
    entries = readdirSync(projectPath);
  } catch {
    return [];
  }

  const sessions: SessionSummary[] = [];
  for (const entry of entries) {
    if (!entry.endsWith(".jsonl")) continue;
    const sessionId = entry.slice(0, -".jsonl".length);
    const summary = summarizeSessionFile(path.join(projectPath, entry), sessionId, encodedProjectDir);
    if (summary) sessions.push(summary);
  }

  sessions.sort((a, b) => (b.startedAt ?? "").localeCompare(a.startedAt ?? ""));
  return sessions;
}

function summarizeSessionFile(filePath: string, sessionId: string, projectDir: string): SessionSummary | null {
  let content: string;
  try {
    content = readFileSync(filePath, "utf-8");
  } catch {
    return null;
  }

  let cwd: string | null = null;
  let startedAt: string | null = null;
  let firstUserMessage: string | null = null;
  let turnCount = 0;
  const calledNames = new Set<string>();

  for (const line of content.split("\n")) {
    if (!line.trim()) continue;
    let raw: RawEnvelope;
    try {
      raw = JSON.parse(line) as RawEnvelope;
    } catch {
      continue;
    }

    if (!cwd && typeof raw.cwd === "string") cwd = raw.cwd;
    if (!startedAt && typeof raw.timestamp === "string") startedAt = raw.timestamp;

    if (raw.type === "user") {
      const msgContent = raw.message?.content;
      const blocks = Array.isArray(msgContent) ? msgContent : null;
      const isAllToolResult = blocks !== null && blocks.length > 0 && blocks.every((b) => b.type === "tool_result");
      if (!isAllToolResult) {
        turnCount += 1;
        if (!firstUserMessage) {
          const text = flattenContentToText(msgContent ?? (typeof raw.message?.content === "string" ? raw.message.content : null));
          if (text) firstUserMessage = text;
        }
      }
    }

    if (raw.type === "assistant") {
      const msgContent = raw.message?.content;
      if (Array.isArray(msgContent)) {
        for (const block of msgContent) {
          if (block.type !== "tool_use" || typeof block.name !== "string") continue;
          calledNames.add(block.name);
          if (block.name === "Skill" && typeof block.input?.skill === "string") {
            calledNames.add(block.input.skill);
          } else if (block.name === "Agent" && typeof block.input?.subagent_type === "string") {
            calledNames.add(block.input.subagent_type);
          }
        }
      }
    }
  }

  let hasSubagents = false;
  try {
    const subagentsDir = path.join(filePath.slice(0, -".jsonl".length), "subagents");
    hasSubagents = readdirSync(subagentsDir).length > 0;
  } catch {
    hasSubagents = false;
  }

  return {
    id: sessionId,
    projectDir,
    cwd,
    startedAt,
    firstUserMessage,
    turnCount,
    hasSubagents,
    calledNames: Array.from(calledNames),
  };
}

function readFirstJsonLine(filePath: string): RawEnvelope | null {
  let content: string;
  try {
    const fd = openSync(filePath, "r");
    const buffer = Buffer.alloc(65536);
    const bytesRead = readSync(fd, buffer, 0, buffer.length, 0);
    closeSync(fd);
    content = buffer.toString("utf-8", 0, bytesRead);
  } catch {
    return null;
  }

  const newlineIdx = content.indexOf("\n");
  const firstLine = newlineIdx === -1 ? content : content.slice(0, newlineIdx);
  if (!firstLine.trim()) return null;

  try {
    return JSON.parse(firstLine) as RawEnvelope;
  } catch {
    return null;
  }
}
