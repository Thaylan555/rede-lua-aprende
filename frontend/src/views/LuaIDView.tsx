import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import confetti from "canvas-confetti";
import { motion } from "motion/react";
import {
  Check, Coins, Copy, Dices, Gamepad2, Globe2, LoaderCircle, LockKeyhole,
  MoonStar, Palette, Save, ShoppingBag, Sparkles, UserRound, WandSparkles
} from "lucide-react";
import { toast } from "sonner";
import { api } from "../api";
import {
  AVATAR_KITS,
  AVATAR_STYLES,
  humanizeAvatarOption,
  humanizeAvatarValue,
  loadAvatarOptions,
  LUA_COMPANIONS,
  LUA_EYES,
  LUA_EXPRESSIONS,
  LUA_GEAR,
  LUA_MARKS,
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
function celebrate(amount = 70) { void confetti({ particleCount: amount, spread: 78, origin: { y: .72 }, disableForReducedMotion: true }); }

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
    setDisplayName(user.displayName);
    setTitle(user.profileTitle);
    setBio(user.bio);
    setAvatarStyle(user.avatarStyle);
    setAvatarSeed(user.avatarSeed);
    setAvatarConfig(user.avatarConfig);
    setTheme(user.profileTheme);
    setVisibility(user.profileVisibility);
    setFavorites(user.favoriteSubjects);
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
  const catalogItems: CosmeticCatalogItem[] = catalog.data?.length
    ? catalog.data
    : PROFILE_COSMETICS.map((item) => ({ ...item, emoji: "✨", active: true })) as CosmeticCatalogItem[];

  const setConfig = (key: string, value: string | number | boolean | string[]) => setAvatarConfig((current) => ({ ...current, [key]: value }));
  const luaValue = (key: string, fallback = "none") => typeof avatarConfig[key] === "string" ? String(avatarConfig[key]) : fallback;

  const applyKit = (kit: (typeof AVATAR_KITS)[number]) => {
    setAvatarStyle(kit.style);
    setAvatarSeed(freshSeed());
    setAvatarConfig({ ...kit.config, _luaLook: kit.id });
    setTheme(kit.theme);
    celebrate(85);
  };

  const surpriseMe = () => {
    const useLuaMate = Math.random() < .82;
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
      next._luaEyes = randomOf(LUA_EYES)[0];
      next._luaMark = randomOf(LUA_MARKS)[0];
      next._luaOutfit = randomOf(LUA_OUTFITS)[0];
    }
    setAvatarConfig(next);
    setTheme(randomOf(themes).theme);
    celebrate(110);
  };

  const unlock = useMutation({
    mutationFn: (id: string) => api.unlockCosmetic(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ["profile-cosmetics"] });
      await qc.invalidateQueries({ queryKey: ["session"] });
      toast.success("Desbloqueado! Tá no inventário, uai ✨");
      celebrate();
    },
    onError: (error: Error) => toast.error(error.message === "COSMETIC_LEVEL_REQUIRED"
      ? "Ainda falta um cadinho de nível pra esse item."
      : error.message === "NOT_ENOUGH_MOON_COINS" ? "Faltaram umas Luas aí 😅" : error.message),
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
      toast.success(`${item.label} aplicado.`);
      return;
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
      return api.updateProfile({
        displayName: displayName.trim(), bio: bio.trim(), profileTitle: title.trim(), avatarStyle, avatarSeed, avatarConfig,
        profileTheme: theme, visibility, favoriteSubjects: favorites,
      });
    },
    onSuccess: async () => {
      toast.success("LuaID salvo. Ficou trem bão demais ✨");
      celebrate(90);
      await qc.invalidateQueries({ queryKey: ["session"] });
      await qc.invalidateQueries({ queryKey: ["luaid"] });
    },
    onError: (error: Error) => toast.error(error.message),
  });

  if (!user) return <div className="v91-profile-gate">
    <div className="v91-profile-gate-orb"><UserRound /></div>
    <span>LUAID 2.0</span>
    <h1>Perfil sem personalidade? Aqui não, visse.</h1>
    <p>Crie um personagem de verdade, monte o cartão e leve sua identidade para jogos, missões e Recordes.</p>
    <button onClick={onLogin}><Sparkles /> Criar meu LuaID</button>
  </div>;

  const apiPath = `${location.origin}/api/luaid/profile/${handle || "seu_nome"}`;
  const level = manifest.data?.level ?? user.level;
  const player = manifest.data?.player;
  const selectedSpecies = luaValue("_luaSpecies", "moon-bear");

  return <div className="v91-luaid-page">
    <div className="v91-luaid-shell">
      <header className="v91-luaid-hero">
        <div className="v91-luaid-copy">
          <span className="v91-eyebrow"><MoonStar /> LUAID • AVATAR LAB</span>
          <h1>Agora seu boneco tem <em>cara de personagem.</em></h1>
          <p>Mais expressão, mais mascotes, mais peças e um editor que parece jogo — não formulário de cadastro.</p>
          <div className="v91-hero-pills"><span>16 LuaMates</span><span>looks prontos</span><span>inventário</span><span>Nova Vida</span></div>
        </div>
        <button className="v91-surprise" onClick={surpriseMe}><Dices /><span><strong>Surpreenda-me</strong><small>gera outro universo</small></span></button>
      </header>

      <section className="v91-avatar-lab">
        <aside className="v91-avatar-stage" style={{ ["--id-accent" as string]: theme.accent, ["--id-surface" as string]: theme.surface, ["--id-bg" as string]: theme.background, ["--id-card" as string]: theme.card }}>
          <div className="v91-stage-space">
            <div className="v91-orbit-ring ring-a"/><div className="v91-orbit-ring ring-b"/>
            <span className="v91-float-star a">✦</span><span className="v91-float-star b">✧</span><span className="v91-float-star c">✦</span>
            <motion.div className="v91-avatar-orb" key={`${avatarStyle}-${avatarSeed}-${selectedSpecies}-${luaValue("_luaExpression")}-${luaValue("_luaEyes")}`} initial={{ scale: .93, y: 8 }} animate={{ scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 260, damping: 19 }}>
              <AvatarVisual style={avatarStyle} seed={avatarSeed} config={avatarConfig} size={420} />
            </motion.div>
          </div>

          <div className="v91-id-deck">
            <div className="v91-deck-top"><span>LUAID • {user.role === "teacher" ? "PROFESSOR" : user.role === "admin" ? "GESTÃO" : "ALUNO"}</span><b>VIDA {user.lifeNumber}</b></div>
            <div className="v91-deck-main"><strong>{displayName || "Seu nome"}</strong><span>@{handle || "seu_luaid"}</span><small>{title || "Explorador Lunar"}</small></div>
            <div className="v91-deck-stats"><div><b>{level}</b><span>Nível</span></div><div><b>{player?.gamesCompleted ?? 0}</b><span>Missões</span></div><div><b>{user.legacyStars ?? 0}</b><span>Legado</span></div></div>
          </div>

          <div className="v91-stage-actions"><button onClick={() => setAvatarSeed(freshSeed())}><Dices /> Outra versão</button><button onClick={() => setTab("inventory")}><ShoppingBag /> Inventário</button></div>
        </aside>

        <div className="v91-avatar-editor">
          <nav className="v91-avatar-tabs">
            <button className={tab === "avatar" ? "active" : ""} onClick={() => setTab("avatar")}><WandSparkles /><span>Avatar</span></button>
            <button className={tab === "identity" ? "active" : ""} onClick={() => setTab("identity")}><UserRound /><span>Identidade</span></button>
            <button className={tab === "card" ? "active" : ""} onClick={() => setTab("card")}><Palette /><span>Cartão</span></button>
            <button className={tab === "inventory" ? "active" : ""} onClick={() => setTab("inventory")}><ShoppingBag /><span>Inventário</span></button>
          </nav>

          {tab === "avatar" && <div className="v91-editor-stack">
            <Panel title="Looks prontos" subtitle="Comece bonito e depois bagunça do seu jeito" icon={<Sparkles />} className="v91-look-panel">
              <div className="v91-look-carousel">{AVATAR_KITS.slice(0, 12).map((kit) => <button key={kit.id} className={avatarConfig._luaLook === kit.id ? "active" : ""} onClick={() => applyKit(kit)}>
                <div className="v91-look-avatar"><AvatarVisual style={kit.style} seed={`kit-${kit.id}`} config={kit.config} size={150} /></div>
                <strong>{kit.label}</strong><small>{kit.tagline}</small>{avatarConfig._luaLook === kit.id && <i><Check /></i>}
              </button>)}</div>
            </Panel>

            <Panel title="Família do personagem" subtitle="Mascote próprio ou estilos open source" icon={<Gamepad2 />}>
              <div className="v91-family-grid">{AVATAR_STYLES.map((s) => <button key={s.id} className={avatarStyle === s.id ? "active" : ""} onClick={() => {
                setAvatarStyle(s.id);
                if (s.id === "lua-mates" && !avatarConfig._luaSpecies) setConfig("_luaSpecies", "moon-bear");
              }}>
                <AvatarVisual style={s.id} seed={`luaid-${s.id}`} config={s.id === "lua-mates" ? { _luaSpecies: "moon-bear", _luaExpression: "happy", _luaEyes: "spark", _luaOutfit: "academy" } : {}} size={110} compact />
                <span><strong>{s.label}</strong><small>{s.note}</small></span>{avatarStyle === s.id && <Check />}
              </button>)}</div>
            </Panel>

            {avatarStyle === "lua-mates" ? <>
              <Panel title="Escolha seu LuaMate" subtitle="Agora eles têm rosto, corpo e expressão de verdade" icon={<MoonStar />}>
                <div className="v91-species-grid">{LUA_MATE_SPECIES.map(([id,label]) => <button key={id} className={selectedSpecies === id ? "active" : ""} onClick={() => setConfig("_luaSpecies", id)}>
                  <div><AvatarVisual style="lua-mates" seed={`species-${id}`} config={{ ...avatarConfig, _luaSpecies:id, _luaHead:"none", _luaFace:"none", _luaAura:"none", _luaFrame:"none", _luaCompanion:"none" }} size={130} compact /></div>
                  <strong>{label}</strong>{selectedSpecies === id && <Check />}
                </button>)}</div>
              </Panel>

              <div className="v91-duo-panels">
                <Panel title="Rosto" subtitle="Olho, expressão e detalhe" icon={<UserRound />}>
                  <OptionRow label="Expressão" items={LUA_EXPRESSIONS} value={luaValue("_luaExpression", "happy")} onChange={(v) => setConfig("_luaExpression", v)} />
                  <OptionRow label="Olhos" items={LUA_EYES} value={luaValue("_luaEyes", "spark")} onChange={(v) => setConfig("_luaEyes", v)} />
                  <OptionRow label="Marca" items={LUA_MARKS} value={luaValue("_luaMark", "blush")} onChange={(v) => setConfig("_luaMark", v)} />
                </Panel>
                <Panel title="Roupa" subtitle="A vibe muda o personagem todo" icon={<Palette />}>
                  <OptionGrid items={LUA_OUTFITS} value={luaValue("_luaOutfit", "academy")} onChange={(v) => setConfig("_luaOutfit", v)} />
                </Panel>
              </div>
            </> : <Panel title="Peças da base" subtitle="Cabelo, olhos, roupa e cores do estilo escolhido" icon={<Palette />}>
              {avatarOptions.isLoading && <p className="v91-muted"><LoaderCircle className="spin" /> carregando peças…</p>}
              <div className="v91-dicebear-options">{curatedOptions.slice(0, 12).map(([key, meta]) => {
                const values = Array.isArray(meta.values) ? meta.values.slice(0, 60) : [];
                if (!values.length) return null;
                return <label key={key}><span>{humanizeAvatarOption(key)}</span><select value={typeof avatarConfig[key] === "string" ? String(avatarConfig[key]) : ""} onChange={(e) => setConfig(key, e.target.value)}><option value="">Automático</option>{values.map((v) => <option key={v} value={v}>{humanizeAvatarValue(v)}</option>)}</select></label>;
              })}</div>
            </Panel>}

            <Panel title="Acessórios e efeitos" subtitle="A parte que deixa o boneco sem vergonha de ser divertido" icon={<WandSparkles />}>
              <GearRail label="Cabeça" items={LUA_GEAR.head} value={luaValue("_luaHead")} onChange={(v) => setConfig("_luaHead", v)} />
              <GearRail label="Rosto" items={LUA_GEAR.face} value={luaValue("_luaFace")} onChange={(v) => setConfig("_luaFace", v)} />
              <GearRail label="Efeito" items={LUA_GEAR.aura} value={luaValue("_luaAura")} onChange={(v) => setConfig("_luaAura", v)} />
              <GearRail label="Moldura" items={LUA_GEAR.frame} value={luaValue("_luaFrame")} onChange={(v) => setConfig("_luaFrame", v)} />
              <GearRail label="Companheiro" items={LUA_COMPANIONS.map(([a,b,c]) => [a, `${c} ${b}`] as const)} value={luaValue("_luaCompanion")} onChange={(v) => setConfig("_luaCompanion", v)} />
            </Panel>
          </div>}

          {tab === "identity" && <div className="v91-editor-stack">
            <Panel title="Sua identidade" subtitle="Nome, título e bio — sem texto de robô, por favor" icon={<UserRound />}>
              <div className="v91-form-grid"><label>Nome<input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={32} /></label><label>@LuaID<input value={handle} onChange={(e) => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "").slice(0,24))} placeholder="meu_nome" /></label><label className="wide">Título<input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={42} placeholder="Guia do Quasar" /></label><label className="wide">Bio<textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={220} placeholder="Conta do seu jeito o que você curte aprender ou ensinar." /></label></div>
            </Panel>
            <Panel title="Compartilhamento" subtitle="Você escolhe se esse LuaID pode aparecer em outras experiências" icon={<Globe2 />}>
              <label className={`v91-visibility ${visibility === "classroom" ? "on" : ""}`}><input type="checkbox" checked={visibility === "classroom"} onChange={(e) => setVisibility(e.target.checked ? "classroom" : "private")} /><span>{visibility === "classroom" ? <Globe2 /> : <LockKeyhole />}<strong>{visibility === "classroom" ? "Perfil compartilhável" : "Perfil privado"}</strong><small>{visibility === "classroom" ? "Pode aparecer em experiências e salas da Rede Lua." : "Fica só na sua conta."}</small></span></label>
              <div className="v91-endpoint"><code>{apiPath}</code><button onClick={() => { navigator.clipboard?.writeText(apiPath); toast.success("Endpoint copiado."); }}><Copy /></button></div>
            </Panel>
          </div>}

          {tab === "card" && <div className="v91-editor-stack">
            <Panel title="Universo do cartão" subtitle="Mude o clima inteiro do perfil" icon={<Palette />}>
              <div className="v91-theme-grid">{themes.map((t) => <button key={t.label} onClick={() => setTheme(t.theme)} className={theme.background === t.theme.background ? "active" : ""}><i style={{ background:`linear-gradient(135deg,${t.theme.background},${t.theme.surface} 58%,${t.theme.accent})` }} /><strong>{t.label}</strong></button>)}</div>
            </Panel>
            <Panel title="Matérias favoritas" subtitle="Até oito — sem precisar fazer TCC pra escolher" icon={<Sparkles />}>
              <div className="v91-subjects">{subjects.map((s) => <button key={s} className={favorites.includes(s) ? "active" : ""} onClick={() => setFavorites((f) => f.includes(s) ? f.filter((x) => x !== s) : [...f,s].slice(-8))}>{s}</button>)}</div>
            </Panel>
          </div>}

          {tab === "inventory" && <div className="v91-editor-stack">
            <Panel title="Inventário + Loja Lunar" subtitle="O que você ganhou, desbloqueou ou ainda tá de olho" icon={<Coins />}>
              <div className="v91-wallet"><span><Coins /> Luas disponíveis</span><strong>{(cosmetics.data?.coins ?? user.moonCoins).toLocaleString("pt-BR")}</strong></div>
              <div className="v91-catalog">{catalogItems.map((item) => {
                const unlocked = cosmeticUnlocks.has(item.id);
                const canBuy = user.level >= item.level && (cosmetics.data?.coins ?? user.moonCoins) >= item.cost;
                return <article key={item.id} className={unlocked ? "unlocked" : ""}><div className="v91-catalog-icon">{item.emoji || "✨"}</div><div><span>{item.kind}</span><strong>{item.label}</strong><p>{item.note}</p><small>Nível {item.level} • {item.cost} Luas</small></div>{unlocked ? <button onClick={() => applyCosmetic(item)}><Check /> Usar</button> : <button disabled={!canBuy || unlock.isPending} onClick={() => unlock.mutate(item.id)}><Coins /> {item.cost}</button>}</article>;
              })}</div>
            </Panel>
          </div>}

          <button className="v91-save" disabled={save.isPending || displayName.trim().length < 2 || title.trim().length < 2} onClick={() => save.mutate()}>{save.isPending ? <LoaderCircle className="spin" /> : <Save />} Salvar meu LuaID</button>
        </div>
      </section>
    </div>
  </div>;
}

