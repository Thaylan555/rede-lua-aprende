export type LuaAvatarConfig = {
  species?: string;
  expression?: string;
  eyes?: string;
  marking?: string;
  outfit?: string;
  head?: string;
  face?: string;
  aura?: string;
  frame?: string;
  companion?: string;
  background?: string;
  palette?: string;
};

type CatalogItem = { id: string; label: string; emoji?: string; rarity?: "common" | "rare" | "epic" | "legendary" };
type Species = CatalogItem & {
  kind: "bear" | "fox" | "penguin" | "capybara" | "owl" | "dragon" | "robot" | "cat" | "axolotl" | "bunny" | "monkey" | "yeti" | "panda" | "frog" | "otter" | "raccoon" | "lion" | "deer" | "wolf" | "chicken" | "unicorn" | "skull" | "planet" | "alien";
  body: string;
  shade: string;
  cream: string;
  iris: string;
};

export const LUA_AVATAR_CATALOG = {
  version: "lua-avatar.v2",
  engine: "Lua Avatar Engine",
  species: [
    { id: "moon-bear", label: "Urso Lunar", emoji: "🐻", kind: "bear", body: "#F4B94D", shade: "#C98624", cream: "#FFE8AD", iris: "#3D78E8" },
    { id: "nebula-fox", label: "Raposa Nebular", emoji: "🦊", kind: "fox", body: "#F18248", shade: "#C9552B", cream: "#FFF0D6", iris: "#4C7D49" },
    { id: "cosmic-penguin", label: "Pinguim Cósmico", emoji: "🐧", kind: "penguin", body: "#293556", shade: "#111A31", cream: "#FAF8F0", iris: "#47A6FF" },
    { id: "lunar-capybara", label: "Capivara Lunar", emoji: "🦫", kind: "capybara", body: "#B8784F", shade: "#7B452C", cream: "#EFC99D", iris: "#5B382B" },
    { id: "wise-owl", label: "Coruja Sábia", emoji: "🦉", kind: "owl", body: "#B580D7", shade: "#744BA0", cream: "#FFF0C8", iris: "#7855C8" },
    { id: "pocket-dragon", label: "Dragão de Bolso", emoji: "🐲", kind: "dragon", body: "#69CB76", shade: "#2A985C", cream: "#D8FFD9", iris: "#5B48CF" },
    { id: "orbit-robot", label: "Robô Órbita", emoji: "🤖", kind: "robot", body: "#59D3EA", shade: "#2F78BC", cream: "#EFFFFF", iris: "#42EAFF" },
    { id: "astro-cat", label: "Gato Astro", emoji: "🐱", kind: "cat", body: "#F2AD47", shade: "#B96928", cream: "#FFECCF", iris: "#3E8B6C" },
    { id: "prism-axolotl", label: "Axolote Prisma", emoji: "🩷", kind: "axolotl", body: "#FF8FBE", shade: "#CF5596", cream: "#FFE8F5", iris: "#6650CF" },
    { id: "star-bunny", label: "Coelho Estelar", emoji: "🐰", kind: "bunny", body: "#D8D5EC", shade: "#948BC2", cream: "#FFF7FB", iris: "#5386DA" },
    { id: "comet-monkey", label: "Macaco Cometa", emoji: "🐵", kind: "monkey", body: "#C17F54", shade: "#784633", cream: "#EEC09A", iris: "#6A4532" },
    { id: "cloud-yeti", label: "Yeti Nuvem", emoji: "☁️", kind: "yeti", body: "#DDEBF6", shade: "#84AEC9", cream: "#FFFFFF", iris: "#4E90D8" },
    { id: "panda-pop", label: "Panda Pop", emoji: "🐼", kind: "panda", body: "#F8F8F4", shade: "#21263A", cream: "#FFFFFF", iris: "#4D82DB" },
    { id: "frog-orbit", label: "Sapo Órbita", emoji: "🐸", kind: "frog", body: "#79D868", shade: "#3B9D52", cream: "#DBFFD4", iris: "#7756D8" },
    { id: "otter-wave", label: "Lontra Onda", emoji: "🦦", kind: "otter", body: "#B57A56", shade: "#754A37", cream: "#EBC8A8", iris: "#4485C8" },
    { id: "raccoon-moon", label: "Guaxinim Lunar", emoji: "🦝", kind: "raccoon", body: "#9AA4B9", shade: "#4A536A", cream: "#E9ECF4", iris: "#4B81DB" },
    { id: "sun-lion", label: "Leão Solar", emoji: "🦁", rarity: "rare", kind: "lion", body: "#F0A33E", shade: "#9B5A22", cream: "#FFE1A1", iris: "#4F83D1" },
    { id: "forest-deer", label: "Cervo Aurora", emoji: "🦌", rarity: "rare", kind: "deer", body: "#C98D61", shade: "#744932", cream: "#F8D8B5", iris: "#4E7F68" },
    { id: "midnight-wolf", label: "Lobo Eclipse", emoji: "🐺", rarity: "rare", kind: "wolf", body: "#6D7896", shade: "#333B56", cream: "#DFE4F1", iris: "#6FE0FF" },
    { id: "rocket-chicken", label: "Galinha Foguete", emoji: "🐔", rarity: "rare", kind: "chicken", body: "#FFF1C8", shade: "#E28C38", cream: "#FFFFFF", iris: "#6B62D4" },
    { id: "crystal-unicorn", label: "Unicórnio Cristal", emoji: "🦄", rarity: "epic", kind: "unicorn", body: "#F3E7FF", shade: "#A574DD", cream: "#FFFFFF", iris: "#5B77DB" },
    { id: "moon-skull", label: "Caveira Lunar", emoji: "💀", rarity: "epic", kind: "skull", body: "#F6F3E8", shade: "#3C4356", cream: "#FFFFFF", iris: "#57DDEB" },
    { id: "planet-pal", label: "Planeta Vivo", emoji: "🌎", rarity: "epic", kind: "planet", body: "#4FB8F6", shade: "#2270B3", cream: "#79D96D", iris: "#223A72" },
    { id: "tiny-alien", label: "Alienzinho Lunar", emoji: "👽", rarity: "legendary", kind: "alien", body: "#77E2B8", shade: "#2A9B7C", cream: "#D8FFF1", iris: "#6C59DB" },
  ] as Species[],
  expressions: [
    { id: "happy", label: "Feliz" }, { id: "curious", label: "Curioso" }, { id: "confident", label: "Confiante" },
    { id: "surprised", label: "Surpreso" }, { id: "sleepy", label: "Soninho" }, { id: "focused", label: "Focado" },
    { id: "mischief", label: "Travesso" }, { id: "victory", label: "Vitória" },
  ] as CatalogItem[],
  eyes: [
    { id: "spark", label: "Brilho" }, { id: "round", label: "Redondo" }, { id: "soft", label: "Suave" },
    { id: "bold", label: "Marcante" }, { id: "star", label: "Estrela" }, { id: "pixel", label: "Pixel" },
  ] as CatalogItem[],
  markings: [
    { id: "none", label: "Limpo" }, { id: "blush", label: "Bochecha" }, { id: "freckles", label: "Sardinhas" },
    { id: "star", label: "Estrela" }, { id: "stripe", label: "Faixa" }, { id: "moon", label: "Lua" },
  ] as CatalogItem[],
  outfits: [
    { id: "academy", label: "Academia Lunar" }, { id: "space", label: "Explorador Espacial" }, { id: "science", label: "Laboratório" },
    { id: "arcade", label: "Arcade" }, { id: "pirate", label: "Aventura Pirata" }, { id: "street", label: "Street" },
    { id: "royal", label: "Real" }, { id: "hero", label: "Herói Lunar" },
  ] as CatalogItem[],
  heads: [
    { id: "none", label: "Sem item" }, { id: "crown", label: "Coroa" }, { id: "headset", label: "Headset" },
    { id: "flower-crown", label: "Flores" }, { id: "scholar-cap", label: "Capelo" }, { id: "pirate-hat", label: "Chapéu pirata" },
    { id: "space-helmet", label: "Capacete espacial" }, { id: "wizard-hat", label: "Chapéu de mago" },
  ] as CatalogItem[],
  faces: [
    { id: "none", label: "Sem item" }, { id: "eyepatch", label: "Tapa-olho" }, { id: "round-glasses", label: "Óculos redondos" },
    { id: "star-glasses", label: "Óculos estrela" }, { id: "neon-visor", label: "Visor neon" }, { id: "moustache", label: "Bigode" },
  ] as CatalogItem[],
  auras: [
    { id: "none", label: "Sem aura" }, { id: "stars", label: "Estrelas" }, { id: "confetti", label: "Confete" },
    { id: "hearts", label: "Corações" }, { id: "cosmic", label: "Cósmica" }, { id: "neon", label: "Neon" },
  ] as CatalogItem[],
  frames: [
    { id: "none", label: "Sem moldura" }, { id: "classic", label: "Clássica" }, { id: "royal", label: "Real" },
    { id: "arcade", label: "Arcade" }, { id: "frost", label: "Gelo" }, { id: "cosmic", label: "Cósmica" },
  ] as CatalogItem[],
  companions: [
    { id: "none", label: "Sem companheiro" }, { id: "mini-moon", label: "Mini Lua" }, { id: "book-sprite", label: "Livro Vivo" },
    { id: "robot-pet", label: "Robô Pet" }, { id: "planet-buddy", label: "Planetinha" }, { id: "star-buddy", label: "Estrelinha" },
  ] as CatalogItem[],
  backgrounds: [
    { id: "aurora", label: "Aurora" }, { id: "stars", label: "Céu Estelar" }, { id: "arcade", label: "Arcade" },
    { id: "sunset", label: "Pôr do sol" }, { id: "forest", label: "Floresta" }, { id: "clean", label: "Limpo" },
  ] as CatalogItem[],
};

