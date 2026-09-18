import type { AvatarConfig, AvatarStyle, ProfileTheme } from "./types";

export const AVATAR_STYLES: Array<{ id: AvatarStyle; label: string; note: string }> = [
  { id: "lua-mates", label: "LuaMates", note: "Mascotes originais da Rede Lua: animais, robôs e criaturas." },
  { id: "adventurer", label: "Cartoon", note: "Expressivo e leve para montar do seu jeito." },
  { id: "avataaars", label: "Street", note: "Meio-corpo com roupas, cabelo e acessórios." },
  { id: "personas", label: "Personas", note: "Visual moderno, simples e colorido." },
  { id: "lorelei", label: "Retrato", note: "Rosto estilizado com muitas combinações." },
  { id: "notionists", label: "Sketch", note: "Ilustração limpa com bastante personalidade." },
  { id: "bottts", label: "Robô", note: "Robôs completos com antenas, peças e carinhas." },
  { id: "pixel-art", label: "Pixel", note: "Visual de game retrô em estilo 8-bit." },
  { id: "big-smile", label: "Big Smile", note: "Cartoon alegre com cabelo, roupa e sorrisos grandes." },
  { id: "fun-emoji", label: "Emoji", note: "Carinhas bem expressivas para um perfil mais leve." },
  { id: "croodles", label: "Doodle", note: "Desenho rabiscado com cara de caderno e muita personalidade." },
  { id: "micah", label: "Creator", note: "Retrato moderno com roupa, cabelo e cores fortes." },
];

export type AvatarKit = {
  id: string;
  label: string;
  tagline: string;
  style: AvatarStyle;
  config: AvatarConfig;
  theme: ProfileTheme;
};

