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
      className="rounded-md border border-black/10 bg-white px-3 py-1.5 text-sm text-zinc-800 dark:border-white/10 dark:bg-zinc-900 dark:text-zinc-200"
    >
      {projects.map((p) => (
        <option key={p.encodedDir} value={p.encodedDir}>
          {p.displayPath}
        </option>
      ))}
    </select>
  );
}
