"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/lib/claude-data/types";
import { shortenPath } from "@/lib/claude-data/format";

export function ProjectSwitcher({
  projects,
  currentProjectDir,
}: {
  projects: Project[];
  currentProjectDir: string;
}) {
  const router = useRouter();
  const current = projects.find((p) => p.encodedDir === currentProjectDir);

  return (
    <div className="relative">
      <select
        value={currentProjectDir}
        onChange={(e) => router.push(`/projects/${encodeURIComponent(e.target.value)}`)}
        title={current?.displayPath}
        className="max-w-[240px] cursor-pointer appearance-none truncate rounded-full border border-black/10 bg-white py-1.5 pl-3.5 pr-8 text-sm text-zinc-800 transition-colors hover:border-black/20 focus:outline-none focus:ring-2 focus:ring-violet-400/50 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-white/20"
      >
        {projects.map((p) => (
          <option key={p.encodedDir} value={p.encodedDir} title={p.displayPath}>
            {shortenPath(p.displayPath)}
          </option>
        ))}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400"
      >
        <path d="M5 7.5L10 12.5L15 7.5" />
      </svg>
    </div>
  );
}
