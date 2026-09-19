import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3, BookOpen, BrainCircuit, Gamepad2, GraduationCap, Home, LifeBuoy,
  LogOut, Menu, MoonStar, Search, ShieldCheck, Sparkles, Trophy, UserRound, X
} from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { initCoreAnalytics, trackPage } from "./analytics";
import { Brand } from "./components/Brand";
import { AuthDialog } from "./components/AuthDialog";
import { AvatarVisual } from "./components/AvatarVisual";
import { EasterEggLayer } from "./components/EasterEggLayer";
import { ExploreView } from "./views/ExploreView";
import { GameView } from "./views/GameView";
import { AdminView } from "./views/AdminView";
import { HomeV9 } from "./views/HomeV9";
import { LearningV8 } from "./views/LearningV8";
import { StudioV8 } from "./views/StudioV8";
import { LuaIDView } from "./views/LuaIDView";
import { SupportV8 } from "./views/SupportV8";
import { RecordsV9 } from "./views/RecordsV9";
import { ImpactV9 } from "./views/ImpactV9";
import { useRegionalVoice, type RegionalVoice } from "./regionalVoice";
import type { Role } from "./types";

export type View = "home" | "learn" | "studio" | "profile" | "library" | "play" | "records" | "impact" | "support" | "admin";

const navItems: Array<{ id: View; label: string; icon: typeof Home; mobile?: boolean; group: "main" | "more" }> = [
  { id: "home", label: "Início", icon: Home, mobile: true, group: "main" },
  { id: "learn", label: "Aprender", icon: BrainCircuit, mobile: true, group: "main" },
  { id: "play", label: "Jogar", icon: Gamepad2, mobile: true, group: "main" },
  { id: "studio", label: "Criar", icon: GraduationCap, mobile: true, group: "main" },
  { id: "profile", label: "LuaID", icon: UserRound, mobile: true, group: "main" },
  { id: "records", label: "Recordes", icon: Trophy, group: "more" },
  { id: "library", label: "Biblioteca", icon: Search, group: "more" },
  { id: "impact", label: "Impacto", icon: BarChart3, group: "more" },
  { id: "support", label: "Suporte", icon: LifeBuoy, group: "more" },
  { id: "admin", label: "Gestão", icon: ShieldCheck, group: "more" },
];

const aliases: Record<string, View> = {
  explore: "library", student: "learn", teacher: "studio", game: "play", inicio: "home", aprender: "learn",
  professor: "studio", perfil: "profile", record: "records", recordes: "records", diretoria: "impact",
};

