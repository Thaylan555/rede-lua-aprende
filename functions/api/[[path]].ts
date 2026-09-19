import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import type { Env } from "../lib/types";
import { LUA_AVATAR_CATALOG, normalizeLuaAvatar, randomLuaAvatar, renderLuaAvatarSvg } from "../lib/luaAvatar";

const app = new Hono<{ Bindings: Env }>().basePath("/api");

app.use("*", async (c, next) => {
  c.header("X-Content-Type-Options", "nosniff");
  c.header("X-Frame-Options", "DENY");
  c.header("Referrer-Policy", "strict-origin-when-cross-origin");
  c.header("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  c.header("Cross-Origin-Resource-Policy", "same-origin");
  await next();
});

app.onError((error, c) => {
  console.error("rede_lua_api_error", error);
  if (error instanceof z.ZodError) return c.json({ error: "VALIDATION_ERROR", message: "Confira os campos enviados." }, 400);
  return c.json({ error: "INTERNAL_ERROR", message: "Não foi possível concluir esta ação agora." }, 500);
});

app.get("/health", (c) => c.json({
  ok: true,
  service: "rede-lua-pages-api",
  data: "supabase",
  intelligence: {
    engine: "luacore",
    search: "postgres-fts+trigram",
    recommendations: "mastery+affinity",
    analytics: "first-party-supabase",
    avatar: "lua-avatar.v2",
  },
  time: new Date().toISOString(),
}));

async function jsonFetch(url: string, init?: RequestInit, timeout = 8000) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(timeout) });
  if (!response.ok) throw new Error(`UPSTREAM_${response.status}`);
  return response.json();
}

app.get("/discover/books", async (c) => {
  const q = z.string().trim().min(2).max(90).parse(c.req.query("q") || "");
  try {
    const url = new URL("https://openlibrary.org/search.json");
    url.searchParams.set("q", q); url.searchParams.set("limit", "12"); url.searchParams.set("fields", "key,title,author_name,first_publish_year,cover_i");
    const payload = await jsonFetch(url.toString());
    c.header("Cache-Control", "public, max-age=900");
    return c.json({ books: (payload.docs || []).map((book: any) => ({ key: book.key, title: book.title, authors: book.author_name || [], year: book.first_publish_year || null, coverUrl: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null })) });
  } catch { return c.json({ error: "BOOK_SOURCE_UNAVAILABLE", message: "A biblioteca está indisponível agora." }, 502); }
});

app.get("/discover/wiki", async (c) => {
  const q = z.string().trim().min(2).max(90).parse(c.req.query("q") || "");
  try {
    const searchUrl = new URL("https://pt.wikipedia.org/w/api.php");
    searchUrl.searchParams.set("action", "query"); searchUrl.searchParams.set("list", "search"); searchUrl.searchParams.set("srsearch", q); searchUrl.searchParams.set("srlimit", "6"); searchUrl.searchParams.set("format", "json"); searchUrl.searchParams.set("origin", "*");
    const searchData = await jsonFetch(searchUrl.toString());
    const titles = (searchData.query?.search || []).map((item: any) => item.title);
    if (!titles.length) return c.json({ results: [] });
    const url = new URL("https://pt.wikipedia.org/w/api.php");
    url.searchParams.set("action", "query"); url.searchParams.set("titles", titles.join("|")); url.searchParams.set("prop", "extracts|pageimages|info");
    url.searchParams.set("exintro", "1"); url.searchParams.set("explaintext", "1"); url.searchParams.set("piprop", "thumbnail"); url.searchParams.set("pithumbsize", "320"); url.searchParams.set("inprop", "url"); url.searchParams.set("format", "json"); url.searchParams.set("origin", "*");
    const payload = await jsonFetch(url.toString());
    const pages = Object.values(payload.query?.pages || {}) as any[];
    c.header("Cache-Control", "public, max-age=900");
    return c.json({ results: pages.map((page) => ({ title: page.title, extract: String(page.extract || "").slice(0, 460), thumbnail: page.thumbnail?.source || null, url: page.fullurl || null })).slice(0, 6) });
  } catch { return c.json({ error: "WIKI_SOURCE_UNAVAILABLE", message: "A enciclopédia está indisponível agora." }, 502); }
});

