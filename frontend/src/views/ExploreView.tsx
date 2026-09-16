import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, BookOpen, BrainCircuit, CloudSun, Earth, ExternalLink, LibraryBig, LoaderCircle, MapPinned, Search, Sparkles } from "lucide-react";
import { api } from "../api";
import type { PublicActivity } from "../types";

type LabTab = "rede" | "books" | "wiki" | "weather" | "world" | "brazil";

const tabs: Array<{ id: LabTab; label: string; icon: typeof BookOpen; note: string }> = [
  { id: "rede", label: "Rede Lua", icon: BrainCircuit, note: "Busca Lunar" },
  { id: "books", label: "Biblioteca", icon: LibraryBig, note: "Open Library" },
  { id: "wiki", label: "Enciclopédia", icon: BookOpen, note: "Wikimedia" },
  { id: "weather", label: "Clima", icon: CloudSun, note: "Open-Meteo" },
  { id: "world", label: "Dados do mundo", icon: BarChart3, note: "World Bank" },
  { id: "brazil", label: "Brasil", icon: MapPinned, note: "IBGE" },
];

export function ExploreView() {
  const [tab, setTab] = useState<LabTab>("rede");
  const [draft, setDraft] = useState("astronomia");
  const [search, setSearch] = useState("astronomia");
  const [cityDraft, setCityDraft] = useState("Belo Horizonte");
  const [city, setCity] = useState("Belo Horizonte");
  const [countryDraft, setCountryDraft] = useState("BRA");
  const [country, setCountry] = useState("BRA");
  const [metric, setMetric] = useState("population");

  const rede = useQuery({ queryKey: ["rede-search", search], queryFn: () => api.searchActivities(search), enabled: tab === "rede" && search.length >= 2 });
  const books = useQuery({ queryKey: ["books", search], queryFn: () => api.books(search), enabled: tab === "books" && search.length >= 2 });
  const wiki = useQuery({ queryKey: ["wiki", search], queryFn: () => api.wiki(search), enabled: tab === "wiki" && search.length >= 2 });
  const weather = useQuery({ queryKey: ["weather", city], queryFn: () => api.weather(city), enabled: tab === "weather" && city.length >= 2 });
  const world = useQuery({ queryKey: ["world", country, metric], queryFn: () => api.world(country, metric), enabled: tab === "world" && country.length >= 2 });
  const states = useQuery({ queryKey: ["states"], queryFn: api.states, enabled: tab === "brazil", staleTime: 24 * 60 * 60_000 });

  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); if (draft.trim().length >= 2) setSearch(draft.trim()); };
  const submitCity = (event: React.FormEvent) => { event.preventDefault(); if (cityDraft.trim().length >= 2) setCity(cityDraft.trim()); };
  const submitCountry = (event: React.FormEvent) => { event.preventDefault(); if (/^[A-Za-z]{2,3}$/.test(countryDraft.trim())) setCountry(countryDraft.trim().toUpperCase()); };

  return <div className="page-width page-pad explore-view">
    <header className="page-intro split-intro">
      <div><span className="eyebrow"><Sparkles size={16} /> observatório de descobertas</span><h1>Pesquise como quem abre uma janela, não uma lista infinita.</h1></div>
      <p>Conteúdo da própria Rede Lua entra primeiro. Depois, fontes públicas confiáveis ampliam o contexto para livros, enciclopédia, clima, Brasil e dados globais.</p>
    </header>

    <div className="lab-shell">
      <aside className="lab-tabs" aria-label="Fontes de pesquisa">
        {tabs.map(({ id, label, icon: Icon, note }) => <button key={id} className={tab === id ? "active" : ""} onClick={() => setTab(id)}><Icon /><span><strong>{label}</strong><small>{note}</small></span></button>)}
      </aside>

      <section className="lab-workspace">
        {tab === "rede" && <>
          <LabHeading icon={BrainCircuit} title="Busca inteligente da Rede Lua" text="Digite um assunto, matéria ou palavra e a Busca Lunar encontra atividades relacionadas dentro da Rede Lua." badge="REDE LUA" />
          <SearchForm value={draft} onChange={setDraft} onSubmit={submitSearch} placeholder="Ex.: frações, sistema solar, português…" />
          {rede.isLoading ? <Loading /> : rede.isError ? <SourceError /> : rede.data?.activities.length ? <div className="rede-result-grid">{rede.data.activities.map((item) => <RedeActivityCard key={item.id} item={item} />)}</div> : <Empty text="Nenhuma atividade publicada combina com essa busca ainda." />}
        </>}

        {tab === "books" && <><LabHeading icon={LibraryBig} title="Biblioteca de apoio" text="Busque livros, autores e primeiras edições pela Open Library." /><SearchForm value={draft} onChange={setDraft} onSubmit={submitSearch} placeholder="Ex.: astronomia, Machado de Assis…" />{books.isLoading ? <Loading /> : books.isError ? <SourceError /> : <div className="book-grid">{books.data?.books.map((book) => <article className="book-card" key={book.key}>{book.coverUrl ? <img src={book.coverUrl} alt="" loading="lazy" /> : <div className="book-fallback"><BookOpen /></div>}<div><small>{book.year || "ano não informado"}</small><strong>{book.title}</strong><p>{book.authors.slice(0, 2).join(", ") || "Autor não informado"}</p></div></article>)}</div>}</>}

        {tab === "wiki" && <><LabHeading icon={BookOpen} title="Enciclopédia rápida" text="Resumo de temas usando a Wikipédia em português como fonte de consulta." /><SearchForm value={draft} onChange={setDraft} onSubmit={submitSearch} placeholder="Ex.: fotossíntese, revolução industrial…" />{wiki.isLoading ? <Loading /> : wiki.isError ? <SourceError /> : <div className="wiki-list">{wiki.data?.results.map((item) => <article key={item.title}>{item.thumbnail ? <img src={item.thumbnail} alt="" loading="lazy" /> : <div className="wiki-fallback"><BookOpen /></div>}<div><strong>{item.title}</strong><p>{item.extract || "Sem resumo disponível."}</p>{item.url && <a href={item.url} target="_blank" rel="noreferrer">Ler na fonte <ExternalLink /></a>}</div></article>)}</div>}</>}

        {tab === "weather" && <><LabHeading icon={CloudSun} title="Laboratório de clima" text="Transforme o tempo atual em contexto para Ciências, Geografia e projetos." /><form className="lab-search" onSubmit={submitCity}><Search /><input value={cityDraft} onChange={(e) => setCityDraft(e.target.value)} placeholder="Cidade, ex.: Curitiba" /><button>Ver clima</button></form>{weather.isLoading ? <Loading /> : weather.isError ? <SourceError /> : weather.data?.place ? <div className="weather-panel"><div className="weather-now"><span>{weather.data.place.name}{weather.data.place.admin1 ? ` • ${weather.data.place.admin1}` : ""}</span><strong>{Math.round(weather.data.current?.temperature_2m ?? 0)}°C</strong><p>Sensação de {Math.round(weather.data.current?.apparent_temperature ?? 0)}°C • umidade {weather.data.current?.relative_humidity_2m ?? "—"}% • vento {Math.round(weather.data.current?.wind_speed_10m ?? 0)} km/h</p></div><div className="weather-days">{weather.data.daily.map((day) => <article key={day.date}><small>{new Date(`${day.date}T12:00:00`).toLocaleDateString("pt-BR", { weekday: "short" })}</small><strong>{Math.round(day.max)}° / {Math.round(day.min)}°</strong><span>chuva {day.rainChance ?? 0}%</span></article>)}</div></div> : <Empty text="Cidade não encontrada." />}</>}

        {tab === "world" && <><LabHeading icon={Earth} title="Dados do mundo" text="Compare indicadores públicos do Banco Mundial em atividades de Geografia e Matemática." /><div className="world-controls"><form className="lab-search" onSubmit={submitCountry}><Earth /><input value={countryDraft} onChange={(e) => setCountryDraft(e.target.value.toUpperCase().slice(0, 3))} placeholder="BRA" /><button>Carregar</button></form><select value={metric} onChange={(e) => setMetric(e.target.value)}><option value="population">População</option><option value="lifeExpectancy">Expectativa de vida</option><option value="internet">Uso da internet</option><option value="gdpPerCapita">PIB per capita</option></select></div>{world.isLoading ? <Loading /> : world.isError ? <SourceError /> : world.data ? <WorldChart data={world.data} /> : null}</>}

        {tab === "brazil" && <><LabHeading icon={MapPinned} title="Brasil em 27 cartões" text="Estados organizados por região com dados oficiais da API de Localidades do IBGE." />{states.isLoading ? <Loading /> : states.isError ? <SourceError /> : <div className="state-grid">{states.data?.states.map((state) => <article key={state.id}><strong>{state.sigla}</strong><div><span>{state.nome}</span><small>{state.regiao}</small></div></article>)}</div>}</>}
      </section>
    </div>
  </div>;
}

