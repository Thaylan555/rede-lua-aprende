import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Database, Gamepad2, GraduationCap, LibraryBig, MoonStar, Palette, Search, ShieldCheck, Sparkles, Trophy, UserRound, Users } from "lucide-react";
import { api } from "../api";
import { reactionAssets } from "../assets";

export function HomeView({ code, setCode, onJoin, onTeacher, onExplore, onStudent }: { code: string; setCode: (value: string) => void; onJoin: () => void; onTeacher: () => void; onExplore: () => void; onStudent: () => void }) {
  const recommended = useQuery({ queryKey: ["recommendations"], queryFn: api.recommendations, staleTime: 60_000, retry: 1 });

  return (
    <>
      <section className="home-hero page-width lunar-hero core-hero">
        <div className="hero-copy">
          <span className="eyebrow"><MoonStar size={16} /> a sala virou um universo de aprendizagem</span>
          <h1>Aprender com uma plataforma que <em>entende o ritmo</em> da turma.</h1>
          <p className="hero-lead">A Rede Lua agora junta LuaCore, Mega Perfil e Quiz Studio: busca nativa, domínio por matéria, avatares combináveis e atividades com tema/minigame — com os dados principais concentrados no Supabase.</p>
          <div className="join-panel lunar-ticket">
            <div className="join-panel-copy"><span>Bilhete de entrada</span><small>Recebeu um código da turma? Entre direto na missão, até sem criar conta.</small></div>
            <div className="join-panel-controls">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9))} onKeyDown={(e) => e.key === "Enter" && onJoin()} placeholder="LUA-4821" aria-label="Código da partida" />
              <button onClick={onJoin}>Entrar <ArrowRight /></button>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onTeacher}><GraduationCap /> Studio do professor</button>
            <button className="button button-ghost" onClick={onStudent}><Sparkles /> Minha Constelação</button>
          </div>
          <div className="trust-row"><span><ShieldCheck /> RLS no Supabase</span><span><CheckCircle2 /> inteligência própria</span><span><Users /> progresso por aprendizagem</span></div>
        </div>

        <div className="hero-constellation" aria-label="Identidade Rede Lua">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <span className="star star-a">✦</span><span className="star star-b">✦</span><span className="star star-c">•</span>
          <img className="hero-logo" src="/assets/rede-lua/brand/logo-transparent.webp" alt="Rede Lua na Educação" />
          <div className="floating-chip chip-search"><Search /><span><b>Busca Lunar</b>Postgres FTS</span></div>
          <div className="floating-chip chip-brain"><BrainCircuit /><span><b>LuaCore</b>domínio adaptativo</span></div>
          <div className="floating-chip chip-score"><Trophy /><span><b>+ XP</b>aprendizado real</span></div>
        </div>
      </section>

      <section className="signal-strip intelligence-strip">
        <div className="page-width signal-grid">
          <strong>LuaCore • um motor próprio dentro da Rede Lua</strong>
          <span><Database /> Supabase</span><span><Search /> Busca nativa</span><span><UserRound /> Mega Perfil</span><span><Palette /> Quiz Studio</span>
        </div>
      </section>

      <section className="page-width home-block lunar-system-block">
        <div className="section-kicker"><span>01</span><p>Sem três serviços externos. Um núcleo forte.</p></div>
        <div className="intelligence-grid core-grid">
          <article className="intelligence-card supabase-card"><span className="system-number">A</span><Database /><h2>Supabase é a fonte de verdade</h2><p>Login, perfis, atividades, partidas, progresso, regras de acesso e dados pedagógicos ficam no PostgreSQL com RLS.</p><small>AUTH • POSTGRES • RLS • RPC</small></article>
          <article className="intelligence-card core-search-card"><span className="system-number">B</span><Search /><h2>Busca Lunar vive no banco</h2><p>Full-text search em português + similaridade por trigramas encontra títulos, matérias, descrições e tags sem indexador externo.</p><small>FTS • TRIGRAM • RANKING</small></article>
          <article className="intelligence-card core-mastery-card"><span className="system-number">C</span><BrainCircuit /><h2>Motor de Domínio aprende com respostas</h2><p>Cada resposta atualiza confiança e domínio por matéria. A vitrine usa esses sinais para variar dificuldade e sugerir o próximo passo.</p><small>MASTERY • AFINIDADE • ADAPTAÇÃO</small></article>
          <article className="intelligence-card core-pulse-card"><span className="system-number">D</span><BarChart3 /><h2>LuaPulse mede só o necessário</h2><p>Eventos de produto ficam no próprio Supabase, com sessão temporária, sem cookies de rastreamento e sem entregar dados a uma plataforma de analytics.</p><small>FIRST-PARTY • PRIVACIDADE • INSIGHTS</small></article>
        </div>
      </section>

      <section className="page-width home-block signature-systems">
        <div className="section-kicker"><span>02</span><p>Três sistemas que dão personalidade à plataforma</p></div>
        <div className="signature-system-grid">
          <article className="signature-card teacher-signature forge-signature">
            <div className="signature-top"><span>PROFESSOR • SISTEMA 01</span><GraduationCap /></div>
            <strong>Forja Lunar</strong>
            <p>Banco pessoal de perguntas reutilizáveis. O professor salva questões boas, separa por habilidade e reaproveita em novas missões sem reescrever tudo.</p>
            <div className="signature-pills"><span>Banco de questões</span><span>Habilidades</span><span>Reutilização</span></div>
            <button onClick={onTeacher}>Abrir a Forja <ArrowRight /></button>
          </article>

          <article className="signature-card teacher-signature radar-signature">
            <div className="signature-top"><span>PROFESSOR • SISTEMA 02</span><BarChart3 /></div>
            <strong>Radar de Aprendizagem</strong>
            <p>Mostra perguntas com maior taxa de erro, domínio por matéria e alunos que precisam de atenção — usando as próprias partidas da turma.</p>
            <div className="signature-pills"><span>Hotspots</span><span>Domínio</span><span>Sinais de intervenção</span></div>
            <button onClick={onTeacher}>Ver o Radar <ArrowRight /></button>
          </article>

          <article className="signature-card student-signature constellation-signature">
            <div className="signature-top"><span>ALUNO • SISTEMA 03</span><Sparkles /></div>
            <strong>Constelação do Aluno</strong>
            <p>Uma trilha diária com missões de recuperação, exploração e desafio. O mapa muda conforme o aluno responde e constrói domínio.</p>
            <div className="signature-pills"><span>Missões diárias</span><span>XP</span><span>Mapa de domínio</span></div>
            <button onClick={onStudent}>Abrir minha Constelação <ArrowRight /></button>
          </article>
        </div>
      </section>

      <section className="page-width home-block personalized-block">
        <div className="section-kicker"><span>03</span><p>Uma vitrine que muda com o aprendizado</p></div>
        <div className="personalized-head"><div><span className="eyebrow"><Sparkles size={16} /> seleção LuaCore</span><h2>{recommended.data?.personalized ? "Sugestões ajustadas ao seu histórico." : "Descubra a próxima missão."}</h2></div><span className="engine-pill">LuaCore</span></div>
        <div className="recommendation-row">
          {recommended.isLoading ? Array.from({ length: 3 }).map((_, i) => <article className="recommendation-card skeleton-card" key={i} />) : recommended.data?.activities.length ? recommended.data.activities.slice(0, 4).map((item, i) => <button className="recommendation-card" key={item.id} onClick={() => { api.trackActivity(item.id, "view"); onExplore(); }}><span className="recommendation-index">0{i + 1}</span><small>{item.subject} • {item.difficulty === "easy" ? "leve" : item.difficulty === "hard" ? "desafio" : "médio"}</small><strong>{item.title}</strong><p>{item.description || "Uma atividade da comunidade Rede Lua."}</p><span className="card-arrow"><ArrowRight /></span></button>) : <article className="recommendation-empty"><LibraryBig /><strong>As recomendações crescem junto com a plataforma.</strong><p>Publique atividades no Studio e o LuaCore cria uma vitrine baseada em afinidade e domínio.</p><button className="button button-ghost" onClick={onExplore}>Abrir laboratório</button></article>}
        </div>
      </section>

      <section className="page-width home-block classroom-story">
        <div className="section-kicker"><span>04</span><p>Do professor para a turma, e da turma de volta para o professor</p></div>
        <div className="story-board">
          <article><span>01</span><GraduationCap /><strong>Forje a missão</strong><p>Crie ou reaproveite perguntas na Forja Lunar.</p></article>
          <ArrowRight className="story-arrow" />
          <article><span>02</span><Gamepad2 /><strong>Jogue com a turma</strong><p>Um código curto coloca todo mundo na mesma partida.</p></article>
          <ArrowRight className="story-arrow" />
          <article><span>03</span><Trophy /><strong>Leia os sinais</strong><p>Radar e Constelação transformam respostas em próximos passos.</p></article>
        </div>
        <div className="reaction-ribbon">{reactionAssets.slice(0, 8).map((item) => <img key={item.id} src={item.src} alt={item.label} />)}</div>
      </section>

      <section className="page-width home-block closing-card lunar-closing">
        <div><span className="eyebrow"><Sparkles size={16} /> Rede Lua + LuaCore</span><h2>Cada aluno, professor e atividade pode ter identidade própria.</h2><p>Avatares combináveis, cartões personalizados, temas de quiz, logos de atividade, minigames, trilhas e dados pedagógicos agora fazem parte do mesmo ecossistema.</p></div>
        <button className="button button-light" onClick={onTeacher}>Criar uma missão <ArrowRight /></button>
      </section>
    </>
  );
}
