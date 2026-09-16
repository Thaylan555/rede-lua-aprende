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

export const onRequest = handle(app);
