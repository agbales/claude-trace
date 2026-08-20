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
      <div className="shrink-0 border-b border-black/5 p-2 dark:border-white/5">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search skills, tools, agents…"
          className="w-full rounded-md border border-black/10 bg-white px-2 py-1.5 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-400 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
        />
      </div>

      {sessions.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No conversations found for this project.</p>
      ) : results.length === 0 ? (
        <p className="p-4 text-sm text-zinc-500">No conversations called &quot;{query.trim()}&quot;.</p>
      ) : (
        <nav className="flex-1 overflow-y-auto">
          {results.map(({ session: s, matchedName }) => {
            const href = `/projects/${encodeURIComponent(projectDir)}/${encodeURIComponent(s.id)}`;
            const isActive = pathname === href;
            return (
              <Link
                key={s.id}
                href={href}
                className={`flex flex-col gap-0.5 border-b border-black/5 px-3 py-2.5 text-sm hover:bg-black/[.03] dark:border-white/5 dark:hover:bg-white/[.04] ${
                  isActive ? "bg-black/[.05] dark:bg-white/[.06]" : ""
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
                  <span className="mt-0.5 inline-block w-fit rounded-full bg-indigo-100 px-1.5 py-0.5 text-[10px] font-medium text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
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