app.get("/discover/ibge/states", async (c) => {
  try {
    const payload = await jsonFetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome");
    c.header("Cache-Control", "public, max-age=86400");
    return c.json({ states: payload.map((state: any) => ({ id: state.id, sigla: state.sigla, nome: state.nome, regiao: state.regiao?.nome || "" })) });
  } catch { return c.json({ error: "IBGE_SOURCE_UNAVAILABLE" }, 502); }
});

app.get("/discover/weather", async (c) => {
  const city = z.string().trim().min(2).max(80).parse(c.req.query("city") || "");
  try {
    const geocode = new URL("https://geocoding-api.open-meteo.com/v1/search");
    geocode.searchParams.set("name", city); geocode.searchParams.set("count", "1"); geocode.searchParams.set("language", "pt"); geocode.searchParams.set("format", "json");
    const geo = await jsonFetch(geocode.toString());
    const place = geo.results?.[0];
    if (!place) return c.json({ place: null, current: null, daily: [] });
    const forecast = new URL("https://api.open-meteo.com/v1/forecast");
    forecast.searchParams.set("latitude", String(place.latitude)); forecast.searchParams.set("longitude", String(place.longitude));
    forecast.searchParams.set("current", "temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code");
    forecast.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max"); forecast.searchParams.set("forecast_days", "4"); forecast.searchParams.set("timezone", "auto");
    const weather = await jsonFetch(forecast.toString());
    c.header("Cache-Control", "public, max-age=600");
    return c.json({
      place: { name: place.name, admin1: place.admin1 || "", country: place.country || "", latitude: place.latitude, longitude: place.longitude },
      current: weather.current || null,
      daily: (weather.daily?.time || []).map((date: string, i: number) => ({ date, max: weather.daily.temperature_2m_max?.[i], min: weather.daily.temperature_2m_min?.[i], rainChance: weather.daily.precipitation_probability_max?.[i] })),
    });
  } catch { return c.json({ error: "WEATHER_SOURCE_UNAVAILABLE", message: "Os dados meteorológicos estão indisponíveis agora." }, 502); }
});

const worldIndicators: Record<string, { code: string; label: string; unit: string }> = {
  population: { code: "SP.POP.TOTL", label: "População", unit: "pessoas" },
  lifeExpectancy: { code: "SP.DYN.LE00.IN", label: "Expectativa de vida", unit: "anos" },
  internet: { code: "IT.NET.USER.ZS", label: "Uso da internet", unit: "% da população" },
  gdpPerCapita: { code: "NY.GDP.PCAP.CD", label: "PIB per capita", unit: "US$" },
};

app.get("/discover/world", async (c) => {
  const country = z.string().trim().regex(/^[A-Za-z]{2,3}$/).transform((v) => v.toUpperCase()).parse(c.req.query("country") || "BRA");
  const metric = z.enum(["population", "lifeExpectancy", "internet", "gdpPerCapita"]).parse(c.req.query("metric") || "population");
  const indicator = worldIndicators[metric];
  try {
    const payload = await jsonFetch(`https://api.worldbank.org/v2/country/${encodeURIComponent(country)}/indicator/${indicator.code}?format=json&mrv=8&per_page=8`);
    const rows = Array.isArray(payload?.[1]) ? payload[1] : [];
    c.header("Cache-Control", "public, max-age=43200");
    return c.json({ country: rows[0]?.country?.value || country, metric: { key: metric, label: indicator.label, unit: indicator.unit }, points: rows.filter((row: any) => row.value !== null).map((row: any) => ({ year: row.date, value: row.value })).reverse() });
  } catch { return c.json({ error: "WORLD_DATA_UNAVAILABLE", message: "Os indicadores globais estão indisponíveis agora." }, 502); }
});


const approvedAvatarStyles = new Set([
  "lua-mates", "adventurer", "avataaars", "personas", "lorelei", "notionists", "bottts", "pixel-art",
  "big-smile", "fun-emoji", "croodles", "micah", "thumbs", "shapes", "rings", "glass",
]);


function requiredSupabase(c: any) {
  const url = c.env.SUPABASE_URL;
  const key = c.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_SERVER_ENV_MISSING");
  return { url: url.replace(/\/$/, ""), key };
}

