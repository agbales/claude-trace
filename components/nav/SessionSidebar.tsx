"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SessionSummary } from "@/lib/claude-data/types";
import { relativeTime, truncate } from "@/lib/claude-data/format";

export function SessionSidebar({ sessions, projectDir }: { sessions: SessionSummary[]; projectDir: string }) {
  const pathname = usePathname();

  if (sessions.length === 0) {
    return <p className="p-4 text-sm text-zinc-500">No conversations found for this project.</p>;
  }

  return (
    <nav className="flex flex-col">
      {sessions.map((s) => {
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
          </Link>
        );
      })}
    </nav>
  );
}
