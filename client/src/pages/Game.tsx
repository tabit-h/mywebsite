import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { MOVE_CONFIG, RANK_CONFIG } from "../../../shared/types";
import type { Move, RoundResult, AiDifficulty, Rank } from "../../../shared/types";

type GamePhase = "setup" | "choosing" | "revealing" | "roundResult" | "matchOver";

interface RoundData {
  playerMove: Move;
  aiMove: Move;
  result: RoundResult;
}

const ROUNDS_TO_WIN = 3;

const difficulties: { id: AiDifficulty; label: string; desc: string; color: string }[] = [
  { id: "easy", label: "Easy", desc: "Random moves", color: "oklch(0.65 0.18 145)" },
  { id: "medium", label: "Medium", desc: "Learns patterns", color: "oklch(0.78 0.15 75)" },
  { id: "hard", label: "Hard", desc: "Counters you", color: "oklch(0.65 0.15 25)" },
  { id: "impossible", label: "Impossible", desc: "Always counters", color: "oklch(0.65 0.22 25)" },
];

export default function Game() {
  const params = useParams<{ mode: string }>();
  const mode = (params.mode || "ai") as "ranked" | "casual" | "ai" | "friend";
  const [, navigate] = useLocation();
  const { isAuthenticated } = useAuth();
  const { data: profile, refetch: refetchProfile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const [phase, setPhase] = useState<GamePhase>("setup");
  const [difficulty, setDifficulty] = useState<AiDifficulty>("medium");
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [rounds, setRounds] = useState<RoundData[]>([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [playerMove, setPlayerMove] = useState<Move | null>(null);
  const [aiMove, setAiMove] = useState<Move | null>(null);
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null);
  const [matchResult, setMatchResult] = useState<"win" | "loss" | "draw" | null>(null);
  const [countdown, setCountdown] = useState(3);
  const [showCountdown, setShowCountdown] = useState(false);
  const [eloChange, setEloChange] = useState(0);
  const [newRank, setNewRank] = useState<Rank | null>(null);
  const [rankUp, setRankUp] = useState(false);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const [newAchievements, setNewAchievements] = useState<string[]>([]);

  const playRoundMutation = trpc.game.playRound.useMutation();
  const finishMatchMutation = trpc.game.finishMatch.useMutation();

  const startMatch = () => {
    setPhase("choosing");
    setPlayerScore(0);
    setAiScore(0);
    setRounds([]);
    setCurrentRound(1);
  };

  const handleChoice = useCallback(async (move: Move) => {
    if (phase !== "choosing") return;
    setPlayerMove(move);
    setPhase("revealing");

    // Countdown
    setShowCountdown(true);
    for (let i = 3; i >= 1; i--) {
      setCountdown(i);
      await new Promise(r => setTimeout(r, 400));
    }
    setShowCountdown(false);

    // Get AI move
    const playerHistory = rounds.map(r => r.playerMove);
    const result = await playRoundMutation.mutateAsync({
      playerMove: move,
      aiDifficulty: difficulty,
      playerHistory,
    });

    setAiMove(result.aiMove as Move);
    setRoundResult(result.result as RoundResult);
    setPhase("roundResult");

    const newRounds = [...rounds, { playerMove: move, aiMove: result.aiMove as Move, result: result.result as RoundResult }];
    setRounds(newRounds);

    const newPS = playerScore + (result.result === "win" ? 1 : 0);
    const newAS = aiScore + (result.result === "loss" ? 1 : 0);
    setPlayerScore(newPS);
    setAiScore(newAS);

    // Check match end
    await new Promise(r => setTimeout(r, 1800));

    if (newPS >= ROUNDS_TO_WIN || newAS >= ROUNDS_TO_WIN || currentRound >= 5) {
      const isWin = newPS > newAS;
      const isDraw = newPS === newAS;
      setMatchResult(isWin ? "win" : isDraw ? "draw" : "loss");
      setPhase("matchOver");

      if (isAuthenticated) {
        try {
          const res = await finishMatchMutation.mutateAsync({
            mode,
            aiDifficulty: difficulty,
            playerScore: newPS,
            opponentScore: newAS,
            rounds: newRounds,
            isWin,
            isDraw,
          });
          setEloChange(res.eloChange);
          setNewRank(res.newRank as Rank);
          setRankUp(res.rankUp);
          setCoinsEarned(res.coinsEarned);
          setNewAchievements(res.newAchievements);
          refetchProfile();

          if (res.rankUp) {
            toast.success(`🎉 RANK UP! You are now ${RANK_CONFIG[res.newRank as Rank].label}!`, { duration: 5000 });
          }
          if (res.newAchievements.length > 0) {
            toast.success(`🏆 Achievement Unlocked!`, { duration: 3000 });
          }
        } catch (e) {
          console.error("Failed to save match", e);
        }
      }
    } else {
      setCurrentRound(r => r + 1);
      await new Promise(r => setTimeout(r, 500));
      setPlayerMove(null);
      setAiMove(null);
      setRoundResult(null);
      setPhase("choosing");
    }
  }, [phase, rounds, playerScore, aiScore, currentRound, difficulty, mode, isAuthenticated]);

  const resetGame = () => {
    setPhase("setup");
    setPlayerScore(0);
    setAiScore(0);
    setRounds([]);
    setCurrentRound(1);
    setPlayerMove(null);
    setAiMove(null);
    setRoundResult(null);
    setMatchResult(null);
    setEloChange(0);
    setNewRank(null);
    setRankUp(false);
    setCoinsEarned(0);
    setNewAchievements([]);
  };

  const modeLabel = { ranked: "RANKED", casual: "CASUAL", ai: "VS AI", friend: "FRIENDS" }[mode];
  const modeColor = { ranked: "oklch(0.78 0.15 75)", casual: "oklch(0.65 0.18 145)", ai: "oklch(0.65 0.18 250)", friend: "oklch(0.65 0.15 310)" }[mode];

  return (
    <div className="container py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <button onClick={() => navigate("/play")} className="text-sm text-[oklch(0.45_0.03_264)] hover:text-[oklch(0.78_0.15_75)] transition-colors mb-1">
            ← Back to Modes
          </button>
          <h1 className="font-display text-3xl font-black text-chiaroscuro">{modeLabel}</h1>
        </div>
        {profile && (
          <div className="text-right">
            <div className={`text-sm font-bold rank-${profile.rank}`}>
              {RANK_CONFIG[profile.rank as Rank].icon} {RANK_CONFIG[profile.rank as Rank].label}
            </div>
            <div className="text-xs text-[oklch(0.45_0.03_264)]">{profile.elo} ELO</div>
          </div>
        )}
      </div>

      {/* Setup Phase */}
      {phase === "setup" && (
        <div className="space-y-6 animate-fade-in-up">
          {mode === "ai" && (
            <div>
              <h2 className="font-heading text-lg font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">SELECT DIFFICULTY</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {difficulties.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDifficulty(d.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 text-left btn-press ${
                      difficulty === d.id
                        ? "border-[oklch(0.78_0.15_75/0.6)] bg-[oklch(0.78_0.15_75/0.1)] shadow-gold-sm"
                        : "border-[oklch(0.25_0.03_264/0.5)] bg-[oklch(0.10_0.015_264)] hover:border-[oklch(0.78_0.15_75/0.3)]"
                    }`}
                  >
                    <div className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-1" style={{ color: difficulty === d.id ? d.color : undefined }}>{d.label}</div>
                    <div className="text-xs text-[oklch(0.45_0.03_264)]">{d.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-6 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.2)] text-center">
            <div className="text-6xl mb-4">⚔️</div>
            <h2 className="font-display text-2xl font-bold text-chiaroscuro mb-2">READY TO BATTLE?</h2>
            <p className="text-[oklch(0.50_0.03_264)] mb-6">First to win {ROUNDS_TO_WIN} rounds wins the match</p>
            <button
              onClick={startMatch}
              className="px-10 py-4 rounded-xl font-display font-black text-xl tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold hover:shadow-gold transition-all duration-300 btn-press"
            >
              START MATCH
            </button>
          </div>
        </div>
      )}

      {/* Active Game */}
      {(phase === "choosing" || phase === "revealing" || phase === "roundResult") && (
        <div className="space-y-6">
          {/* Score Board */}
          <div className="grid grid-cols-3 gap-4 items-center">
            {/* Player */}
            <div className="text-center p-4 rounded-xl glass border border-[oklch(0.78_0.15_75/0.2)]">
              <div className="text-xs text-[oklch(0.45_0.03_264)] uppercase tracking-widest mb-1">You</div>
              <div className="font-display text-5xl font-black text-[oklch(0.88_0.18_80)]">{playerScore}</div>
              {profile && <div className={`text-xs rank-${profile.rank} mt-1`}>{profile.username}</div>}
            </div>

            {/* Round info */}
            <div className="text-center">
              <div className="text-xs text-[oklch(0.45_0.03_264)] uppercase tracking-widest mb-1">Round</div>
              <div className="font-display text-3xl font-bold text-[oklch(0.78_0.15_75)]">{currentRound}</div>
              <div className="text-xs text-[oklch(0.35_0.02_264)] mt-1">of 5</div>
            </div>

            {/* AI */}
            <div className="text-center p-4 rounded-xl glass border border-[oklch(0.25_0.03_264/0.5)]">
              <div className="text-xs text-[oklch(0.45_0.03_264)] uppercase tracking-widest mb-1">Opponent</div>
              <div className="font-display text-5xl font-black text-[oklch(0.65_0.15_25)]">{aiScore}</div>
              <div className="text-xs text-[oklch(0.45_0.03_264)] mt-1">
                {mode === "ai" ? `AI (${difficulty})` : "Opponent"}
              </div>
            </div>
          </div>

          {/* Round progress dots */}
          <div className="flex justify-center gap-2">
            {Array.from({ length: 5 }).map((_, i) => {
              const round = rounds[i];
              return (
                <div key={i} className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  !round ? "bg-[oklch(0.20_0.02_264)]" :
                  round.result === "win" ? "bg-[oklch(0.65_0.18_145)]" :
                  round.result === "loss" ? "bg-[oklch(0.55_0.22_25)]" :
                  "bg-[oklch(0.55_0.04_264)]"
                }`} />
              );
            })}
          </div>

          {/* Countdown */}
          {showCountdown && (
            <div className="text-center">
              <div className="font-display text-8xl font-black text-chiaroscuro glow-gold animate-rank-up">{countdown}</div>
            </div>
          )}

          {/* Choice Reveal */}
          {phase === "roundResult" && playerMove && aiMove && (
            <div className="grid grid-cols-3 gap-4 items-center">
              <div className="text-center animate-choice-reveal">
                <div className="text-7xl mb-2">{MOVE_CONFIG[playerMove].emoji}</div>
                <div className="font-heading font-bold text-[oklch(0.90_0.02_80)] tracking-wide">{MOVE_CONFIG[playerMove].label}</div>
              </div>
              <div className="text-center">
                <div className={`font-display text-2xl font-black tracking-wide ${
                  roundResult === "win" ? "text-[oklch(0.65_0.18_145)] glow-gold-sm" :
                  roundResult === "loss" ? "text-[oklch(0.55_0.22_25)]" :
                  "text-[oklch(0.55_0.04_264)]"
                }`}>
                  {roundResult === "win" ? "WIN!" : roundResult === "loss" ? "LOSS" : "DRAW"}
                </div>
              </div>
              <div className="text-center animate-choice-reveal" style={{ animationDelay: "0.1s" }}>
                <div className="text-7xl mb-2">{MOVE_CONFIG[aiMove].emoji}</div>
                <div className="font-heading font-bold text-[oklch(0.55_0.04_264)] tracking-wide">{MOVE_CONFIG[aiMove].label}</div>
              </div>
            </div>
          )}

          {/* Choice Buttons */}
          {phase === "choosing" && (
            <div>
              <p className="text-center text-sm text-[oklch(0.45_0.03_264)] mb-6 tracking-widest uppercase">Choose your move</p>
              <div className="grid grid-cols-3 gap-4">
                {(["rock", "paper", "scissors"] as Move[]).map((move) => (
                  <button
                    key={move}
                    onClick={() => handleChoice(move)}
                    className="group rps-btn p-6 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.5)] hover:shadow-gold transition-all duration-200 text-center"
                  >
                    <div className="text-6xl sm:text-7xl mb-3 group-hover:scale-110 transition-transform duration-200">
                      {MOVE_CONFIG[move].emoji}
                    </div>
                    <div className="font-heading font-bold text-sm tracking-widest uppercase text-[oklch(0.65_0.04_264)] group-hover:text-[oklch(0.88_0.18_80)] transition-colors">
                      {MOVE_CONFIG[move].label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Waiting for reveal */}
          {phase === "revealing" && !showCountdown && (
            <div className="text-center py-8">
              <div className="text-4xl animate-spin-slow inline-block">⚙️</div>
              <p className="text-[oklch(0.45_0.03_264)] mt-3">Revealing...</p>
            </div>
          )}
        </div>
      )}

      {/* Match Over */}
      {phase === "matchOver" && matchResult && (
        <div className={`text-center space-y-6 animate-fade-in-up ${
          matchResult === "win" ? "animate-win-flash" : matchResult === "loss" ? "animate-loss-flash" : ""
        }`}>
          <div className="p-8 rounded-2xl glass border border-[oklch(0.78_0.15_75/0.2)]">
            {/* Result */}
            <div className="text-7xl mb-4 animate-rank-up">
              {matchResult === "win" ? "🏆" : matchResult === "loss" ? "💀" : "🤝"}
            </div>
            <h2 className={`font-display text-5xl font-black mb-2 ${
              matchResult === "win" ? "text-chiaroscuro glow-gold" :
              matchResult === "loss" ? "text-[oklch(0.55_0.22_25)]" :
              "text-[oklch(0.65_0.04_264)]"
            }`}>
              {matchResult === "win" ? "VICTORY!" : matchResult === "loss" ? "DEFEAT" : "DRAW"}
            </h2>
            <p className="text-[oklch(0.50_0.03_264)] mb-6">
              {playerScore} — {aiScore} · {rounds.length} rounds
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              {isAuthenticated && eloChange !== 0 && (
                <div className="p-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)]">
                  <div className={`font-display text-2xl font-bold ${eloChange > 0 ? "text-[oklch(0.65_0.18_145)]" : "text-[oklch(0.55_0.22_25)]"}`}>
                    {eloChange > 0 ? "+" : ""}{eloChange}
                  </div>
                  <div className="text-xs text-[oklch(0.45_0.03_264)]">ELO Change</div>
                </div>
              )}
              {coinsEarned > 0 && (
                <div className="p-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)]">
                  <div className="font-display text-2xl font-bold text-[oklch(0.78_0.15_75)]">+{coinsEarned}</div>
                  <div className="text-xs text-[oklch(0.45_0.03_264)]">🪙 Coins</div>
                </div>
              )}
              {newAchievements.length > 0 && (
                <div className="p-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)]">
                  <div className="font-display text-2xl font-bold text-[oklch(0.78_0.15_75)]">{newAchievements.length}</div>
                  <div className="text-xs text-[oklch(0.45_0.03_264)]">🏆 Unlocked</div>
                </div>
              )}
            </div>

            {/* Rank up */}
            {rankUp && newRank && (
              <div className="mb-6 p-4 rounded-xl bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.4)] animate-rank-up">
                <div className="text-3xl mb-1">🎉</div>
                <div className="font-display font-bold text-[oklch(0.88_0.18_80)] glow-gold">RANK UP!</div>
                <div className={`text-lg font-bold rank-${newRank}`}>
                  {RANK_CONFIG[newRank].icon} {RANK_CONFIG[newRank].label}
                </div>
              </div>
            )}

            {/* Round history */}
            <div className="flex justify-center gap-2 mb-6">
              {rounds.map((r, i) => (
                <div key={i} className="text-center">
                  <div className={`text-xs px-2 py-1 rounded font-bold ${
                    r.result === "win" ? "bg-[oklch(0.65_0.18_145/0.2)] text-[oklch(0.65_0.18_145)]" :
                    r.result === "loss" ? "bg-[oklch(0.55_0.22_25/0.2)] text-[oklch(0.55_0.22_25)]" :
                    "bg-[oklch(0.55_0.04_264/0.2)] text-[oklch(0.55_0.04_264)]"
                  }`}>
                    {MOVE_CONFIG[r.playerMove].emoji} vs {MOVE_CONFIG[r.aiMove].emoji}
                  </div>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={resetGame}
                className="px-8 py-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press"
              >
                Play Again
              </button>
              <button
                onClick={() => navigate("/play")}
                className="px-8 py-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.78_0.15_75)] bg-[oklch(0.78_0.15_75/0.08)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.15)] transition-all btn-press"
              >
                Change Mode
              </button>
              {isAuthenticated && (
                <button
                  onClick={() => navigate("/profile")}
                  className="px-8 py-3 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.65_0.04_264)] bg-[oklch(0.12_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] hover:text-[oklch(0.88_0.18_80)] transition-all btn-press"
                >
                  View Profile
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