async function supabaseRpc(c: any, name: string, body: unknown, authorization?: string) {
  const { url, key } = requiredSupabase(c);
  const response = await fetch(`${url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: authorization || `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body ?? {}),
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    const text = await response.text();
    console.error("supabase_rpc_error", name, response.status, text.slice(0, 500));
    return { ok: false as const, status: response.status, data: null };
  }
  return { ok: true as const, status: response.status, data: await response.json() };
}


function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer);
  const chunk = 0x8000;
  let binary = "";
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

const luaLabelMap = {
  species: {
    "moon-bear": "urso lunar",
    "nebula-fox": "raposa nebular",
    "cosmic-penguin": "pinguim cósmico",
    "lunar-capybara": "capivara lunar",
    "wise-owl": "coruja sábia",
    "pocket-dragon": "dragão de bolso",
    "orbit-robot": "robô órbita",
    "astro-cat": "gato astro",
    "prism-axolotl": "axolote prisma",
    "star-bunny": "coelho estelar",
    "comet-monkey": "macaco cometa",
    "cloud-yeti": "yeti nuvem",
    "panda-pop": "panda pop",
    "frog-orbit": "sapo órbita",
    "otter-wave": "lontra onda",
    "raccoon-moon": "guaxinim lunar",
    "sun-lion": "leão solar",
    "forest-deer": "cervo aurora",
    "midnight-wolf": "lobo eclipse",
    "rocket-chicken": "galinha foguete",
    "crystal-unicorn": "unicórnio cristal",
    "moon-skull": "caveira lunar",
    "planet-pal": "planeta vivo",
    "tiny-alien": "alienzinho lunar",
  } as Record<string, string>,
  expression: {
    happy: "feliz", curious: "curioso", confident: "confiante", surprised: "surpreso",
    sleepy: "com sono", focused: "focado", mischief: "travesso", victory: "vitorioso",
  } as Record<string, string>,
  eyes: { spark: "olhos brilhantes", round: "olhos redondos", soft: "olhos suaves", bold: "olhos marcantes", star: "olhos em estrela", pixel: "olhos pixel" } as Record<string, string>,
  marking: { none: "sem marca", blush: "bochechas coradas", freckles: "sardinhas", star: "marca de estrela", stripe: "faixa facial", moon: "marca de lua" } as Record<string, string>,
  outfit: { academy: "uniforme academia lunar", space: "roupa espacial", science: "roupa de laboratório", arcade: "roupa arcade", pirate: "roupa pirata", street: "roupa street", royal: "roupa real", hero: "roupa de herói" } as Record<string, string>,
  head: { none: "", crown: "coroa", headset: "headset gamer", "flower-crown": "coroa de flores", "scholar-cap": "capelo acadêmico", "pirate-hat": "chapéu pirata", "space-helmet": "capacete espacial", "wizard-hat": "chapéu de mago" } as Record<string, string>,
  face: { none: "", eyepatch: "tapa-olho", "round-glasses": "óculos redondos", "star-glasses": "óculos em estrela", "neon-visor": "visor neon", moustache: "bigode divertido" } as Record<string, string>,
  aura: { none: "", stars: "aura de estrelas", confetti: "aura de confete", hearts: "aura de corações", cosmic: "aura cósmica", neon: "aura neon" } as Record<string, string>,
  frame: { none: "", classic: "moldura clássica", royal: "moldura real", arcade: "moldura arcade", frost: "moldura gelo", cosmic: "moldura cósmica" } as Record<string, string>,
  companion: { none: "", "mini-moon": "mini lua flutuante", "book-sprite": "livro vivo", "robot-pet": "robô pet", "planet-buddy": "planetinha", "star-buddy": "estrelinha" } as Record<string, string>,
  background: { aurora: "fundo aurora", stars: "céu estrelado", arcade: "fundo arcade", sunset: "pôr do sol", forest: "floresta", clean: "fundo limpo" } as Record<string, string>,
};

function describeLuaValue(group: keyof typeof luaLabelMap, value: unknown) {
  if (typeof value !== "string" || !value) return "";
  return luaLabelMap[group][value] || value.replace(/[-_]/g, " ");
}

