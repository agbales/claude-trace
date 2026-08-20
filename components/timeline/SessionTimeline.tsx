import type { Session } from "@/lib/claude-data/types";
import { TurnList } from "./TurnList";
import { TokenUsageBadge } from "./TokenUsageBadge";
import { StatsPanel } from "./StatsPanel";
import { SessionFilterProvider } from "./SessionFilterContext";
import { ClearSelectionButton } from "./ClearSelectionButton";

export function SessionTimeline({ session }: { session: Session }) {
  return (
    <SessionFilterProvider>
      <div className="mx-auto max-w-3xl px-6 py-8">
        <header className="mb-2 flex items-start justify-between gap-4 border-b border-black/5 pb-4 dark:border-white/5">
          <div>
            <p className="text-sm text-zinc-500">{session.cwd ?? session.projectDir}</p>
            {session.gitBranch && <p className="text-xs text-zinc-400">branch: {session.gitBranch}</p>}
          </div>
          <div className="flex flex-col items-end gap-2">
            <TokenUsageBadge usage={session.tokenUsage} />
            <ClearSelectionButton />
          </div>
        </header>

        {session.stats.totalToolCalls > 0 && (
          <div className="mb-6">
            <StatsPanel stats={session.stats} />
          </div>
        )}

        {session.turns.length === 0 ? (
          <p className="text-sm text-zinc-500">This conversation has no turns.</p>
        ) : (
          <TurnList turns={session.turns} projectDir={session.projectDir} sessionId={session.id} />
        )}
      </div>
    </SessionFilterProvider>
  );
}
