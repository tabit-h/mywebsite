import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Challenges() {
  const { isAuthenticated } = useAuth();
  const { data, refetch } = trpc.challenges.today.useQuery(undefined, { enabled: isAuthenticated });
  const claimMutation = trpc.challenges.claim.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success("🪙 Reward claimed!");
        refetch();
      } else {
        toast.error("Already claimed or not completed");
      }
    },
  });

  const challenges = data?.challenges || [];
  const progress = data?.progress || [];

  // Time until reset
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const hoursLeft = Math.floor((tomorrow.getTime() - now.getTime()) / 3600000);
  const minutesLeft = Math.floor(((tomorrow.getTime() - now.getTime()) % 3600000) / 60000);

  return (
    <div className="container py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">📋</span>
          <h1 className="font-display text-5xl font-black text-chiaroscuro">DAILY CHALLENGES</h1>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Complete challenges for bonus rewards</p>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.3)]">
            <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.15_75)] pulse-gold" />
            <span className="text-xs font-bold text-[oklch(0.78_0.15_75)]">Resets in {hoursLeft}h {minutesLeft}m</span>
          </div>
        </div>
      </div>

      {!isAuthenticated ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="font-display text-2xl font-bold text-chiaroscuro mb-3">Sign In Required</h2>
          <p className="text-[oklch(0.45_0.03_264)] mb-6">Sign in to access daily challenges and earn rewards</p>
          <button onClick={() => window.location.href = getLoginUrl()}
            className="px-8 py-3 rounded-xl font-heading font-bold text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press">
            Sign In
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const playerProgress = progress.find(p => p.challengeId === challenge.id);
            const prog = playerProgress?.progress || 0;
            const completed = playerProgress?.completed || false;
            const claimed = !!playerProgress?.claimedAt;
            const pct = Math.min(100, Math.round((prog / challenge.requirement) * 100));

            return (
              <div key={challenge.id}
                className={`relative p-6 rounded-2xl border transition-all duration-300 overflow-hidden ${
                  claimed
                    ? "glass border-[oklch(0.78_0.15_75/0.15)] opacity-60"
                    : completed
                    ? "glass border-[oklch(0.65_0.18_145/0.4)] shadow-[0_0_20px_oklch(0.65_0.18_145/0.1)]"
                    : "glass border-[oklch(0.25_0.03_264/0.5)]"
                }`}>
                {/* Glow for completed */}
                {completed && !claimed && (
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.65 0.18 145 / 0.06) 0%, transparent 70%)" }} />
                )}

                <div className="relative z-10 flex items-start gap-4">
                  <div className="text-4xl shrink-0">{claimed ? "✅" : completed ? "🎯" : "📋"}</div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <h3 className="font-heading font-bold text-xl text-[oklch(0.90_0.02_80)] tracking-wide">{challenge.name}</h3>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm">🪙</span>
                        <span className="font-display font-bold text-[oklch(0.78_0.15_75)]">+{challenge.rewardCoins}</span>
                      </div>
                    </div>
                    <p className="text-sm text-[oklch(0.50_0.03_264)] mb-4">{challenge.description}</p>

                    {/* Progress */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="text-[oklch(0.50_0.03_264)]">{prog} / {challenge.requirement}</span>
                        <span className={completed ? "text-[oklch(0.65_0.18_145)] font-bold" : "text-[oklch(0.45_0.03_264)]"}>
                          {completed ? "COMPLETE!" : `${pct}%`}
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${
                          completed ? "bg-gradient-to-r from-[oklch(0.55_0.18_145)] to-[oklch(0.65_0.18_145)]" : "bg-[oklch(0.78_0.15_75/0.5)]"
                        }`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>

                    {/* Claim button */}
                    {completed && !claimed && (
                      <button
                        onClick={() => claimMutation.mutate({ challengeId: challenge.id })}
                        disabled={claimMutation.isPending}
                        className="px-6 py-2 rounded-lg font-heading font-bold tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.55_0.18_145)] to-[oklch(0.65_0.18_145)] hover:from-[oklch(0.60_0.20_145)] hover:to-[oklch(0.70_0.20_145)] transition-all btn-press text-sm"
                      >
                        {claimMutation.isPending ? "Claiming..." : "🎁 Claim Reward"}
                      </button>
                    )}
                    {claimed && (
                      <span className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest">Reward Claimed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {challenges.length === 0 && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">⏳</div>
              <p className="text-[oklch(0.45_0.03_264)]">Loading today's challenges...</p>
            </div>
          )}

          {/* Info */}
          <div className="mt-6 p-4 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.4)]">
            <p className="text-xs text-[oklch(0.45_0.03_264)] leading-relaxed">
              <span className="text-[oklch(0.78_0.15_75)] font-bold">💡 Tip:</span> Daily challenges reset every 24 hours at midnight UTC. Complete them before they expire to earn bonus coins and XP. Progress is tracked automatically as you play.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