function buildAvatarAiPrompt(payload: {
  avatarStyle: string;
  avatarConfig?: Record<string, unknown>;
  displayName?: string;
  profileTitle?: string;
  bio?: string;
  lifeNumber?: number;
  legacyStars?: number;
}) {
  const config = payload.avatarConfig || {};
  const title = payload.profileTitle?.trim() || "Explorador Lunar";
  const style = payload.avatarStyle || "lua-mates";
  const species = describeLuaValue("species", config._luaSpecies) || "mascote lunar";

  const lookBits = style === "lua-mates"
    ? [
        species,
        describeLuaValue("expression", config._luaExpression),
        describeLuaValue("eyes", config._luaEyes),
        describeLuaValue("marking", config._luaMark),
        describeLuaValue("outfit", config._luaOutfit),
        describeLuaValue("head", config._luaHead),
        describeLuaValue("face", config._luaFace),
        describeLuaValue("aura", config._luaAura),
        describeLuaValue("companion", config._luaCompanion),
        describeLuaValue("background", config._luaBackdrop),
      ].filter(Boolean).join(", ")
    : `avatar em estilo ${style.replace(/[-_]/g, " ")}`;

  const prompt = style === "lua-mates"
    ? [
        `MASCOTE CARTOON NÃO-HUMANO. O personagem principal é especificamente um ${species}.`,
        "Preserve a espécie animal/criatura. NÃO transforme em pessoa humana, mulher, homem, criança, adolescente, humano anime, rosto humano ou pele humana.",
        `Visual obrigatório: ${lookBits}.`,
        "Crie uma versão premium do mesmo mascote para a Rede Lua na Educação, mantendo cabeça, focinho/bico/orelhas/chifres e silhueta coerentes com a espécie.",
        "Estilo 2D/2.5D cartoon de jogo educacional, formas arredondadas, olhos muito expressivos, acabamento limpo, luz suave, cores vivas, leitura forte em tamanho pequeno.",
        "Composição quadrada de avatar, personagem centralizado do peito para cima, fundo espacial divertido e simples. Sem texto, sem letras, sem logo inserido pelo desenho.",
        `Personalidade visual: ${title}.`,
      ].join(" ")
    : [
        "Crie um avatar cartoon original e estilizado para a Rede Lua na Educação.",
        `Base visual: ${lookBits}.`,
        "Não use aparência fotorealista. Prefira personagem de jogo educacional, formas limpas, olhos expressivos e cores vivas.",
        "Composição quadrada, personagem centralizado, sem texto e sem logo desenhado.",
      ].join(" ");

  return { prompt, summary: lookBits || style, species };
}

function buildLuaReferenceUrl(c: any, payload: { avatarStyle: string; avatarSeed?: string; avatarConfig?: Record<string, unknown> }) {
  const origin = new URL(c.req.url).origin;
  const seed = payload.avatarSeed || "rede-lua";
  if (payload.avatarStyle !== "lua-mates") {
    return `${origin}/api/luaid/avatar/${encodeURIComponent(payload.avatarStyle)}/${encodeURIComponent(seed)}.svg`;
  }
  const config = payload.avatarConfig || {};
  const params = new URLSearchParams();
  const map: Record<string, string> = {
    _luaSpecies: "species", _luaExpression: "expression", _luaEyes: "eyes", _luaMark: "marking", _luaOutfit: "outfit",
    _luaHead: "head", _luaFace: "face", _luaAura: "aura", _luaFrame: "frame", _luaCompanion: "companion", _luaBackdrop: "background",
  };
  for (const [key, query] of Object.entries(map)) {
    const value = config[key];
    if (typeof value === "string" && value) params.set(query, value);
  }
  return `${origin}/api/avatar/v2/render/${encodeURIComponent(seed)}.svg?${params.toString()}`;
}

app.get("/luaid/me", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) return c.json({ error: "AUTH_REQUIRED", message: "Entre para abrir seu LuaID." }, 401);
  const result = await supabaseRpc(c, "rede_lua_profile_manifest", {}, authorization);
  if (!result.ok) return c.json({ error: "PROFILE_UNAVAILABLE", message: "Não foi possível carregar o LuaID." }, result.status === 401 ? 401 : 502);
  c.header("Cache-Control", "private, no-store");
  return c.json(result.data);
});

