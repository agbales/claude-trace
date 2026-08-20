import type { Session } from "@/lib/claude-data/types";
import { TurnList } from "./TurnList";
import { TokenUsageBadge } from "./TokenUsageBadge";

export function SessionTimeline({ session }: { session: Session }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <header className="mb-6 flex items-center justify-between border-b border-black/5 pb-4 dark:border-white/5">
        <div>
          <p className="text-sm text-zinc-500">{session.cwd ?? session.projectDir}</p>
          {session.gitBranch && <p className="text-xs text-zinc-400">branch: {session.gitBranch}</p>}
        </div>
        <TokenUsageBadge usage={session.tokenUsage} />
      </header>

      {session.turns.length === 0 ? (
        <p className="text-sm text-zinc-500">This conversation has no turns.</p>
      ) : (
        <TurnList turns={session.turns} projectDir={session.projectDir} sessionId={session.id} />
      )}
    </div>
  );
}