export const AVATAR_KITS: AvatarKit[] = [
  { id: "capivara-lunar", label: "Capivara Lunar", tagline: "Mascote tranquilo com cara de Rede Lua.", style: "lua-mates", config: { _luaSpecies: "lunar-capybara", _luaExpression: "happy", _luaOutfit: "academy", _luaCompanion: "book-sprite", _luaHead: "scholar-cap", _luaAura: "stars", _luaFrame: "royal" }, theme: { accent: "#ffca43", surface: "#174b91", background: "#071c45", card: "#fffaf0", pattern: "stars" } },
  { id: "dragao-arcade", label: "Dragão Arcade", tagline: "Criatura de game com energia neon.", style: "lua-mates", config: { _luaSpecies: "pocket-dragon", _luaExpression: "confident", _luaOutfit: "arcade", _luaCompanion: "star-buddy", _luaHead: "headset", _luaAura: "pixels", _luaFrame: "arcade" }, theme: { accent: "#35f2b5", surface: "#7447e7", background: "#090c22", card: "#fffdf6", pattern: "grid" } },
  { id: "pinguim-cientista", label: "Pinguim Cientista", tagline: "Laboratório, curiosidade e um livro vivo.", style: "lua-mates", config: { _luaSpecies: "cosmic-penguin", _luaExpression: "curious", _luaOutfit: "science", _luaCompanion: "book-sprite", _luaHead: "scholar-cap", _luaFace: "round-glasses", _luaAura: "cosmic", _luaFrame: "frost" }, theme: { accent: "#65e9ff", surface: "#244a80", background: "#081a34", card: "#f8fdff", pattern: "orbit" } },
  { id: "raposa-pirata", label: "Raposa Pirata", tagline: "Aventura, mapa e tapa-olho sem copiar ninguém.", style: "lua-mates", config: { _luaSpecies: "nebula-fox", _luaExpression: "confident", _luaOutfit: "pirate", _luaCompanion: "mini-moon", _luaHead: "pirate-hat", _luaFace: "eyepatch", _luaAura: "comet", _luaFrame: "pirate" }, theme: { accent: "#ffc83d", surface: "#273a69", background: "#10182f", card: "#fff9ea", pattern: "stars" } },
  { id: "axolote-prisma", label: "Axolote Prisma", tagline: "Fofo, estranho e impossível de confundir.", style: "lua-mates", config: { _luaSpecies: "prism-axolotl", _luaExpression: "surprised", _luaOutfit: "space", _luaCompanion: "planet-buddy", _luaHead: "classic-crown", _luaFace: "prism-glasses", _luaAura: "hearts", _luaFrame: "candy" }, theme: { accent: "#ff6fb5", surface: "#6a4cd5", background: "#221249", card: "#fff7fc", pattern: "orbit" } },
  { id: "pirata-lunar", label: "Pirata Lunar", tagline: "Tapa-olho, chapéu e clima de aventura.", style: "avataaars", config: { _luaHead: "pirate-hat", _luaFace: "eyepatch", _luaAura: "stars", _luaFrame: "pirate" }, theme: { accent: "#ffc83d", surface: "#12274c", background: "#07162f", card: "#fffaf0", pattern: "stars" } },
  { id: "robo-neon", label: "Robô Neon", tagline: "Metal, luzes e energia futurista.", style: "bottts", config: { _luaHead: "robot-antenna", _luaFace: "none", _luaAura: "neon", _luaFrame: "tech" }, theme: { accent: "#39e4ff", surface: "#172756", background: "#080d25", card: "#f6fbff", pattern: "grid" } },
  { id: "gamer-pixel", label: "Gamer Pixel", tagline: "Headset e visual de jogo retrô.", style: "pixel-art", config: { _luaHead: "headset", _luaFace: "none", _luaAura: "pixels", _luaFrame: "arcade" }, theme: { accent: "#ffcf3e", surface: "#6a44dc", background: "#181036", card: "#fffdf5", pattern: "grid" } },
  { id: "mago-cosmico", label: "Mago Cósmico", tagline: "Um visual mágico sem ficar infantil.", style: "adventurer", config: { _luaHead: "wizard-hat", _luaFace: "star-glasses", _luaAura: "cosmic", _luaFrame: "cosmic" }, theme: { accent: "#ffe066", surface: "#5938a9", background: "#1b1042", card: "#fffaff", pattern: "orbit" } },
  { id: "street-lunar", label: "Street Lunar", tagline: "Boné, visor e uma vibe mais teen.", style: "avataaars", config: { _luaHead: "street-cap", _luaFace: "neon-visor", _luaAura: "neon", _luaFrame: "street" }, theme: { accent: "#65e9ff", surface: "#155bd7", background: "#071c45", card: "#ffffff", pattern: "plain" } },
  { id: "agente-orbita", label: "Agente Órbita", tagline: "Máscara, tecnologia e perfil misterioso.", style: "notionists", config: { _luaHead: "none", _luaFace: "mask", _luaAura: "cosmic", _luaFrame: "tech" }, theme: { accent: "#a477ff", surface: "#172650", background: "#080d20", card: "#fbfbff", pattern: "orbit" } },
  { id: "creator-pop", label: "Creator Pop", tagline: "Cartoon forte, divertido e com cara de criador.", style: "big-smile", config: { _luaHead: "headset", _luaFace: "none", _luaAura: "stars", _luaFrame: "street" }, theme: { accent: "#ff5d8f", surface: "#2648a8", background: "#111a44", card: "#fffaf5", pattern: "stars" } },
  { id: "caderno-vivo", label: "Caderno Vivo", tagline: "Doodle criativo para quem gosta de desenhar e inventar.", style: "croodles", config: { _luaHead: "street-cap", _luaFace: "star-glasses", _luaAura: "pixels", _luaFrame: "arcade" }, theme: { accent: "#ffd54a", surface: "#1f6d5b", background: "#0c2d2a", card: "#fffdf1", pattern: "grid" } },
];

export const LUA_MATE_SPECIES = [
  ["moon-bear", "Urso Lunar", "🐻"], ["nebula-fox", "Raposa Nebular", "🦊"], ["cosmic-penguin", "Pinguim Cósmico", "🐧"],
  ["lunar-capybara", "Capivara Lunar", "🟤"], ["wise-owl", "Coruja Sábia", "🦉"], ["pocket-dragon", "Dragão de Bolso", "🐲"],
  ["orbit-robot", "Robô Órbita", "🤖"], ["astro-cat", "Gato Astro", "🐱"], ["prism-axolotl", "Axolote Prisma", "🩷"],
  ["star-bunny", "Coelho Estelar", "🐰"], ["comet-monkey", "Macaco Cometa", "🐵"], ["cloud-yeti", "Yeti Nuvem", "☁️"],
] as const;

