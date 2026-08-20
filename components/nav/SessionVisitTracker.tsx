"use client";

import { useEffect } from "react";
import { lastSessionKey } from "@/lib/claude-data/last-session";

// Renders nothing — records that this session was the last one viewed in this
// project, so switching projects and back lands you where you left off.
export function SessionVisitTracker({ projectDir, sessionId }: { projectDir: string; sessionId: string }) {
  useEffect(() => {
    window.localStorage.setItem(lastSessionKey(projectDir), sessionId);
  }, [projectDir, sessionId]);

  return null;
}
