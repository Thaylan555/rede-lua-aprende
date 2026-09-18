import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Copy, Dices, Globe2, LoaderCircle, LockKeyhole, MoonStar, Palette, Save, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { AvatarVisual } from "../components/AvatarVisual";
import type { AvatarStyle, ProfileTheme, SessionUser } from "../types";

const styles: Array<{ id: AvatarStyle; label: string; note: string }> = [
  { id: "adventurer", label: "Aventureiro", note: "cartoon leve" },
  { id: "lorelei", label: "Lorelei", note: "ilustrado" },
  { id: "micah", label: "Micah", note: "moderno" },
  { id: "big-smile", label: "Big Smile", note: "expressivo" },
  { id: "fun-emoji", label: "Fun Emoji", note: "bem divertido" },
  { id: "croodles", label: "Croodles", note: "desenhado" },
  { id: "bottts", label: "Robô", note: "futurista" },
  { id: "pixel-art", label: "Pixel", note: "arcade" },
  { id: "personas", label: "Personas", note: "limpo" },
  { id: "notionists", label: "Notionists", note: "editorial" },
];

const themes: Array<{ label: string; theme: ProfileTheme }> = [
  { label: "Lua", theme: { accent: "#ffbd2e", surface: "#0b2d68", background: "#07162f", card: "#fffaf0", pattern: "stars" } },
  { label: "Aurora", theme: { accent: "#4de8d4", surface: "#6d4aff", background: "#160d3b", card: "#fffaff", pattern: "orbit" } },
  { label: "Arcade", theme: { accent: "#35f2b5", surface: "#7c3cff", background: "#070815", card: "#f7f6ff", pattern: "grid" } },
  { label: "Caderno", theme: { accent: "#ffbd2e", surface: "#2158a8", background: "#edf4ff", card: "#ffffff", pattern: "grid" } },
];

const subjects = ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Física", "Química", "Biologia", "Artes"];

