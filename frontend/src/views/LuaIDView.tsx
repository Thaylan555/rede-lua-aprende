import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { Check, Coins, Copy, Dices, Gamepad2, Globe2, LoaderCircle, LockKeyhole, MoonStar, Palette, Save, ShoppingBag, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import {
  AVATAR_KITS,
  AVATAR_STYLES,
  humanizeAvatarOption,
  humanizeAvatarValue,
  loadAvatarOptions,
  LUA_COMPANIONS,
  LUA_EXPRESSIONS,
  LUA_GEAR,
  LUA_MATE_SPECIES,
  LUA_OUTFITS,
  PROFILE_COSMETICS,
  usefulAvatarOptions,
} from "../avatar";
import { AvatarVisual } from "../components/AvatarVisual";
import { profileTextIssue } from "../moderation";
import type { AvatarConfig, AvatarStyle, CosmeticCatalogItem, ProfileTheme, SessionUser } from "../types";

const themes: Array<{ label: string; theme: ProfileTheme }> = [
  { label: "Lua", theme: { accent: "#ffbd2e", surface: "#0b2d68", background: "#07162f", card: "#fffaf0", pattern: "stars" } },
  { label: "Aurora", theme: { accent: "#4de8d4", surface: "#6d4aff", background: "#160d3b", card: "#fffaff", pattern: "orbit" } },
  { label: "Arcade", theme: { accent: "#35f2b5", surface: "#7c3cff", background: "#070815", card: "#f7f6ff", pattern: "grid" } },
  { label: "Caderno", theme: { accent: "#ffbd2e", surface: "#2158a8", background: "#edf4ff", card: "#ffffff", pattern: "grid" } },
  { label: "Sorvete", theme: { accent: "#ff70b7", surface: "#7b56d9", background: "#2a174f", card: "#fff8fd", pattern: "orbit" } },
  { label: "Floresta", theme: { accent: "#e8c84b", surface: "#26705b", background: "#0d342c", card: "#fffdf3", pattern: "stars" } },
];

const subjects = ["Matemática", "Português", "Ciências", "História", "Geografia", "Inglês", "Física", "Química", "Biologia", "Artes"];
type Tab = "avatar" | "identity" | "card" | "inventory";

function randomOf<T>(items: readonly T[]) { return items[Math.floor(Math.random() * items.length)]; }
function freshSeed() { return `lua-${crypto.randomUUID().replaceAll("-", "").slice(0, 20)}`; }
function celebrate() { void confetti({ particleCount: 70, spread: 78, origin: { y: .72 }, disableForReducedMotion: true }); }

export function LuaIDView({ user, onLogin }: { user: SessionUser | null; onLogin: () => void }) {
  const qc = useQueryClient();
  const manifest = useQuery({ queryKey: ["luaid", user?.id], queryFn: api.luaIdManifest, enabled: Boolean(user), staleTime: 15_000, retry: 1 });
  const cosmetics = useQuery({ queryKey: ["profile-cosmetics", user?.id], queryFn: api.myCosmetics, enabled: Boolean(user), staleTime: 15_000, retry: 1 });
  const catalog = useQuery({ queryKey: ["cosmetic-catalog"], queryFn: api.cosmeticCatalog, enabled: Boolean(user), staleTime: 60_000, retry: 1 });

  const [tab, setTab] = useState<Tab>("avatar");
  const [displayName, setDisplayName] = useState(user?.displayName || "");
  const [title, setTitle] = useState(user?.profileTitle || "Explorador Lunar");
  const [bio, setBio] = useState(user?.bio || "");
  const [handle, setHandle] = useState(user?.profileHandle || "");
  const [avatarStyle, setAvatarStyle] = useState<AvatarStyle>(user?.avatarStyle || "lua-mates");
  const [avatarSeed, setAvatarSeed] = useState(user?.avatarSeed || freshSeed());
  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(user?.avatarConfig || {});
  const [theme, setTheme] = useState<ProfileTheme>(user?.profileTheme || themes[0].theme);
  const [visibility, setVisibility] = useState<"private" | "classroom">(user?.profileVisibility || "private");
  const [favorites, setFavorites] = useState<string[]>(user?.favoriteSubjects || []);

  useEffect(() => {
    if (!user) return;
    setDisplayName(user.displayName); setTitle(user.profileTitle); setBio(user.bio); setAvatarStyle(user.avatarStyle); setAvatarSeed(user.avatarSeed);
    setAvatarConfig(user.avatarConfig); setTheme(user.profileTheme); setVisibility(user.profileVisibility); setFavorites(user.favoriteSubjects);
    setHandle(user.profileHandle || manifest.data?.handle || "");
  }, [user?.id]);
  useEffect(() => { if (manifest.data?.handle) setHandle(manifest.data.handle); }, [manifest.data?.handle]);

  const avatarOptions = useQuery({
    queryKey: ["dicebear-options", avatarStyle],
    queryFn: () => loadAvatarOptions(avatarStyle),
    enabled: avatarStyle !== "lua-mates",
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
  const curatedOptions = useMemo(() => avatarOptions.data ? usefulAvatarOptions(avatarOptions.data) : [], [avatarOptions.data]);
  const cosmeticUnlocks = new Set(cosmetics.data?.unlocks || []);
  const catalogItems: CosmeticCatalogItem[] = catalog.data?.length ? catalog.data : PROFILE_COSMETICS.map((item) => ({ ...item, emoji: "✨", active: true })) as CosmeticCatalogItem[];

  const setConfig = (key: string, value: string | number | boolean | string[]) => setAvatarConfig((current) => ({ ...current, [key]: value }));
  const luaValue = (key: string, fallback = "none") => typeof avatarConfig[key] === "string" ? String(avatarConfig[key]) : fallback;

  const applyKit = (kit: (typeof AVATAR_KITS)[number]) => {
    setAvatarStyle(kit.style); setAvatarSeed(freshSeed()); setAvatarConfig({ ...kit.config, _luaLook: kit.id }); setTheme(kit.theme); celebrate();
  };

  const surpriseMe = () => {
    const useLuaMate = Math.random() < .7;
    const style = useLuaMate ? "lua-mates" as AvatarStyle : randomOf(AVATAR_STYLES.filter((s) => s.id !== "lua-mates")).id;
    setAvatarStyle(style);
    setAvatarSeed(freshSeed());
    const next: AvatarConfig = {
      _luaLook: "surprise",
      _luaHead: randomOf(LUA_GEAR.head)[0],
      _luaFace: randomOf(LUA_GEAR.face)[0],
      _luaAura: randomOf(LUA_GEAR.aura)[0],
      _luaFrame: randomOf(LUA_GEAR.frame)[0],
      _luaCompanion: randomOf(LUA_COMPANIONS)[0],
    };
    if (useLuaMate) {
      next._luaSpecies = randomOf(LUA_MATE_SPECIES)[0];
      next._luaExpression = randomOf(LUA_EXPRESSIONS)[0];
      next._luaOutfit = randomOf(LUA_OUTFITS)[0];
    }
    setAvatarConfig(next);
    setTheme(randomOf(themes).theme);
    celebrate();
  };

  const unlock = useMutation({
    mutationFn: (id: string) => api.unlockCosmetic(id),
    onSuccess: async () => { await qc.invalidateQueries({ queryKey: ["profile-cosmetics"] }); await qc.invalidateQueries({ queryKey: ["session"] }); toast.success("Desbloqueado! Já pode usar no seu LuaID."); celebrate(); },
    onError: (error: Error) => toast.error(error.message === "COSMETIC_LEVEL_REQUIRED" ? "Você ainda não chegou ao nível necessário." : error.message === "NOT_ENOUGH_MOON_COINS" ? "Faltam Luas para desbloquear esse item." : error.message),
  });

  const applyCosmetic = (item: CosmeticCatalogItem) => {
    const key: Record<CosmeticCatalogItem["kind"], string | null> = {
      head: "_luaHead", face: "_luaFace", aura: "_luaAura", frame: "_luaFrame", species: "_luaSpecies", outfit: "_luaOutfit",
      companion: "_luaCompanion", expression: "_luaExpression", background: null, theme: null,
    };
    if (item.kind === "theme" || item.kind === "background") {
      if (item.value === "aurora") setTheme(themes[1].theme);
      else if (item.value === "forest") setTheme(themes[5].theme);
      else if (item.value === "candy") setTheme(themes[4].theme);
      toast.success(`${item.label} aplicado.`); return;
    }
    const configKey = key[item.kind];
    if (configKey) setConfig(configKey, item.value);
    if (item.kind === "species") setAvatarStyle("lua-mates");
    toast.success(`${item.label} aplicado.`);
  };

  const save = useMutation({
    mutationFn: async () => {
      const issue = profileTextIssue({ displayName, bio, profileTitle: title });
      if (issue) throw new Error(issue);
      if (handle && handle !== manifest.data?.handle) await api.setProfileHandle(handle);
      return api.updateProfile({ displayName: displayName.trim(), bio: bio.trim(), profileTitle: title.trim(), avatarStyle, avatarSeed, avatarConfig, profileTheme: theme, visibility, favoriteSubjects: favorites });
    },
    onSuccess: async () => { toast.success("LuaID salvo. Esse personagem é seu ✨"); celebrate(); await qc.invalidateQueries({ queryKey: ["session"] }); await qc.invalidateQueries({ queryKey: ["luaid"] }); },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return <div className="v8-shell v8-gate"><div className="v8-gate-orb"><UserRound /></div><span>LUAID</span><h1>Seu perfil pode ser um personagem, não uma foto.</h1><p>Crie um LuaMate, robô, cartoon ou pixel e use a mesma identidade em toda a Rede Lua.</p><button className="v8-primary" onClick={onLogin}>Criar meu LuaID</button></div>;

  const apiPath = `${location.origin}/api/luaid/profile/${handle || "seu_nome"}`;
  const level = manifest.data?.level ?? user.level;
  const player = manifest.data?.player;

  return <div className="v8-shell v8-luaid v81-avatar-revolution">
    <header className="v81-avatar-head">
      <div><span className="v8-kicker"><MoonStar /> AVATAR REVOLUTION</span><h1>Seu LuaID agora parece <em>um personagem de verdade.</em></h1><p>Crie mascotes originais da Rede Lua, misture estilos, acessórios, companheiros, efeitos e cartões. Sem precisar usar foto real.</p></div>
      <button className="v81-surprise" onClick={surpriseMe}><Dices /><span><strong>Surpreenda-me</strong><small>gera um look inteiro</small></span></button>
    </header>

    <section className="v81-studio">
      <aside className="v81-preview-column" style={{ ["--id-accent" as string]: theme.accent, ["--id-surface" as string]: theme.surface, ["--id-bg" as string]: theme.background, ["--id-card" as string]: theme.card }}>
        <div className={`v8-id-card v81-id-card pattern-${theme.pattern}`}>
          <div className="v8-id-cover"><span>LUAID • {user.role === "teacher" ? "PROFESSOR" : user.role === "admin" ? "GESTÃO" : "ALUNO"}</span><i>LV {level}</i></div>
          <div className="v8-id-avatar v81-id-avatar"><AvatarVisual style={avatarStyle} seed={avatarSeed} config={avatarConfig} size={320} /></div>
          <div className="v8-id-main"><small>@{handle || "seu_nome"}</small><h2>{displayName || "Seu nome"}</h2><span>{title || "Explorador Lunar"}</span><p>{bio || "Seu espaço para aprender, jogar e mostrar sua personalidade."}</p></div>
          <div className="v8-id-stats"><span><strong>{level}</strong><small>Nível</small></span><span><strong>{player?.gamesCompleted || 0}</strong><small>Missões</small></span><span><strong>{cosmetics.data?.coins ?? user.moonCoins}</strong><small>Luas</small></span></div>
          <div className="v8-id-subjects">{favorites.slice(0, 4).map((s) => <span key={s}>{s}</span>)}</div>
        </div>
        <div className="v81-preview-actions"><button onClick={() => setAvatarSeed(freshSeed())}><Dices /> Outra versão</button><button onClick={() => setTab("inventory")}><ShoppingBag /> Inventário</button></div>
        <div className="v81-combo-note"><Sparkles /><span><strong>Milhões de combinações possíveis</strong><small>12 LuaMates + estilos open source + peças próprias + efeitos + companheiros.</small></span></div>
      </aside>

      <div className="v81-editor">
        <nav className="v81-tabs">
          <button className={tab === "avatar" ? "active" : ""} onClick={() => setTab("avatar")}><WandSparkles /> Avatar</button>
          <button className={tab === "identity" ? "active" : ""} onClick={() => setTab("identity")}><UserRound /> Identidade</button>
          <button className={tab === "card" ? "active" : ""} onClick={() => setTab("card")}><Palette /> Cartão</button>
          <button className={tab === "inventory" ? "active" : ""} onClick={() => setTab("inventory")}><ShoppingBag /> Inventário</button>
        </nav>

        {tab === "avatar" && <div className="v81-tab-stack">
          <section className="v8-id-editor-card v81-kits"><div className="v8-panel-title"><div><span>LOOKS PRONTOS</span><h2>Comece por uma personalidade</h2></div><Sparkles /></div><div className="v81-kit-grid">{AVATAR_KITS.slice(0, 10).map((kit) => <button key={kit.id} className={avatarConfig._luaLook === kit.id ? "active" : ""} onClick={() => applyKit(kit)}><AvatarVisual style={kit.style} seed={`kit-${kit.id}`} config={kit.config} size={110} /><strong>{kit.label}</strong><small>{kit.tagline}</small></button>)}</div></section>

          <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>BASE</span><h2>Escolha a família do personagem</h2></div><Gamepad2 /></div><div className="v81-style-grid">{AVATAR_STYLES.map((s) => <button key={s.id} className={avatarStyle === s.id ? "active" : ""} onClick={() => { setAvatarStyle(s.id); if (s.id === "lua-mates" && !avatarConfig._luaSpecies) setConfig("_luaSpecies", "moon-bear"); }}><AvatarVisual style={s.id} seed={`luaid-${s.id}`} config={s.id === "lua-mates" ? { _luaSpecies: "moon-bear", _luaExpression: "happy", _luaOutfit: "academy" } : {}} size={94} compact /><span><strong>{s.label}</strong><small>{s.note}</small></span>{avatarStyle === s.id && <Check />}</button>)}</div></section>

          {avatarStyle === "lua-mates" ? <>
            <PickerSection title="LuaMate" subtitle="Escolha seu mascote" items={LUA_MATE_SPECIES} value={luaValue("_luaSpecies", "moon-bear")} onChange={(v) => setConfig("_luaSpecies", v)} />
            <div className="v81-split"><PickerSection title="Expressão" subtitle="Mude a atitude" items={LUA_EXPRESSIONS} value={luaValue("_luaExpression", "happy")} onChange={(v) => setConfig("_luaExpression", v)} compact /><PickerSection title="Roupa" subtitle="Escolha a vibe" items={LUA_OUTFITS} value={luaValue("_luaOutfit", "academy")} onChange={(v) => setConfig("_luaOutfit", v)} compact /></div>
          </> : <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>PEÇAS DA BASE</span><h2>Cabelo, olhos, roupa e cores</h2></div><Palette /></div>{avatarOptions.isLoading && <p className="v81-muted"><LoaderCircle className="spin" /> carregando peças…</p>}<div className="v81-dicebear-options">{curatedOptions.slice(0, 10).map(([key, meta]) => { const values = Array.isArray(meta.values) ? meta.values.slice(0, 60) : []; if (!values.length) return null; return <label key={key}><span>{humanizeAvatarOption(key)}</span><select value={typeof avatarConfig[key] === "string" ? String(avatarConfig[key]) : ""} onChange={(e) => setConfig(key, e.target.value)}><option value="">Automático</option>{values.map((v) => <option key={v} value={v}>{humanizeAvatarValue(v)}</option>)}</select></label>; })}</div></section>}

          <section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>MIX & MATCH</span><h2>Peças que funcionam por cima de qualquer avatar</h2></div><WandSparkles /></div><div className="v81-gear-stack"><GearRail label="Cabeça" items={LUA_GEAR.head} value={luaValue("_luaHead")} onChange={(v) => setConfig("_luaHead", v)} /><GearRail label="Rosto" items={LUA_GEAR.face} value={luaValue("_luaFace")} onChange={(v) => setConfig("_luaFace", v)} /><GearRail label="Efeito" items={LUA_GEAR.aura} value={luaValue("_luaAura")} onChange={(v) => setConfig("_luaAura", v)} /><GearRail label="Moldura" items={LUA_GEAR.frame} value={luaValue("_luaFrame")} onChange={(v) => setConfig("_luaFrame", v)} /><GearRail label="Companheiro" items={LUA_COMPANIONS.map(([a,b,c]) => [a, `${c} ${b}`] as const)} value={luaValue("_luaCompanion")} onChange={(v) => setConfig("_luaCompanion", v)} /></div></section>
        </div>}

        {tab === "identity" && <div className="v81-tab-stack"><section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>IDENTIDADE</span><h2>Como você aparece por aqui</h2></div><UserRound /></div><div className="v8-form-grid"><label>Nome<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={32} /></label><label>@LuaID<input value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0, 24))} placeholder="meu_nome" /></label><label className="wide">Título<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={42} placeholder="Guia do Quasar" /></label><label className="wide">Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={220} placeholder="Conte do seu jeito o que você curte aprender ou ensinar." /></label></div></section><section className="v8-id-editor-card v8-api-card"><div className="v8-panel-title"><div><span>LUAID API</span><h2>Decida se esse cartão pode ser compartilhado</h2></div><Globe2 /></div><label className="v8-visibility"><input type="checkbox" checked={visibility === "classroom"} onChange={(e) => setVisibility(e.target.checked ? "classroom" : "private")} /><span>{visibility === "classroom" ? <Globe2 /> : <LockKeyhole />}<strong>{visibility === "classroom" ? "Perfil compartilhável" : "Perfil privado"}</strong><small>{visibility === "classroom" ? "Seu LuaID pode ser usado por outras experiências da Rede Lua." : "A API pública não devolve seus dados."}</small></span></label><div className="v8-endpoint"><code>{apiPath}</code><button onClick={() => { navigator.clipboard?.writeText(apiPath); toast.success("Endpoint copiado."); }}><Copy /></button></div></section></div>}

        {tab === "card" && <div className="v81-tab-stack"><section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>CARTÃO</span><h2>Escolha o universo do seu LuaID</h2></div><Palette /></div><div className="v81-theme-grid">{themes.map((t) => <button key={t.label} onClick={() => setTheme(t.theme)} className={theme.background === t.theme.background ? "active" : ""}><i style={{ background: `linear-gradient(135deg,${t.theme.background},${t.theme.surface} 58%,${t.theme.accent})` }} /><strong>{t.label}</strong></button>)}</div><div className="v8-subject-picks"><strong>Matérias que fazem parte de você</strong><div>{subjects.map((s) => <button key={s} className={favorites.includes(s) ? "active" : ""} onClick={() => setFavorites((f) => f.includes(s) ? f.filter((x) => x !== s) : [...f, s].slice(-8))}>{s}</button>)}</div></div></section></div>}

        {tab === "inventory" && <div className="v81-tab-stack"><section className="v8-id-editor-card"><div className="v8-panel-title"><div><span>INVENTÁRIO</span><h2>Itens conquistados e Loja Lunar</h2></div><Coins /></div><div className="v81-wallet"><span><Coins /> Suas Luas</span><strong>{(cosmetics.data?.coins ?? user.moonCoins).toLocaleString("pt-BR")}</strong></div><div className="v81-catalog">{catalogItems.map((item) => { const unlocked = cosmeticUnlocks.has(item.id); const canBuy = user.level >= item.level && (cosmetics.data?.coins ?? user.moonCoins) >= item.cost; return <article key={item.id} className={unlocked ? "unlocked" : ""}><div className="v81-catalog-icon">{item.emoji || "✨"}</div><div><span>{item.kind}</span><strong>{item.label}</strong><p>{item.note}</p><small>Nível {item.level} • {item.cost} Luas</small></div>{unlocked ? <button onClick={() => applyCosmetic(item)}><Check /> Usar</button> : <button disabled={!canBuy || unlock.isPending} onClick={() => unlock.mutate(item.id)}><Coins /> {item.cost}</button>}</article>; })}</div></section></div>}

        <button className="v8-primary v8-save-wide v81-save" disabled={save.isPending || displayName.trim().length < 2 || title.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? <LoaderCircle className="spin" /> : <Save />} Salvar meu LuaID</button>
      </div>
    </section>
  </div>;
}

function PickerSection({ title, subtitle, items, value, onChange, compact = false }: { title:string; subtitle:string; items: readonly (readonly [string,string,string])[]; value:string; onChange:(v:string)=>void; compact?:boolean }) {
  return <section className={`v8-id-editor-card v81-picker-section ${compact ? "compact" : ""}`}><div className="v8-panel-title"><div><span>{title.toUpperCase()}</span><h2>{subtitle}</h2></div></div><div className="v81-chip-grid">{items.map(([id,label,emoji]) => <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><span>{emoji}</span><strong>{label}</strong>{value === id && <Check />}</button>)}</div></section>;
}

function GearRail({ label, items, value, onChange }: { label:string; items: readonly (readonly [string,string])[]; value:string; onChange:(v:string)=>void }) {
  return <div className="v81-gear-rail"><strong>{label}</strong><div>{items.map(([id,name]) => <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><i className={`gear-swatch gear-${id}`} /><span>{name}</span>{value === id && <Check />}</button>)}</div></div>;
}
