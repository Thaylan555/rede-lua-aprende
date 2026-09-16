import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BarChart3, BrainCircuit, CheckCircle2, Gamepad2, GraduationCap, LibraryBig, MoonStar, Palette, Search, ShieldCheck, Sparkles, Trophy, UserRound, Users } from "lucide-react";
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
          <p className="hero-lead">Quizzes, minigames e trilhas que acompanham cada turma. Professores criam do seu jeito e alunos avançam no próprio ritmo.</p>
          <div className="join-panel lunar-ticket">
            <div className="join-panel-copy"><span>Bilhete de entrada</span><small>Recebeu um código da turma? Entre direto na missão, até sem criar conta.</small></div>
            <div className="join-panel-controls">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9))} onKeyDown={(e) => e.key === "Enter" && onJoin()} placeholder="LUA-4821" aria-label="Código da partida" />
              <button onClick={onJoin}>Entrar <ArrowRight /></button>
            </div>
          </div>
          <div className="hero-actions">
            <button className="button button-primary" onClick={onTeacher}><GraduationCap /> Área do professor</button>
            <button className="button button-ghost" onClick={onStudent}><Sparkles /> Minha Constelação</button>
          </div>
          <div className="trust-row"><span><ShieldCheck /> dados protegidos</span><span><CheckCircle2 /> sem anúncios</span><span><Users /> progresso que faz sentido</span></div>
        </div>

        <div className="hero-constellation" aria-label="Identidade Rede Lua">
          <span className="orbit orbit-one" /><span className="orbit orbit-two" />
          <span className="star star-a">✦</span><span className="star star-b">✦</span><span className="star star-c">•</span>
          <img className="hero-logo" src="/assets/rede-lua/brand/logo-transparent.webp" alt="Rede Lua na Educação" />
          <div className="floating-chip chip-search"><Search /><span><b>Busca Lunar</b>ache atividades</span></div>
          <div className="floating-chip chip-brain"><BrainCircuit /><span><b>No seu ritmo</b>trilhas que mudam</span></div>
          <div className="floating-chip chip-score"><Trophy /><span><b>+ XP</b>avance aprendendo</span></div>
        </div>
      </section>

      <section className="signal-strip intelligence-strip">
        <div className="page-width signal-grid">
          <strong>Feita para transformar a aula em experiência</strong>
          <span><Gamepad2 /> Quizzes</span><span><Search /> Busca rápida</span><span><UserRound /> Perfis</span><span><Palette /> Minigames</span>
        </div>
      </section>

      <section className="page-width home-block lunar-system-block">
        <div className="section-kicker"><span>01</span><p>Tudo pensado para aprender sem complicar</p></div>
        <div className="intelligence-grid core-grid">
          <article className="intelligence-card supabase-card"><span className="system-number">A</span><Users /><h2>Tudo em um só lugar</h2><p>Conta, atividades, partidas e progresso ficam conectados para professor e aluno não perderem tempo pulando entre ferramentas.</p><small>CONTA • ATIVIDADES • PROGRESSO</small></article>
          <article className="intelligence-card core-search-card"><span className="system-number">B</span><Search /><h2>Encontre o que precisa</h2><p>Pesquise por matéria, assunto ou palavra e encontre rapidamente atividades que combinam com o momento da turma.</p><small>PESQUISA • MATÉRIAS • DESCOBERTAS</small></article>
          <article className="intelligence-card core-mastery-card"><span className="system-number">C</span><BrainCircuit /><h2>Cada aluno no próprio ritmo</h2><p>As respostas ajudam a mostrar o que já está forte, o que precisa de reforço e qual pode ser o próximo desafio.</p><small>RITMO • REFORÇO • DESAFIO</small></article>
          <article className="intelligence-card core-pulse-card"><span className="system-number">D</span><ShieldCheck /><h2>Privacidade desde o começo</h2><p>A Rede Lua usa apenas o necessário para a experiência funcionar e evita transformar a aprendizagem em publicidade.</p><small>PRIVACIDADE • CONTROLE • TRANQUILIDADE</small></article>
        </div>
      </section>

      <section className="page-width home-block signature-systems">
        <div className="section-kicker"><span>02</span><p>Três espaços com personalidade própria</p></div>
        <div className="signature-system-grid">
          <article className="signature-card teacher-signature forge-signature">
            <div className="signature-top"><span>PARA PROFESSORES</span><GraduationCap /></div>
            <strong>Forja Lunar</strong>
            <p>Guarde suas melhores perguntas e reaproveite quando quiser. Você cria uma vez e monta novas missões muito mais rápido.</p>
            <div className="signature-pills"><span>Perguntas salvas</span><span>Organização</span><span>Reutilização</span></div>
            <button onClick={onTeacher}>Abrir a Forja <ArrowRight /></button>
          </article>

          <article className="signature-card teacher-signature radar-signature">
            <div className="signature-top"><span>PARA PROFESSORES</span><BarChart3 /></div>
            <strong>Radar de Aprendizagem</strong>
            <p>Veja onde a turma mais errou, quais assuntos estão indo bem e quem pode precisar de uma ajuda extra.</p>
            <div className="signature-pills"><span>Visão da turma</span><span>Dificuldades</span><span>Próximos passos</span></div>
            <button onClick={onTeacher}>Ver o Radar <ArrowRight /></button>
          </article>

          <article className="signature-card student-signature constellation-signature">
            <div className="signature-top"><span>PARA ALUNOS</span><Sparkles /></div>
            <strong>Constelação do Aluno</strong>
            <p>Uma trilha que muda com você, com missões para reforçar, descobrir assuntos novos e encarar desafios.</p>
            <div className="signature-pills"><span>Missões</span><span>XP</span><span>Progresso</span></div>
            <button onClick={onStudent}>Abrir minha Constelação <ArrowRight /></button>
          </article>
        </div>
      </section>

      <section className="page-width home-block personalized-block">
        <div className="section-kicker"><span>03</span><p>Uma página que acompanha seu jeito de aprender</p></div>
        <div className="personalized-head"><div><span className="eyebrow"><Sparkles size={16} /> escolhido para você</span><h2>{recommended.data?.personalized ? "Sugestões para continuar de onde você parou." : "Descubra sua próxima missão."}</h2></div><span className="engine-pill">Para você</span></div>
        <div className="recommendation-row">
          {recommended.isLoading ? Array.from({ length: 3 }).map((_, i) => <article className="recommendation-card skeleton-card" key={i} />) : recommended.data?.activities.length ? recommended.data.activities.slice(0, 4).map((item, i) => <button className="recommendation-card" key={item.id} onClick={() => { api.trackActivity(item.id, "view"); onExplore(); }}><span className="recommendation-index">0{i + 1}</span><small>{item.subject} • {item.difficulty === "easy" ? "leve" : item.difficulty === "hard" ? "desafio" : "médio"}</small><strong>{item.title}</strong><p>{item.description || "Uma atividade da comunidade Rede Lua."}</p><span className="card-arrow"><ArrowRight /></span></button>) : <article className="recommendation-empty"><LibraryBig /><strong>As sugestões aparecem conforme a Rede Lua ganha atividades.</strong><p>Quando professores publicarem novas missões, você verá aqui opções que combinam com seus estudos.</p><button className="button button-ghost" onClick={onExplore}>Explorar atividades</button></article>}
        </div>
      </section>

      <section className="page-width home-block classroom-story">
        <div className="section-kicker"><span>04</span><p>Uma aula completa em três momentos</p></div>
        <div className="story-board">
          <article><span>01</span><GraduationCap /><strong>Crie a missão</strong><p>Monte perguntas, escolha o visual e deixe a atividade com a cara da turma.</p></article>
          <ArrowRight className="story-arrow" />
          <article><span>02</span><Gamepad2 /><strong>Jogue com a turma</strong><p>Um código curto coloca todo mundo na mesma partida.</p></article>
          <ArrowRight className="story-arrow" />
          <article><span>03</span><Trophy /><strong>Acompanhe a evolução</strong><p>Veja os resultados e descubra qual pode ser o próximo passo.</p></article>
        </div>
        <div className="reaction-ribbon">{reactionAssets.slice(0, 8).map((item) => <img key={item.id} src={item.src} alt={item.label} />)}</div>
      </section>

      <section className="page-width home-block closing-card lunar-closing">
        <div><span className="eyebrow"><Sparkles size={16} /> Rede Lua na Educação</span><h2>Cada turma pode ter uma experiência que parece feita para ela.</h2><p>Avatares, temas, logos, minigames, missões e trilhas deixam aprender e ensinar mais divertido sem perder a simplicidade.</p></div>
        <button className="button button-light" onClick={onTeacher}>Criar uma missão <ArrowRight /></button>
      </section>
    </>
  );
}