export function LuaIDView({ user, onLogin }: { user: SessionUser | null; onLogin: () => void }) {
  const qc = useQueryClient();
  const manifest = useQuery({ queryKey: ["luaid", user?.id], queryFn: api.luaIdManifest, enabled: Boolean(user), staleTime: 15_000, retry: 1 });
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [title, setTitle] = useState(user?.profileTitle || "Explorador Lunar");
  const [bio, setBio] = useState(user?.bio || "");
  const [handle, setHandle] = useState(user?.profileHandle || "");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user?.avatarStyle || "adventurer");
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || crypto.randomUUID());
  const [theme, setTheme] = useState<ProfileTheme>(user?.profileTheme || themes[0].theme);
  const [visibility, setVisibility] = useState<"private" | "classroom">(user?.profileVisibility || "private");
  const [favorites, setFavorites] = useState<string[]>(user?.favoriteSubjects || []);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName); setTitle(user.profileTitle); setBio(user.bio); setAvatarStyle(user.avatarStyle); setAvatarSeed(user.avatarSeed);
    setTheme(user.profileTheme); setVisibility(user.profileVisibility); setFavorites(user.favoriteSubjects); setHandle(user.profileHandle || manifest.data?.handle || "");
  }, [user?.id]);
  useEffect(() => { if (manifest.data?.handle) setHandle(manifest.data.handle); }, [manifest.data?.handle]);

  const save = useMutation({
    mutationFn: async () => {
      if (handle && handle !== manifest.data?.handle) await api.setProfileHandle(handle);
      return api.updateProfile({ displayName, bio, profileTitle: title, avatarStyle, avatarSeed, avatarConfig: user!.avatarConfig, profileTheme: theme, visibility, favoriteSubjects: favorites });
    },
    onSuccess: async () => { toast.success("LuaID atualizado!"); await qc.invalidateQueries({ queryKey: ["session"] }); await qc.invalidateQueries({ queryKey: ["luaid"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return <div className="v8-shell v8-gate"><div className="v8-gate-orb"><UserRound /></div><span>LUAID</span><h1>Seu perfil, mas com identidade de verdade.</h1><p>Entre para criar seu avatar, cartão, @nome e perfil usado em toda a Rede Lua.</p><button className="v8-primary" onClick={onLogin}>Criar meu LuaID</button></div>;

  const apiPath = `${location.origin}/api/luaid/profile/${handle || "seu_nome"}`;
  const level = manifest.data?.level ?? user.level;
  const player = manifest.data?.player;

  return <div className="v8-shell v8-luaid">
    <header className="v8-luaid-head"><div><span className="v8-kicker"><MoonStar /> LUAID</span><h1>Um perfil que também é uma <em>identidade digital</em> da Rede Lua.</h1><p>Você monta uma vez e a mesma identidade pode aparecer na plataforma, em cartões e em outros projetos por API.</p></div><div className="v8-api-pill"><Globe2 /><span><strong>LuaID API</strong><small>v1 • ativo</small></span></div></header>

    <section className="v8-luaid-layout">
      <div className="v8-luaid-preview" style={{ ["--id-accent" as string]: theme.accent, ["--id-surface" as string]: theme.surface, ["--id-bg" as string]: theme.background, ["--id-card" as string]: theme.card }}>
        <div className={`v8-id-card pattern-${theme.pattern}`}>
          <div className="v8-id-cover"><span>LUAID • {user.role === "teacher" ? "PROFESSOR" : user.role === "admin" ? "GESTÃO" : "ALUNO"}</span></div>
          <div className="v8-id-avatar"><AvatarVisual style={avatarStyle} seed={avatarSeed} config={user.avatarConfig} size={220} /></div>
          <div className="v8-id-main"><small>@{handle || "seu_nome"}</small><h2>{displayName || "Seu nome"}</h2><span>{title || "Explorador Lunar"}</span><p>{bio || "Sua bio aparece aqui. Curta, humana e com a sua cara."}</p></div>
          <div className="v8-id-stats"><span><strong>{level}</strong><small>Nível</small></span><span><strong>{player?.gamesCompleted || 0}</strong><small>Missões</small></span><span><strong>{user.moonCoins}</strong><small>Luas</small></span></div>
          <div className="v8-id-subjects">{favorites.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
        </div>
        <button className="v8-reroll" onClick={() => setAvatarSeed(crypto.randomUUID())}><Dices /> Gerar outra combinação</button>
      </div>

      <div className="v8-luaid-editor">
        <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>IDENTIDADE</span><h2>Como você aparece por aqui</h2></div><UserRound /></div><div className="v8-form-grid"><label>Nome<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={32} /></label><label>@LuaID<input value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24))} placeholder="meu_nome" /></label><label className="wide">Título<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={42} placeholder="Guia do Quasar" /></label><label className="wide">Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={220} placeholder="Conte um pouco sobre o que você curte aprender ou ensinar." /></label></div></section>

        <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>AVATAR LAB</span><h2>Escolha uma base. O resto é seu.</h2></div><WandSparkles /></div><div className="v8-avatar-style-grid">{styles.map((s) => <button key={s.id} className={avatarStyle === s.id ? "active" : ""} onClick={() => setAvatarStyle(s.id)}><AvatarVisual style={s.id} seed={`luaid-${s.id}`} config={{}} size={100} compact /><span><strong>{s.label}</strong><small>{s.note}</small></span>{avatarStyle === s.id && <Check />}</button>)}</div><p className="v8-api-note">Os avatares usam a API open source do DiceBear por trás, mas o LuaID guarda uma identidade única da Rede Lua: avatar + cartão + progresso + @handle.</p></section>

        <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>CARTÃO</span><h2>Escolha a atmosfera</h2></div><Palette /></div><div className="v8-theme-preset-grid">{themes.map((t) => <button key={t.label} onClick={() => setTheme(t.theme)} className={theme.background === t.theme.background ? "active" : ""}><i style={{ background: `linear-gradient(135deg,${t.theme.surface},${t.theme.accent})` }} /><strong>{t.label}</strong></button>)}</div><div className="v8-subject-picks"><strong>Matérias que fazem parte de você</strong><div>{subjects.map((s) => <button key={s} className={favorites.includes(s) ? "active" : ""} onClick={() => setFavorites((f) => f.includes(s) ? f.filter((x) => x !== s) : [...f, s].slice(-8))}>{s}</button>)}</div></div></section>

        <section className="v8-id-editor-card v8-api-card"><div className="v8-panel-title"><div><span>PERFIL POR API</span><h2>Seu LuaID pode existir além desta tela.</h2></div><Globe2 /></div><label className="v8-visibility"><input type="checkbox" checked={visibility === "classroom"} onChange={(e) => setVisibility(e.target.checked ? "classroom" : "private")} /><span>{visibility === "classroom" ? <Globe2 /> : <LockKeyhole />}<strong>{visibility === "classroom" ? "Perfil compartilhável" : "Perfil privado"}</strong><small>{visibility === "classroom" ? "Seu cartão público pode ser lido pela LuaID API." : "A API pública não retorna seu perfil."}</small></span></label><div className="v8-endpoint"><code>{apiPath}</code><button onClick={() => { navigator.clipboard?.writeText(apiPath); toast.success("Endpoint copiado."); }}><Copy /></button></div></section>

        <button className="v8-primary v8-save-wide" disabled={save.isPending || displayName.trim().length < 2 || title.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? <LoaderCircle className="spin" /> : <Save />} Salvar meu LuaID</button>
      </div>
    </section>
  </div>;
}