function Panel({ title, subtitle, icon, children, className = "" }: { title:string; subtitle:string; icon?:ReactNode; children:ReactNode; className?:string }) {
  return <section className={`v91-panel ${className}`.trim()}><header><div><span>{title}</span><small>{subtitle}</small></div>{icon && <i>{icon}</i>}</header>{children}</section>;
}

function OptionGrid({ items, value, onChange }: { items: readonly (readonly [string,string,string])[]; value:string; onChange:(v:string)=>void }) {
  return <div className="v91-option-grid">{items.map(([id,label,emoji]) => <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><span>{emoji}</span><strong>{label}</strong>{value === id && <Check />}</button>)}</div>;
}

function OptionRow({ label, items, value, onChange }: { label:string; items: readonly (readonly [string,string,string])[]; value:string; onChange:(v:string)=>void }) {
  return <div className="v91-option-row"><b>{label}</b><div>{items.map(([id,name,emoji]) => <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><span>{emoji}</span><small>{name}</small></button>)}</div></div>;
}

function GearRail({ label, items, value, onChange }: { label:string; items: readonly (readonly [string,string])[]; value:string; onChange:(v:string)=>void }) {
  return <div className="v91-gear-rail"><strong>{label}</strong><div>{items.map(([id,name]) => <button key={id} className={value === id ? "active" : ""} onClick={() => onChange(id)}><i className={`gear-swatch gear-${id}`} /><span>{name}</span>{value === id && <Check />}</button>)}</div></div>;
}