app.get("/luaid/profile/:handle", async (c) => {
  const handle = z.string().trim().regex(/^[a-zA-Z0-9_]{3,24}$/).parse(c.req.param("handle"));
  const result = await supabaseRpc(c, "rede_lua_public_profile", { p_handle: handle });
  if (!result.ok || !result.data) return c.json({ error: "PROFILE_NOT_FOUND", message: "Esse perfil não está público." }, 404);
  c.header("Cache-Control", "public, max-age=120, s-maxage=300");
  return c.json(result.data);
});

app.get("/luaid/avatar/catalog", (c) => {
  c.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return c.json({ ...LUA_AVATAR_CATALOG, styles: Array.from(approvedAvatarStyles) });
});

app.get("/avatar/v2/catalog", (c) => {
  c.header("Cache-Control", "public, max-age=3600, s-maxage=86400");
  return c.json(LUA_AVATAR_CATALOG);
});

app.get("/avatar/v2/random", (c) => {
  const seed = z.string().trim().min(2).max(90).parse(c.req.query("seed") || crypto.randomUUID());
  const config = randomLuaAvatar(seed);
  const params = new URLSearchParams(config);
  return c.json({ version: LUA_AVATAR_CATALOG.version, seed, config, renderUrl: `/api/avatar/v2/render/${encodeURIComponent(seed)}.svg?${params.toString()}` });
});

app.get("/avatar/v2/render/:seed.svg", (c) => {
  const seed = z.string().trim().min(2).max(90).parse(c.req.param("seed"));
  const config = normalizeLuaAvatar(seed, {
    species: c.req.query("species"), expression: c.req.query("expression"), eyes: c.req.query("eyes"), marking: c.req.query("marking"),
    outfit: c.req.query("outfit"), head: c.req.query("head"), face: c.req.query("face"), aura: c.req.query("aura"),
    frame: c.req.query("frame"), companion: c.req.query("companion"), background: c.req.query("background"), palette: c.req.query("palette"),
  });
  c.header("Content-Type", "image/svg+xml; charset=utf-8");
  c.header("Cache-Control", "public, max-age=86400, s-maxage=604800, immutable");
  return c.body(renderLuaAvatarSvg(seed, config));
});

const luaAvatarComposeSchema = z.object({
  seed: z.string().trim().min(2).max(90).optional(),
  config: z.object({
    species: z.string().optional(), expression: z.string().optional(), eyes: z.string().optional(), marking: z.string().optional(),
    outfit: z.string().optional(), head: z.string().optional(), face: z.string().optional(), aura: z.string().optional(),
    frame: z.string().optional(), companion: z.string().optional(), background: z.string().optional(), palette: z.string().optional(),
  }).default({}),
});

app.post("/avatar/v2/compose", async (c) => {
  const payload = luaAvatarComposeSchema.parse(await c.req.json());
  const seed = payload.seed || crypto.randomUUID();
  const config = normalizeLuaAvatar(seed, payload.config);
  const params = new URLSearchParams(config);
  return c.json({
    version: LUA_AVATAR_CATALOG.version, seed, config,
    renderUrl: `/api/avatar/v2/render/${encodeURIComponent(seed)}.svg?${params.toString()}`,
  });
});

app.get("/luaid/avatar/:style/:seed.svg", async (c) => {
  const style = z.string().trim().regex(/^[a-z0-9-]{2,32}$/).parse(c.req.param("style"));
  const seed = z.string().trim().min(2).max(90).parse(c.req.param("seed"));
  if (!approvedAvatarStyles.has(style)) return c.json({ error: "STYLE_NOT_ALLOWED" }, 400);
  if (style === "lua-mates") {
    const config = normalizeLuaAvatar(seed, {
      species: c.req.query("species"), expression: c.req.query("expression"), eyes: c.req.query("eyes"), marking: c.req.query("marking"),
      outfit: c.req.query("outfit"), head: c.req.query("head"), face: c.req.query("face"), aura: c.req.query("aura"),
      frame: c.req.query("frame"), companion: c.req.query("companion"), background: c.req.query("background"), palette: c.req.query("palette"),
    });
    c.header("Content-Type", "image/svg+xml; charset=utf-8");
    c.header("Cache-Control", "public, max-age=86400, s-maxage=604800, immutable");
    return c.body(renderLuaAvatarSvg(seed, config));
  }
  const url = new URL(`https://api.dicebear.com/10.x/${style}/svg`);
  url.searchParams.set("seed", seed);
  url.searchParams.set("radius", "22");
  url.searchParams.set("backgroundType", "gradientLinear");
  const response = await fetch(url.toString(), { signal: AbortSignal.timeout(7000) });
  if (!response.ok) return c.json({ error: "AVATAR_SOURCE_UNAVAILABLE" }, 502);
  c.header("Content-Type", "image/svg+xml; charset=utf-8");
  c.header("Cache-Control", "public, max-age=86400, s-maxage=604800");
  return c.body(await response.text());
});


