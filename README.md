# Claude Trace

A local app for browsing your Claude Code conversation history — see every question you asked, and drill into exactly what happened answering it: which tools, skills, and agents got called, and what they returned.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). It reads directly from `~/.claude/projects/` on your machine — no setup or import step.

## How it works

- **Pick a project.** The dropdown in the top nav lists every project Claude Code has session history for.
- **Browse conversations.** The left sidebar lists that project's conversations, newest first. Switch projects and back and you'll land back on the conversation you were last looking at.
- **Search by what was called.** The search box above the conversation list filters down to conversations that called a specific tool, skill, or agent by name.
- **Scan questions, drill into answers.** Each conversation shows just the list of questions asked, collapsed by default. Click one to expand the full answer — text, tool calls, skill invocations, and agent/subagent calls, each individually expandable.
- **See the stats.** Every conversation has a summary of how many tool calls, skills, MCP tools, agents, and errors it involved, broken down by name.
- **Click a stat to filter.** Click any tool, skill, or agent name in the stats panel and the conversation filters down to just that: what triggered the call, the call itself, and everything that happened as a result — useful for debugging a specific skill or tool's behavior without wading through everything else. Clear the selection to go back to normal view.
