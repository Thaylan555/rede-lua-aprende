import { ArrowRight, BookOpenCheck, BrainCircuit, Gamepad2, GraduationCap, Mail, MoonStar, Play, Sparkles, UserRound, WandSparkles } from "lucide-react";
import { LumiMoment } from "../components/LumiMoment";

export function HomeV8({
  code,
  setCode,
  onJoin,
  onLearn,
  onStudio,
  onProfile,
  onSupport,
}: {
  code: string;
  setCode: (value: string) => void;
  onJoin: () => void;
  onLearn: () => void;
  onStudio: () => void;
  onProfile: () => void;
  onSupport: () => void;
}) {
  return <div className="v8-home">
    <section className="v8-hero v8-shell">
      <div className="v8-hero-copy">
        <span className="v8-kicker"><MoonStar /> REDE LUA NA EDUCAÇÃO</span>
        <h1>Aprender pode parecer <em>uma aventura</em>, não uma prova sem fim.</h1>
        <p>A turma joga, pensa, tenta de novo e evolui. O professor monta experiências do jeito dele — sem transformar a aula em um painel complicado.</p>
        <div className="v8-hero-actions">
          <button className="v8-primary" onClick={onLearn}><BrainCircuit /> Quero aprender <ArrowRight /></button>
          <button className="v8-secondary" onClick={onStudio}><WandSparkles /> Sou professor</button>
        </div>
        <div className="v8-trust-line"><span>Sem resposta pronta</span><i /> <span>Sem anúncio</span><i /> <span>Feito para sala de aula</span></div>
      </div>

      <div className="v8-hero-stage" aria-hidden="true">
        <div className="v8-orbit v8-orbit-a" />
        <div className="v8-orbit v8-orbit-b" />
        <div className="v8-orbit-dot dot-a">✦</div>
        <div className="v8-orbit-dot dot-b">☄</div>
        <div className="v8-lumi-card">
          <LumiMoment kind="curious" message="Lumi está de olho na missão" />
        </div>
        <div className="v8-floating-note note-a"><strong>+10 XP</strong><span>Você chegou no raciocínio 👀</span></div>
        <div className="v8-floating-note note-b"><strong>Nova pista</strong><span>Sem entregar a resposta.</span></div>
      </div>
    </section>

    <section className="v8-join-band">
      <div className="v8-shell v8-join-inner">
        <div><span>JÁ TEM UMA SALA?</span><strong>Entre rapidinho.</strong></div>
        <div className="v8-code-box">
          <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9-]/g, "").slice(0, 9))} placeholder="LUA-4821" aria-label="Código da sala" />
          <button onClick={onJoin}><Play /> Entrar</button>
        </div>
      </div>
    </section>

    <section className="v8-shell v8-three-worlds">
      <header className="v8-section-title"><span>TRÊS JEITOS DE VIVER A REDE LUA</span><h2>Não é só quiz.</h2><p>Cada parte da plataforma tem uma função clara e uma interface própria.</p></header>
      <div className="v8-world-grid">
        <button className="v8-world-card learn" onClick={onLearn}>
          <div className="v8-world-art"><BrainCircuit /><span>01</span></div>
          <small>PARA QUEM APRENDE</small><h3>Trilha Lunar</h3><p>Você recebe pistas, organiza o raciocínio e tenta de novo. A plataforma não joga a resposta na sua cara.</p><b>Entrar na trilha <ArrowRight /></b>
        </button>
        <button className="v8-world-card studio" onClick={onStudio}>
          <div className="v8-world-art"><GraduationCap /><span>02</span></div>
          <small>PARA QUEM ENSINA</small><h3>Studio do Professor</h3><p>Escolha um minigame, monte as perguntas, veja a prévia e publique. Mais criação, menos formulário.</p><b>Abrir o Studio <ArrowRight /></b>
        </button>
        <button className="v8-world-card identity" onClick={onProfile}>
          <div className="v8-world-art"><UserRound /><span>03</span></div>
          <small>SUA IDENTIDADE</small><h3>LuaID</h3><p>Avatar, cartão, conquistas e um perfil que também pode ser usado por API em outros produtos da Rede Lua.</p><b>Ver meu LuaID <ArrowRight /></b>
        </button>
      </div>
    </section>

    <section className="v8-shell v8-learning-story">
      <div className="v8-story-copy">
        <span className="v8-kicker"><BookOpenCheck /> APRENDER SEM COLAR</span>
        <h2>Errou? A Rede Lua não entrega o gabarito.</h2>
        <p>Ela devolve uma pista, pede para você olhar o problema por outro ângulo e deixa você tentar de novo. A explicação completa aparece quando o raciocínio fecha.</p>
        <div className="v8-learning-steps">
          <div><b>1</b><span><strong>Leia</strong><small>entenda o que a questão está pedindo</small></span></div>
          <div><b>2</b><span><strong>Pense</strong><small>registre seu raciocínio em uma frase</small></span></div>
          <div><b>3</b><span><strong>Tente</strong><small>se errar, receba uma pista — não a resposta</small></span></div>
          <div><b>4</b><span><strong>Entenda</strong><small>quando acertar, veja a explicação</small></span></div>
        </div>
      </div>
      <div className="v8-demo-question">
        <div className="v8-demo-top"><span>MATEMÁTICA • ETAPA 2/5</span><Sparkles /></div>
        <h3>Qual caminho você usaria primeiro para resolver este problema?</h3>
        <div className="v8-demo-options"><span>A</span><span>B</span><span>C</span><span>D</span></div>
        <div className="v8-coach-bubble"><strong>Lumi:</strong> “Olha para a relação entre as grandezas antes de calcular.”</div>
      </div>
    </section>

    <section className="v8-shell v8-studio-showcase">
      <header className="v8-section-title"><span>PROFESSOR, ESCOLHA O CLIMA DA AULA</span><h2>O mesmo conteúdo. Várias formas de jogar.</h2></header>
      <div className="v8-mode-strip">
        <article><div>👾</div><strong>Batalha de Chefão</strong><span>a turma derruba a energia do monstro</span></article>
        <article><div>🗺️</div><strong>Caça ao Tesouro</strong><span>cada etapa revela uma nova pista</span></article>
        <article><div>🚀</div><strong>Corrida Espacial</strong><span>progresso e velocidade em destaque</span></article>
        <article><div>🃏</div><strong>Duelo de Cartas</strong><span>rodadas curtas em formato de desafio</span></article>
      </div>
      <button className="v8-link-action" onClick={onStudio}>Criar uma experiência <ArrowRight /></button>
    </section>

    <section className="v8-shell v8-contact-cta">
      <div><Mail /><span><strong>Uma escola quer conversar com a Rede Lua?</strong><small>Suporte, contato institucional e dúvidas em um lugar só.</small></span></div>
      <button onClick={onSupport}>Falar com a equipe <ArrowRight /></button>
    </section>
  </div>;
}
