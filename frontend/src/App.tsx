import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BookOpen, Gamepad2, GraduationCap, Home, LogOut, Menu, MoonStar, Search, Sparkles, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "./api";
import { initCoreAnalytics, trackPage } from "./analytics";
import { Brand } from "./components/Brand";
import { AuthDialog } from "./components/AuthDialog";
import { HomeView } from "./views/HomeView";
import { ExploreView } from "./views/ExploreView";
import { TeacherView } from "./views/TeacherView";
import { GameView } from "./views/GameView";
import { StudentView } from "./views/StudentView";
import { ProfileView } from "./views/ProfileView";
import { AvatarVisual } from "./components/AvatarVisual";
import type { Role } from "./types";

export type View = "home" | "explore" | "student" | "profile" | "teacher" | "game";

const navItems: Array<{ id: View; label: string; icon: typeof Home }> = [
  { id: "home", label: "Início", icon: Home },
  { id: "explore", label: "Explorar", icon: Search },
  { id: "student", label: "Minha trilha", icon: Sparkles },
  { id: "profile", label: "Meu perfil", icon: UserRound },
  { id: "teacher", label: "Professor", icon: GraduationCap },
  { id: "game", label: "Partida", icon: Gamepad2 },
];

function getViewFromHash(): View {
  const value = location.hash.replace(/^#\/?/, "").split("?")[0];
  return navItems.some((item) => item.id === value) ? value as View : "home";
}

export default function App() {
  const queryClient = useQueryClient();
  const [view, setViewState] = useState<View>(() => getViewFromHash());
  const [menuOpen, setMenuOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [preferredRole, setPreferredRole] = useState<Exclude<Role, "admin">>("student");
  const [gameCode, setGameCode] = useState("");
  const session = useQuery({ queryKey: ["session"], queryFn: api.session, staleTime: 60_000, retry: 1 });
  const user = session.data?.user || null;

  const logout = useMutation({
    mutationFn: api.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["session"] });
      toast.success("Sessão encerrada.");
      go("home");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  useEffect(() => {
    initCoreAnalytics();
    const onHash = () => setViewState(getViewFromHash());
    addEventListener("hashchange", onHash);
    return () => removeEventListener("hashchange", onHash);
  }, []);

  const go = (next: View) => {
    setViewState(next);
    history.pushState(null, "", `#/${next}`);
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openAuth = (role: Exclude<Role, "admin"> = "student") => {
    setPreferredRole(role);
    setAuthOpen(true);
  };

  const joinFromHome = () => {
    const normalized = gameCode.trim().toUpperCase();
    if (!/^LUA-\d{4,5}$/.test(normalized)) return toast.error("Use um código como LUA-4821.");
    setGameCode(normalized);
    go("game");
  };

  const currentLabel = useMemo(() => navItems.find((item) => item.id === view)?.label || "Início", [view]);

  useEffect(() => {
    trackPage(`Rede Lua • ${currentLabel}`, `${location.pathname}#/${view}`);
  }, [view, currentLabel]);

  return <div className="app-shell">
    <header className="site-header">
      <div className="page-width header-inner">
        <button className="mobile-menu" onClick={() => setMenuOpen(true)} aria-label="Abrir menu"><Menu /></button>
        <button className="brand-button" onClick={() => go("home")}><Brand compact /></button>
        <nav className="desktop-nav" aria-label="Navegação principal">{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /> {label}</button>)}</nav>
        <div className="header-account">
          {user ? <><button className="user-chip" onClick={() => go("profile")}><span className="user-chip-avatar"><AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={72} compact /></span><div><strong>{user.displayName}</strong><small>{user.role === "teacher" ? "Professor" : user.role === "admin" ? "Gestão" : `Nível ${user.level}`}</small></div></button><button className="icon-button" onClick={() => logout.mutate()} title="Sair"><LogOut /></button></> : <button className="login-button" onClick={() => openAuth("student")}><UserRound /> Entrar</button>}
        </div>
      </div>
    </header>

    {menuOpen && <div className="drawer-layer"><button className="drawer-backdrop" onClick={() => setMenuOpen(false)} aria-label="Fechar menu" /><aside className="mobile-drawer"><div className="drawer-head"><Brand compact /><button className="icon-button" onClick={() => setMenuOpen(false)}><X /></button></div><span className="drawer-current"><MoonStar /> {currentLabel}</span><nav>{navItems.map(({ id, label, icon: Icon }) => <button key={id} className={view === id ? "active" : ""} onClick={() => go(id)}><Icon /><span>{label}</span></button>)}</nav>{user ? <button className="drawer-login" onClick={() => logout.mutate()}><LogOut /> Sair da conta</button> : <button className="drawer-login" onClick={() => { setMenuOpen(false); openAuth("student"); }}><UserRound /> Entrar ou criar conta</button>}</aside></div>}

    <main className="site-main">
      {view === "home" && <HomeView code={gameCode} setCode={setGameCode} onJoin={joinFromHome} onTeacher={() => user ? go("teacher") : openAuth("teacher")} onExplore={() => go("explore")} onStudent={() => user ? go("student") : openAuth("student")} />}
      {view === "explore" && <ExploreView />}
      {view === "student" && <StudentView user={user} onLogin={() => openAuth("student")} onExplore={() => go("explore")} />}
      {view === "profile" && <ProfileView user={user} onLogin={() => openAuth("student")} />}
      {view === "teacher" && <TeacherView user={user} onLogin={() => openAuth("teacher")} />}
      {view === "game" && <GameView initialCode={gameCode} />}
    </main>

    <footer className="site-footer">
      <div className="page-width footer-inner"><Brand compact /><p>Aprender, criar e descobrir em uma experiência feita para a turma.</p><div><button onClick={() => go("explore")}><BookOpen /> Fontes educacionais</button><span>Rede Lua na educação • 2026</span></div></div>
    </footer>

    <AuthDialog open={authOpen} onClose={() => setAuthOpen(false)} preferredRole={preferredRole} />
  </div>;
}
