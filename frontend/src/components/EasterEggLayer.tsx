import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Sparkles, Star } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import type { SessionUser } from "../types";
import type { View } from "../App";
import { LumiMoment } from "./LumiMoment";

const fragmentByView: Partial<Record<View, string>> = {
  home: "fragment-1",
  explore: "fragment-2",
  student: "fragment-3",
  profile: "fragment-4",
  teacher: "fragment-5",
};

const guestKey = "rede-lua-guest-secrets";
const readGuest = () => {
  try { return new Set<string>(JSON.parse(localStorage.getItem(guestKey) || "[]")); }
  catch { return new Set<string>(); }
};
const writeGuest = (set: Set<string>) => localStorage.setItem(guestKey, JSON.stringify([...set]));

export function EasterEggLayer({ view, user }: { view: View; user: SessionUser | null }) {
  const flags = useQuery({ queryKey:["public-feature-flags"], queryFn:api.publicFeatureFlags, staleTime:60_000, retry:1 });
  const [guestSecrets, setGuestSecrets] = useState<Set<string>>(() => readGuest());
  const [showLumi, setShowLumi] = useState(false);
  const [lumiText, setLumiText] = useState("psiu… tem umas coisas escondidas por aqui 👀");
  const [eclipseActive, setEclipseActive] = useState(() => document.documentElement.classList.contains("rede-lua-eclipse"));
  const taps = useRef<number[]>([]);
  const secretQuery = useQuery({ queryKey:["my-secrets",user?.id], queryFn:api.mySecrets, enabled:Boolean(user), staleTime:20_000, retry:1 });
  const serverSecrets = useMemo(() => new Set<string>(Array.isArray(secretQuery.data) ? secretQuery.data : []), [secretQuery.data]);
  const secrets = user ? serverSecrets : guestSecrets;
  const currentFragment = fragmentByView[view];
  const secretsEnabled = flags.data?.secret_stars === true;
  const eclipseEnabled = flags.data?.eclipse_mode === true;
  const lumiEnabled = flags.data?.lumi_moments === true;

  const saveSecret = async (secretId: string) => {
    if (user) {
      try {
        const result = await api.claimSecret(secretId);
        await secretQuery.refetch();
        if (result.new && result.reward) toast.success(`Segredo encontrado! +${result.reward} Luas 🌙`);
      } catch { /* segredo é bônus; não deve travar a interface */ }
    } else {
      const next = new Set(guestSecrets); next.add(secretId); writeGuest(next); setGuestSecrets(next);
    }
  };

  useEffect(() => {
    const onBrandTap = () => {
      if (!eclipseEnabled) return;
      const now = Date.now();
      taps.current = [...taps.current.filter((time) => now - time < 5500), now];
      if (taps.current.length < 7) return;
      taps.current = [];
      document.documentElement.classList.toggle("rede-lua-eclipse");
      const active = document.documentElement.classList.contains("rede-lua-eclipse");
      setEclipseActive(active);
      toast(active ? "🌘 Modo Eclipse descoberto." : "☀️ Eclipse encerrado.");
      if (active) void saveSecret("eclipse");
      void confetti({ particleCount: 45, spread: 76, origin: { y: .2 }, disableForReducedMotion: true });
    };
    window.addEventListener("rede-lua:brand-tap", onBrandTap as EventListener);
    return () => window.removeEventListener("rede-lua:brand-tap", onBrandTap as EventListener);
  }, [eclipseEnabled, user, guestSecrets]);

  useEffect(() => {
    if (!lumiEnabled || sessionStorage.getItem("rede-lua-lumi-seen")) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("rede-lua-lumi-seen", "1");
      setShowLumi(true);
      window.setTimeout(() => setShowLumi(false), 9000);
    }, 18000 + Math.floor(Math.random() * 12000));
    return () => clearTimeout(timer);
  }, [lumiEnabled]);

  const collectFragment = async () => {
    if (!currentFragment) return;
    const fragmentSet = new Set([...secrets].filter((id) => id.startsWith("fragment-")));
    fragmentSet.add(currentFragment);
    const nextCount = fragmentSet.size;
    await saveSecret(currentFragment);
    setLumiText(nextCount >= 5 ? "você achou todos! Isso merece uma constelação ✨" : `fragmento ${nextCount}/5. Tem mais por aí…`);
    setShowLumi(true);
    void confetti({ particleCount: 26, spread: 48, origin: { x: .86, y: .35 }, disableForReducedMotion: true });
    if (nextCount >= 5 && !secrets.has("cartografo-lunar")) {
      await saveSecret("cartografo-lunar");
      toast.success("🏅 Conquista secreta: Cartógrafo Lunar");
    }
  };

  return <>
    {secretsEnabled && currentFragment && !secrets.has(currentFragment) && <button className={`secret-star secret-star-${view}`} onClick={collectFragment} aria-label="Estrela misteriosa"><Star /><span>?</span></button>}
    {showLumi && <LumiMoment kind={secrets.size >= 3 ? "cheer" : "curious"} message={lumiText} onClose={() => setShowLumi(false)} floating />}
    {eclipseActive && <div className="eclipse-orbit" aria-hidden="true"><Sparkles /></div>}
  </>;
}
