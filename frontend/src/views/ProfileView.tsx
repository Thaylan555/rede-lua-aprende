import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bot, Check, Dices, Gamepad2, Glasses, LoaderCircle, MoonStar, Palette, Save, ShieldCheck, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import { AVATAR_KITS, AVATAR_STYLES, humanizeAvatarOption, humanizeAvatarValue, keepLuaGear, loadAvatarOptions, LUA_GEAR, usefulAvatarOptions } from "../avatar";
import { AvatarVisual } from "../components/AvatarVisual";
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

  const save = useMutation({
    mutationFn: () => api.updateProfile({ displayName: displayName.trim(), bio: bio.trim(), profileTitle: profileTitle.trim(), avatarStyle, avatarSeed, avatarConfig, profileTheme, visibility, favoriteSubjects }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["session"] }); toast.success("Perfil lunar atualizado."); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return <div className="page-width page-pad"><section className="profile-gate"><div className="gate-icon"><UserRound /></div><span>ESTÚDIO DE PERFIL</span><h1>Crie um personagem com a sua cara.</h1><p>Cartoon, robô, pixel, pirata, gamer ou uma mistura só sua. Você não precisa enviar foto real para ter um perfil cheio de personalidade.</p><button className="button button-primary" onClick={onLogin}>Entrar ou criar conta</button></section></div>;

  const roleLabel = user.role === "teacher" ? "Professor" : user.role === "admin" ? "Gestão" : "Aluno";
  const setOption = (key: string, value: string | number | boolean | string[]) => setAvatarConfig((current) => ({ ...current, [key]: value }));
  const removeOption = (key: string) => setAvatarConfig((current) => { const next = { ...current }; delete next[key]; return next; });
  const luaValue = (key: string) => typeof avatarConfig[key] === "string" ? String(avatarConfig[key]) : "none";
  const setLua = (key: string, value: string) => setAvatarConfig((current) => ({ ...current, _luaLook: "custom", [key]: value }));
  const applyKit = (kit: (typeof AVATAR_KITS)[number]) => {
    setAvatarStyle(kit.style);
    setAvatarSeed(randomSeed());
    setAvatarConfig({ ...kit.config, _luaLook: kit.id });
    setProfileTheme(kit.theme);
  };

  return <div className="page-width page-pad profile-view">
    <header className="profile-page-head"><div><span className="eyebrow"><Sparkles size={16} /> Mega Perfil</span><h1>Seu perfil, sua vibe.</h1><p>Escolha um estilo, acessórios e cores. Misture tudo do seu jeito.</p></div><div className="profile-role-pill"><ShieldCheck /><span>{roleLabel}</span></div></header>

    <section className="profile-studio-grid">
      <aside className={`profile-preview pattern-${profileTheme.pattern}`} style={{ ["--profile-bg" as string]: profileTheme.background, ["--profile-surface" as string]: profileTheme.surface, ["--profile-accent" as string]: profileTheme.accent, ["--profile-card" as string]: profileTheme.card }}>
        <div className="profile-cover"><MoonStar /><span>REDE LUA • {roleLabel.toUpperCase()}</span></div>
        <div className="profile-avatar-shell"><AvatarVisual style={avatarStyle} seed={avatarSeed} config={avatarConfig} size={360} alt={`Avatar de ${displayName}`} /></div>
        <div className="profile-preview-copy"><span>{profileTitle || "Explorador Lunar"}</span><h2>{displayName || "Seu nome"}</h2><p>{bio || "Sua bio aparece aqui. Conte um pouco sobre o que você curte aprender."}</p></div>
        <div className="profile-stat-row"><div><strong>{user.level}</strong><span>Nível</span></div><div><strong>{user.xp.toLocaleString("pt-BR")}</strong><span>XP</span></div><div><strong>{user.streakDays}</strong><span>Sequência</span></div></div>
        <div className="profile-subject-chips">{favoriteSubjects.length ? favoriteSubjects.slice(0, 4).map((subject) => <span key={subject}>{subject}</span>) : <span>Escolha matérias favoritas</span>}</div>
      </aside>

      <div className="profile-editor-stack">
        <section className="profile-editor-card"><div className="panel-heading"><div><span>IDENTIDADE</span><h2>Nome, título e bio</h2></div><UserRound /></div><div className="profile-fields two"><label>Nome de exibição<input value={displayName} onChange={(e) => setDisplayName(e.target.value.slice(0, 32))} maxLength={32} /></label><label>Título do perfil<input value={profileTitle} onChange={(e) => setProfileTitle(e.target.value.slice(0, 42))} maxLength={42} placeholder="Explorador Lunar" /></label></div><label>Bio<textarea value={bio} onChange={(e) => setBio(e.target.value.slice(0, 220))} maxLength={220} placeholder="O que você curte aprender ou fazer?" /><small>{bio.length}/220</small></label><div className="visibility-row"><label><input type="radio" checked={visibility === "private"} onChange={() => setVisibility("private")} /> Privado</label><label><input type="radio" checked={visibility === "classroom"} onChange={() => setVisibility("classroom")} /> Visível nas turmas/partidas</label></div></section>

        <section className="profile-editor-card avatar-maker avatar-fun-studio">
          <div className="panel-heading"><div><span>LOOKS PRONTOS</span><h2>Escolha uma vibe e depois mexa em tudo</h2></div><WandSparkles /></div>
          <div className="avatar-kit-grid">{AVATAR_KITS.map((kit) => {
            const active = avatarConfig._luaLook === kit.id;
            return <button key={kit.id} className={active ? "active" : ""} onClick={() => applyKit(kit)}>
              <span className={`kit-orb kit-${kit.id}`}><AvatarVisual style={kit.style} seed={`preview-${kit.id}`} config={kit.config} size={150} /></span>
              <strong>{kit.label}</strong><small>{kit.tagline}</small>{active && <Check />}
            </button>;
          })}</div>
        </section>

        <section className="profile-editor-card avatar-maker">
          <div className="panel-heading"><div><span>PERSONAGEM</span><h2>Base do seu avatar</h2></div><Bot /></div>
          <div className="avatar-style-grid">{AVATAR_STYLES.map((style) => <button key={style.id} className={avatarStyle === style.id ? "active" : ""} onClick={() => { setAvatarStyle(style.id); setAvatarConfig((current) => ({ ...keepLuaGear(current), _luaLook: "custom" })); }}><strong>{style.label}</strong><small>{style.note}</small>{avatarStyle === style.id && <Check />}</button>)}</div>
          <button className="button button-ghost avatar-random-button" onClick={() => { setAvatarSeed(randomSeed()); setAvatarConfig((current) => ({ ...keepLuaGear(current), _luaLook: "custom" })); }}><Dices /> Outra combinação</button>
        </section>

        <section className="profile-editor-card lua-gear-card">
          <div className="panel-heading"><div><span>ACESSÓRIOS LUA</span><h2>Agora deixa ele divertido</h2></div><Gamepad2 /></div>
          <p className="gear-intro">Esses itens ficam por cima do avatar e funcionam até nos estilos que não trazem o acessório de fábrica.</p>
          <GearPicker title="Na cabeça" value={luaValue("_luaHead")} items={LUA_GEAR.head} onChange={(value) => setLua("_luaHead", value)} />
          <GearPicker title="No rosto" value={luaValue("_luaFace")} items={LUA_GEAR.face} onChange={(value) => setLua("_luaFace", value)} />
          <GearPicker title="Efeito" value={luaValue("_luaAura")} items={LUA_GEAR.aura} onChange={(value) => setLua("_luaAura", value)} />
          <GearPicker title="Moldura" value={luaValue("_luaFrame")} items={LUA_GEAR.frame} onChange={(value) => setLua("_luaFrame", value)} />
        </section>

        <section className="profile-editor-card avatar-maker">
          <details className="avatar-detail-drawer">
            <summary><span><Glasses /> Detalhes do personagem</span><small>Cabelo, olhos, roupa, cores e outras peças do estilo escolhido</small></summary>
            <div className="avatar-detail-content">
              {avatarOptions.isLoading && <div className="source-status"><LoaderCircle className="spin" /> carregando opções…</div>}
              {avatarOptions.isError && <div className="source-status error"><strong>As opções extras não carregaram agora.</strong><span>Você ainda pode trocar o estilo, usar um look pronto ou gerar outra combinação.</span></div>}
              {!!curatedOptions.length && <div className="avatar-option-grid">{curatedOptions.map(([key, meta]) => {
                const current = avatarConfig[key];
                if (meta.type === "number") return <label key={key}>{humanizeAvatarOption(key)}<div className="range-line"><input type="range" min={meta.min ?? 0} max={meta.max ?? 100} value={typeof current === "number" ? current : meta.min ?? 0} onChange={(e) => setOption(key, Number(e.target.value))} /><span>{typeof current === "number" ? current : meta.min ?? 0}</span></div><button type="button" className="mini-reset" onClick={() => removeOption(key)}>automático</button></label>;
                if (meta.type === "boolean") return <label key={key} className="toggle-option"><input type="checkbox" checked={current === true} onChange={(e) => setOption(key, e.target.checked)} /> <span>{humanizeAvatarOption(key)}</span><button type="button" className="mini-reset" onClick={() => removeOption(key)}>automático</button></label>;
                const values = Array.isArray(meta.values) ? meta.values.slice(0, 80) : [];
                if (!values.length) return null;
                return <label key={key}>{humanizeAvatarOption(key)}<select value={typeof current === "string" ? current : ""} onChange={(e) => e.target.value ? setOption(key, e.target.value) : removeOption(key)}><option value="">Automático</option>{values.map((value) => <option value={value} key={value}>{humanizeAvatarValue(value)}</option>)}</select></label>;
              })}</div>}
            </div>
          </details>
        </section>

        <section className="profile-editor-card"><div className="panel-heading"><div><span>CARTÃO</span><h2>Cores do seu perfil</h2></div><Palette /></div><div className="color-editor-grid"><ColorField label="Destaque" value={profileTheme.accent} onChange={(accent) => setProfileTheme((v) => ({ ...v, accent }))} /><ColorField label="Capa" value={profileTheme.surface} onChange={(surface) => setProfileTheme((v) => ({ ...v, surface }))} /><ColorField label="Fundo" value={profileTheme.background} onChange={(background) => setProfileTheme((v) => ({ ...v, background }))} /><ColorField label="Cartão" value={profileTheme.card} onChange={(card) => setProfileTheme((v) => ({ ...v, card }))} /></div><div className="pattern-picker">{(["stars","orbit","grid","plain"] as const).map((pattern) => <button key={pattern} className={profileTheme.pattern === pattern ? "active" : ""} onClick={() => setProfileTheme((v) => ({ ...v, pattern }))}>{pattern}</button>)}</div><div><strong>Matérias favoritas</strong><div className="subject-picker">{subjects.map((subject) => { const active = favoriteSubjects.includes(subject); return <button key={subject} className={active ? "active" : ""} onClick={() => setFavoriteSubjects((current) => active ? current.filter((item) => item !== subject) : [...current, subject].slice(-8))}>{subject}</button>; })}</div></div></section>

        <button className="button button-primary profile-save" disabled={save.isPending || displayName.trim().length < 2 || profileTitle.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? <LoaderCircle className="spin" /> : <Save />} Salvar Mega Perfil</button>
      </div>
    </section>
  </div>;
}

function GearPicker({ title, value, items, onChange }: { title: string; value: string; items: readonly (readonly [string, string])[]; onChange: (value: string) => void }) {
  return <div className="gear-picker"><strong>{title}</strong><div>{items.map(([id, label]) => <button type="button" key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><span className={`gear-swatch gear-${id}`} />{label}{value === id && <Check />}</button>)}</div></div>;
}

function ColorField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="color-field"><span>{label}</span><div><input type="color" value={value} onChange={(e) => onChange(e.target.value)} /><input value={value} onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && onChange(e.target.value)} maxLength={7} /></div></label>;
}
