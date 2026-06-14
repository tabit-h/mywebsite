import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { RANK_CONFIG, MOVE_CONFIG } from "../../../shared/types";
import type { Rank, Move } from "../../../shared/types";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

export default function Profile() {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();
  const { data: profile, isLoading } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const { data: matchHistory } = trpc.profile.matchHistory.useQuery(undefined, { enabled: isAuthenticated });
  const { data: playerAchs } = trpc.achievements.mine.useQuery(undefined, { enabled: isAuthenticated });
  const { data: allAchs } = trpc.achievements.all.useQuery();

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="font-display text-3xl font-bold text-chiaroscuro mb-3">Sign In Required</h2>
        <p className="text-[oklch(0.45_0.03_264)] mb-6">Create your profile and track your progress</p>
        <button onClick={() => window.location.href = getLoginUrl()}
          className="px-8 py-3 rounded-xl font-heading font-bold text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press">
          Sign In to Play
        </button>
      </div>
    );
  }

  if (isLoading || !profile) {
    return (
      <div className="container py-20 text-center">
        <div className="text-4xl animate-spin-slow inline-block">⚙️</div>
      </div>
    );
  }

  const rank = profile.rank as Rank;
  const rankCfg = RANK_CONFIG[rank];
  const winRate = profile.totalGames > 0 ? Math.round((profile.wins / profile.totalGames) * 100) : 0;
  const favoriteMove = profile.favoriteMove as Move;

  // ELO progress within rank
  const rankMin = rankCfg.minElo;
  const rankMax = rankCfg.maxElo === 9999 ? profile.elo + 200 : rankCfg.maxElo;
  const rankProgress = Math.min(100, Math.round(((profile.elo - rankMin) / (rankMax - rankMin)) * 100));

  const moveData = [
    { name: "Rock 🪨", value: profile.rockCount, color: "oklch(0.65 0.12 55)" },
    { name: "Paper 📄", value: profile.paperCount, color: "oklch(0.78 0.15 75)" },
    { name: "Scissors ✂️", value: profile.scissorsCount, color: "oklch(0.75 0.18 230)" },
  ];

  const unlockedAchs = playerAchs?.filter(a => a.unlockedAt) || [];

  return (
    <div className="container py-12 max-w-5xl">
      {/* Profile Header */}
      <div className="relative p-6 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.2)] mb-6 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 pointer-events-none"
          style={{ background: `radial-gradient(circle, ${rankCfg.color} 0%, transparent 70%)`, filter: "blur(40px)" }} />

        <div className="relative z-10 flex flex-wrap gap-6 items-start">
          {/* Avatar */}
          <div className={`relative w-20 h-20 rounded-2xl border-2 flex items-center justify-center text-3xl font-black text-[oklch(0.88_0.18_80)] bg-[oklch(0.78_0.15_75/0.15)] rank-bg-${rank}`}>
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.username} className="w-full h-full rounded-2xl object-cover" />
            ) : (
              profile.username.slice(0, 2).toUpperCase()
            )}
            {/* Rank badge */}
            <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 border-[oklch(0.06_0.01_264)] rank-bg-${rank}`}>
              {rankCfg.icon}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-3xl font-black text-[oklch(0.95_0.02_80)] mb-1">{profile.username}</h1>
            <div className={`flex items-center gap-2 mb-2 rank-${rank}`}>
              <span className="font-bold text-lg">{rankCfg.icon} {rankCfg.label}</span>
              <span className="text-[oklch(0.45_0.03_264)]">·</span>
              <span className="font-display font-bold">{profile.elo} ELO</span>
            </div>
            {profile.bio && <p className="text-sm text-[oklch(0.55_0.04_80)] mb-3">{profile.bio}</p>}

            {/* Rank progress */}
            <div className="max-w-xs">
              <div className="flex justify-between text-xs text-[oklch(0.45_0.03_264)] mb-1">
                <span>{rankCfg.label}</span>
                <span>{profile.elo} / {rankCfg.maxElo === 9999 ? "∞" : rankCfg.maxElo}</span>
              </div>
              <div className="h-2 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 rank-bg-${rank}`}
                  style={{ width: `${rankProgress}%`, background: rankCfg.color }} />
              </div>
            </div>
          </div>

          {/* Coins */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.3)]">
            <span className="text-xl">🪙</span>
            <div>
              <div className="font-display font-bold text-[oklch(0.88_0.18_80)]">{profile.coins.toLocaleString()}</div>
              <div className="text-xs text-[oklch(0.55_0.04_80)]">Coins</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Total Games", value: profile.totalGames, color: "oklch(0.78 0.15 75)" },
              { label: "Wins", value: profile.wins, color: "oklch(0.65 0.18 145)" },
              { label: "Losses", value: profile.losses, color: "oklch(0.55 0.22 25)" },
              { label: "Win Rate", value: `${winRate}%`, color: "oklch(0.78 0.15 75)" },
              { label: "Current Streak", value: profile.currentStreak, color: "oklch(0.65 0.18 145)" },
              { label: "Best Streak", value: profile.longestStreak, color: "oklch(0.88 0.18 80)" },
              { label: "Draws", value: profile.draws, color: "oklch(0.55 0.04 264)" },
              { label: "Fav Move", value: favoriteMove ? MOVE_CONFIG[favoriteMove].emoji : "—", color: "oklch(0.78 0.15 75)" },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-xl glass border border-[oklch(0.25_0.03_264/0.4)] text-center">
                <div className="font-display text-2xl font-bold mb-1" style={{ color: stat.color }}>{stat.value}</div>
                <div className="text-xs text-[oklch(0.45_0.03_264)] uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Move Distribution Chart */}
          <div className="p-5 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.4)]">
            <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">MOVE DISTRIBUTION</h3>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={moveData} barSize={40}>
                <XAxis dataKey="name" tick={{ fill: "oklch(0.55 0.04 264)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.45 0.03 264)", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.09 0.015 264)", border: "1px solid oklch(0.78 0.15 75 / 0.3)", borderRadius: "8px", color: "oklch(0.90 0.02 80)" }}
                  cursor={{ fill: "oklch(0.78 0.15 75 / 0.05)" }}
                />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {moveData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Match History */}
          <div className="p-5 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.4)]">
            <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">RECENT MATCHES</h3>
            {!matchHistory || matchHistory.length === 0 ? (
              <p className="text-[oklch(0.40_0.03_264)] text-sm text-center py-6">No matches played yet. Start playing!</p>
            ) : (
              <div className="space-y-2">
                {matchHistory.slice(0, 10).map((match) => {
                  const isWin = match.winnerId === profile.userId;
                  const isDraw = match.winnerId === null;
                  return (
                    <div key={match.id} className="flex items-center gap-3 p-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.20_0.02_264/0.4)]">
                      <div className={`w-2 h-8 rounded-full ${isWin ? "bg-[oklch(0.65_0.18_145)]" : isDraw ? "bg-[oklch(0.55_0.04_264)]" : "bg-[oklch(0.55_0.22_25)]"}`} />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-bold uppercase tracking-wide ${isWin ? "text-[oklch(0.65_0.18_145)]" : isDraw ? "text-[oklch(0.55_0.04_264)]" : "text-[oklch(0.55_0.22_25)]"}`}>
                            {isWin ? "WIN" : isDraw ? "DRAW" : "LOSS"}
                          </span>
                          <span className="text-xs text-[oklch(0.40_0.03_264)] uppercase">{match.mode}</span>
                        </div>
                        <div className="text-xs text-[oklch(0.40_0.03_264)]">
                          {match.player1Score} — {match.player2Score}
                        </div>
                      </div>
                      {match.eloChange !== 0 && match.eloChange !== null && (
                        <span className={`text-sm font-bold font-display ${(match.eloChange ?? 0) > 0 ? "text-[oklch(0.65_0.18_145)]" : "text-[oklch(0.55_0.22_25)]"}`}>
                          {(match.eloChange ?? 0) > 0 ? "+" : ""}{match.eloChange}
                        </span>
                      )}
                      <span className="text-xs text-[oklch(0.35_0.02_264)]">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Achievements */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] tracking-wide">ACHIEVEMENTS</h3>
              <span className="text-xs text-[oklch(0.78_0.15_75)] font-bold">{unlockedAchs.length}/{allAchs?.length || 0}</span>
            </div>
            <div className="space-y-2">
              {allAchs?.slice(0, 8).map(ach => {
                const playerAch = playerAchs?.find(a => a.achievementKey === ach.key);
                const unlocked = !!playerAch?.unlockedAt;
                const progress = playerAch?.progress || 0;
                const pct = Math.min(100, Math.round((progress / ach.requirement) * 100));
                return (
                  <div key={ach.key} className={`p-3 rounded-xl border transition-all ${
                    unlocked
                      ? "bg-[oklch(0.78_0.15_75/0.08)] border-[oklch(0.78_0.15_75/0.3)]"
                      : "bg-[oklch(0.10_0.015_264)] border-[oklch(0.20_0.02_264/0.4)] opacity-60"
                  }`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{ach.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className={`text-xs font-bold truncate ${unlocked ? "text-[oklch(0.88_0.18_80)]" : "text-[oklch(0.55_0.04_264)]"}`}>
                          {ach.name}
                        </div>
                      </div>
                      {unlocked && <span className="text-xs text-[oklch(0.78_0.15_75)]">✓</span>}
                    </div>
                    {!unlocked && (
                      <div className="h-1 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
                        <div className="h-full rounded-full bg-[oklch(0.78_0.15_75/0.5)]" style={{ width: `${pct}%` }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <button onClick={() => navigate("/achievements")}
              className="w-full mt-3 py-2 rounded-lg text-xs font-semibold text-[oklch(0.78_0.15_75)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.08)] transition-all">
              View All Achievements →
            </button>
          </div>

          {/* Quick actions */}
          <div className="space-y-2">
            <button onClick={() => navigate("/play")}
              className="w-full p-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press">
              ⚔️ Play Now
            </button>
            <button onClick={() => navigate("/challenges")}
              className="w-full p-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.78_0.15_75)] bg-[oklch(0.78_0.15_75/0.08)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.15)] transition-all btn-press">
              📋 Daily Challenges
            </button>
            <button onClick={() => navigate("/shop")}
              className="w-full p-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.65_0.04_264)] bg-[oklch(0.12_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] hover:text-[oklch(0.88_0.18_80)] transition-all btn-press">
              🛍️ Shop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