const avatarEnhanceSchema = z.object({
  avatarStyle: z.string().trim().min(2).max(40),
  avatarSeed: z.string().trim().min(2).max(120).optional(),
  avatarConfig: z.record(z.union([z.string(), z.number(), z.boolean(), z.array(z.string())])).default({}),
  displayName: z.string().trim().max(80).optional(),
  profileTitle: z.string().trim().max(80).optional(),
  bio: z.string().trim().max(240).optional(),
  lifeNumber: z.number().int().min(1).max(999).optional(),
  legacyStars: z.number().int().min(0).max(99999).optional(),
  savePreview: z.boolean().optional(),
});

app.post("/avatar/v2/enhance", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) return c.json({ error: "AUTH_REQUIRED", message: "Entre para gerar a versão IA do avatar." }, 401);

  const payload = avatarEnhanceSchema.parse(await c.req.json());
  const built = buildAvatarAiPrompt(payload);
  const seed = payload.avatarSeed || crypto.randomUUID();
  const referenceImageUrl = buildLuaReferenceUrl(c, payload);
  const hasProviderKey = Boolean(c.env.POLLINATIONS_TOKEN);

  // Com chave: usa o gateway atual e um modelo image-to-image para preservar o LuaMate.
  // Sem chave: mantém um fallback gratuito por texto, mas com prompt rígido e sem enhance automático.
  const model = hasProviderKey ? (c.env.POLLINATIONS_EDIT_MODEL || "kontext") : (c.env.POLLINATIONS_MODEL || "zimage");
  const base = hasProviderKey
    ? "https://gen.pollinations.ai/image"
    : (c.env.POLLINATIONS_BASE_URL || "https://image.pollinations.ai/prompt").replace(/\/$/, "");
  const params = new URLSearchParams({
    width: "768",
    height: "768",
    model,
    seed,
    safe: "true",
  });
  if (hasProviderKey) {
    params.set("image", referenceImageUrl);
    params.set("nologo", "true");
    params.set("private", "true");
  }

  const remoteUrl = `${base}/${encodeURIComponent(built.prompt)}?${params.toString()}`;
  const headers: Record<string, string> = { Accept: "image/png,image/jpeg,image/webp;q=0.9,*/*;q=0.8" };
  if (c.env.POLLINATIONS_TOKEN) headers.Authorization = `Bearer ${c.env.POLLINATIONS_TOKEN}`;

  const imageResponse = await fetch(remoteUrl, { headers, signal: AbortSignal.timeout(55000) });
  if (!imageResponse.ok) {
    const detail = await imageResponse.text().catch(() => "");
    console.error("avatar_ai_error", imageResponse.status, detail.slice(0, 300));
    return c.json({ error: "AVATAR_AI_UNAVAILABLE", message: "A IA de avatar não respondeu agora. Tenta de novo já já." }, 502);
  }

  const contentType = imageResponse.headers.get("content-type") || "image/png";
  const imageBase64 = arrayBufferToBase64(await imageResponse.arrayBuffer());
  const imageDataUrl = `data:${contentType};base64,${imageBase64}`;

  let stored: any = null;
  if (payload.savePreview !== false) {
    const saved = await supabaseRpc(c, "rede_lua_set_avatar_ai_preview", {
      p_prompt: built.prompt,
      p_image_url: "",
      p_seed: seed,
      p_provider: hasProviderKey ? "pollinations-reference" : "pollinations-free",
    }, authorization);
    if (saved.ok) stored = saved.data;
  }

  c.header("Cache-Control", "no-store");
  return c.json({
    ok: true,
    seed,
    prompt: built.prompt,
    summary: built.summary,
    provider: "pollinations",
    model,
    mode: hasProviderKey ? "reference" : "prompt",
    referenceImageUrl,
    remoteUrl,
    imageDataUrl,
    stored,
  });
});

