import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function Settings() {
  const { isAuthenticated, logout } = useAuth();
  const { data: profile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");

  const updateMutation = trpc.profile.update.useMutation({
    onSuccess: () => toast.success("Profile updated!"),
    onError: () => toast.error("Update failed"),
  });

  if (!isAuthenticated) {
    return (
      <div className="container py-20 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="font-display text-3xl font-bold text-chiaroscuro mb-3">Sign In Required</h2>
        <button onClick={() => window.location.href = getLoginUrl()}
          className="px-8 py-3 rounded-xl font-heading font-bold text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold btn-press">
          Sign In
        </button>
      </div>
    );
  }

  const handleSave = () => {
    const updates: { username?: string; bio?: string } = {};
    if (username.trim()) updates.username = username.trim();
    if (bio.trim()) updates.bio = bio.trim();
    if (Object.keys(updates).length === 0) { toast.error("No changes to save"); return; }
    updateMutation.mutate(updates);
  };

  return (
    <div className="container py-12 max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-5xl font-black text-chiaroscuro mb-2">SETTINGS</h1>
        <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Manage your account</p>
      </div>

      <div className="space-y-6">
        {/* Profile Settings */}
        <div className="p-6 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.5)]">
          <h2 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">PROFILE</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[oklch(0.55_0.04_264)] uppercase tracking-widest mb-2">Username</label>
              <input
                type="text"
                placeholder={profile?.username || "Your username"}
                value={username}
                onChange={e => setUsername(e.target.value)}
                maxLength={24}
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] text-[oklch(0.90_0.02_80)] placeholder-[oklch(0.35_0.02_264)] focus:outline-none focus:border-[oklch(0.78_0.15_75/0.5)] transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[oklch(0.55_0.04_264)] uppercase tracking-widest mb-2">Bio</label>
              <textarea
                placeholder={profile?.bio || "Tell the world about yourself..."}
                value={bio}
                onChange={e => setBio(e.target.value)}
                maxLength={160}
                rows={3}
                className="w-full px-4 py-3 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.5)] text-[oklch(0.90_0.02_80)] placeholder-[oklch(0.35_0.02_264)] focus:outline-none focus:border-[oklch(0.78_0.15_75/0.5)] transition-colors resize-none"
              />
              <div className="text-xs text-[oklch(0.35_0.02_264)] text-right mt-1">{bio.length}/160</div>
            </div>
            <button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="px-6 py-2.5 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.08_0.01_264)] bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.88_0.18_80)] shadow-gold-sm btn-press disabled:opacity-50"
            >
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Account Info */}
        <div className="p-6 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.5)]">
          <h2 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">ACCOUNT</h2>
          <div className="space-y-3">
            {[
              { label: "Player ID", value: profile?.userId ? `#${profile.userId}` : "—" },
              { label: "Member Since", value: profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—" },
              { label: "Login Method", value: "Manus OAuth" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-[oklch(0.20_0.02_264/0.4)]">
                <span className="text-sm text-[oklch(0.50_0.03_264)]">{item.label}</span>
                <span className="text-sm font-semibold text-[oklch(0.80_0.02_80)]">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Preferences */}
        <div className="p-6 rounded-2xl glass border border-[oklch(0.25_0.03_264/0.5)]">
          <h2 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-4 tracking-wide">PREFERENCES</h2>
          <div className="space-y-3">
            {[
              { label: "Sound Effects", desc: "Game sounds and notifications" },
              { label: "Animations", desc: "Particle effects and transitions" },
              { label: "Match Notifications", desc: "Alerts for tournament matches" },
            ].map(pref => (
              <div key={pref.label} className="flex items-center justify-between py-2">
                <div>
                  <div className="text-sm font-semibold text-[oklch(0.80_0.02_80)]">{pref.label}</div>
                  <div className="text-xs text-[oklch(0.45_0.03_264)]">{pref.desc}</div>
                </div>
                <button
                  onClick={() => toast.info("Preference settings coming soon")}
                  className="w-11 h-6 rounded-full bg-[oklch(0.78_0.15_75/0.3)] border border-[oklch(0.78_0.15_75/0.4)] relative transition-all hover:bg-[oklch(0.78_0.15_75/0.5)]"
                >
                  <div className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-[oklch(0.78_0.15_75)]" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Sign Out */}
        <div className="p-6 rounded-2xl glass border border-[oklch(0.55_0.22_25/0.2)]">
          <h2 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-2 tracking-wide">DANGER ZONE</h2>
          <p className="text-xs text-[oklch(0.45_0.03_264)] mb-4">Sign out of your account on this device.</p>
          <button
            onClick={logout}
            className="px-6 py-2.5 rounded-xl font-heading font-bold tracking-wide text-[oklch(0.75_0.18_25)] bg-[oklch(0.55_0.22_25/0.1)] border border-[oklch(0.55_0.22_25/0.3)] hover:bg-[oklch(0.55_0.22_25/0.2)] transition-all btn-press"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
