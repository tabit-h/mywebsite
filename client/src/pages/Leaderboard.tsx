import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { RANK_CONFIG } from "../../../shared/types";
import type { Rank } from "../../../shared/types";

export default function Leaderboard() {
  const [tab, setTab] = useState<"global" | "regional" | "friends">("global");
  const { data: leaderboard, isLoading } = trpc.leaderboard.global.useQuery();
  const { isAuthenticated } = useAuth();
  const { data: myProfile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const players = leaderboard || [];

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏆</span>
          <h1 className="font-display text-5xl font-black text-chiaroscuro">LEADERBOARD</h1>
        </div>
        <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Season 1 · Global Rankings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] w-fit">
        {(["global", "regional", "friends"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-lg font-heading font-semibold text-sm tracking-wide transition-all duration-200 ${
              tab === t
                ? "bg-[oklch(0.78_0.15_75/0.15)] text-[oklch(0.88_0.18_80)] border border-[oklch(0.78_0.15_75/0.3)]"
                : "text-[oklch(0.50_0.03_264)] hover:text-[oklch(0.75_0.04_264)]"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* My rank highlight */}
      {myProfile && (
        <div className="mb-4 p-4 rounded-xl bg-[oklch(0.78_0.15_75/0.06)] border border-[oklch(0.78_0.15_75/0.25)]">
          <div className="flex items-center gap-3">
            <span className="text-xs text-[oklch(0.78_0.15_75)] font-bold uppercase tracking-widest">Your Rank</span>
            <div className="w-8 h-8 rounded-full bg-[oklch(0.78_0.15_75/0.2)] border border-[oklch(0.78_0.15_75/0.4)] flex items-center justify-center text-xs font-bold text-[oklch(0.88_0.18_80)]">
              {myProfile.username.slice(0, 2).toUpperCase()}
            </div>
            <span className="font-bold text-[oklch(0.90_0.02_80)]">{myProfile.username}</span>
            <span className={`rank-${myProfile.rank} text-sm font-bold`}>
              {RANK_CONFIG[myProfile.rank as Rank].icon} {RANK_CONFIG[myProfile.rank as Rank].label}
            </span>
            <span className="ml-auto font-display font-bold text-[oklch(0.78_0.15_75)]">{myProfile.elo} ELO</span>
          </div>
        </div>
      )}

      {/* Rank tier legend */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(Object.entries(RANK_CONFIG) as [Rank, typeof RANK_CONFIG[Rank]][]).map(([rank, cfg]) => (
          <div key={rank} className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border rank-bg-${rank}`}>
            <span>{cfg.icon}</span>
            <span className={`rank-${rank}`}>{cfg.label}</span>
            <span className="text-[oklch(0.40_0.03_264)]">{cfg.minElo}+</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl overflow-hidden border border-[oklch(0.25_0.03_264/0.5)]">
        {/* Header */}
        <div className="grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-5 py-3 bg-[oklch(0.10_0.015_264)] border-b border-[oklch(0.25_0.03_264/0.5)]">
          <div className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest">#</div>
          <div className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest">Player</div>
          <div className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest text-right hidden sm:block">ELO</div>
          <div className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest text-right hidden md:block">Win Rate</div>
          <div className="text-xs font-bold text-[oklch(0.45_0.03_264)] uppercase tracking-widest text-right hidden lg:block">Wins</div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-[oklch(0.45_0.03_264)]">
            <div className="text-3xl animate-spin-slow inline-block mb-3">⚙️</div>
            <p>Loading rankings...</p>
          </div>
        ) : players.length === 0 ? (
          <div className="py-16 text-center text-[oklch(0.45_0.03_264)]">
            <div className="text-5xl mb-3">🏆</div>
            <p>No players ranked yet. Be the first!</p>
          </div>
        ) : (
          players.map((player, i) => {
            const rank = (player.rank || "bronze") as Rank;
            const cfg = RANK_CONFIG[rank];
            const winRate = player.totalGames > 0 ? Math.round((player.wins / player.totalGames) * 100) : 0;
            const isMe = myProfile?.userId === player.userId;

            return (
              <div
                key={player.id}
                className={`grid grid-cols-[3rem_1fr_auto_auto_auto] gap-4 px-5 py-4 border-b border-[oklch(0.20_0.02_264/0.3)] transition-all duration-200 hover:bg-[oklch(0.78_0.15_75/0.03)] ${
                  isMe ? "bg-[oklch(0.78_0.15_75/0.05)] border-l-2 border-l-[oklch(0.78_0.15_75/0.5)]" : ""
                }`}
              >
                {/* Rank number */}
                <div className={`flex items-center font-display font-bold text-lg ${
                  i === 0 ? "text-[oklch(0.88_0.18_80)]" :
                  i === 1 ? "text-[oklch(0.75_0.03_264)]" :
                  i === 2 ? "text-[oklch(0.65_0.12_55)]" :
                  "text-[oklch(0.35_0.02_264)]"
                }`}>
                  {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`}
                </div>

                {/* Player info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-[oklch(0.88_0.18_80)] shrink-0 rank-bg-${rank} border`}>
                    {player.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className={`font-semibold truncate ${isMe ? "text-[oklch(0.88_0.18_80)]" : "text-[oklch(0.85_0.02_80)]"}`}>
                      {player.username} {isMe && <span className="text-xs text-[oklch(0.78_0.15_75)]">(You)</span>}
                    </div>
                    <div className={`text-xs rank-${rank}`}>{cfg.icon} {cfg.label}</div>
                  </div>
                </div>

                {/* ELO */}
                <div className="hidden sm:flex items-center justify-end">
                  <span className="font-display font-bold text-[oklch(0.78_0.15_75)]">{player.elo}</span>
                </div>

                {/* Win Rate */}
                <div className="hidden md:flex flex-col items-end justify-center">
                  <span className="font-bold text-[oklch(0.90_0.02_80)]">{winRate}%</span>
                  <div className="w-16 h-1 rounded-full bg-[oklch(0.20_0.02_264)] mt-1 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.78_0.15_75)]"
                      style={{ width: `${winRate}%` }} />
                  </div>
                </div>

                {/* Wins */}
                <div className="hidden lg:flex items-center justify-end">
                  <span className="text-[oklch(0.65_0.04_264)]">{player.wins}W</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
