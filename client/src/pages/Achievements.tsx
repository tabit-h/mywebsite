import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";

export default function Achievements() {
  const { isAuthenticated } = useAuth();
  const { data: allAchs } = trpc.achievements.all.useQuery();
  const { data: playerAchs } = trpc.achievements.mine.useQuery(undefined, { enabled: isAuthenticated });

  const unlockedCount = playerAchs?.filter(a => a.unlockedAt).length || 0;
  const totalCount = allAchs?.length || 0;

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏆</span>
          <h1 className="font-display text-5xl font-black text-chiaroscuro">ACHIEVEMENTS</h1>
        </div>
        <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">
          {isAuthenticated ? `${unlockedCount} / ${totalCount} Unlocked` : "Sign in to track progress"}
        </p>
      </div>

      {/* Progress bar */}
      {isAuthenticated && (
        <div className="mb-8 p-4 rounded-xl glass border border-[oklch(0.78_0.15_75/0.2)]">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-bold text-[oklch(0.90_0.02_80)]">Overall Progress</span>
            <span className="text-[oklch(0.78_0.15_75)] font-bold">{totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0}%</span>
          </div>
          <div className="h-3 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] transition-all duration-1000"
              style={{ width: `${totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0}%` }} />
          </div>
        </div>
      )}

      {/* Achievement Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {allAchs?.map(ach => {
          const playerAch = playerAchs?.find(a => a.achievementKey === ach.key);
          const unlocked = !!playerAch?.unlockedAt;
          const progress = playerAch?.progress || 0;
          const pct = Math.min(100, Math.round((progress / ach.requirement) * 100));

          return (
            <div key={ach.key}
              className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden ${
                unlocked
                  ? "glass border-[oklch(0.78_0.15_75/0.35)] shadow-gold-sm"
                  : "bg-[oklch(0.09_0.015_264)] border-[oklch(0.20_0.02_264/0.5)]"
              }`}>
              {/* Glow for unlocked */}
              {unlocked && (
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: "radial-gradient(ellipse at 50% 0%, oklch(0.78 0.15 75 / 0.08) 0%, transparent 70%)" }} />
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                  <div className={`text-4xl ${unlocked ? "" : "grayscale opacity-40"}`}>{ach.icon}</div>
                  {unlocked ? (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.78_0.15_75/0.15)] border border-[oklch(0.78_0.15_75/0.4)]">
                      <span className="text-xs font-bold text-[oklch(0.88_0.18_80)]">✓ UNLOCKED</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-[oklch(0.15_0.02_264)] border border-[oklch(0.25_0.03_264/0.5)]">
                      <span className="text-xs text-[oklch(0.45_0.03_264)]">LOCKED</span>
                    </div>
                  )}
                </div>

                <h3 className={`font-heading font-bold text-lg mb-1 ${unlocked ? "text-[oklch(0.90_0.02_80)]" : "text-[oklch(0.55_0.04_264)]"}`}>
                  {ach.name}
                </h3>
                <p className="text-xs text-[oklch(0.45_0.03_264)] mb-3 leading-relaxed">{ach.description}</p>

                {/* Progress */}
                {!unlocked && isAuthenticated && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-[oklch(0.40_0.03_264)] mb-1">
                      <span>{progress} / {ach.requirement}</span>
                      <span>{pct}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
                      <div className="h-full rounded-full bg-[oklch(0.78_0.15_75/0.6)] transition-all duration-500"
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                )}

                {/* Reward */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs">🪙</span>
                  <span className={`text-xs font-bold ${unlocked ? "text-[oklch(0.78_0.15_75)]" : "text-[oklch(0.40_0.03_264)]"}`}>
                    {ach.rewardCoins} coins
                  </span>
                  {unlocked && playerAch?.unlockedAt && (
                    <span className="ml-auto text-xs text-[oklch(0.40_0.03_264)]">
                      {new Date(playerAch.unlockedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {!isAuthenticated && (
        <div className="mt-8 text-center">
          <button onClick={() => window.location.href = getLoginUrl()}
            className="px-8 py-3 rounded-xl font-heading font-bold text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press">
            Sign In to Track Progress
          </button>
        </div>
      )}
    </div>
  );
}