function RedeActivityCard({ item }: { item: PublicActivity }) {
  return <button className="rede-activity-card" onClick={() => api.trackActivity(item.id, "view")}><div><span>{item.subject}</span><em>{item.difficulty === "easy" ? "leve" : item.difficulty === "hard" ? "desafio" : "médio"}</em></div><strong>{item.title}</strong><p>{item.description || "Atividade publicada na Rede Lua."}</p><footer>{item.tags.slice(0, 3).map((tag) => <small key={tag}>#{tag}</small>)}<Search /></footer></button>;
}
function LabHeading({ icon: Icon, title, text, badge }: { icon: typeof BookOpen; title: string; text: string; badge?: string }) { return <div className="lab-heading"><div className="lab-icon"><Icon /></div><div><div className="lab-title-row"><h2>{title}</h2>{badge && <span>{badge}</span>}</div><p>{text}</p></div></div>; }
function SearchForm({ value, onChange, onSubmit, placeholder }: { value: string; onChange: (value: string) => void; onSubmit: (event: React.FormEvent) => void; placeholder: string }) { return <form className="lab-search" onSubmit={onSubmit}><Search /><input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} /><button>Pesquisar</button></form>; }
function Loading() { return <div className="source-status"><LoaderCircle className="spin" /><strong>Consultando a fonte…</strong></div>; }
function SourceError() { return <div className="source-status error"><strong>A fonte não respondeu agora.</strong><span>Tente novamente em alguns instantes.</span></div>; }
function Empty({ text }: { text: string }) { return <div className="source-status"><strong>{text}</strong></div>; }
function WorldChart({ data }: { data: { country: string; metric: { label: string; unit: string }; points: Array<{ year: string; value: number }> } }) {
  const max = Math.max(...data.points.map((p) => Number(p.value) || 0), 1);
  const format = (value: number) => data.metric.unit === "US$" ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value) : data.metric.unit === "pessoas" ? new Intl.NumberFormat("pt-BR", { notation: "compact", maximumFractionDigits: 1 }).format(value) : `${new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value)}${data.metric.unit.startsWith("%") ? "%" : ""}`;
  return <div className="world-card"><div><span>{data.country}</span><h3>{data.metric.label}</h3><p>Últimos valores disponíveis • {data.metric.unit}</p></div><div className="bar-chart">{data.points.map((point) => <div className="bar-item" key={point.year}><span className="bar-value">{format(point.value)}</span><div className="bar-track"><i style={{ height: `${Math.max(8, (point.value / max) * 100)}%` }} /></div><small>{point.year}</small></div>)}</div></div>;
}