export const LUA_EXPRESSIONS = [
  ["happy", "Feliz", "😄"], ["curious", "Curioso", "🤔"], ["confident", "Confiante", "😏"], ["surprised", "Surpreso", "😮"],
] as const;

export const LUA_OUTFITS = [
  ["academy", "Academia Lunar", "🎒"], ["space", "Explorador Espacial", "🚀"], ["science", "Laboratório", "🧪"], ["arcade", "Arcade", "🎮"], ["pirate", "Aventura Pirata", "🏴‍☠️"],
] as const;

export const LUA_COMPANIONS = [
  ["none", "Sem companheiro", "—"], ["mini-moon", "Mini Lua", "🌙"], ["book-sprite", "Livro Vivo", "📘"], ["mini-rocket", "Mini Foguete", "🚀"],
  ["star-buddy", "Estrelinha", "⭐"], ["robot-pet", "Robô Pet", "🤖"], ["frog-orbit", "Sapo Órbita", "🐸"], ["planet-buddy", "Planetinha", "🪐"], ["pencil-sprite", "Lápis Vivo", "✏️"],
] as const;

export const LUA_BACKDROPS = [
  ["stars", "Céu Estelar"], ["orbit", "Órbita"], ["grid", "Arcade"], ["plain", "Limpo"],
] as const;

export const LUA_GEAR = {
  head: [
    ["none", "Sem item"], ["pirate-hat", "Chapéu pirata"], ["headset", "Headset gamer"], ["wizard-hat", "Chapéu de mago"], ["street-cap", "Boné street"], ["robot-antenna", "Antena robô"], ["comet-crown", "Coroa Cometa"], ["cowboy-hat", "Chapéu cowboy"], ["top-hat", "Cartola"], ["classic-crown", "Coroa clássica"], ["pancake-stack", "Torre de panquecas"], ["flower-crown", "Coroa de flores"], ["scholar-cap", "Capelo"], ["party-hat", "Chapéu de festa"], ["winter-beanie", "Gorro"],
  ],
  face: [
    ["none", "Sem item"], ["eyepatch", "Tapa-olho"], ["neon-visor", "Visor neon"], ["star-glasses", "Óculos estrela"], ["mask", "Máscara tech"], ["prism-glasses", "Óculos Prisma"], ["nerd-glasses", "Óculos nerd"], ["round-glasses", "Óculos redondo"], ["pixel-shades", "Óculos pixel"], ["moustache", "Bigode divertido"], ["monocle", "Monóculo"],
  ],
  aura: [
    ["none", "Sem efeito"], ["stars", "Estrelas"], ["neon", "Neon"], ["pixels", "Pixels"], ["cosmic", "Órbita cósmica"], ["comet", "Rastro de Cometa"], ["confetti", "Confete"], ["hearts", "Corações"], ["snow", "Neve"], ["books", "Livros voando"],
  ],
  frame: [
    ["none", "Clássica"], ["pirate", "Pirata"], ["tech", "Tech"], ["arcade", "Arcade"], ["cosmic", "Cósmica"], ["street", "Street"], ["quasar", "Quasar"], ["royal", "Real"], ["forest", "Floresta"], ["frost", "Gelo"], ["candy", "Doce"],
  ],
} as const;

export const PROFILE_COSMETICS = [
  { id:"head-comet-crown", label:"Coroa Cometa", note:"Uma coroa espacial para looks especiais.", cost:60, level:3, kind:"head", value:"comet-crown" },
  { id:"face-prism-glasses", label:"Óculos Prisma", note:"Lentes coloridas com vibe futurista.", cost:45, level:2, kind:"face", value:"prism-glasses" },
  { id:"aura-comet", label:"Rastro de Cometa", note:"Partículas passando atrás do avatar.", cost:35, level:2, kind:"aura", value:"comet" },
  { id:"frame-quasar", label:"Moldura Quasar", note:"Uma moldura brilhante para destacar o cartão.", cost:50, level:3, kind:"frame", value:"quasar" },
  { id:"theme-aurora", label:"Tema Aurora", note:"Paleta especial verde, azul e dourado.", cost:80, level:4, kind:"theme", value:"aurora" },
] as const;

