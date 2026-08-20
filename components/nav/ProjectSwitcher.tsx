"use client";

import { useRouter } from "next/navigation";
import type { Project } from "@/lib/claude-data/types";

export function ProjectSwitcher({
  projects,
  currentProjectDir,
}: {
  projects: Project[];
  currentProjectDir: string;
}) {
  const router = useRouter();

  return (
    <select
      value={currentProjectDir}
      onChange={(e) => router.push(`/projects/${encodeURIComponent(e.target.value)}`)}
      className="rounded-full border border-black/10 bg-white px-3.5 py-1.5 text-sm text-zinc-800 transition-colors hover:border-black/20 dark:border-white/10 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-white/20"
    >
      {projects.map((p) => (
        <option key={p.encodedDir} value={p.encodedDir}>
          {p.displayPath}
        </option>
      ))}
    </select>
  );
}
