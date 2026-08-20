import type { ReactNode } from "react";
import { listProjects, listSessions } from "@/lib/claude-data/discover";
import { ProjectSwitcher } from "@/components/nav/ProjectSwitcher";
import { SessionSidebar } from "@/components/nav/SessionSidebar";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ projectDir: string }>;
}) {
  const { projectDir } = await params;
  const decodedProjectDir = decodeURIComponent(projectDir);
  const projects = listProjects();
  const sessions = listSessions(decodedProjectDir);

  return (
    <div className="flex h-screen flex-col">
      <header className="flex shrink-0 items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/10">
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xs font-bold text-white">
            C
          </span>
          <span className="text-base font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Claude Trace
          </span>
        </span>
        <ProjectSwitcher projects={projects} currentProjectDir={decodedProjectDir} />
      </header>
      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 shrink-0 overflow-hidden border-r border-black/10 dark:border-white/10">
          <SessionSidebar sessions={sessions} projectDir={decodedProjectDir} />
        </aside>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
