import { listSessions } from "@/lib/claude-data/discover";
import { DefaultSessionRedirect } from "@/components/nav/DefaultSessionRedirect";

export default async function ProjectIndexPage({ params }: { params: Promise<{ projectDir: string }> }) {
  const { projectDir } = await params;
  const decodedProjectDir = decodeURIComponent(projectDir);
  const sessions = listSessions(decodedProjectDir);

  if (sessions.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-zinc-500">
        No conversations found for this project.
      </div>
    );
  }

  return <DefaultSessionRedirect projectDir={decodedProjectDir} sessions={sessions} />;
}
