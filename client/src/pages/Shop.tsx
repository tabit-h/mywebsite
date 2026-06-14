import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

type Category = "all" | "border" | "skin" | "banner" | "effect";

const rarityColors: Record<string, string> = {
  common: "oklch(0.75 0.03 264)",
  rare: "oklch(0.65 0.18 250)",
  epic: "oklch(0.65 0.22 310)",
  legendary: "oklch(0.78 0.15 75)",
};

const rarityLabels: Record<string, string> = {
  common: "Common", rare: "Rare", epic: "Epic", legendary: "Legendary",
};

const categoryIcons: Record<string, string> = {
  all: "🛍️", border: "🖼️", skin: "🎨", banner: "🏳️", effect: "✨",
};

export default function Shop() {
  const [category, setCategory] = useState<Category>("all");
  const { isAuthenticated } = useAuth();
  const { data: items } = trpc.shop.items.useQuery();
  const { data: inventory, refetch: refetchInventory } = trpc.shop.inventory.useQuery(undefined, { enabled: isAuthenticated });
  const { data: profile, refetch: refetchProfile } = trpc.profile.me.useQuery(undefined, { enabled: isAuthenticated });

  const purchaseMutation = trpc.shop.purchase.useMutation({
    onSuccess: (res) => {
      if (res.success) {
        toast.success("🎉 Item purchased!");
        refetchInventory();
        refetchProfile();
      } else {
        toast.error(res.error || "Purchase failed");
      }
    },
    onError: () => toast.error("Purchase failed"),
  });

  const equipMutation = trpc.profile.equipItem.useMutation({
    onSuccess: () => { toast.success("Item equipped!"); refetchProfile(); },
  });

  const ownedKeys = new Set(inventory?.map(i => i.itemKey) || []);

  const filtered = items?.filter(item =>
    category === "all" || item.category === category
  ) || [];

  return (
    <div className="container py-12">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🛍️</span>
            <h1 className="font-display text-5xl font-black text-chiaroscuro">ROYALE SHOP</h1>
          </div>
          <p className="text-[oklch(0.45_0.03_264)] tracking-widest text-sm uppercase">Customize your identity</p>
        </div>
        {profile && (
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[oklch(0.78_0.15_75/0.1)] border border-[oklch(0.78_0.15_75/0.3)]">
            <span className="text-xl">🪙</span>
            <div>
              <div className="font-display font-bold text-[oklch(0.88_0.18_80)]">{profile.coins.toLocaleString()}</div>
              <div className="text-xs text-[oklch(0.55_0.04_80)]">Royale Coins</div>
            </div>
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {(["all", "border", "skin", "banner", "effect"] as Category[]).map(cat => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-heading font-semibold text-sm tracking-wide transition-all duration-200 btn-press ${
              category === cat
                ? "bg-[oklch(0.78_0.15_75/0.15)] text-[oklch(0.88_0.18_80)] border border-[oklch(0.78_0.15_75/0.4)] shadow-gold-sm"
                : "bg-[oklch(0.10_0.015_264)] text-[oklch(0.55_0.04_264)] border border-[oklch(0.25_0.03_264/0.5)] hover:text-[oklch(0.78_0.15_75)]"
            }`}
          >
            <span>{categoryIcons[cat]}</span>
            <span>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(item => {
          const owned = ownedKeys.has(item.key);
          const rarityColor = rarityColors[item.rarity] || rarityColors.common;
          const isEquipped = profile?.equippedBorder === item.key || profile?.equippedSkin === item.key;
          const canAfford = (profile?.coins || 0) >= item.price;

          return (
            <div key={item.id}
              className={`relative p-5 rounded-2xl border transition-all duration-300 overflow-hidden group ${
                owned
                  ? "glass border-[oklch(0.78_0.15_75/0.25)]"
                  : "bg-[oklch(0.09_0.015_264)] border-[oklch(0.20_0.02_264/0.5)] hover:border-[oklch(0.78_0.15_75/0.3)]"
              }`}>
              {/* Rarity glow */}
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10 pointer-events-none"
                style={{ background: `radial-gradient(circle, ${rarityColor} 0%, transparent 70%)`, filter: "blur(15px)" }} />

              <div className="relative z-10">
                {/* Preview */}
                <div className="w-full h-24 rounded-xl mb-4 flex items-center justify-center text-5xl bg-[oklch(0.12_0.015_264)] border border-[oklch(0.20_0.02_264/0.4)]">
                  {item.category === "border" ? "🖼️" :
                   item.category === "skin" ? "🎨" :
                   item.category === "banner" ? "🏳️" : "✨"}
                </div>

                {/* Rarity badge */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{ color: rarityColor, background: `${rarityColor}18`, border: `1px solid ${rarityColor}40` }}>
                    {rarityLabels[item.rarity]}
                  </span>
                  {isEquipped && (
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full text-[oklch(0.65_0.18_145)] bg-[oklch(0.65_0.18_145/0.15)] border border-[oklch(0.65_0.18_145/0.4)]">
                      Equipped
                    </span>
                  )}
                </div>

                <h3 className="font-heading font-bold text-[oklch(0.90_0.02_80)] mb-1">{item.name}</h3>
                <p className="text-xs text-[oklch(0.45_0.03_264)] mb-4 leading-relaxed">{item.description}</p>

                {/* Price / Action */}
                {owned ? (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) return;
                      const type = item.category === "border" ? "border" : "skin";
                      equipMutation.mutate({ type, itemKey: item.key });
                    }}
                    disabled={isEquipped}
                    className={`w-full py-2 rounded-lg font-heading font-bold text-sm tracking-wide transition-all btn-press ${
                      isEquipped
                        ? "bg-[oklch(0.65_0.18_145/0.15)] text-[oklch(0.65_0.18_145)] border border-[oklch(0.65_0.18_145/0.4)] cursor-default"
                        : "bg-[oklch(0.78_0.15_75/0.1)] text-[oklch(0.78_0.15_75)] border border-[oklch(0.78_0.15_75/0.3)] hover:bg-[oklch(0.78_0.15_75/0.2)]"
                    }`}
                  >
                    {isEquipped ? "✓ Equipped" : "Equip"}
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (!isAuthenticated) { window.location.href = getLoginUrl(); return; }
                      if (!canAfford) { toast.error("Not enough coins!"); return; }
                      purchaseMutation.mutate({ itemKey: item.key });
                    }}
                    disabled={purchaseMutation.isPending}
                    className={`w-full py-2 rounded-lg font-heading font-bold text-sm tracking-wide transition-all btn-press flex items-center justify-center gap-2 ${
                      canAfford
                        ? "bg-gradient-to-r from-[oklch(0.65_0.12_75)] to-[oklch(0.78_0.15_75)] text-[oklch(0.08_0.01_264)] hover:from-[oklch(0.72_0.15_75)] hover:to-[oklch(0.88_0.18_80)]"
                        : "bg-[oklch(0.12_0.015_264)] text-[oklch(0.40_0.03_264)] border border-[oklch(0.20_0.02_264/0.5)] cursor-not-allowed"
                    }`}
                  >
                    <span>🪙</span>
                    <span>{item.price.toLocaleString()}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-3">🛍️</div>
          <p className="text-[oklch(0.45_0.03_264)]">No items in this category yet.</p>
        </div>
      )}

      {/* Earn coins tip */}
      <div className="mt-8 p-4 rounded-xl bg-[oklch(0.10_0.015_264)] border border-[oklch(0.25_0.03_264/0.4)]">
        <p className="text-xs text-[oklch(0.45_0.03_264)] leading-relaxed">
          <span className="text-[oklch(0.78_0.15_75)] font-bold">💡 Earn Coins:</span> Win matches (+25 coins), complete ranked games (+50), finish daily challenges (+100), and unlock achievements for bonus rewards.
        </p>
      </div>
    </div>
  );
}
