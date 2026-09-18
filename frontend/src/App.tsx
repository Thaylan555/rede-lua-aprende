import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Gamepad2, GraduationCap, Home, LifeBuoy, LogOut, Menu, MoonStar, Search, ShieldCheck, UserRound, X } from "lucide-react";
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
import { HomeV8 } from "./views/HomeV8";
import { LearningV8 } from "./views/LearningV8";
import { StudioV8 } from "./views/StudioV8";
import { LuaIDView } from "./views/LuaIDView";
import { SupportV8 } from "./views/SupportV8";
import type { Role } from "./types";

export type View = "home" | "learn" | "studio" | "profile" | "library" | "play" | "support" | "admin";

const navItems: Array<{ id: View; label: string; icon: typeof Home; mobile?: boolean }> = [
  { id: "home", label: "Início", icon: Home, mobile: true },
  { id: "learn", label: "Aprender", icon: MoonStar, mobile: true },
  { id: "library", label: "Biblioteca", icon: Search },
  { id: "studio", label: "Criar", icon: GraduationCap, mobile: true },
  { id: "play", label: "Jogar", icon: Gamepad2, mobile: true },
  { id: "profile", label: "LuaID", icon: UserRound, mobile: true },
  { id: "support", label: "Suporte", icon: LifeBuoy },
  { id: "admin", label: "Gestão", icon: ShieldCheck },
];

const aliases: Record<string, View> = {
  explore: "library", student: "learn", teacher: "studio", game: "play",
  inicio: "home", aprender: "learn", professor: "studio", perfil: "profile",
};

function getViewFromHash(): View {
  const raw = location.hash.replace(/^#\/?/, "").split("?")[0] || "home";
  const value = aliases[raw] || raw;
  return navItems.some((item) => item.id === value) ? value as View : "home";
}

export default function App() {
  const qc = useQueryClient();
  const [view, setView] = useState<View>(() => getViewFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<Exclude<Role, "admin">>("student");
  const [gameCode, setGameCode] = useState(() => {
    const q = location.hash.split("?")[1] || "";
    return (new URLSearchParams(q).get("code") || "").toUpperCase();
  });

  const session = useQuery({ queryKey: ["session"], queryFn: api.session, staleTime: 60_000, retry: 1 });
  const user = session.data?.user || null;
  const announcements = useQuery({ queryKey: ["announcements-v8", user?.role || "guest"], queryFn: () => api.activeAnnouncements(user?.role), staleTime: 45_000, retry: 1 });

  const visibleNav = useMemo(() => navItems.filter((item) => item.id !== "admin" || user?.role === "admin"), [user?.role]);
  const mobileNav = visibleNav.filter((item) => item.mobile);

  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["session"] }); toast.success("Até a próxima 🌙"); go("home"); },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    initCoreAnalytics();
    const onHash = () => {
      setView(getViewFromHash());
      const code = new URLSearchParams(location.hash.split("?")[1] || "").get("code");
      if (code) setGameCode(code.toUpperCase());
    };
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  const go = (next: View) => {
    setView(next);
    history.pushState(null, "", `#/${next}`);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (role: Exclude<Role, "admin"> = "student") => { setPreferredRole(role); setAuthOpen(true); };
  const join = () => {
    const normalized = gameCode.trim().toUpperCase();
    if (!/^LUA-\d{4,5}$/.test(normalized)) return toast.error("Use um código como LUA-4821.");
    setGameCode(normalized); go("play");
  };

  const currentLabel = navItems.find((item) => item.id === view)?.label || "Início";
  useEffect(() => { trackPage(`Rede Lua • ${currentLabel}`, `${location.pathname}#/${view}`); }, [view, currentLabel]);

  return <div className="v8-app">
    <header className="v8-topbar">
      <div className="v8-shell v8-topbar-inner">
        <button className="v8-menu-button" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
        <button className="v8-brand" onClick={() => { window.dispatchEvent(new CustomEvent("rede-lua:brand-tap")); go("home"); }}><Brand compact /></button>
        <nav className="v8-desktop-nav">{visibleNav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>
        <div className="v8-account">
          {user ? <><button className="v8-user-pill" onClick={() => go("profile")}><AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={56} compact /><span><strong>{user.displayName}</strong><small>{user.role === "teacher" ? "Professor" : user.role === "admin" ? "Gestão" : `Nível ${user.level}`}</small></span></button><button className="v8-icon-button" onClick={() => logout.mutate()} aria-label="Sair"><LogOut /></button></> : <button className="v8-login" onClick={() => openAuth("student")}><UserRound /> Entrar</button>}
        </div>
      </div>
    </header>

    {announcements.data?.[0] && <div className={`v8-announcement tone-${announcements.data[0].style}`}><div className="v8-shell"><MoonStar /><strong>{announcements.data[0].title}</strong><span>{announcements.data[0].body}</span></div></div>}

    {menuOpen && <div className="v8-drawer-layer"><button className="v8-drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" /><aside className="v8-drawer"><div className="v8-drawer-head"><Brand compact /><button onClick={() => setMenuOpen(false)}><X /></button></div><nav>{visibleNav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav><div className="v8-drawer-foot">{user ? <button onClick={() => logout.mutate()}><LogOut /> Sair da conta</button> : <button onClick={() => { setMenuOpen(false); openAuth("student"); }}><UserRound /> Entrar ou criar conta</button>}<small>Rede Lua na Educação • 2026</small></div></aside></div>}

    <main className="v8-main">
      {user?.accountStatus === "suspended" && view !== "admin" ? <div className="v8-shell v8-gate"><ShieldCheck /><span>CONTA PAUSADA</span><h1>Seu acesso está temporariamente pausado.</h1><p>Fale com o suporte da Rede Lua se isso parece um engano.</p><button className="v8-primary" onClick={() => go("support")}>Ir para o suporte</button></div> : <>
        {view === "home" && <HomeV8 code={gameCode} setCode={setGameCode} onJoin={join} onLearn={() => user ? go("learn") : openAuth("student")} onStudio={() => user ? go("studio") : openAuth("teacher")} onProfile={() => user ? go("profile") : openAuth("student")} onSupport={() => go("support")} />}
        {view === "learn" && <LearningV8 user={user} onLogin={() => openAuth("student")} onLibrary={() => go("library")} />}
        {view === "studio" && <StudioV8 user={user} onLogin={() => openAuth("teacher")} />}
        {view === "profile" && <LuaIDView user={user} onLogin={() => openAuth("student")} />}
        {view === "library" && <ExploreView />}
        {view === "play" && <GameView initialCode={gameCode} />}
        {view === "support" && <SupportV8 user={user} />}
        {view === "admin" && <AdminView user={user} />}
      </>}
    </main>

    <EasterEggLayer view={view} user={user} />

    <footer className="v8-footer"><div className="v8-shell"><Brand compact /><p>Aprender, criar e jogar — com a cara da sua turma.</p><div><button onClick={() => go("library")}><BookOpen /> Biblioteca</button><button onClick={() => go("support")}><LifeBuoy /> Suporte</button><span>© 2026 Rede Lua</span></div></div></footer>

    <nav className="v8-mobile-nav">{mobileNav.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>
    <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} preferredRole={preferredRole} />
  </div>;
}
