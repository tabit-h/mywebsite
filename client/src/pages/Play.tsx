import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { RANK_CONFIG } from "../../../shared/types";
import type { Rank } from "../../../shared/types";

export default function Play() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: profile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const modes = [
    {
      id: "ranked", icon: "⚔️", title: "RANKED", subtitle: "Competitive Mode",
      desc: "Compete in ELO-based matchmaking. Win to climb the ranks and earn seasonal rewards. Every match counts.",
      color: "oklch(0.78 0.15 75)",
      features: ["ELO Matchmaking", "Rank Progression", "Seasonal Rewards", "Match History"],
      badge: "RANKED",
    },
    {
      id: "casual", icon: "🎮", title: "CASUAL", subtitle: "Relaxed Play",
      desc: "Play without pressure. No rank changes. Perfect for warming up or just having fun.",
      color: "oklch(0.65 0.18 145)",
      features: ["No Rank Impact", "Fast Matchmaking", "Earn Coins", "Practice Freely"],
      badge: "CASUAL",
    },
    {
      id: "ai", icon: "🤖", title: "VS AI", subtitle: "Solo Training",
      desc: "Challenge our AI across 4 difficulty levels. Master your strategy before taking on real opponents.",
      color: "oklch(0.65 0.18 250)",
      features: ["4 Difficulty Levels", "Instant Matches", "Strategy Practice", "Earn Coins"],
      badge: "TRAINING",
    },
    {
      id: "friend", icon: "👥", title: "FRIENDS", subtitle: "Private Match",
      desc: "Create a private room and challenge your friends. Share the room code to get started.",
      color: "oklch(0.65 0.15 310)",
      features: ["Private Rooms", "Room Codes", "Invite Links", "No Rank Impact"],
      badge: "COMING SOON",
      disabled: true,
    },
  ];

  const handlePlay = (modeId: string, disabled?: boolean) => {
    if (disabled) return;
    if (!isAuthenticated && modeId !== "ai") {
      window.location.href = getLoginUrl();
      return;
    }
    navigate(`/game/${modeId}`);
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-5xl font-black text-chiaroscuro mb-2">SELECT MODE</h1>
        <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Choose your battlefield</p>
      </div>

      {/* Profile quick stats */}
      {profile && (
        <div className="mb-8 p-4 rounded-xl glass border border-[oklch(0.78_0.15_75/0.2)] flex flex-wrap gap-6 items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[oklch(0.78_0.15_75/0.2)] border border-[oklch(0.78_0.15_75/0.4)] flex items-center justify-center font-bold text-[oklch(0.88_0.18_80)]">
              {profile.username.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="font-bold text-[oklch(0.90_0.02_80)]">{profile.username}</div>
              <div className={`text-xs rank-${profile.rank}`}>
                {RANK_CONFIG[profile.rank as Rank].icon} {RANK_CONFIG[profile.rank as Rank].label} · {profile.elo} ELO
              </div>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div><span className="font-bold text-[oklch(0.78_0.15_75)]">{profile.wins}</span> <span className="text-[oklch(0.45_0.03_264)]">Wins</span></div>
            <div><span className="font-bold text-[oklch(0.90_0.02_80)]">{profile.totalGames}</span> <span className="text-[oklch(0.45_0.03_264)]">Games</span></div>
            <div><span className="font-bold text-[oklch(0.65_0.18_145)]">{profile.currentStreak}</span> <span className="text-[oklch(0.45_0.03_264)]">Streak</span></div>
            <div><span className="font-bold text-[oklch(0.88_0.18_80)]">🪙 {profile.coins}</span></div>
          </div>
        </div>
      )}

      {/* Mode Grid */}
      <div className="grid sm:grid-cols-2 gap-4">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => handlePlay(mode.id, mode.disabled)}
            disabled={mode.disabled}
            className={`group relative p-6 rounded-2xl text-left transition-all duration-300 overflow-hidden ${
              mode.disabled
                ? "glass border border-[oklch(0.25_0.03_264/0.3)] opacity-60 cursor-not-allowed"
                : "glass border border-[oklch(0.25_0.03_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.4)] btn-press cursor-pointer"
            }`}
          >
            {/* Hover glow */}
            {!mode.disabled && (
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                style={{ background: `radial-gradient(ellipse at 30% 30%, ${mode.color}12 0%, transparent 60%)` }} />
            )}

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-4">
                <div className="text-5xl">{mode.icon}</div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest"
                  style={{ background: `${mode.color}18`, color: mode.color, border: `1px solid ${mode.color}40` }}>
                  {mode.badge}
                </span>
              </div>

              <h3 className="font-display text-2xl font-black text-[oklch(0.90_0.02_80)] tracking-wide mb-1">{mode.title}</h3>
              <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: mode.color }}>{mode.subtitle}</p>
              <p className="text-sm text-[oklch(0.50_0.03_264)] leading-relaxed mb-5">{mode.desc}</p>

              <div className="flex flex-wrap gap-2">
                {mode.features.map(f => (
                  <span key={f} className="px-2 py-0.5 rounded-md text-xs text-[oklch(0.55_0.04_264)] bg-[oklch(0.12_0.015_264)] border border-[oklch(0.20_0.02_264/0.5)]">
                    {f}
                  </span>
                ))}
              </div>

              {!mode.disabled && (
                <div className="mt-5 flex items-center gap-2 font-heading font-bold text-sm tracking-wide" style={{ color: mode.color }}>
                  <span>ENTER ARENA</span>
                  <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
