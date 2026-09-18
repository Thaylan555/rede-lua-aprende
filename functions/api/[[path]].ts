import { Hono } from "hono";
import { handle } from "hono/cloudflare-pages";
import { z } from "zod";
import type { Env } from "../lib/types";

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


const luaMateCatalog = {
  species: ["moon-bear","nebula-fox","cosmic-penguin","lunar-capybara","wise-owl","pocket-dragon","orbit-robot","astro-cat","prism-axolotl","star-bunny","comet-monkey","cloud-yeti"],
  expressions: ["happy","curious","confident","surprised"],
  outfits: ["academy","space","science","arcade","pirate"],
  companions: ["none","mini-moon","book-sprite","mini-rocket","star-buddy","robot-pet","frog-orbit","planet-buddy","pencil-sprite"],
};

function tinyHash(value: string) {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) h = Math.imul(h ^ value.charCodeAt(i), 16777619);
  return Math.abs(h >>> 0);
}

function escapeSvgText(value: string) {
  return value.replace(/[&<>"']/g, (char) => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&apos;" }[char] || char));
}

function luaMateSvg(seed: string, speciesInput?: string, expressionInput?: string, outfitInput?: string) {
  const h = tinyHash(seed);
  const species = luaMateCatalog.species.includes(speciesInput || "") ? speciesInput! : luaMateCatalog.species[h % luaMateCatalog.species.length];
  const expression = luaMateCatalog.expressions.includes(expressionInput || "") ? expressionInput! : luaMateCatalog.expressions[h % luaMateCatalog.expressions.length];
  const outfit = luaMateCatalog.outfits.includes(outfitInput || "") ? outfitInput! : luaMateCatalog.outfits[h % luaMateCatalog.outfits.length];
  const palettes: Record<string,[string,string,string]> = {
    "moon-bear":["#f5c24b","#d99c22","#ffe9aa"], "nebula-fox":["#f58a45","#c75b28","#fff0cf"], "cosmic-penguin":["#27365d","#101a36","#f7f5ed"],
    "lunar-capybara":["#bd7a4f","#8c5030","#f4cf9f"], "wise-owl":["#b98bd9","#8056a8","#fff0c8"], "pocket-dragon":["#6dce72","#2b9b63","#d7ffd7"],
    "orbit-robot":["#63d9ef","#2b75ba","#eefcff"], "astro-cat":["#f5b14a","#bd6f27","#fff0d1"], "prism-axolotl":["#ff91c2","#d85f9f","#ffe8f5"],
    "star-bunny":["#d9d7ef","#9a91c8","#fff7fb"], "comet-monkey":["#c78557","#7c4934","#f2c49f"], "cloud-yeti":["#dbeaf5","#8cb5d0","#ffffff"]
  };
  const [body,accent,inner] = palettes[species] || palettes["moon-bear"];
  const outfitColor = outfit === "arcade" ? "#7447e7" : outfit === "science" ? "#d7efff" : outfit === "space" ? "#21396d" : outfit === "pirate" ? "#7f3b32" : "#1a5db0";
  const eye = expression === "happy" ? '<path d="M73 101q10-12 20 0M127 101q10-12 20 0" fill="none" stroke="#071c45" stroke-width="7" stroke-linecap="round"/>' : '<circle cx="83" cy="101" r="8" fill="#071c45"/><circle cx="139" cy="101" r="8" fill="#071c45"/>';
  const mouth = expression === "surprised" ? '<ellipse cx="111" cy="133" rx="10" ry="13" fill="#7c2b3f" stroke="#071c45" stroke-width="4"/>' : expression === "curious" ? '<path d="M95 135q15-8 31 0" fill="none" stroke="#071c45" stroke-width="6" stroke-linecap="round"/>' : '<path d="M88 128q22 28 45 0" fill="#fff" stroke="#071c45" stroke-width="5"/>';
  const ears = species.includes("fox") || species.includes("cat") ? `<path d="M59 67 47 28l39 29M161 67l12-39-39 29" fill="${body}" stroke="#071c45" stroke-width="7"/>` : species.includes("bunny") ? `<ellipse cx="76" cy="45" rx="18" ry="43" fill="${body}" stroke="#071c45" stroke-width="7"/><ellipse cx="144" cy="45" rx="18" ry="43" fill="${body}" stroke="#071c45" stroke-width="7"/>` : `<circle cx="64" cy="68" r="23" fill="${body}" stroke="#071c45" stroke-width="7"/><circle cx="156" cy="68" r="23" fill="${body}" stroke="#071c45" stroke-width="7"/>`;
  return `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 220 220" role="img" aria-label="LuaMate ${escapeSvgText(species)}"><defs><linearGradient id="bg" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#eef7ff"/><stop offset="1" stop-color="#fff5cf"/></linearGradient></defs><rect x="6" y="6" width="208" height="208" rx="55" fill="url(#bg)"/>${ears}<ellipse cx="110" cy="186" rx="62" ry="26" fill="${outfitColor}" stroke="#071c45" stroke-width="6"/><rect x="48" y="50" width="124" height="114" rx="52" fill="${body}" stroke="#071c45" stroke-width="7"/><ellipse cx="110" cy="126" rx="34" ry="25" fill="${inner}" opacity=".86"/>${eye}<ellipse cx="111" cy="118" rx="7" ry="5" fill="${accent}"/>${mouth}<circle cx="42" cy="43" r="4" fill="#ffcf45"/><circle cx="179" cy="39" r="3" fill="#65e8ff"/></svg>`;
}

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
  return c.json({ version: "lua-avatar.v1", engine: "Rede Lua + DiceBear", ...luaMateCatalog, styles: Array.from(approvedAvatarStyles) });
});

app.get("/luaid/avatar/:style/:seed.svg", async (c) => {
  const style = z.string().trim().regex(/^[a-z0-9-]{2,32}$/).parse(c.req.param("style"));
  const seed = z.string().trim().min(2).max(90).parse(c.req.param("seed"));
  if (!approvedAvatarStyles.has(style)) return c.json({ error: "STYLE_NOT_ALLOWED" }, 400);
  if (style === "lua-mates") {
    const species = c.req.query("species");
    const expression = c.req.query("expression");
    const outfit = c.req.query("outfit");
    c.header("Content-Type", "image/svg+xml; charset=utf-8");
    c.header("Cache-Control", "public, max-age=86400, s-maxage=604800");
    return c.body(luaMateSvg(seed, species, expression, outfit));
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
