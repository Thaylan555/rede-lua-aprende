import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  GraduationCap,
  LibraryBig,
  MessageCircle,
  MoonStar,
  Palette,
  Search,
  ShieldCheck,
  Sparkles,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import { api } from "../api";
import { reactionAssets } from "../assets";
import { LumiMoment } from "../components/LumiMoment";

export function HomeView({ code, setCode, onJoin, onTeacher, onExplore, onStudent }: { code: string; setCode: (value: string) => void; onJoin: () => void; onTeacher: () => void; onExplore: () => void; onStudent: () => void }) {
  const recommended = useQuery({ queryKey: ["recommendations"], queryFn: api.recommendations, staleTime: 60_000, retry: 1 });

  return (
    <>
      <section className="page-width home-hero human-hero">
        <div className="hero-copy human-hero-copy">
          <span className="eyebrow"><MoonStar size={16} /> feito para aulas de verdade</span>
          <h1>Quiz, risada, disputa e <em>aprendizado</em> na mesma aula.</h1>
          <p className="hero-lead">O professor cria a atividade, a turma entra com um código e pronto. Dá para jogar, reagir, ganhar XP e descobrir o que vale revisar depois.</p>

          <div className="quick-join-card">
            <div>
              <span className="quick-join-label">Já tem um código?</span>
              <strong>Entra na partida 👇</strong>
            </div>
            <div className="quick-join-controls">
              <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9))} onKeyDown={(e) => e.key === "Enter" && onJoin()} placeholder="LUA-4821" aria-label="Código da partida" />
              <button onClick={onJoin}>Entrar <ArrowRight /></button>
            </div>
          </div>

          <div className="hero-actions human-actions">
            <button className="button button-primary" onClick={onTeacher}><GraduationCap /> Quero criar uma atividade</button>
            <button className="button button-ghost" onClick={onStudent}><UserRound /> Ver meu perfil</button>
          </div>

          <div className="human-trust-row">
            <span><CheckCircle2 /> funciona no celular</span>
            <span><ShieldCheck /> sem anúncios</span>
            <span><Sparkles /> perfil do seu jeito</span>
          </div>

          <div className="home-lumi-note"><LumiMoment kind="smile" message="Errou? tenta outra. Aqui não tem bronca por aprender 😌" /></div>
        </div>

        <div className="classroom-playground" aria-label="Exemplo divertido de uma partida Rede Lua">
          <div className="playground-topline"><span>EXEMPLO DE UMA PARTIDA</span><b>História • valendo 200 XP</b></div>
          <img className="playground-logo" src="/assets/rede-lua/brand/logo-transparent.webp" alt="Rede Lua na Educação" />

          <div className="chat-bubble teacher-bubble"><GraduationCap /><span><small>Professor</small><strong>Valendo! 👀</strong></span></div>
          <div className="chat-bubble student-bubble"><MessageCircle /><span><small>Aluno</small><strong>AGORA EU SEI KKK</strong></span></div>

          <div className="playground-question">
            <span>Pergunta 3 de 8</span>
            <strong>Qual desses acontecimentos veio primeiro?</strong>
            <div className="playground-answers"><i>A</i><i>B</i><i className="picked">C ✓</i><i>D</i></div>
          </div>

          <div className="playground-reactions">
            {reactionAssets.slice(0, 6).map((item, index) => <img key={item.id} className={`reaction-float reaction-${index + 1}`} src={item.src} alt={item.label} />)}
          </div>
        </div>
      </section>

      <section className="friendly-strip">
        <div className="page-width friendly-strip-inner">
          <strong>Sem enrolação: cria, manda o código e joga.</strong>
          <span><Gamepad2 /> quiz e minigame</span>
          <span><Palette /> tema da sua turma</span>
          <span><Trophy /> XP e ranking</span>
          <span><MessageCircle /> reações ao vivo</span>
        </div>
      </section>

      <section className="page-width home-block human-section">
        <div className="human-section-head">
          <span>Como funciona</span>
          <h2>Uma aula inteira em poucos passos.</h2>
          <p>Sem tutorial gigante. O fluxo foi pensado para dar para entender batendo o olho.</p>
        </div>
        <div className="human-steps">
          <article><span>1</span><GraduationCap /><strong>O professor monta</strong><p>Escreve as perguntas, escolhe o tema e deixa tudo com a cara da turma.</p></article>
          <article><span>2</span><Users /><strong>A turma entra</strong><p>Todo mundo usa o mesmo código. Nem precisa criar conta para participar da partida.</p></article>
          <article><span>3</span><Gamepad2 /><strong>A sala joga</strong><p>Tem pontuação, reações, ranking e modos diferentes para não cair sempre no mesmo formato.</p></article>
          <article><span>4</span><BookOpen /><strong>Depois fica mais fácil revisar</strong><p>O professor consegue ver quais perguntas apertaram mais e planejar a próxima aula.</p></article>
        </div>
      </section>

      <section className="page-width home-block fun-block">
        <div className="human-section-head">
          <span>Não é só responder pergunta</span>
          <h2>Tem espaço para deixar a aula com personalidade.</h2>
        </div>
        <div className="fun-grid">
          <article className="fun-card avatar-fun"><div className="fun-icon"><UserRound /></div><strong>Perfil que parece seu</strong><p>Avatar, cabelo, óculos, robô, pirata, gamer, moldura e um monte de combinações.</p><button onClick={onStudent}>Montar meu perfil <ArrowRight /></button></article>
          <article className="fun-card theme-fun"><div className="fun-icon"><Palette /></div><strong>Cada quiz com uma cara</strong><p>Troque cores, logo, fundo e estilo. Uma aula de Ciências não precisa parecer igual à de História.</p><button onClick={onTeacher}>Criar meu quiz <ArrowRight /></button></article>
          <article className="fun-card reaction-fun"><div className="mini-reaction-line">{reactionAssets.slice(0, 4).map((item) => <img key={item.id} src={item.src} alt={item.label} />)}</div><strong>A turma pode reagir</strong><p>Acertou? Errou feio? Ficou em choque? Dá para reagir durante a partida sem parar o jogo.</p><button onClick={() => { setCode(""); onJoin(); }}>Ver partidas <ArrowRight /></button></article>
        </div>
      </section>

      <section className="page-width home-block teacher-real-life">
        <div className="teacher-real-copy">
          <span className="eyebrow"><GraduationCap size={16} /> para quem está na frente da turma</span>
          <h2>Professor não precisa virar designer nem programador.</h2>
          <p>Crie uma atividade, reaproveite perguntas antigas e veja onde a turma travou. O resto fica no caminho, não na sua frente.</p>
          <div className="teacher-real-points"><span>✓ duplicar quiz pronto</span><span>✓ guardar perguntas boas</span><span>✓ acompanhar erros da turma</span></div>
          <button className="button button-primary" onClick={onTeacher}>Abrir área do professor <ArrowRight /></button>
        </div>
        <div className="teacher-note-stack">
          <div className="paper-note note-one"><small>HOJE</small><strong>Revisar Revolução Industrial</strong><span>“A questão 4 confundiu metade da turma.”</span></div>
          <div className="paper-note note-two"><small>AMANHÃ</small><strong>Duplicar o quiz e trocar 2 perguntas</strong><span>Pronto. Sem começar tudo do zero.</span></div>
          <div className="paper-note note-three"><Sparkles /><strong>Boa!</strong><span>Material salvo para usar de novo.</span></div>
        </div>
      </section>

      <section className="page-width home-block personalized-block human-recommendations">
        <div className="human-section-head compact-head">
          <span>Quer jogar alguma coisa?</span>
          <h2>{recommended.data?.personalized ? "Separei algumas atividades para você." : "Olha o que já dá para explorar."}</h2>
        </div>
        <div className="recommendation-row">
          {recommended.isLoading ? Array.from({ length: 3 }).map((_, i) => <article className="recommendation-card skeleton-card" key={i} />) : recommended.data?.activities.length ? recommended.data.activities.slice(0, 4).map((item, i) => <button className="recommendation-card human-recommendation-card" key={item.id} onClick={() => { api.trackActivity(item.id, "view"); onExplore(); }}><span className="recommendation-index">0{i + 1}</span><small>{item.subject} • {item.difficulty === "easy" ? "leve" : item.difficulty === "hard" ? "desafio" : "médio"}</small><strong>{item.title}</strong><p>{item.description || "Uma atividade pronta para entrar e jogar."}</p><span className="card-arrow"><ArrowRight /></span></button>) : <article className="recommendation-empty"><LibraryBig /><strong>A biblioteca ainda está começando.</strong><p>Quando os professores publicarem atividades, elas aparecem aqui.</p><button className="button button-ghost" onClick={onExplore}>Explorar atividades</button></article>}
        </div>
      </section>

      <section className="page-width home-block human-closing">
        <div className="human-closing-copy"><span>🌙 Rede Lua na Educação</span><h2>A aula continua sendo da turma. A tecnologia só ajuda a deixar tudo mais vivo.</h2><p>Comece simples: crie uma atividade ou entre numa partida com um código.</p></div>
        <div className="human-closing-actions"><button className="button button-light" onClick={onTeacher}>Criar atividade <ArrowRight /></button><button className="button button-ghost closing-ghost" onClick={onExplore}><Search /> Explorar</button></div>
      </section>
    </>
  );
}