function hash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return h >>> 0;
}

function choose<T extends CatalogItem>(items: T[], seed: string, salt: string) {
  return items[hash(`${seed}:${salt}`) % items.length].id;
}

function allowed(items: CatalogItem[], value: string | undefined, fallback: string) {
  return value && items.some((item) => item.id === value) ? value : fallback;
}

export function normalizeLuaAvatar(seed: string, config: LuaAvatarConfig = {}) {
  const alias = (value: string | undefined, map: Record<string,string>) => value ? (map[value] || value) : value;
  const speciesFallback = LUA_AVATAR_CATALOG.species[hash(`${seed}:species`) % LUA_AVATAR_CATALOG.species.length].id;
  return {
    species: allowed(LUA_AVATAR_CATALOG.species, config.species, speciesFallback),
    expression: allowed(LUA_AVATAR_CATALOG.expressions, config.expression, choose(LUA_AVATAR_CATALOG.expressions, seed, "expression")),
    eyes: allowed(LUA_AVATAR_CATALOG.eyes, config.eyes, choose(LUA_AVATAR_CATALOG.eyes, seed, "eyes")),
    marking: allowed(LUA_AVATAR_CATALOG.markings, config.marking, choose(LUA_AVATAR_CATALOG.markings, seed, "marking")),
    outfit: allowed(LUA_AVATAR_CATALOG.outfits, config.outfit, choose(LUA_AVATAR_CATALOG.outfits, seed, "outfit")),
    head: allowed(LUA_AVATAR_CATALOG.heads, alias(config.head, {
      "classic-crown":"crown", "comet-crown":"crown", "street-cap":"none", "robot-antenna":"none", "party-hat":"none",
      "winter-beanie":"none", "cowboy-hat":"none", "top-hat":"none", "pancake-stack":"none"
    }), "none"),
    face: allowed(LUA_AVATAR_CATALOG.faces, alias(config.face, {
      "prism-glasses":"round-glasses", "nerd-glasses":"round-glasses", "pixel-shades":"neon-visor", "mask":"neon-visor", "monocle":"round-glasses"
    }), "none"),
    aura: allowed(LUA_AVATAR_CATALOG.auras, alias(config.aura, {
      pixels:"neon", comet:"cosmic", snow:"stars", books:"cosmic"
    }), choose(LUA_AVATAR_CATALOG.auras, seed, "aura")),
    frame: allowed(LUA_AVATAR_CATALOG.frames, alias(config.frame, {
      pirate:"classic", tech:"arcade", street:"classic", quasar:"cosmic", forest:"classic", candy:"royal"
    }), "none"),
    companion: allowed(LUA_AVATAR_CATALOG.companions, alias(config.companion, {
      "mini-rocket":"robot-pet", "frog-orbit":"planet-buddy", "pencil-sprite":"book-sprite"
    }), "none"),
    background: allowed(LUA_AVATAR_CATALOG.backgrounds, alias(config.background, { orbit:"aurora", grid:"arcade", plain:"clean" }), choose(LUA_AVATAR_CATALOG.backgrounds, seed, "background")),
    palette: config.palette || "default",
  };
}

