import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { RANK_CONFIG } from "../../../shared/types";
import type { Rank } from "../../../shared/types";

export default function Tournaments() {
  const { isAuthenticated } = useAuth();
  const [selectedTournament, setSelectedTournament] = useState<number | null>(null);
  const { data: tournaments, refetch } = trpc.tournaments.list.useQuery();
  const { data: participants } = trpc.tournaments.participants.useQuery(
    { tournamentId: selectedTournament! },
    { enabled: selectedTournament !== null }
  );
  const { data: myProfile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const joinMutation = trpc.tournaments.join.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success("🏆 Joined tournament!");
        refetch();
      } else {
        toast.error(res.error || "Failed to join");
      }
    },
  });

  const statusColors: Record<string, string> = {
    upcoming: "oklch(0.78 0.15 75)",
    active: "oklch(0.65 0.18 145)",
    completed: "oklch(0.45 0.03 264)",
  };

  const statusLabels: Record<string, string> = {
    upcoming: "UPCOMING", active: "LIVE", completed: "ENDED",
  };

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">🏆</span>
          <h1 className="font-display text-5xl font-black text-chiaroscuro">TOURNAMENTS</h1>
        </div>
        <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Compete for glory and prizes</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Tournament List */}
        <div className="lg:col-span-2 space-y-4">
          {tournaments?.map(tournament => {
            const statusColor = statusColors[tournament.status] || statusColors.upcoming;
            const spotsLeft = tournament.maxPlayers - tournament.currentPlayers;
            const isFull = spotsLeft <= 0;
            const fillPct = Math.round((tournament.currentPlayers / tournament.maxPlayers) * 100);

            return (
              <div key={tournament.id}
                className={`relative p-6 rounded-2xl border cursor-pointer transition-all duration-300 overflow-hidden ${
                  selectedTournament === tournament.id
                    ? "glass border-[oklch(0.78_0.15_75/0.5)] shadow-gold"
                    : "glass border-[oklch(0.25_0.03_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.3)]"
                }`}
                onClick={() => setSelectedTournament(tournament.id === selectedTournament ? null : tournament.id)}
              >
                {/* Status glow */}
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-8 pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${statusColor} 0%, transparent 70%)`, filter: "blur(20px)" }} />

                <div className="relative z-10">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-display text-xl font-bold text-[oklch(0.90_0.02_80)] mb-1">{tournament.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                          style={{ color: statusColor, background: `${statusColor}18`, border: `1px solid ${statusColor}40` }}>
                          {tournament.status === "active" && <span className="inline-block w-1.5 h-1.5 rounded-full mr-1 bg-current animate-pulse" />}
                          {statusLabels[tournament.status]}
                        </span>
                        <span className="text-xs text-[oklch(0.45_0.03_264)]">Single Elimination</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="flex items-center gap-1 justify-end">
                        <span className="text-sm">🪙</span>
                        <span className="font-display font-bold text-[oklch(0.78_0.15_75)]">{tournament.prizeCoins.toLocaleString()}</span>
                      </div>
                      <div className="text-xs text-[oklch(0.45_0.03_264)]">Prize Pool</div>
                    </div>
                  </div>

                  {/* Players & time */}
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-xs text-[oklch(0.45_0.03_264)] mb-1">
                        <span>{tournament.currentPlayers} / {tournament.maxPlayers} players</span>
                        <span>{isFull ? "FULL" : `${spotsLeft} spots left`}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[oklch(0.15_0.02_264)] overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${fillPct}%`, background: statusColor }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs text-[oklch(0.45_0.03_264)]">Starts</div>
                      <div className="text-xs font-bold text-[oklch(0.78_0.15_75)]">
                        {new Date(tournament.startTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Join button */}
                  {tournament.status === "upcoming" && isAuthenticated && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        joinMutation.mutate({ tournamentId: tournament.id });
                      }}
                      disabled={isFull || joinMutation.isPending}
                      className={`px-5 py-2 rounded-lg font-heading font-bold text-sm tracking-wide transition-all btn-press ${
                        isFull
                          ? "bg-[oklch(0.12_0.015_264)] text-[oklch(0.40_0.03_264)] border border-[oklch(0.20_0.02_264/0.5)] cursor-not-allowed"
                          : "bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.78_0.15_75)] text-[oklch(0.08_0.01_264)] hover:from-[oklch(0.72_0.15_75)] hover:to-[oklch(0.88_0.18_80)] shadow-gold-sm"
                      }`}
                    >
                      {isFull ? "Tournament Full" : "Join Tournament"}
                    </button>
                  )}
                  {!isAuthenticated && tournament.status === "upcoming" && (
                    <button
                      onClick={(e) => { e.stopPropagation(); window.location.href = getLoginUrl(); }}
                      className="px-5 py-2 rounded-lg font-heading font-bold text-sm tracking-wide text-[oklch(0.78_0.15_75)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.1)] transition-all btn-press"
                    >
                      Sign In to Join
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {(!tournaments || tournaments.length === 0) && (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-[oklch(0.45_0.03_264)]">No tournaments scheduled yet.</p>
            </div>
          )}
        </div>

        {/* Bracket / Participants Panel */}
        <div className="space-y-4">
          {selectedTournament && participants ? (
            <div className="p-5 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.2)]">
              <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">PARTICIPANTS</h3>
              {participants.length === 0 ? (
                <p className="text-xs text-[oklch(0.45_0.03_264)] text-center py-4">No participants yet</p>
              ) : (
                <div className="space-y-2">
                  {participants.map((p, i) => {
                    const rank = (p.rank || "bronze") as Rank;
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-[oklch(0.10_0.015_264)] border border-[oklch(0.20_0.02_264/0.4)]">
                        <span className="text-xs text-[oklch(0.40_0.03_264)] font-mono w-4">{i + 1}</span>
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-[oklch(0.88_0.18_80)] rank-bg-${rank} border`}>
                          {(p.username || "?").slice(0, 2).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-bold text-[oklch(0.85_0.02_80)] truncate">{p.username || "Unknown"}</div>
                          <div className={`text-[10px] rank-${rank}`}>{RANK_CONFIG[rank].icon} {RANK_CONFIG[rank].label}</div>
                        </div>
                        <span className="text-xs font-display font-bold text-[oklch(0.65_0.04_264)]">{p.elo}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="p-5 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.4)] text-center">
              <div className="text-4xl mb-3">🎯</div>
              <p className="text-sm text-[oklch(0.45_0.03_264)]">Select a tournament to view participants and bracket</p>
            </div>
          )}

          {/* Tournament info */}
          <div className="p-5 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.4)]">
            <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-3 tracking-wide">HOW IT WORKS</h3>
            <div className="space-y-3 text-xs text-[oklch(0.50_0.03_264)]">
              {[
                { icon: "1️⃣", text: "Join an upcoming tournament before it fills up" },
                { icon: "2️⃣", text: "Tournament starts automatically at the scheduled time" },
                { icon: "3️⃣", text: "Single elimination — win to advance, lose and you're out" },
                { icon: "4️⃣", text: "Champion takes the full prize pool in Royale Coins" },
              ].map(step => (
                <div key={step.icon} className="flex items-start gap-2">
                  <span>{step.icon}</span>
                  <span>{step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
