import { notFound } from "next/navigation";
import { getSession } from "@/lib/claude-data/get-session";
import { SessionTimeline } from "@/components/timeline/SessionTimeline";

export default async function SessionPage({
  params,
}: {
  params: Promise<{ projectDir: string; sessionId: string }>;
}) {
  const { projectDir, sessionId } = await params;
  const session = getSession(decodeURIComponent(projectDir), decodeURIComponent(sessionId));
  if (!session) notFound();

  return <SessionTimeline session={session} />;
}