const configuredBase = (import.meta.env.VITE_DICEBEAR_API_URL || "https://api.dicebear.com/10.x").replace(/\/$/, "");
export const DICEBEAR_API_BASE = configuredBase;

export type DiceBearOptionMeta = {
  type?: "string" | "enum" | "number" | "boolean" | "color";
  values?: string[];
  min?: number;
  max?: number;
  list?: boolean;
  weighted?: boolean;
};

export type DiceBearOptions = Record<string, DiceBearOptionMeta>;

const blockedKeys = new Set(["seed", "size", "radius", "backgroundType", "backgroundRotation", "randomizeIds"]);

export function buildAvatarUrl(style: AvatarStyle, seed: string, config: AvatarConfig = {}, size = 320) {
  if (style === "lua-mates") return "";
  const params = new URLSearchParams();
  params.set("seed", seed || "rede-lua");
  params.set("size", String(Math.max(64, Math.min(512, size))));
  Object.entries(config).forEach(([key, value]) => {
    if (key.startsWith("_lua") || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) || blockedKeys.has(key) || value === "" || value == null) return;
    if (Array.isArray(value)) params.set(key, value.join(","));
    else params.set(key, String(value));
  });
  return `${DICEBEAR_API_BASE}/${style}/svg?${params.toString()}`;
}

export async function loadAvatarOptions(style: AvatarStyle): Promise<DiceBearOptions> {
  if (style === "lua-mates") return {};
  const response = await fetch(`${DICEBEAR_API_BASE}/${style}/options.json`, { headers: { accept: "application/json" } });
  if (!response.ok) throw new Error("Não foi possível carregar as opções do avatar.");
  return response.json();
}

export function usefulAvatarOptions(options: DiceBearOptions) {
  const preferred = [
    "hair", "hairVariant", "hairColor", "glasses", "glassesProbability", "glassesColor", "eyes", "eye", "eyesColor",
    "eyebrows", "mouth", "earrings", "earringsProbability", "accessories", "accessoriesProbability", "facialHair",
    "facialHairProbability", "clothing", "clothes", "shirt", "skinColor", "backgroundColor", "antenna", "texture", "mouth",
  ];
  const rank = (key: string) => {
    const lower = key.toLowerCase();
    const idx = preferred.findIndex((name) => lower === name.toLowerCase());
    if (idx >= 0) return idx;
    const contains = preferred.findIndex((name) => lower.includes(name.toLowerCase()));
    return contains >= 0 ? contains + 20 : 999;
  };
  return Object.entries(options)
    .filter(([key, meta]) => !blockedKeys.has(key) && !key.startsWith("_lua") && (meta.type === "enum" || meta.type === "color" || meta.type === "number" || meta.type === "boolean"))
    .sort(([a], [b]) => rank(a) - rank(b))
    .slice(0, 14);
}

export function humanizeAvatarOption(key: string) {
  const known: Record<string, string> = {
    hair: "Cabelo", hairVariant: "Cabelo", hairColor: "Cor do cabelo", glasses: "Óculos", glassesProbability: "Chance de óculos",
    glassesColor: "Cor dos óculos", eyes: "Olhos", eye: "Olhos", eyesColor: "Cor dos olhos", eyebrows: "Sobrancelhas", mouth: "Boca",
    earrings: "Brincos", earringsProbability: "Chance de brincos", accessories: "Acessórios", accessoriesProbability: "Chance de acessórios",
    facialHair: "Barba / bigode", facialHairProbability: "Chance de barba", clothing: "Roupa", clothes: "Roupa", shirt: "Roupa",
    skinColor: "Tom do avatar", backgroundColor: "Fundo", antenna: "Antena", texture: "Textura",
  };
  if (known[key]) return known[key];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}

export function humanizeAvatarValue(value: string) {
  const cleaned = value
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]/g, " ")
    .replace(/\b0*(\d+)\b/g, "modelo $1")
    .trim();
  return cleaned.replace(/\b\w/g, (m) => m.toUpperCase());
}

export function keepLuaGear(config: AvatarConfig): AvatarConfig {
  return Object.fromEntries(Object.entries(config).filter(([key]) => key.startsWith("_lua")));
}
