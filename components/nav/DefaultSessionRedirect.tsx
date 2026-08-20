"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { SessionSummary } from "@/lib/claude-data/types";
import { lastSessionKey } from "@/lib/claude-data/last-session";

// Landing on a bare /projects/[projectDir] URL — whether from the project
// switcher, the root redirect, or a direct link — should never show an empty
// state when sessions exist. Prefer the last conversation viewed in this
// project (if it still exists), otherwise the latest one.
export function DefaultSessionRedirect({
  projectDir,
  sessions,
}: {
  projectDir: string;
  sessions: SessionSummary[];
}) {
  const router = useRouter();

  useEffect(() => {
    if (sessions.length === 0) return;
    const remembered = window.localStorage.getItem(lastSessionKey(projectDir));
    const target = remembered && sessions.some((s) => s.id === remembered) ? remembered : sessions[0].id;
    router.replace(`/projects/${encodeURIComponent(projectDir)}/${encodeURIComponent(target)}`);
  }, [projectDir, sessions, router]);

  return null;
}
