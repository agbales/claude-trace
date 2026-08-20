import { NextResponse } from "next/server";
import { getSubagentTranscript } from "@/lib/claude-data/get-session";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ projectDir: string; sessionId: string; agentId: string }> }
) {
  const { projectDir, sessionId, agentId } = await params;
  const transcript = getSubagentTranscript(
    decodeURIComponent(projectDir),
    decodeURIComponent(sessionId),
    decodeURIComponent(agentId)
  );

  if (!transcript) {
    return NextResponse.json({ error: "Subagent transcript not found" }, { status: 404 });
  }

  return NextResponse.json(transcript);
}
