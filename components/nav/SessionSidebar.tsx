"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionSummary } from "@/lib/claude-data/types";
import { relativeTime, truncate } from "@/lib/claude-data/format";

interface SessionMatch {
  session: SessionSummary;
  matchedName: string | null;
}

export function SessionSidebar({ sessions, projectDir }: { sessions: SessionSummary[]; projectDir: string }) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();

  const results: SessionMatch[] = useMemo(() => {
    if (!normalizedQuery) return sessions.map((session) => ({ session, matchedName: null }));
    return sessions
      .map((session) => ({
        session,
        matchedName: session.calledNames.find((n) => n.toLowerCase().includes(normalizedQuery)) ?? null,
      }))
      .filter((r): r is SessionMatch & { matchedName: string } => r.matchedName !== null);
  }, [sessions, normalizedQuery]);

  return (
    <div className="flex h-full flex-col">
      <div className="shrink-0 p-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, tools, agents…"
          className="w-full rounded-full border border-black/10 bg-white px-3.5 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-400/50 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-200 dark:placeholder:text-zinc-500"
        />
      </div>

      {sessions.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No conversations found for this project.</p>
      ) : results.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No conversations called &quot;{query.trim()}&quot;.</p>
      ) : (
        <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-2">
          {results.map(({ session: s, matchedName }) => {
            const href = `/projects/${encodeURIComponent(projectDir)}/${encodeURIComponent(s.id)}`;
            const isActive = pathname === href;
            return (
              <Link
                key={s.id}
                href={href}
                className={`flex flex-col gap-0.5 rounded-xl border px-3 py-2.5 text-sm transition-colors ${
                  isActive
                    ? "border-violet-200 bg-violet-50 dark:border-violet-900/60 dark:bg-violet-950/30"
                    : "border-transparent hover:bg-black/[.03] dark:hover:bg-white/[.04]"
                }`}
              >
                <span className="line-clamp-2 text-zinc-900 dark:text-zinc-100">
                  {truncate(s.firstUserMessage ?? "(empty conversation)", 80)}
                </span>
                <span className="text-xs text-zinc-500">
                  {relativeTime(s.startedAt)} · {s.turnCount} turn{s.turnCount === 1 ? "" : "s"}
                  {s.hasSubagents ? " · agents" : ""}
                </span>
                {matchedName && (
                  <span className="mt-0.5 inline-block w-fit rounded-full bg-violet-100 px-1.5 py-0.5 text-[10px] font-medium text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
                    {matchedName}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
