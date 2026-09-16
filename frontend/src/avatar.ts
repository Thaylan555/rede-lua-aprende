import type { AvatarConfig, AvatarStyle } from "./types";

export const AVATAR_STYLES: Array<{ id: AvatarStyle; label: string; note: string }> = [
  { id: "adventurer", label: "Aventureiro", note: "Cartoon expressivo, cabelo, óculos e acessórios." },
  { id: "avataaars", label: "Avataaars", note: "Meio-corpo com roupas, cabelos e expressões." },
  { id: "personas", label: "Personas", note: "Visual flat com cabelos, óculos e roupas." },
  { id: "lorelei", label: "Lorelei", note: "Retrato leve com muitas combinações de rosto." },
  { id: "notionists", label: "Notionists", note: "Ilustração limpa com peças variadas." },
];

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
    if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(key) || blockedKeys.has(key) || value === "" || value == null) return;
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
    "facialHairProbability", "clothing", "clothes", "shirt", "skinColor", "backgroundColor"
  ];
  const rank = (key: string) => {
    const lower = key.toLowerCase();
    const idx = preferred.findIndex((name) => lower === name.toLowerCase());
    if (idx >= 0) return idx;
    const contains = preferred.findIndex((name) => lower.includes(name.toLowerCase()));
    return contains >= 0 ? contains + 20 : 999;
  };
  return Object.entries(options)
    .filter(([key, meta]) => !blockedKeys.has(key) && (meta.type === "enum" || meta.type === "color" || meta.type === "number" || meta.type === "boolean"))
    .sort(([a], [b]) => rank(a) - rank(b))
    .slice(0, 14);
}

export function humanizeAvatarOption(key: string) {
  const known: Record<string, string> = {
    hair: "Cabelo", hairVariant: "Cabelo", hairColor: "Cor do cabelo", glasses: "Óculos", glassesProbability: "Chance de óculos",
    glassesColor: "Cor dos óculos", eyes: "Olhos", eye: "Olhos", eyesColor: "Cor dos olhos", eyebrows: "Sobrancelhas", mouth: "Boca",
    earrings: "Brincos", earringsProbability: "Chance de brincos", accessories: "Acessórios", accessoriesProbability: "Chance de acessórios",
    facialHair: "Barba / bigode", facialHairProbability: "Chance de barba", clothing: "Roupa", clothes: "Roupa", shirt: "Roupa",
    skinColor: "Tom do avatar", backgroundColor: "Fundo"
  };
  if (known[key]) return known[key];
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (m) => m.toUpperCase());
}
