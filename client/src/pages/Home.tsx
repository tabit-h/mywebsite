import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { RANK_CONFIG } from "../../../shared/types";
import type { Rank } from "../../../shared/types";

export default function Home() {
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: leaderboard } = trpc.leaderboard.global.useQuery();
  const { data: stats } = trpc.homepage.stats.useQuery();

  const topPlayers = leaderboard?.slice(0, 5) || [];
  const onlineCount = stats?.onlinePlayers ?? 0;
  const totalMatches = stats?.totalMatches ?? 0;
  const totalPlayers = stats?.totalPlayers ?? 0;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center">
        {/* Background gradient */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[60%] h-[70%] rounded-full opacity-5"
            style={{ background: "radial-gradient(ellipse, oklch(0.78 0.15 75) 0%, transparent 70%)", filter: "blur(80px)" }} />
          <div className="absolute bottom-0 left-0 w-[40%] h-[50%] rounded-full opacity-3"
            style={{ background: "radial-gradient(ellipse, oklch(0.78 0.15 75) 0%, transparent 70%)", filter: "blur(100px)" }} />
        </div>

        <div className="container relative z-10 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Copy */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.3)] animate-fade-in-up">
                <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.78_0.15_75)] pulse-gold" />
                <span className="text-xs font-semibold text-[oklch(0.78_0.15_75)] tracking-widest uppercase">Season 1 · Live Now</span>
              </div>

              {/* Title */}
              <div className="animate-fade-in-up-delay-1">
                <h1 className="font-display text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tight text-chiaroscuro">
                  RPS
                </h1>
                <h1 className="font-display text-7xl sm:text-8xl lg:text-9xl font-black leading-none tracking-tight text-chiaroscuro">
                  ROYALE
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-lg text-[oklch(0.55_0.04_80)] max-w-md leading-relaxed animate-fade-in-up-delay-2">
                Outsmart your opponents and climb the ranks in the ultimate
                <span className="text-[oklch(0.78_0.15_75)]"> Rock Paper Scissors</span> arena.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 animate-fade-in-up-delay-3">
                <button
                  onClick={() => isAuthenticated ? navigate("/play") : window.location.href = getLoginUrl()}
                  className="group relative px-8 py-3.5 rounded-xl font-heading font-bold text-lg tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold hover:shadow-gold transition-all duration-300 btn-press overflow-hidden"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    ⚔️ PLAY NOW
                  </span>
                  <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>

                <button
                  onClick={() => navigate("/game/ai")}
                  className="px-6 py-3.5 rounded-xl font-heading font-bold text-base tracking-wide text-[oklch(0.78_0.15_75)] bg-[oklch(0.78_0.15_75/0.08)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.15)] hover:border-[oklch(0.78_0.15_75/0.5)] transition-all duration-200 btn-press"
                >
                  🤖 vs AI
                </button>

                <button
                  onClick={() => navigate("/leaderboard")}
                  className="px-6 py-3.5 rounded-xl font-heading font-bold text-base tracking-wide text-[oklch(0.65_0.04_264)] bg-[oklch(0.12_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] hover:text-[oklch(0.88_0.18_80)] hover:border-[oklch(0.78_0.15_75/0.3)] transition-all duration-200 btn-press"
                >
                  🏆 Leaderboard
                </button>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 animate-fade-in-up-delay-4">
                {[
                  { value: onlineCount.toLocaleString(), label: "Online Now" },
                  { value: totalMatches >= 1000 ? (totalMatches / 1000).toFixed(1) + "K" : totalMatches.toLocaleString(), label: "Matches Played" },
                  { value: totalPlayers.toLocaleString(), label: "Players" },
                ].map(stat => (
                  <div key={stat.label}>
                    <div className="text-2xl font-display font-bold text-gold-gradient">{stat.value}</div>
                    <div className="text-xs text-[oklch(0.45_0.03_264)] uppercase tracking-widest">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Animated RPS Visual */}
            <div className="relative flex items-center justify-center h-80 lg:h-[500px]">
              {/* Outer ring */}
              <div className="absolute w-72 h-72 lg:w-96 lg:h-96 rounded-full border border-[oklch(0.78_0.15_75/0.1)] animate-spin-slow" />
              <div className="absolute w-56 h-56 lg:w-72 lg:h-72 rounded-full border border-[oklch(0.78_0.15_75/0.06)]" style={{ animation: "spin 12s linear infinite reverse" }} />

              {/* Glow core */}
              <div className="absolute w-32 h-32 rounded-full opacity-20"
                style={{ background: "radial-gradient(circle, oklch(0.78 0.15 75) 0%, transparent 70%)", filter: "blur(20px)" }} />

              {/* Rock */}
              <div className="absolute animate-float" style={{ top: "10%", left: "50%", transform: "translateX(-50%)" }}>
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.3)] shadow-gold flex items-center justify-center text-4xl lg:text-5xl hover:scale-110 transition-transform cursor-default">
                  🪨
                </div>
              </div>

              {/* Paper */}
              <div className="absolute animate-float-delay" style={{ bottom: "10%", left: "10%" }}>
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.3)] shadow-gold flex items-center justify-center text-4xl lg:text-5xl hover:scale-110 transition-transform cursor-default">
                  📄
                </div>
              </div>

              {/* Scissors */}
              <div className="absolute animate-float-slow" style={{ bottom: "10%", right: "10%" }}>
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.3)] shadow-gold flex items-center justify-center text-4xl lg:text-5xl hover:scale-110 transition-transform cursor-default">
                  ✂️
                </div>
              </div>

              {/* Center VS */}
              <div className="relative z-10 w-16 h-16 rounded-full bg-gradient-to-br from-[oklch(0.78_0.15_75/0.3)] to-[oklch(0.78_0.15_75/0.05)] border border-[oklch(0.78_0.15_75/0.5)] flex items-center justify-center shadow-gold">
                <span className="font-display font-black text-lg text-[oklch(0.88_0.18_80)] glow-gold-sm">VS</span>
              </div>

              {/* Connecting lines */}
              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20" viewBox="0 0 400 400">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="oklch(0.78 0.15 75)" stopOpacity="0" />
                    <stop offset="50%" stopColor="oklch(0.78 0.15 75)" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="oklch(0.78 0.15 75)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="200" y1="60" x2="80" y2="320" stroke="url(#lineGrad)" strokeWidth="1" />
                <line x1="200" y1="60" x2="320" y2="320" stroke="url(#lineGrad)" strokeWidth="1" />
                <line x1="80" y1="320" x2="320" y2="320" stroke="url(#lineGrad)" strokeWidth="1" />
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Game Modes Section */}
      <section className="py-20 relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.15_75/0.3)] to-transparent" />
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl font-bold text-chiaroscuro mb-3">CHOOSE YOUR ARENA</h2>
            <p className="text-[oklch(0.45_0.03_264)] text-sm tracking-widest uppercase">Select a game mode to begin</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: "⚔️", title: "RANKED", subtitle: "Competitive",
                desc: "ELO matchmaking. Climb the ranks. Earn seasonal rewards.",
                color: "oklch(0.78 0.15 75)", href: "/game/ranked",
                badge: "Season 1",
              },
              {
                icon: "🎮", title: "CASUAL", subtitle: "No Pressure",
                desc: "Fast matchmaking. Practice freely. No rank changes.",
                color: "oklch(0.65 0.18 145)", href: "/game/casual",
                badge: "Quick Play",
              },
              {
                icon: "🤖", title: "VS AI", subtitle: "Solo Training",
                desc: "4 difficulty levels. Perfect your strategy. No risk.",
                color: "oklch(0.65 0.18 250)", href: "/game/ai",
                badge: "4 Difficulties",
              },
              {
                icon: "👥", title: "FRIENDS", subtitle: "Private Match",
                desc: "Create a room. Share the code. Challenge your friends.",
                color: "oklch(0.65 0.15 310)", href: "/game/friend",
                badge: "Coming Soon",
              },
            ].map((mode, i) => (
              <button
                key={mode.title}
                onClick={() => navigate(mode.href)}
                className="group relative p-6 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.3)] transition-all duration-300 text-left btn-press overflow-hidden"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  style={{ background: `radial-gradient(ellipse at 50% 0%, ${mode.color}10 0%, transparent 70%)` }} />

                <div className="relative z-10">
                  <div className="text-4xl mb-4">{mode.icon}</div>
                  <div className="mb-1">
                    <span className="font-display text-xl font-bold text-[oklch(0.90_0.02_80)] tracking-wide">{mode.title}</span>
                  </div>
                  <div className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: mode.color }}>
                    {mode.subtitle}
                  </div>
                  <p className="text-sm text-[oklch(0.50_0.03_264)] leading-relaxed mb-4">{mode.desc}</p>
                  <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold tracking-widest uppercase"
                    style={{ background: `${mode.color}18`, color: mode.color, border: `1px solid ${mode.color}40` }}>
                    {mode.badge}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      {topPlayers.length > 0 && (
        <section className="py-20 relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.15_75/0.2)] to-transparent" />
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-3xl font-bold text-chiaroscuro">TOP PLAYERS</h2>
                <p className="text-[oklch(0.45_0.03_264)] text-sm mt-1">Global rankings · Season 1</p>
              </div>
              <button onClick={() => navigate("/leaderboard")}
                className="text-sm text-[oklch(0.78_0.15_75)] hover:text-[oklch(0.88_0.18_80)] font-semibold tracking-wide transition-colors">
                View All →
              </button>
            </div>

            <div className="space-y-2">
              {topPlayers.map((player, i) => {
                const rank = (player.rank || "bronze") as Rank;
                const cfg = RANK_CONFIG[rank];
                const winRate = player.totalGames > 0 ? Math.round((player.wins / player.totalGames) * 100) : 0;
                return (
                  <div key={player.id}
                    className="flex items-center gap-4 p-4 rounded-xl glass border border-[oklch(0.25_0.03_264/0.3)] hover:border-[oklch(0.78_0.15_75/0.2)] transition-all duration-200">
                    <div className={`w-8 text-center font-display font-bold text-lg ${i === 0 ? "text-[oklch(0.88_0.18_80)]" : i === 1 ? "text-[oklch(0.75_0.03_264)]" : i === 2 ? "text-[oklch(0.65_0.12_55)]" : "text-[oklch(0.40_0.03_264)]"}`}>
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-[oklch(0.78_0.15_75/0.2)] border border-[oklch(0.78_0.15_75/0.3)] flex items-center justify-center text-sm font-bold text-[oklch(0.88_0.18_80)]">
                      {player.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-[oklch(0.90_0.02_80)] truncate">{player.username}</div>
                      <div className={`text-xs rank-${rank}`}>{cfg.icon} {cfg.label}</div>
                    </div>
                    <div className="text-right hidden sm:block">
                      <div className="font-display font-bold text-[oklch(0.78_0.15_75)]">{player.elo}</div>
                      <div className="text-xs text-[oklch(0.45_0.03_264)]">ELO</div>
                    </div>
                    <div className="text-right hidden md:block">
                      <div className="font-bold text-[oklch(0.90_0.02_80)]">{winRate}%</div>
                      <div className="text-xs text-[oklch(0.45_0.03_264)]">Win Rate</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
