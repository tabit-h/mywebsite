import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { RANK_CONFIG } from "../../../shared/types";
import type { Rank } from "../../../shared/types";
import {
  Menu, X, Trophy, Swords, Users, ShoppingBag,
  BarChart3, Star, LogOut, Settings, User, Coins
} from "lucide-react";

const navLinks = [
  { href: "/play", label: "Play", icon: Swords },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/tournaments", label: "Tournaments", icon: Star },
  { href: "/shop", label: "Shop", icon: ShoppingBag },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { data: profile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const rank = (profile?.rank || "bronze") as Rank;
  const rankCfg = RANK_CONFIG[rank];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16">
        {/* Backdrop */}
        <div className="absolute inset-0 bg-[oklch(0.06_0.01_264/0.95)] backdrop-blur-xl border-b border-[oklch(0.78_0.15_75/0.12)]" />
        {/* Gold top line */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[oklch(0.78_0.15_75/0.6)] to-transparent" />

        <div className="relative container h-full flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[oklch(0.78_0.15_75/0.3)] to-[oklch(0.78_0.15_75/0.05)] border border-[oklch(0.78_0.15_75/0.4)] flex items-center justify-center shadow-gold-sm group-hover:shadow-gold transition-all duration-300">
              <span className="text-lg">⚔️</span>
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-display text-lg font-bold text-chiaroscuro tracking-wider">RPS</span>
              <span className="font-display text-[10px] font-semibold text-[oklch(0.78_0.15_75)] tracking-[0.3em] uppercase">ROYALE</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = location === href || location.startsWith(href + "/");
              return (
                <Link key={href} href={href}>
                  <button className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-heading font-semibold tracking-wide transition-all duration-200 btn-press ${
                    active
                      ? "text-[oklch(0.88_0.18_80)] bg-[oklch(0.78_0.15_75/0.12)] border border-[oklch(0.78_0.15_75/0.3)]"
                      : "text-[oklch(0.65_0.04_264)] hover:text-[oklch(0.88_0.18_80)] hover:bg-[oklch(0.78_0.15_75/0.06)]"
                  }`}>
                    <Icon size={14} />
                    {label}
                  </button>
                </Link>
              );
            })}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Online indicator */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[oklch(0.65_0.18_145)] pulse-gold" />
              <span className="text-xs text-[oklch(0.55_0.04_80)] font-mono">2,847 online</span>
            </div>

            {isAuthenticated && profile ? (
              <>
                {/* Coins */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.25)]">
                  <span className="text-xs">🪙</span>
                  <span className="text-xs font-bold text-[oklch(0.88_0.18_80)] font-mono">{profile.coins.toLocaleString()}</span>
                </div>

                {/* Profile dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.3)] transition-all duration-200 btn-press">
                      <Avatar className="w-7 h-7">
                        <AvatarImage src={profile.avatarUrl || undefined} />
                        <AvatarFallback className="bg-[oklch(0.78_0.15_75/0.2)] text-[oklch(0.88_0.18_80)] text-xs font-bold">
                          {profile.username.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="hidden sm:flex flex-col items-start leading-none">
                        <span className="text-xs font-semibold text-[oklch(0.90_0.02_80)]">{profile.username}</span>
                        <span className={`text-[10px] font-bold uppercase tracking-wide rank-${rank}`}>
                          {rankCfg.icon} {rankCfg.label}
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52 bg-[oklch(0.09_0.015_264)] border-[oklch(0.78_0.15_75/0.2)] text-[oklch(0.90_0.02_80)]">
                    <div className="px-3 py-2 border-b border-[oklch(0.25_0.03_264/0.5)]">
                      <p className="text-sm font-bold">{profile.username}</p>
                      <p className={`text-xs rank-${rank}`}>{rankCfg.icon} {rankCfg.label} · {profile.elo} ELO</p>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center gap-2 cursor-pointer">
                        <User size={14} /> Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/achievements" className="flex items-center gap-2 cursor-pointer">
                        <Star size={14} /> Achievements
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/challenges" className="flex items-center gap-2 cursor-pointer">
                        <BarChart3 size={14} /> Daily Challenges
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center gap-2 cursor-pointer">
                        <Settings size={14} /> Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-[oklch(0.25_0.03_264/0.5)]" />
                    <DropdownMenuItem onClick={logout} className="text-[oklch(0.65_0.15_25)] focus:text-[oklch(0.75_0.18_25)] cursor-pointer">
                      <LogOut size={14} className="mr-2" /> Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                size="sm"
                className="bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.78_0.15_75)] text-[oklch(0.08_0.01_264)] font-bold font-heading tracking-wide hover:from-[oklch(0.72_0.15_75)] hover:to-[oklch(0.88_0.18_80)] shadow-gold-sm btn-press"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden p-1.5 rounded-lg text-[oklch(0.65_0.04_264)] hover:text-[oklch(0.88_0.18_80)] hover:bg-[oklch(0.78_0.15_75/0.06)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden absolute top-16 left-0 right-0 bg-[oklch(0.07_0.01_264/0.98)] backdrop-blur-xl border-b border-[oklch(0.78_0.15_75/0.12)] py-3">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)}>
                <div className="flex items-center gap-3 px-6 py-3 text-[oklch(0.75_0.04_264)] hover:text-[oklch(0.88_0.18_80)] hover:bg-[oklch(0.78_0.15_75/0.06)] transition-colors">
                  <Icon size={16} />
                  <span className="font-heading font-semibold tracking-wide">{label}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </nav>
      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}