export function randomLuaAvatar(seed: string) {
  return normalizeLuaAvatar(seed, {
    species: choose(LUA_AVATAR_CATALOG.species, seed, "random-species"),
    expression: choose(LUA_AVATAR_CATALOG.expressions, seed, "random-expression"),
    eyes: choose(LUA_AVATAR_CATALOG.eyes, seed, "random-eyes"),
    marking: choose(LUA_AVATAR_CATALOG.markings, seed, "random-marking"),
    outfit: choose(LUA_AVATAR_CATALOG.outfits, seed, "random-outfit"),
    head: choose(LUA_AVATAR_CATALOG.heads, seed, "random-head"),
    face: choose(LUA_AVATAR_CATALOG.faces, seed, "random-face"),
    aura: choose(LUA_AVATAR_CATALOG.auras, seed, "random-aura"),
    frame: choose(LUA_AVATAR_CATALOG.frames, seed, "random-frame"),
    companion: choose(LUA_AVATAR_CATALOG.companions, seed, "random-companion"),
    background: choose(LUA_AVATAR_CATALOG.backgrounds, seed, "random-bg"),
  });
}

const esc = (value: string) => value.replace(/[&<>'"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&apos;", '"': "&quot;" }[c] || c));

function bgStops(kind: string): [string, string, string] {
  const map: Record<string, [string, string, string]> = {
    aurora: ["#122B6A", "#5D49D8", "#33D7C7"], stars: ["#071C45", "#163B7B", "#5F61DE"], arcade: ["#27125F", "#5E2CC7", "#F23A9D"],
    sunset: ["#FF8A5B", "#F7C75A", "#7E5AEF"], forest: ["#103D35", "#27765C", "#91D16C"], clean: ["#EEF6FF", "#F7F0FF", "#FFF4CE"],
  };
  return map[kind] || map.aurora;
}

function outfitColors(kind: string): [string, string, string] {
  const map: Record<string, [string, string, string]> = {
    academy: ["#1D6DDB", "#0E3C90", "#FFD54A"], space: ["#253A78", "#101C44", "#65E9FF"], science: ["#F7FBFF", "#BADDF4", "#3EBDA6"],
    arcade: ["#7E50EC", "#20C9E4", "#FFD84D"], pirate: ["#A74D42", "#3B233F", "#F2C64C"], street: ["#1769FF", "#5B43D6", "#FF6EA8"],
    royal: ["#6B42CD", "#2C1C6D", "#FFD84D"], hero: ["#E34C5F", "#7A2033", "#65E9FF"],
  };
  return map[kind] || map.academy;
}

function auraSvg(kind: string) {
  if (kind === "stars") return `<g opacity=".95"><path d="M72 116l6 15 16 2-12 10 4 16-14-9-14 9 4-16-12-10 16-2Z" fill="#FFD84D"/><path d="M432 145l4 10 11 1-8 7 2 11-9-6-9 6 2-11-8-7 11-1Z" fill="#6CE6FF"/><circle cx="421" cy="321" r="7" fill="#FF77B5"/><circle cx="93" cy="352" r="6" fill="#8F7BFF"/></g>`;
  if (kind === "confetti") return `<g opacity=".95" stroke-linecap="round" stroke-width="10"><path d="M76 100l19 8" stroke="#FFD84D"/><path d="M420 101l-16 14" stroke="#FF5F91"/><path d="M86 362l14-16" stroke="#57E0D0"/><path d="M426 356l-20-7" stroke="#8E6CFF"/><path d="M55 248l20-2" stroke="#FF885C"/></g>`;
  if (kind === "hearts") return `<g fill="#FF6D9E" opacity=".9"><path d="M74 122c-13-15-33 5 0 29 33-24 13-44 0-29Z"/><path d="M432 300c-10-12-26 4 0 23 26-19 10-35 0-23Z"/><path d="M391 99c-7-8-18 3 0 16 18-13 7-24 0-16Z"/></g>`;
  if (kind === "cosmic") return `<g fill="none" stroke="#8B7CFF" stroke-width="5" opacity=".55"><ellipse cx="256" cy="253" rx="210" ry="146" transform="rotate(-18 256 253)"/><ellipse cx="256" cy="253" rx="170" ry="218" transform="rotate(32 256 253)"/></g>`;
  if (kind === "neon") return `<circle cx="256" cy="253" r="203" fill="none" stroke="#4DF4E2" stroke-width="12" opacity=".4"/><circle cx="256" cy="253" r="218" fill="none" stroke="#A45CFF" stroke-width="8" opacity=".32"/>`;
  return "";
}

function earsSvg(species: Species) {
  const { kind, body, shade, cream } = species;
  if (["fox", "cat", "raccoon", "wolf", "lion"].includes(kind)) return `<path d="M151 180 117 79l90 72Z" fill="${body}" stroke="#132A50" stroke-width="10" stroke-linejoin="round"/><path d="m361 180 34-101-90 72Z" fill="${body}" stroke="#132A50" stroke-width="10" stroke-linejoin="round"/><path d="m150 151-18-51 47 40Z" fill="${cream}" opacity=".8"/><path d="m362 151 18-51-47 40Z" fill="${cream}" opacity=".8"/>`;
  if (kind === "bunny") return `<ellipse cx="187" cy="108" rx="38" ry="91" fill="${body}" stroke="#132A50" stroke-width="10" transform="rotate(-8 187 108)"/><ellipse cx="325" cy="108" rx="38" ry="91" fill="${body}" stroke="#132A50" stroke-width="10" transform="rotate(8 325 108)"/><ellipse cx="187" cy="107" rx="16" ry="62" fill="#F4BCD2"/><ellipse cx="325" cy="107" rx="16" ry="62" fill="#F4BCD2"/>`;
  if (["bear", "panda", "otter", "yeti", "capybara"].includes(kind)) return `<circle cx="153" cy="161" r="52" fill="${body}" stroke="#132A50" stroke-width="10"/><circle cx="359" cy="161" r="52" fill="${body}" stroke="#132A50" stroke-width="10"/><circle cx="153" cy="161" r="27" fill="${cream}" opacity=".75"/><circle cx="359" cy="161" r="27" fill="${cream}" opacity=".75"/>`;
  if (kind === "dragon") return `<path d="m170 163-53-79 9 92M342 163l53-79-9 92" fill="${shade}" stroke="#245C45" stroke-width="10" stroke-linejoin="round"/><path d="M207 140 227 73l29 59 29-59 20 67" fill="${cream}" stroke="${shade}" stroke-width="8" stroke-linejoin="round"/>`;
  if (kind === "deer") return `<path d="M171 150c-33-35-52-68-36-105m13 43-34-19m49 2 22-29M341 150c33-35 52-68 36-105m-13 43 34-19m-49 2-22-29" fill="none" stroke="${shade}" stroke-width="14" stroke-linecap="round"/><path d="M160 178 130 102l75 53ZM352 178l30-76-75 53Z" fill="${body}" stroke="#132A50" stroke-width="10"/>`;
  if (kind === "unicorn") return `<path d="m256 145-25-94 25-28 25 28Z" fill="#FFD84D" stroke="#7350C9" stroke-width="9"/><path d="M169 177 134 92l78 61ZM343 177l35-85-78 61Z" fill="${body}" stroke="#132A50" stroke-width="10"/>`;
  if (kind === "axolotl") return `<path d="M156 195 79 122l30 87-62 26 91 25M356 195l77-73-30 87 62 26-91 25" fill="${shade}" stroke="#873D73" stroke-width="10" stroke-linejoin="round"/>`;
  if (kind === "frog") return `<circle cx="177" cy="149" r="58" fill="${body}" stroke="#132A50" stroke-width="10"/><circle cx="335" cy="149" r="58" fill="${body}" stroke="#132A50" stroke-width="10"/>`;
  if (kind === "robot") return `<path d="M256 150V86" stroke="#244B7B" stroke-width="14" stroke-linecap="round"/><circle cx="256" cy="66" r="24" fill="#FFD84D" stroke="#244B7B" stroke-width="10"/>`;
  if (kind === "chicken") return `<path d="M231 147c-6-26 10-52 27-63 15 15 26 34 19 58 20-14 39-8 46 1-13 24-42 33-68 24Z" fill="#F45F66" stroke="#9D3440" stroke-width="9"/><path d="M162 184 137 119l63 47ZM350 184l25-65-63 47Z" fill="${body}" stroke="#132A50" stroke-width="9"/>`;
  if (kind === "alien") return `<path d="M151 174 123 113l70 45ZM361 174l28-61-70 45Z" fill="${body}" stroke="#132A50" stroke-width="10"/>`;
  return "";
}

function headSvg(species: Species, uid: string) {
  const { kind, body, shade, cream } = species;
  if (kind === "robot") return `<rect x="126" y="150" width="260" height="242" rx="88" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/>`;
  if (kind === "penguin") return `<ellipse cx="256" cy="268" rx="154" ry="158" fill="${shade}" stroke="#132A50" stroke-width="10"/><ellipse cx="256" cy="280" rx="122" ry="129" fill="${cream}"/>`;
  if (kind === "skull") return `<path d="M127 255c0-101 56-156 129-156s129 55 129 156c0 75-34 111-70 123l-7 74h-39l-13-37-13 37h-39l-7-74c-36-12-70-48-70-123Z" fill="${body}" stroke="#132A50" stroke-width="11"/>`;
  if (kind === "planet") return `<circle cx="256" cy="264" r="154" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/><path d="M109 271c-31 6-49 18-47 33 3 24 82 31 190 15 109-16 193-49 190-74-2-14-24-21-59-20" fill="none" stroke="#FFD458" stroke-width="22" stroke-linecap="round"/>`;
  if (kind === "alien") return `<path d="M256 108c88 0 141 67 128 161-12 93-74 139-128 139s-116-46-128-139c-13-94 40-161 128-161Z" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/>`;
  if (kind === "yeti") return `<path d="M105 264c0-112 61-169 151-169s151 57 151 169v40c0 80-64 116-151 116s-151-36-151-116Z" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/>`;
  if (kind === "capybara") return `<path d="M104 253c0-94 58-149 152-149s152 55 152 149v58c0 70-64 107-152 107s-152-37-152-107Z" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/>`;
  return `<ellipse cx="256" cy="268" rx="154" ry="154" fill="url(#${uid}-fur)" stroke="#132A50" stroke-width="11"/>`;
}

function speciesFace(species: Species) {
  const { kind, shade, cream } = species;
  if (["bear", "otter", "lion"].includes(kind)) return `<ellipse cx="256" cy="322" rx="82" ry="60" fill="${cream}" opacity=".95"/>`;
  if (kind === "panda") return `<ellipse cx="197" cy="259" rx="52" ry="70" fill="${shade}" transform="rotate(18 197 259)"/><ellipse cx="315" cy="259" rx="52" ry="70" fill="${shade}" transform="rotate(-18 315 259)"/><ellipse cx="256" cy="326" rx="76" ry="54" fill="#fff"/>`;
  if (kind === "raccoon") return `<path d="M132 243c31-36 75-48 124-21-33 39-78 59-124 21ZM380 243c-31-36-75-48-124-21 33 39 78 59 124 21Z" fill="${shade}" opacity=".98"/><ellipse cx="256" cy="326" rx="76" ry="53" fill="${cream}"/>`;
  if (["fox", "wolf", "cat"].includes(kind)) return `<path d="m256 389-98-93h196Z" fill="${cream}" opacity=".92"/>`;
  if (kind === "monkey") return `<ellipse cx="256" cy="308" rx="104" ry="91" fill="${cream}"/><circle cx="105" cy="266" r="52" fill="${shade}"/><circle cx="407" cy="266" r="52" fill="${shade}"/>`;
  if (kind === "owl") return `<circle cx="202" cy="263" r="72" fill="${cream}"/><circle cx="310" cy="263" r="72" fill="${cream}"/>`;
  if (kind === "frog") return `<ellipse cx="256" cy="329" rx="95" ry="52" fill="${cream}" opacity=".5"/>`;
  if (kind === "robot") return `<rect x="165" y="207" width="182" height="126" rx="48" fill="#102852"/>`;
  if (kind === "deer") return `<ellipse cx="256" cy="330" rx="78" ry="56" fill="${cream}"/>`;
  if (kind === "chicken") return `<ellipse cx="256" cy="322" rx="82" ry="58" fill="#FFF7E8"/><path d="m256 292-25 21 25 17 25-17Z" fill="#F2A13E"/>`;
  if (kind === "unicorn") return `<ellipse cx="256" cy="326" rx="76" ry="52" fill="${cream}"/>`;
  if (kind === "planet") return `<path d="M161 194c24 10 38 25 44 47 16-8 33-9 51-1 13-21 35-33 65-35-1 41-23 72-65 91-62-7-94-41-95-102Z" fill="${cream}" opacity=".72"/>`;
  return "";
}

function eyesSvg(expression: string, style: string, iris: string, kind: Species["kind"]) {
  const y = kind === "frog" ? 182 : kind === "owl" ? 265 : kind === "robot" ? 263 : 270;
  const left = kind === "frog" ? 177 : 206;
  const right = kind === "frog" ? 335 : 306;
  if (expression === "happy" || expression === "victory") return `<path d="M${left-27} ${y}q27-31 54 0M${right-27} ${y}q27-31 54 0" fill="none" stroke="${kind === "robot" ? "#66E9FF" : "#15213D"}" stroke-width="13" stroke-linecap="round"/>`;
  if (expression === "sleepy") return `<path d="M${left-28} ${y}q28 13 56 0M${right-28} ${y}q28 13 56 0" fill="none" stroke="#15213D" stroke-width="11" stroke-linecap="round"/>`;
  if (expression === "confident" || expression === "mischief") return `<path d="M${left-28} ${y-14}l56 10M${right-28} ${y-4}l56-10" stroke="#15213D" stroke-width="12" stroke-linecap="round"/>`;
  if (style === "star") return `<path d="m${left} ${y-30} 9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3Zm100 0 9 19 21 3-15 15 4 21-19-10-19 10 4-21-15-15 21-3Z" fill="#FFD84D" stroke="#15213D" stroke-width="7" stroke-linejoin="round"/>`;
  if (style === "pixel") return `<rect x="${left-28}" y="${y-28}" width="56" height="56" rx="7" fill="#fff" stroke="#15213D" stroke-width="8"/><rect x="${left-8}" y="${y-5}" width="16" height="21" fill="${iris}"/><rect x="${right-28}" y="${y-28}" width="56" height="56" rx="7" fill="#fff" stroke="#15213D" stroke-width="8"/><rect x="${right-8}" y="${y-5}" width="16" height="21" fill="${iris}"/>`;
  const rx = style === "bold" ? 34 : style === "soft" ? 29 : 31;
  const ry = rx + 4;
  return [left,right].map((cx) => `<g><ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="#fff" stroke="#15213D" stroke-width="5"/><circle cx="${cx}" cy="${y+4}" r="20" fill="${iris}"/><circle cx="${cx}" cy="${y+5}" r="12" fill="#13213D"/><circle cx="${cx-8}" cy="${y-8}" r="8" fill="#fff"/><circle cx="${cx+7}" cy="${y+9}" r="4" fill="#fff" opacity=".75"/></g>`).join("");
}

function markingSvg(marking: string) {
  if (marking === "blush") return `<ellipse cx="163" cy="325" rx="32" ry="14" fill="#FF7D9D" opacity=".32"/><ellipse cx="349" cy="325" rx="32" ry="14" fill="#FF7D9D" opacity=".32"/>`;
  if (marking === "freckles") return `<g fill="#8D5C52" opacity=".48"><circle cx="171" cy="320" r="5"/><circle cx="185" cy="329" r="4"/><circle cx="341" cy="320" r="5"/><circle cx="327" cy="329" r="4"/></g>`;
  if (marking === "star") return `<path d="m151 314 7 15 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2Z" fill="#FFD84D"/>`;
  if (marking === "stripe") return `<path d="M154 201c24-22 48-31 70-28M358 201c-24-22-48-31-70-28" fill="none" stroke="#132A50" stroke-width="12" stroke-linecap="round" opacity=".2"/>`;
  if (marking === "moon") return `<path d="M154 315c-18 1-29 20-20 36 8 15 29 18 41 5-23 5-35-23-21-41Z" fill="#FFD84D"/>`;
  return "";
}

function mouthSvg(expression: string, kind: Species["kind"], shade: string) {
  if (kind === "owl") return `<path d="m256 304-24 29h48Z" fill="#F2A23A"/><path d="M225 354q31 23 62 0" fill="none" stroke="#15213D" stroke-width="10" stroke-linecap="round"/>`;
  if (kind === "frog") return `<circle cx="232" cy="322" r="6" fill="#356E42"/><circle cx="280" cy="322" r="6" fill="#356E42"/><path d="M198 357q58 46 116 0" fill="#FF7896" stroke="#17373A" stroke-width="8" stroke-linecap="round"/>`;
  if (kind === "robot") return expression === "surprised" ? `<circle cx="256" cy="321" r="19" fill="#65E9FF"/>` : `<path d="M213 321h86" stroke="#65E9FF" stroke-width="13" stroke-linecap="round"/>`;
  if (kind === "skull") return `<path d="M201 352h110M220 352v31M246 352v31M272 352v31M298 352v31" stroke="#273044" stroke-width="9" stroke-linecap="round"/>`;
  const nose = kind === "penguin" || kind === "chicken" ? "" : `<ellipse cx="256" cy="323" rx="20" ry="15" fill="${shade}"/>`;
  if (expression === "surprised") return `${nose}<ellipse cx="256" cy="365" rx="21" ry="28" fill="#762B43"/>`;
  if (expression === "curious" || expression === "focused") return `${nose}<path d="M227 365q29 15 58 0" fill="none" stroke="#762B43" stroke-width="10" stroke-linecap="round"/>`;
  if (expression === "mischief") return `${nose}<path d="M220 355q36 38 72 5c-20 6-45 2-72-5Z" fill="#762B43" stroke="#571F35" stroke-width="5"/>`;
  return `${nose}<path d="M215 355q41 47 82 0c-17 16-65 16-82 0Z" fill="#762B43" stroke="#571F35" stroke-width="5"/><path d="M238 372q18 10 36 0" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
}

function outfitSvg(kind: string, uid: string) {
  const [a,b,c] = outfitColors(kind);
  return `<g><path d="M135 395c18-64 60-95 121-95s103 31 121 95l22 103H113Z" fill="url(#${uid}-outfit)" stroke="#132A50" stroke-width="10"/><path d="M173 382c23 21 50 31 83 31s60-10 83-31" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width="12" stroke-linecap="round"/>${kind === "science" ? `<path d="M205 337h102l18 159H187Z" fill="#fff" opacity=".82"/><circle cx="297" cy="400" r="17" fill="#56CDB6"/><path d="M288 400h18M297 391v18" stroke="#fff" stroke-width="6" stroke-linecap="round"/>` : ""}${kind === "space" ? `<circle cx="256" cy="392" r="25" fill="${c}"/><path d="M244 392h24M256 380v24" stroke="#17345D" stroke-width="7" stroke-linecap="round"/>` : ""}${kind === "arcade" ? `<path d="M196 350h120" stroke="${c}" stroke-width="12"/><circle cx="215" cy="389" r="10" fill="#FF6FA8"/><circle cx="297" cy="389" r="10" fill="#67E8FF"/>` : ""}${kind === "pirate" ? `<path d="M196 349h120" stroke="${c}" stroke-width="12"/><path d="m228 390 28 22 28-22" fill="none" stroke="#F8E4B0" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>` : ""}${kind === "royal" ? `<path d="M201 348h110" stroke="#FFD84D" stroke-width="12"/><path d="M256 358v60" stroke="#fff" stroke-opacity=".36" stroke-width="8"/>` : ""}${kind === "hero" ? `<path d="m213 349 43 30 43-30" fill="none" stroke="#65E9FF" stroke-width="12" stroke-linejoin="round"/>` : ""}</g>`;
}

function headwearSvg(kind: string) {
  if (kind === "crown") return `<path d="M176 161 191 100l65 39 65-39 15 61Z" fill="#FFD84D" stroke="#132A50" stroke-width="10" stroke-linejoin="round"/><circle cx="191" cy="100" r="9" fill="#5EE7FF"/><circle cx="256" cy="139" r="9" fill="#A46DFF"/><circle cx="321" cy="100" r="9" fill="#FF6FA8"/>`;
  if (kind === "headset") return `<path d="M167 218c0-78 37-113 89-113s89 35 89 113" fill="none" stroke="#192E61" stroke-width="18" stroke-linecap="round"/><rect x="141" y="204" width="42" height="82" rx="20" fill="#43DBFF" stroke="#132A50" stroke-width="9"/><rect x="329" y="204" width="42" height="82" rx="20" fill="#9A62FF" stroke="#132A50" stroke-width="9"/>`;
  if (kind === "flower-crown") return `<g stroke="#132A50" stroke-width="5"><circle cx="197" cy="143" r="21" fill="#FF7FA9"/><circle cx="231" cy="126" r="20" fill="#FFD84D"/><circle cx="267" cy="130" r="22" fill="#A86DFF"/><circle cx="304" cy="144" r="21" fill="#FF9C73"/><path d="M183 156c47-26 93-25 145 0" fill="none" stroke="#39A878" stroke-width="10"/></g>`;
  if (kind === "scholar-cap") return `<path d="m168 154 88-43 88 43-88 43Z" fill="#17386C" stroke="#132A50" stroke-width="9"/><path d="M211 177v35c31 18 60 18 90 0v-35" fill="#224D90" stroke="#132A50" stroke-width="8"/><path d="M344 154v67" stroke="#FFD84D" stroke-width="7" stroke-linecap="round"/><circle cx="344" cy="226" r="10" fill="#FFD84D"/>`;
  if (kind === "pirate-hat") return `<path d="M145 171c45-14 59-60 111-60s67 46 111 60c-19 26-57 41-111 41s-92-15-111-41Z" fill="#12284F" stroke="#132A50" stroke-width="10"/><path d="M165 172h182" stroke="#F7C74C" stroke-width="13" stroke-linecap="round"/>`;
  if (kind === "space-helmet") return `<path d="M137 243c0-101 52-151 119-151s119 50 119 151" fill="none" stroke="#E7F5FF" stroke-width="31" opacity=".9"/><path d="M151 207c31-52 178-52 210 0" fill="none" stroke="#5DE5FF" stroke-width="11" opacity=".65"/>`;
  if (kind === "wizard-hat") return `<path d="m200 167 67-143 55 150Z" fill="#6747C8" stroke="#27175E" stroke-width="9"/><path d="M145 176c49-18 173-21 222 0-30 31-193 35-222 0Z" fill="#3A287D" stroke="#27175E" stroke-width="9"/><path d="m264 80 9 18 20 3-15 14 4 20-18-10-18 10 4-20-15-14 20-3Z" fill="#FFE66B"/>`;
  return "";
}

function faceGearSvg(kind: string) {
  if (kind === "eyepatch") return `<path d="M151 243 355 305" stroke="#111A30" stroke-width="10" stroke-linecap="round"/><path d="M291 249c32-8 60 8 72 34-11 29-37 46-65 42-28-7-42-31-35-52 5-11 14-20 28-24Z" fill="#111A30" stroke="#050913" stroke-width="7"/><path d="m310 267 8 16 18 3-13 13 3 18-16-9-16 9 3-18-13-13 18-3Z" fill="#FFD84D"/>`;
  if (kind === "round-glasses") return `<g fill="none" stroke="#132A50" stroke-width="10"><circle cx="206" cy="271" r="48"/><circle cx="306" cy="271" r="48"/><path d="M254 271h4M158 270h-24M354 270h24"/></g>`;
  if (kind === "star-glasses") return `<g fill="#FFD84D" stroke="#132A50" stroke-width="7"><path d="m205 229 12 25 28 4-20 20 5 28-25-13-25 13 5-28-20-20 28-4Z"/><path d="m307 229 12 25 28 4-20 20 5 28-25-13-25 13 5-28-20-20 28-4Z"/></g><path d="M244 269h24" stroke="#132A50" stroke-width="9"/>`;
  if (kind === "neon-visor") return `<defs><linearGradient id="lua-visor" x1="0" x2="1"><stop stop-color="#47E7FF"/><stop offset="1" stop-color="#AF62FF"/></linearGradient></defs><path d="M162 241c59-24 129-24 188 0l-13 65c-53 20-109 20-162 0Z" fill="url(#lua-visor)" fill-opacity=".7" stroke="#132A50" stroke-width="9"/><path d="M188 259h123" stroke="#fff" stroke-width="7" stroke-linecap="round" opacity=".75"/>`;
  if (kind === "moustache") return `<path d="M256 340c-31-32-76-13-81 19 32 9 61 3 81-17 20 20 49 26 81 17-5-32-50-51-81-19Z" fill="#3B2B2B" stroke="#132A50" stroke-width="7"/>`;
  return "";
}

function companionSvg(kind: string) {
  if (kind === "mini-moon") return `<g transform="translate(392 349)"><circle r="45" fill="#FFD84D" stroke="#132A50" stroke-width="8"/><circle cx="-14" cy="-10" r="7" fill="#E7B72D"/><circle cx="12" cy="13" r="9" fill="#E7B72D"/><path d="M-15 5q15 14 30 0" fill="none" stroke="#132A50" stroke-width="6" stroke-linecap="round"/></g>`;
  if (kind === "book-sprite") return `<g transform="translate(392 356)"><path d="M-44-34c24-7 39-1 44 13 5-14 20-20 44-13v68c-20-5-35 1-44 15-9-14-24-20-44-15Z" fill="#4F8FF7" stroke="#132A50" stroke-width="8"/><circle cx="-15" cy="0" r="5" fill="#fff"/><circle cx="15" cy="0" r="5" fill="#fff"/></g>`;
  if (kind === "robot-pet") return `<g transform="translate(397 357)"><rect x="-42" y="-39" width="84" height="78" rx="26" fill="#66E8FF" stroke="#132A50" stroke-width="8"/><circle cx="-16" cy="-5" r="8" fill="#132A50"/><circle cx="16" cy="-5" r="8" fill="#132A50"/><path d="M-12 18h24" stroke="#132A50" stroke-width="7" stroke-linecap="round"/><path d="M0-39V-58" stroke="#132A50" stroke-width="7"/><circle cy="-65" r="9" fill="#FFD84D" stroke="#132A50" stroke-width="5"/></g>`;
  if (kind === "planet-buddy") return `<g transform="translate(394 357)"><circle r="39" fill="#6A79E7" stroke="#132A50" stroke-width="8"/><ellipse rx="59" ry="15" fill="none" stroke="#FFD84D" stroke-width="9" transform="rotate(-14)"/><circle cx="-12" cy="-4" r="5" fill="#fff"/><circle cx="12" cy="-4" r="5" fill="#fff"/></g>`;
  if (kind === "star-buddy") return `<g transform="translate(394 357)"><path d="m0-49 14 30 33 5-24 23 6 33L0 26l-29 16 6-33-24-23 33-5Z" fill="#FFD84D" stroke="#132A50" stroke-width="8"/><circle cx="-10" cy="0" r="4" fill="#132A50"/><circle cx="10" cy="0" r="4" fill="#132A50"/></g>`;
  return "";
}

function frameSvg(kind: string) {
  if (kind === "classic") return `<rect x="17" y="17" width="478" height="478" rx="106" fill="none" stroke="#163B76" stroke-width="18"/>`;
  if (kind === "royal") return `<rect x="16" y="16" width="480" height="480" rx="108" fill="none" stroke="#FFD84D" stroke-width="19"/><rect x="34" y="34" width="444" height="444" rx="91" fill="none" stroke="#6C45CC" stroke-width="7"/>`;
  if (kind === "arcade") return `<rect x="17" y="17" width="478" height="478" rx="78" fill="none" stroke="#65E9FF" stroke-width="15"/><path d="M31 84V31h53M428 31h53v53M31 428v53h53M428 481h53v-53" fill="none" stroke="#FF68B1" stroke-width="12"/>`;
  if (kind === "frost") return `<rect x="17" y="17" width="478" height="478" rx="106" fill="none" stroke="#BFEAFF" stroke-width="18"/><path d="M53 85l22 22M53 107l22-22M437 85l22 22M437 107l22-22" stroke="#fff" stroke-width="8" stroke-linecap="round"/>`;
  if (kind === "cosmic") return `<rect x="17" y="17" width="478" height="478" rx="106" fill="none" stroke="#8A6DFF" stroke-width="18"/><circle cx="75" cy="74" r="10" fill="#FFD84D"/><circle cx="435" cy="81" r="8" fill="#65E9FF"/><circle cx="452" cy="421" r="9" fill="#FF6FA8"/>`;
  return "";
}

export function renderLuaAvatarSvg(seed: string, raw: LuaAvatarConfig = {}) {
  const cfg = normalizeLuaAvatar(seed, raw);
  const species = LUA_AVATAR_CATALOG.species.find((item) => item.id === cfg.species)!;
  const uid = `lua-${hash(`${seed}:${JSON.stringify(cfg)}`).toString(36)}`;
  const [bg1,bg2,bg3] = bgStops(cfg.background);
  const [out1,out2] = outfitColors(cfg.outfit);
  const title = `${species.label} — ${LUA_AVATAR_CATALOG.expressions.find(x => x.id === cfg.expression)?.label || cfg.expression}`;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="${esc(title)}">\n<defs>\n  <linearGradient id="${uid}-bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${bg1}"/><stop offset=".53" stop-color="${bg2}"/><stop offset="1" stop-color="${bg3}"/></linearGradient>\n  <linearGradient id="${uid}-fur" x1=".16" y1=".04" x2=".82" y2="1"><stop stop-color="#ffffff" stop-opacity=".28"/><stop offset=".18" stop-color="${species.body}"/><stop offset="1" stop-color="${species.shade}"/></linearGradient>\n  <linearGradient id="${uid}-outfit" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${out1}"/><stop offset="1" stop-color="${out2}"/></linearGradient>\n  <radialGradient id="${uid}-shine" cx=".31" cy=".14" r=".88"><stop stop-color="#fff" stop-opacity=".75"/><stop offset=".42" stop-color="#fff" stop-opacity="0"/></radialGradient>\n</defs>\n<rect width="512" height="512" rx="108" fill="url(#${uid}-bg)"/>\n<circle cx="94" cy="94" r="62" fill="#fff" opacity=".08"/><circle cx="424" cy="116" r="84" fill="#fff" opacity=".06"/>\n${auraSvg(cfg.aura)}\n<g>\n  ${outfitSvg(cfg.outfit, uid)}\n  ${earsSvg(species)}\n  ${headSvg(species, uid)}\n  <ellipse cx="216" cy="169" rx="92" ry="52" fill="url(#${uid}-shine)" opacity=".35" transform="rotate(-18 216 169)"/>\n  ${speciesFace(species)}\n  ${eyesSvg(cfg.expression, cfg.eyes, species.iris, species.kind)}\n  ${markingSvg(cfg.marking)}\n  ${mouthSvg(cfg.expression, species.kind, species.shade)}\n  ${headwearSvg(cfg.head)}\n  ${faceGearSvg(cfg.face)}\n</g>\n${companionSvg(cfg.companion)}\n${frameSvg(cfg.frame)}\n</svg>`;
}
