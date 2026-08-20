import { redirect } from "next/navigation";
import { listProjects } from "@/lib/claude-data/discover";

export default function Home() {
  const projects = listProjects();

  if (projects.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center text-sm text-zinc-500">
        No Claude Code projects found under ~/.claude/projects.
      </div>
    );
  }

  redirect(`/projects/${encodeURIComponent(projects[0].encodedDir)}`);
}