function getViewFromHash(): View {
  const raw = location.hash.replace(/^#\/?/, "").split("?")[0] || "home";
  const value = aliases[raw] || raw;
  return navItems.some((item) => item.id === value) ? value as View : "home";
}

function VoiceControl({ mode, onChange }: { mode: RegionalVoice; onChange: (mode: RegionalVoice) => void }) {
  return <div className="v9-voice-control"><span>Modo Prosa</span><div>{(["mix","mineiro","baiano","neutro"] as RegionalVoice[]).map((id) => <button key={id} className={mode === id ? "active" : ""} onClick={() => onChange(id)} title={id}>{id === "mix" ? "BR" : id === "mineiro" ? "Uai" : id === "baiano" ? "Oxente" : "Normal"}</button>)}</div></div>;
}

export default function App() {
  const qc = useQueryClient();
  const voice = useRegionalVoice();
  const [view, setView] = useState<View>(() => getViewFromHash());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<Exclude<Role, "admin">>("student");
  const [gameCode, setGameCode] = useState(() => {
    const q = location.hash.split("?")[1] || "";
    return (new URLSearchParams(q).get("code") || "").toUpperCase();
  });

  const session = useQuery({ queryKey: ["session"], queryFn: api.session, staleTime: 60_000, retry: 1 });
  const user = session.data?.user || null;
  const announcements = useQuery({ queryKey: ["announcements-v9", user?.role || "guest"], queryFn: () => api.activeAnnouncements(user?.role), staleTime: 45_000, retry: 1 });

  const visibleNav = useMemo(() => navItems.filter((item) => item.id !== "admin" || user?.role === "admin"), [user?.role]);
  const mainNav = visibleNav.filter((item) => item.group === "main");
  const moreNav = visibleNav.filter((item) => item.group === "more");
  const mobileNav = mainNav.filter((item) => item.mobile);

  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["session"] }); toast.success("Falou! A Lua fica acesa pra quando você voltar 🌙"); go("home"); },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    initCoreAnalytics();
    const onHash = () => {
      setView(getViewFromHash());
      const code = new URLSearchParams(location.hash.split("?")[1] || "").get("code");
      if (code) setGameCode(code.toUpperCase());
    };
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setCommandOpen((v) => !v); }
      if (event.key === "Escape") { setCommandOpen(false); setDrawerOpen(false); }
    };
    addEventListener("hashchange", onHash); addEventListener("keydown", onKey);
    return () => { removeEventListener("hashchange", onHash); removeEventListener("keydown", onKey); };
  }, []);

  const go = (next: View) => {
    setView(next); history.pushState(null, "", `#/${next}`); setDrawerOpen(false); setCommandOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openAuth = (role: Exclude<Role, "admin"> = "student") => { setPreferredRole(role); setAuthOpen(true); };
  const join = () => {
    const normalized = gameCode.trim().toUpperCase();
    if (!/^LUA-\d{4,5}$/.test(normalized)) return toast.error("Uai, esse PIN tá estranho. Usa algo tipo LUA-4821.");
    setGameCode(normalized); go("play");
  };
  const currentLabel = navItems.find((item) => item.id === view)?.label || "Início";
  useEffect(() => { trackPage(`Rede Lua • ${currentLabel}`, `${location.pathname}#/${view}`); }, [view, currentLabel]);

  const accountHint = user ? `${user.role === "teacher" ? "Professor" : user.role === "admin" ? "Gestão" : `Nível ${user.level}`} • Vida ${user.lifeNumber}` : "Entrar";

  const renderView = () => {
    if (user?.accountStatus === "suspended" && view !== "admin") return <div className="v9-gate v9-page-width"><div className="v9-gate-orb"><ShieldCheck /></div><span>CONTA PAUSADA</span><h1>Seu acesso está temporariamente pausado.</h1><p>Se isso parece um engano, chama o suporte que a gente confere.</p><button className="v9-cta primary" onClick={() => go("support")}>Ir para o suporte</button></div>;
    switch (view) {
      case "home": return <HomeV9 user={user} code={gameCode} setCode={setGameCode} onJoin={join} onLearn={() => user ? go("learn") : openAuth("student")} onStudio={() => user ? go("studio") : openAuth("teacher")} onProfile={() => user ? go("profile") : openAuth("student")} onRecords={() => user ? go("records") : openAuth("student")} onImpact={() => go("impact")} />;
      case "learn": return <LearningV8 user={user} onLogin={() => openAuth("student")} onLibrary={() => go("library")} />;
      case "studio": return <StudioV8 user={user} onLogin={() => openAuth("teacher")} />;
      case "profile": return <LuaIDView user={user} onLogin={() => openAuth("student")} />;
      case "records": return <RecordsV9 user={user} onLogin={() => openAuth("student")} onProfile={() => go("profile")} />;
      case "impact": return <ImpactV9 user={user} onStudio={() => user ? go("studio") : openAuth("teacher")} onLearn={() => user ? go("learn") : openAuth("student")} />;
      case "library": return <ExploreView />;
      case "play": return <GameView initialCode={gameCode} />;
      case "support": return <SupportV8 user={user} />;
      case "admin": return <AdminView user={user} />;
    }
  };

  return <div className="v9-app">
    <aside className="v9-rail">
      <button className="v9-rail-brand" onClick={() => { window.dispatchEvent(new CustomEvent("rede-lua:brand-tap")); go("home"); }}><Brand compact /></button>
      <nav className="v9-rail-main">{mainNav.map(({ id, label, icon: Icon }) => <button key={id} data-label={label} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>
      <div className="v9-rail-divider" />
      <nav className="v9-rail-more">{moreNav.map(({ id, label, icon: Icon }) => <button key={id} data-label={label} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>
      <div className="v9-rail-bottom"><button className="v9-command-trigger" onClick={() => setCommandOpen(true)}><Sparkles /><span>Atalho</span><kbd>⌘K</kbd></button><VoiceControl mode={voice.mode} onChange={voice.setMode} /></div>
    </aside>

    <div className="v9-workspace">
      <header className="v9-hud">
        <div className="v9-hud-left"><button className="v9-mobile-menu" onClick={() => setDrawerOpen(true)}><Menu /></button><div><span>{currentLabel}</span><small>{view === "records" ? voice.say("record") : view === "studio" ? voice.say("teacher") : view === "learn" ? voice.say("nextMission") : "Rede Lua na Educação"}</small></div></div>
        <div className="v9-hud-status"><i /><span>Universo online</span></div>
        <div className="v9-hud-account">{user ? <><button className="v9-account-card" onClick={() => go("profile")}><AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={46} compact /><span><strong>{user.displayName}</strong><small>{accountHint}</small></span></button><button className="v9-icon-button" onClick={() => logout.mutate()} aria-label="Sair"><LogOut /></button></> : <button className="v9-login-button" onClick={() => openAuth("student")}><UserRound /> Entrar</button>}</div>
      </header>

      {announcements.data?.[0] && <div className={`v9-announcement tone-${announcements.data[0].style}`}><MoonStar /><strong>{announcements.data[0].title}</strong><span>{announcements.data[0].body}</span></div>}

      <AnimatePresence mode="wait">
        <motion.main key={view} className="v9-main" initial={{ opacity: 0, y: 12, filter: "blur(3px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(2px)" }} transition={{ duration: .22, ease: [0.22, 1, 0.36, 1] }}>{renderView()}</motion.main>
      </AnimatePresence>

      <footer className="v9-footer"><div><Brand compact /><span>Aprender, criar e jogar — agora com Recordes e Nova Vida.</span></div><div><button onClick={() => go("impact")}><BarChart3 /> Impacto</button><button onClick={() => go("support")}><LifeBuoy /> Suporte</button><span>© 2026 Rede Lua</span></div></footer>
    </div>

    <EasterEggLayer view={view as any} user={user} />

    <nav className="v9-mobile-dock">{mobileNav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>

    {drawerOpen && <div className="v9-drawer-layer"><button className="v9-drawer-backdrop" onClick={() => setDrawerOpen(false)} /><motion.aside className="v9-drawer" initial={{ x: -320 }} animate={{ x: 0 }}><div className="v9-drawer-head"><Brand compact /><button onClick={() => setDrawerOpen(false)}><X /></button></div><nav>{visibleNav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav><VoiceControl mode={voice.mode} onChange={voice.setMode} /></motion.aside></div>}

    {commandOpen && <div className="v9-command-layer"><button className="v9-dialog-backdrop" onClick={() => setCommandOpen(false)} /><motion.section className="v9-command" initial={{ opacity: 0, scale: .96, y: -12 }} animate={{ opacity: 1, scale: 1, y: 0 }}><div className="v9-command-head"><Sparkles /><div><strong>Comando Lunar</strong><small>Pra onde vamos agora?</small></div><kbd>ESC</kbd></div><div className="v9-command-grid">{visibleNav.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => go(id)}><Icon /><span>{label}</span><small>{id === "records" ? "recordes e vidas" : id === "impact" ? "modo diretoria" : id === "learn" ? "trilha sem gabarito" : id === "studio" ? "criação do professor" : "abrir área"}</small></button>)}</div></motion.section></div>}

    <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} preferredRole={preferredRole} />
  </div>;
}
