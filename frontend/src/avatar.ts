import type { AvatarConfig, AvatarStyle, ProfileTheme } from "./types";

export const AVATAR_STYLES: Array<{ id: AvatarStyle; label: string; note: string }> = [
  { id: "adventurer", label: "Cartoon", note: "Expressivo e leve para montar do seu jeito." },
  { id: "avataaars", label: "Street", note: "Meio-corpo com roupas, cabelo e acessórios." },
  { id: "personas", label: "Personas", note: "Visual moderno, simples e colorido." },
  { id: "lorelei", label: "Retrato", note: "Rosto estilizado com muitas combinações." },
  { id: "notionists", label: "Sketch", note: "Ilustração limpa com bastante personalidade." },
  { id: "bottts", label: "Robô", note: "Robôs completos com antenas, peças e carinhas." },
  { id: "pixel-art", label: "Pixel", note: "Visual de game retrô em estilo 8-bit." },
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
  { id: "pirata-lunar", label: "Pirata Lunar", tagline: "Tapa-olho, chapéu e clima de aventura.", style: "avataaars", config: { _luaHead: "pirate-hat", _luaFace: "eyepatch", _luaAura: "stars", _luaFrame: "pirate" }, theme: { accent: "#ffc83d", surface: "#12274c", background: "#07162f", card: "#fffaf0", pattern: "stars" } },
  { id: "robo-neon", label: "Robô Neon", tagline: "Metal, luzes e energia futurista.", style: "bottts", config: { _luaHead: "robot-antenna", _luaFace: "none", _luaAura: "neon", _luaFrame: "tech" }, theme: { accent: "#39e4ff", surface: "#172756", background: "#080d25", card: "#f6fbff", pattern: "grid" } },
  { id: "gamer-pixel", label: "Gamer Pixel", tagline: "Headset e visual de jogo retrô.", style: "pixel-art", config: { _luaHead: "headset", _luaFace: "none", _luaAura: "pixels", _luaFrame: "arcade" }, theme: { accent: "#ffcf3e", surface: "#6a44dc", background: "#181036", card: "#fffdf5", pattern: "grid" } },
  { id: "mago-cosmico", label: "Mago Cósmico", tagline: "Um visual mágico sem ficar infantil.", style: "adventurer", config: { _luaHead: "wizard-hat", _luaFace: "star-glasses", _luaAura: "cosmic", _luaFrame: "cosmic" }, theme: { accent: "#ffe066", surface: "#5938a9", background: "#1b1042", card: "#fffaff", pattern: "orbit" } },
  { id: "street-lunar", label: "Street Lunar", tagline: "Boné, visor e uma vibe mais teen.", style: "avataaars", config: { _luaHead: "street-cap", _luaFace: "neon-visor", _luaAura: "neon", _luaFrame: "street" }, theme: { accent: "#65e9ff", surface: "#155bd7", background: "#071c45", card: "#ffffff", pattern: "plain" } },
  { id: "agente-orbita", label: "Agente Órbita", tagline: "Máscara, tecnologia e perfil misterioso.", style: "notionists", config: { _luaHead: "none", _luaFace: "mask", _luaAura: "cosmic", _luaFrame: "tech" }, theme: { accent: "#a477ff", surface: "#172650", background: "#080d20", card: "#fbfbff", pattern: "orbit" } },
];

export const LUA_GEAR = {
  head: [
    ["none", "Sem item"], ["pirate-hat", "Chapéu pirata"], ["headset", "Headset gamer"], ["wizard-hat", "Chapéu de mago"], ["street-cap", "Boné street"], ["robot-antenna", "Antena robô"],
  ],
  face: [
    ["none", "Sem item"], ["eyepatch", "Tapa-olho"], ["neon-visor", "Visor neon"], ["star-glasses", "Óculos estrela"], ["mask", "Máscara tech"],
  ],
  aura: [
    ["none", "Sem efeito"], ["stars", "Estrelas"], ["neon", "Neon"], ["pixels", "Pixels"], ["cosmic", "Órbita cósmica"],
  ],
  frame: [
    ["none", "Clássica"], ["pirate", "Pirata"], ["tech", "Tech"], ["arcade", "Arcade"], ["cosmic", "Cósmica"], ["street", "Street"],
  ],
} as const;

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
