import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Dices, Glasses, LoaderCircle, MoonStar, Palette, Save, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { AVATAR_STYLES, buildAvatarUrl, humanizeAvatarOption, loadAvatarOptions, usefulAvatarOptions } from "../avatar";
import type { AvatarConfig, AvatarStyle, ProfileTheme, SessionUser } from "../types";

const subjects = ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Física", "Química", "Biologia", "Artes"];

function randomSeed() {
  return `lua-${crypto.randomUUID().replace(/-/g, "").slice(0, 18)}`;
}

export function ProfileView({ user, onLogin }: { user: SessionUser | null; onLogin: () => void }) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [profileTitle, setProfileTitle] = useState(user?.profileTitle || "Explorador Lunar");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user?.avatarStyle || "adventurer");
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || randomSeed());
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(user?.avatarConfig || {});
  const [profileTheme, setProfileTheme] = useState<ProfileTheme>(user?.profileTheme || { accent: "#ffbd2e", surface: "#0b2d68", background: "#071c45", card: "#ffffff", pattern: "stars" });
  const [visibility, setVisibility] = useState<"private" | "classroom">(user?.profileVisibility || "private");
  const [favoriteSubjects, setFavoriteSubjects] = useState<string[]>(user?.favoriteSubjects || []);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName); setBio(user.bio); setProfileTitle(user.profileTitle); setAvatarStyle(user.avatarStyle);
    setAvatarSeed(user.avatarSeed); setAvatarConfig(user.avatarConfig); setProfileTheme(user.profileTheme);
    setVisibility(user.profileVisibility); setFavoriteSubjects(user.favoriteSubjects);
  }, [user?.id]);

  const avatarOptions = useQuery({ queryKey: ["dicebear-options", avatarStyle], queryFn: () => loadAvatarOptions(avatarStyle), staleTime: 60 * 60 * 1000, retry: 1 });
  const curatedOptions = useMemo(() => avatarOptions.data ? usefulAvatarOptions(avatarOptions.data) : [], [avatarOptions.data]);
  const avatarUrl = useMemo(() => buildAvatarUrl(avatarStyle, avatarSeed, avatarConfig, 360), [avatarStyle, avatarSeed, avatarConfig]);

  const save = useMutation({
    mutationFn: () => api.updateProfile({ displayName: displayName.trim(), bio: bio.trim(), profileTitle: profileTitle.trim(), avatarStyle, avatarSeed, avatarConfig, profileTheme, visibility, favoriteSubjects }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["session"] }); toast.success("Perfil lunar atualizado."); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return <div className="page-width page-pad"><section className="profile-gate"><div className="gate-icon"><UserRound /></div><span>ESTÚDIO DE PERFIL</span><h1>Crie seu personagem na Rede Lua.</h1><p>Aluno e professor podem montar um avatar, escolher o visual do cartão e personalizar a identidade sem enviar uma foto real.</p><button className="button button-primary" onClick={onLogin}>Entrar ou criar conta</button></section></div>;

  const roleLabel = user.role === "teacher" ? "Professor" : user.role === "admin" ? "Gestão" : "Aluno";
  const setOption = (key: string, value: string | number | boolean | string[]) => setAvatarConfig((current) => ({ ...current, [key]: value }));
  const removeOption = (key: string) => setAvatarConfig((current) => { const next = { ...current }; delete next[key]; return next; });

  return <div className="page-width page-pad profile-view">
    <header className="profile-page-head"><div><span className="eyebrow"><Sparkles size={16} /> Mega Perfil</span><h1>Seu perfil também faz parte da experiência.</h1><p>O avatar usa DiceBear e pode rodar na API pública ou em uma instância própria. O Supabase guarda só as escolhas do personagem e do cartão.</p></div><div className="profile-role-pill"><ShieldCheck /><span>{roleLabel}</span></div></header>

    <section className="profile-studio-grid">
      <aside className={`profile-preview pattern-${profileTheme.pattern}`} style={{ ["--profile-bg" as string]: profileTheme.background, ["--profile-surface" as string]: profileTheme.surface, ["--profile-accent" as string]: profileTheme.accent, ["--profile-card" as string]: profileTheme.card }}>
        <div className="profile-cover"><MoonStar /><span>REDE LUA • {roleLabel.toUpperCase()}</span></div>
        <div className="profile-avatar-shell"><img src={avatarUrl} alt={`Avatar de ${displayName}`} /></div>
        <div className="profile-preview-copy"><span>{profileTitle || "Explorador Lunar"}</span><h2>{displayName || "Seu nome"}</h2><p>{bio || "Sua bio aparece aqui. Conte um pouco sobre o que você gosta de aprender."}</p></div>
        <div className="profile-stat-row"><div><strong>{user.level}</strong><span>Nível</span></div><div><strong>{user.xp.toLocaleString("pt-BR")}</strong><span>XP</span></div><div><strong>{user.streakDays}</strong><span>Sequência</span></div></div>
        <div className="profile-subject-chips">{favoriteSubjects.length ? favoriteSubjects.slice(0, 4).map((subject) => <span key={subject}>{subject}</span>) : <span>Escolha matérias favoritas</span>}</div>
      </aside>

      <div className="profile-editor-stack">
        <section className="profile-editor-card"><div className="panel-heading"><div><span>IDENTIDADE</span><h2>Nome, título e bio</h2></div><UserRound /></div><div className="profile-fields two"><label>Nome de exibição<input value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 32))} maxLength={32} /></label><label>Título do perfil<input value={profileTitle} onChange={(e) => setProfileTitle(e.target.value.slice(0, 42))} maxLength={42} placeholder="Explorador Lunar" /></label></div><label>Bio<textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 220))} maxLength={220} placeholder="O que você gosta de aprender?" /><small>{bio.length}/220</small></label><div className="visibility-row"><label><input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} /> Privado</label><label><input type="radio" checked={visibility === "classroom"} onChange={() => setVisibility("classroom")} /> Visível nas turmas/partidas</label></div></section>

        <section className="profile-editor-card avatar-maker"><div className="panel-heading"><div><span>PERSONAGEM</span><h2>Avatar com combinações abertas</h2></div><Glasses /></div><div className="avatar-style-grid">{AVATAR_STYLES.map((style) => <button key={style.id} className={avatarStyle === style.id ? "active" : ""} onClick={() => { setAvatarStyle(style.id); setAvatarConfig({}); }}><strong>{style.label}</strong><small>{style.note}</small>{avatarStyle === style.id && <Check />}</button>)}</div><div className="avatar-seed-row"><label>Variação / seed<input value={avatarSeed} onChange={(e) => setAvatarSeed(e.target.value.replace(/[^a-zA-Z0-9-_]/g, "").slice(0, 80))} /></label><button className="button button-ghost" onClick={() => { setAvatarSeed(randomSeed()); setAvatarConfig({}); }}><Dices /> Surpreender</button></div>

          {avatarOptions.isLoading && <div className="source-status"><LoaderCircle className="spin" /> carregando peças do avatar…</div>}
          {avatarOptions.isError && <div className="source-status error"><strong>As opções avançadas da API não responderam.</strong><span>O avatar continua funcionando pelo estilo + seed. Em produção você pode usar a instância DiceBear incluída no ZIP.</span></div>}
          {!!curatedOptions.length && <div className="avatar-option-grid">{curatedOptions.map(([key, meta]) => {
            const current = avatarConfig[key];
            if (meta.type === "number") return <label key={key}>{humanizeAvatarOption(key)}<div className="range-line"><input type="range" min={meta.min ?? 0} max={meta.max ?? 100} value={typeof current === "number" ? current : meta.min ?? 0} onChange={(e) => setOption(key, Number(e.target.value))} /><span>{typeof current === "number" ? current : meta.min ?? 0}</span></div><button className="mini-reset" onClick={() => removeOption(key)}>automático</button></label>;
            if (meta.type === "boolean") return <label key={key} className="toggle-option"><input type="checkbox" checked={current === true} onChange={(e) => setOption(key, e.target.checked)} /> <span>{humanizeAvatarOption(key)}</span><button className="mini-reset" onClick={() => removeOption(key)}>automático</button></label>;
            const values = Array.isArray(meta.values) ? meta.values.slice(0, 80) : [];
            if (!values.length) return null;
            return <label key={key}>{humanizeAvatarOption(key)}<select value={typeof current === "string" ? current : ""} onChange={(e) => e.target.value ? setOption(key, e.target.value) : removeOption(key)}><option value="">Automático</option>{values.map((value) => <option value={value} key={value}>{value.replace(/[-_]/g, " ")}</option>)}</select></label>;
          })}</div>}
        </section>

        <section className="profile-editor-card"><div className="panel-heading"><div><span>CARTÃO</span><h2>Cores do seu perfil</h2></div><Palette /></div><div className="color-editor-grid"><ColorField label="Destaque" value={profileTheme.accent} onChange={(accent) => setProfileTheme((v) => ({ ...v, accent }))} /><ColorField label="Capa" value={profileTheme.surface} onChange={(surface) => setProfileTheme((v) => ({ ...v, surface }))} /><ColorField label="Fundo" value={profileTheme.background} onChange={(background) => setProfileTheme((v) => ({ ...v, background }))} /><ColorField label="Cartão" value={profileTheme.card} onChange={(card) => setProfileTheme((v) => ({ ...v, card }))} /></div><div className="pattern-picker">{(["stars","orbit","grid","plain"] as const).map((pattern) => <button key={pattern} className={profileTheme.pattern === pattern ? "active" : ""} onClick={() => setProfileTheme((v) => ({ ...v, pattern }))}>{pattern}</button>)}</div><div><strong>Matérias favoritas</strong><div className="subject-picker">{subjects.map((subject) => { const active = favoriteSubjects.includes(subject); return <button key={subject} className={active ? "active" : ""} onClick={() => setFavoriteSubjects((current) => active ? current.filter((item) => item !== subject) : [...current, subject].slice(-8))}>{subject}</button>; })}</div></div></section>

        <button className="button button-primary profile-save" disabled={save.isPending || displayName.trim().length < 2 || profileTitle.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? <LoaderCircle className="spin" /> : <Save />} Salvar Mega Perfil</button>
      </div>
    </section>
  </div>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field"><span>{label}</span><div><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input value={value} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)} maxLength={7} /></div></label>;
}