app.get("/notifications/me", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) return c.json({ error: "AUTH_REQUIRED", message: "Entre para ver seus avisos." }, 401);
  const result = await supabaseRpc(c, "rede_lua_my_notifications", {}, authorization);
  if (!result.ok) return c.json({ error: "NOTIFICATIONS_UNAVAILABLE", message: "Não foi possível carregar os avisos." }, result.status === 401 ? 401 : 502);
  c.header("Cache-Control", "private, no-store");
  return c.json({ notifications: Array.isArray(result.data) ? result.data : [] });
});

app.post("/notifications/:id/ping", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) return c.json({ error: "AUTH_REQUIRED", message: "Entre para ver seus avisos." }, 401);
  const id = z.string().uuid().parse(c.req.param("id"));
  const result = await supabaseRpc(c, "rede_lua_notification_ping", { p_notification_id: id }, authorization);
  if (!result.ok) return c.json({ error: "NOTIFICATION_UNAVAILABLE", message: "Não foi possível atualizar esse aviso." }, result.status === 401 ? 401 : 502);
  c.header("Cache-Control", "private, no-store");
  return c.json(result.data);
});

app.post("/notifications/:id/ack", async (c) => {
  const authorization = c.req.header("Authorization");
  if (!authorization?.startsWith("Bearer ")) return c.json({ error: "AUTH_REQUIRED", message: "Entre para ver seus avisos." }, 401);
  const id = z.string().uuid().parse(c.req.param("id"));
  const result = await supabaseRpc(c, "rede_lua_notification_ack", { p_notification_id: id }, authorization);
  if (!result.ok) return c.json({ error: "NOTIFICATION_UNAVAILABLE", message: "Não foi possível concluir esse aviso." }, result.status === 401 ? 401 : 502);
  c.header("Cache-Control", "private, no-store");
  return c.json(result.data);
});

const contactSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().trim().email().max(180),
  topic: z.enum(["suporte", "contato", "escola", "professor", "privacidade"]),
  message: z.string().trim().min(10).max(3000),
});

app.post("/contact", async (c) => {
  const payload = contactSchema.parse(await c.req.json());
  const serviceKey = c.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseUrl = c.env.SUPABASE_URL?.replace(/\/$/, "");
  const authHeader = c.req.header("Authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ") && supabaseUrl && c.env.SUPABASE_PUBLISHABLE_KEY) {
    try {
      const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: { apikey: c.env.SUPABASE_PUBLISHABLE_KEY, Authorization: authHeader },
        signal: AbortSignal.timeout(5000),
      });
      if (userResponse.ok) userId = (await userResponse.json())?.id || null;
    } catch { /* contato continua funcionando sem sessão */ }
  }

  let stored = false;
  if (serviceKey && supabaseUrl) {
    const response = await fetch(`${supabaseUrl}/rest/v1/rede_lua_contact_messages`, {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ user_id: userId, name: payload.name, email: payload.email, topic: payload.topic, message: payload.message }),
      signal: AbortSignal.timeout(7000),
    });
    stored = response.ok;
  }

  let emailed = false;
  if (c.env.RESEND_API_KEY) {
    const to = c.env.CONTACT_TO_EMAIL || "support@redelua.xyz";
    const from = c.env.CONTACT_FROM_EMAIL || "Rede Lua <contato@redelua.xyz>";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${c.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: payload.email,
        subject: `[Rede Lua] ${payload.topic} — ${payload.name}`,
        text: `Nome: ${payload.name}\nE-mail: ${payload.email}\nAssunto: ${payload.topic}\n\n${payload.message}`,
      }),
      signal: AbortSignal.timeout(8000),
    });
    emailed = response.ok;
  }

  if (!stored && !emailed) return c.json({ error: "CONTACT_NOT_CONFIGURED", message: "O canal de contato ainda não foi configurado. Use support@redelua.xyz por enquanto." }, 503);
  return c.json({ ok: true, stored, emailed });
});

export const onRequest = handle(app);
