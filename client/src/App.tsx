import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Navbar from "./components/Navbar";
import ParticleBackground from "./components/ParticleBackground";

// Pages
import Home from "./pages/Home";
import Play from "./pages/Play";
import Game from "./pages/Game";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Challenges from "./pages/Challenges";
import Shop from "./pages/Shop";
import Tournaments from "./pages/Tournaments";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/play" component={Play} />
      <Route path="/game/:mode" component={Game} />
      <Route path="/leaderboard" component={Leaderboard} />
      <Route path="/profile" component={Profile} />
      <Route path="/achievements" component={Achievements} />
      <Route path="/challenges" component={Challenges} />
      <Route path="/shop" component={Shop} />
      <Route path="/tournaments" component={Tournaments} />
      <Route path="/settings" component={Settings} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground relative">
      <ParticleBackground />
      {/* Vignette overlay */}
      <div className="fixed inset-0 pointer-events-none z-[1]"
        style={{ background: "radial-gradient(ellipse at center, transparent 50%, oklch(0.04 0.01 264 / 0.7) 100%)" }} />
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <main>
          <Router />
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            theme="dark"
            toastOptions={{
              style: {
                background: "oklch(0.09 0.015 264)",
                border: "1px solid oklch(0.78 0.15 75 / 0.3)",
                color: "oklch(0.90 0.02 80)",
              },
            }}
          />
          <Layout />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
