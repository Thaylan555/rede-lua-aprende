import { motion } from "motion/react";
import {
  ArrowRight, BarChart3, BookOpenCheck, BrainCircuit, Gamepad2, GraduationCap,
  Orbit, Play, Rocket, Sparkles, Trophy, UserRound, WandSparkles
} from "lucide-react";
import { LumiMoment } from "../components/LumiMoment";
import { AvatarVisual } from "../components/AvatarVisual";
import { useRegionalVoice } from "../regionalVoice";
import type { SessionUser } from "../types";

const reveal = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: .2 } };

export function HomeV9({
  user, code, setCode, onJoin, onLearn, onStudio, onProfile, onRecords, onImpact,
}: {
  user: SessionUser | null;
  code: string;
  setCode: (value: string) => void;
  onJoin: () => void;
  onLearn: () => void;
  onStudio: () => void;
  onProfile: () => void;
  onRecords: () => void;
  onImpact: () => void;
}) {
  const voice = useRegionalVoice();
  return <div className="v9-home">
    <section className="v9-hero v9-page-width">
      <motion.div className="v9-hero-copy" initial={{ opacity: 0, x: -28 }} animate={{ opacity: 1, x: 0 }} transition={{ type: "spring", stiffness: 150, damping: 18 }}>
        <div className="v9-badge"><Sparkles /> REDE LUA • NOVA ERA</div>
        <h1>{voice.say("hero")} <em>Sem gabarito mastigado.</em></h1>
        <p>Aprender, jogar, criar e evoluir viraram partes da mesma jornada. Cada pessoa tem um LuaID, recordes, uma vida atual e um caminho que muda conforme ela aprende.</p>
        <div className="v9-hero-actions">
          <button className="v9-cta primary" onClick={onLearn}><BrainCircuit /> Começar a aprender <ArrowRight /></button>
          <button className="v9-cta ghost" onClick={onStudio}><GraduationCap /> Abrir Studio</button>
        </div>
        <div className="v9-hero-mini">
          <span><BookOpenCheck /> aprende sem entregar resposta</span>
          <span><Trophy /> recordes pessoais</span>
          <span><Orbit /> nova vida do avatar</span>
        </div>
      </motion.div>

      <motion.div className="v9-hero-stage" initial={{ opacity: 0, scale: .94, rotate: 1 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ delay: .08, type: "spring", stiffness: 110, damping: 16 }}>
        <div className="v9-stage-glow" />
        <div className="v9-stage-card main">
          <span className="v9-stage-label">AGORA NA REDE LUA</span>
          <div className="v9-stage-avatar">
            {user ? <AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={150} compact /> : <div className="v9-demo-moon">🌙</div>}
          </div>
          <h3>{user ? user.displayName : "Seu LuaMate entra aqui"}</h3>
          <p>{user ? `Vida ${user.lifeNumber} • Nível ${user.level}` : "Crie, personalize, jogue e deixe seu recorde."}</p>
          <div className="v9-stage-bars"><i style={{ width: user ? `${Math.min(100, (user.lifeXp / Math.max(1, 600 + (user.lifeNumber - 1) * 250)) * 100)}%` : "46%" }} /></div>
        </div>
        <motion.div className="v9-float-card one" animate={{ y: [0, -10, 0], rotate: [-2, 1, -2] }} transition={{ duration: 4.6, repeat: Infinity, ease: "easeInOut" }}><span>🏆</span><b>RECORD</b><small>{voice.say("record")}</small></motion.div>
        <motion.div className="v9-float-card two" animate={{ y: [0, 12, 0], rotate: [2, -1, 2] }} transition={{ duration: 5.4, repeat: Infinity, ease: "easeInOut" }}><span>🧠</span><b>SEM COLA</b><small>Errou? Ganha pista, não gabarito.</small></motion.div>
        <motion.div className="v9-float-card three" animate={{ x: [0, 8, 0] }} transition={{ duration: 4.9, repeat: Infinity, ease: "easeInOut" }}><span>✨</span><b>NOVA VIDA</b><small>Seu personagem pode renascer.</small></motion.div>
      </motion.div>
    </section>

    <section className="v9-join-strip">
      <div className="v9-page-width v9-join-inner">
        <div><span>ENTRAR NUMA SALA</span><strong>Tem PIN? Então bora.</strong></div>
        <div className="v9-pin-box"><input value={code} onChange={e => setCode(e.target.value.toUpperCase())} placeholder="LUA-4821" maxLength={9} /><button onClick={onJoin}><Play /> Entrar</button></div>
        <small>Sem conta também dá pra participar de uma partida ao vivo.</small>
      </div>
    </section>

    <motion.section className="v9-page-width v9-paths" {...reveal}>
      <div className="v9-section-heading"><span>TRÊS JEITOS DE VIVER A REDE LUA</span><h2>Não é uma landing page. É uma plataforma.</h2><p>Cada papel entra numa experiência diferente — mas tudo conversa pelo mesmo progresso.</p></div>
      <div className="v9-path-grid">
        <article className="student"><div className="v9-path-icon"><BrainCircuit /></div><span>ALUNO</span><h3>Aprender sem resposta pronta.</h3><p>Pistas, tentativas, domínio por matéria, LuaMates, Recordes e Nova Vida.</p><button onClick={onLearn}>Entrar na trilha <ArrowRight /></button></article>
        <article className="teacher"><div className="v9-path-icon"><WandSparkles /></div><span>PROFESSOR</span><h3>Transformar conteúdo em experiência.</h3><p>Quiz, chefão, caça ao tesouro, corrida, cartas, dados da turma e criação visual.</p><button onClick={onStudio}>Criar no Studio <ArrowRight /></button></article>
        <article className="director"><div className="v9-path-icon"><BarChart3 /></div><span>DIRETORIA</span><h3>Ver aprendizagem acontecendo.</h3><p>Engajamento, autoria docente, progressão, segurança e sinais pedagógicos em um só lugar.</p><button onClick={onImpact}>Ver impacto <ArrowRight /></button></article>
      </div>
    </motion.section>

    <motion.section className="v9-world v9-page-width" {...reveal}>
      <div className="v9-world-copy"><span>NOVA MECÂNICA</span><h2>Seu avatar tem <em>vidas</em>, não só roupa.</h2><p>Quando a vida atual alcança a meta de XP, o personagem pode renascer. O visual equipado recomeça, mas o legado fica: recordes, inventário, estrelas e histórico continuam com você.</p><div className="v9-world-actions"><button onClick={onRecords}><Trophy /> Abrir Recordes e Vidas</button><button onClick={onProfile}><UserRound /> Meu LuaID</button></div></div>
      <div className="v9-life-demo">
        <div className="v9-life-node done"><b>VIDA 1</b><span>🌱</span><small>começo</small></div><i />
        <div className="v9-life-node done"><b>VIDA 2</b><span>🛸</span><small>legado +1</small></div><i />
        <div className="v9-life-node active"><b>VIDA 3</b><span>🐲</span><small>em curso</small></div><i />
        <div className="v9-life-node"><b>PRÓXIMA</b><span>✨</span><small>?</small></div>
      </div>
    </motion.section>

    <motion.section className="v9-page-width v9-systems" {...reveal}>
      <div className="v9-section-heading"><span>SISTEMAS QUE DÃO ASSUNTO NA APRESENTAÇÃO</span><h2>Tem coisa pra aluno, professor e direção.</h2></div>
      <div className="v9-system-grid">
        {[
          ["🧠","Trilha sem gabarito","A pessoa erra, recebe uma pista e tenta de novo. A resposta só aparece quando o raciocínio chega lá."],
          ["🎮","Studio de experiências","Professor escolhe modo de jogo, tema, perguntas, tempo, mídia e identidade visual."],
          ["🏆","Recorde Lua","Melhor pontuação, sequência, nível, carreira e histórico de vidas ficam registrados."],
          ["🪐","Nova Vida","O avatar renasce e a progressão de vida recomeça sem apagar conquistas permanentes."],
          ["📡","Pulse da turma","Reações ao vivo e sinais de engajamento deixam a sala menos silenciosa e mais observável."],
          ["🧭","Mapa de aprendizagem","Domínio por matéria mostra onde vale revisar sem transformar aluno em nota ambulante."],
        ].map(([icon,title,text]) => <article key={title}><span>{icon}</span><h3>{title}</h3><p>{text}</p></article>)}
      </div>
    </motion.section>

    <section className="v9-page-width v9-lumi-section"><LumiMoment kind="smile" /><div><span>LUMI TÁ DE OLHO 👀</span><h2>Aprender não precisa ter cara de formulário.</h2><p>Tem humor, avatar, missão, reação, recorde e um pouco de “uai” e “oxente” — sem transformar a aula em bagunça.</p></div><button onClick={onProfile}><Rocket /> Montar meu universo</button></section>
  </div>;
}
