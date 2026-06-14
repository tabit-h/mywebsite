export type Move = "rock" | "paper" | "scissors";
export type RoundResult = "win" | "loss" | "draw";
export type Rank = "bronze" | "silver" | "gold" | "platinum" | "diamond";
export type GameMode = "ranked" | "casual" | "ai" | "friend";
export type AiDifficulty = "easy" | "medium" | "hard" | "impossible";

export interface RoundData {
  playerMove: Move;
  aiMove: Move;
  result: RoundResult;
}

export const RANK_CONFIG: Record<Rank, {
  label: string;
  color: string;
  bgClass: string;
  minElo: number;
  maxElo: number;
  icon: string;
}> = {
  bronze: { label: "Bronze", color: "#c97a3a", bgClass: "rank-bg-bronze", minElo: 0, maxElo: 1099, icon: "🥉" },
  silver: { label: "Silver", color: "#a8b4c0", bgClass: "rank-bg-silver", minElo: 1100, maxElo: 1299, icon: "🥈" },
  gold: { label: "Gold", color: "#d4a843", bgClass: "rank-bg-gold", minElo: 1300, maxElo: 1599, icon: "🥇" },
  platinum: { label: "Platinum", color: "#5bc4d4", bgClass: "rank-bg-platinum", minElo: 1600, maxElo: 1999, icon: "💎" },
  diamond: { label: "Diamond", color: "#7b9ef0", bgClass: "rank-bg-diamond", minElo: 2000, maxElo: 9999, icon: "💠" },
};

export const MOVE_CONFIG: Record<Move, { emoji: string; label: string; beats: Move; color: string }> = {
  rock: { emoji: "🪨", label: "Rock", beats: "scissors", color: "oklch(0.65 0.12 55)" },
  paper: { emoji: "📄", label: "Paper", beats: "rock", color: "oklch(0.78 0.15 75)" },
  scissors: { emoji: "✂️", label: "Scissors", beats: "paper", color: "oklch(0.75 0.18 230)" },
};
