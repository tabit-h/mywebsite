import { describe, expect, it } from "vitest";
import { calculateElo, eloToRank } from "./db";

describe("ELO calculation", () => {
  it("winner gains ELO and loser loses ELO", () => {
    const { winnerChange, loserChange } = calculateElo(1000, 1000);
    expect(winnerChange).toBeGreaterThan(0);
    expect(loserChange).toBeLessThan(0);
  });

  it("upsets give more ELO to winner", () => {
    const { winnerChange: upsetWin } = calculateElo(900, 1200); // lower beats higher
    const { winnerChange: normalWin } = calculateElo(1200, 900); // higher beats lower
    expect(upsetWin).toBeGreaterThan(normalWin);
  });

  it("draw gives small adjustments", () => {
    const { winnerChange, loserChange } = calculateElo(1000, 1000, true);
    expect(Math.abs(winnerChange)).toBeLessThan(5);
    expect(Math.abs(loserChange)).toBeLessThan(5);
  });
});

describe("eloToRank", () => {
  it("maps ELO to correct ranks", () => {
    expect(eloToRank(500)).toBe("bronze");
    expect(eloToRank(1099)).toBe("bronze");
    expect(eloToRank(1100)).toBe("silver");
    expect(eloToRank(1299)).toBe("silver");
    expect(eloToRank(1300)).toBe("gold");
    expect(eloToRank(1599)).toBe("gold");
    expect(eloToRank(1600)).toBe("platinum");
    expect(eloToRank(1999)).toBe("platinum");
    expect(eloToRank(2000)).toBe("diamond");
    expect(eloToRank(3000)).toBe("diamond");
  });
});

describe("RPS game logic", () => {
  const getRoundResult = (p1: string, p2: string): "win" | "loss" | "draw" => {
    if (p1 === p2) return "draw";
    if (
      (p1 === "rock" && p2 === "scissors") ||
      (p1 === "paper" && p2 === "rock") ||
      (p1 === "scissors" && p2 === "paper")
    ) return "win";
    return "loss";
  };

  it("rock beats scissors", () => expect(getRoundResult("rock", "scissors")).toBe("win"));
  it("paper beats rock", () => expect(getRoundResult("paper", "rock")).toBe("win"));
  it("scissors beats paper", () => expect(getRoundResult("scissors", "paper")).toBe("win"));
  it("same move is draw", () => {
    expect(getRoundResult("rock", "rock")).toBe("draw");
    expect(getRoundResult("paper", "paper")).toBe("draw");
    expect(getRoundResult("scissors", "scissors")).toBe("draw");
  });
  it("rock loses to paper", () => expect(getRoundResult("rock", "paper")).toBe("loss"));
  it("paper loses to scissors", () => expect(getRoundResult("paper", "scissors")).toBe("loss"));
  it("scissors loses to rock", () => expect(getRoundResult("scissors", "rock")).toBe("loss"));
});

describe("auth.logout", () => {
  it("clears session cookie", async () => {
    const { appRouter } = await import("./routers");
    const { COOKIE_NAME } = await import("../shared/const");
    const clearedCookies: { name: string; options: Record<string, unknown> }[] = [];
    const ctx = {
      user: { id: 1, openId: "test", name: "Test", email: null, loginMethod: null, role: "user" as const, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as any,
      res: { clearCookie: (name: string, opts: Record<string, unknown>) => clearedCookies.push({ name, options: opts }) } as any,
    };
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result).toEqual({ success: true });
    expect(clearedCookies).toHaveLength(1);
    expect(clearedCookies[0]?.name).toBe(COOKIE_NAME);
  });
});
