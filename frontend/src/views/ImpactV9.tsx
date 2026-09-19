import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Activity, ArrowRight, BarChart3, BookOpenCheck, BrainCircuit, Gamepad2, GraduationCap, HeartPulse, ShieldCheck, Sparkles, UsersRound } from "lucide-react";
import { api } from "../api";
import type { SessionUser } from "../types";

export function ImpactV9({ user, onStudio, onLearn }: { user: SessionUser | null; onStudio: () => void; onLearn: () => void }) {
  const teacher = useQuery({ queryKey: ["impact-teacher-v9", user?.id], queryFn: async () => ({ creator: await api.creatorProfile(), radar: await api.teacherRadar(30) }), enabled: Boolean(user && (user.role === "teacher" || user.role === "admin")), staleTime: 30_000 });
  const student = useQuery({ queryKey: ["impact-student-v9", user?.id], queryFn: async () => ({ constellation: await api.studentConstellation(), player: await api.playerProfile() }), enabled: Boolean(user && user.role === "student"), staleTime: 30_000 });

  const isTeacher = user?.role === "teacher" || user?.role === "admin";
  const radar = teacher.data?.radar;
  const creator = teacher.data?.creator;
  const constellation = student.data?.constellation;
  const player = student.data?.player;

  return <div className="v9-impact v9-page-width">
    <header className="v9-impact-hero">
      <div><span className="v9-badge"><BarChart3 /> PAINEL DE IMPACTO</span><h1>Um jeito de mostrar pra diretoria que isso aqui é <em>mais que quiz.</em></h1><p>Aprendizagem, autoria do professor, engajamento e segurança aparecem como sistemas observáveis — sem transformar aluno em só uma nota.</p></div>
      <div className="v9-impact-seal"><ShieldCheck /><strong>Projeto demonstrável</strong><small>dados reais quando há uso • sem número inventado</small></div>
    </header>

    <section className="v9-impact-pillars">
      {[
        ["🧠","Aprendizagem ativa","Erro gera pista e nova tentativa. O gabarito não é entregue antes da construção do raciocínio."],
        ["🎮","Edutainment com propósito","Minigames mudam a apresentação da atividade, enquanto o professor continua controlando o conteúdo."],
        ["🧭","Sinais pedagógicos","Domínio, tentativas e pontos de dificuldade ajudam o professor a decidir o que revisar."],
        ["🎨","Autoria docente","Professor escolhe tema, identidade visual, modo de jogo, questões, tempo e mídia."],
        ["🌙","Identidade e progressão","LuaID, Recordes, inventário e Nova Vida constroem vínculo sem depender de prêmio aleatório."],
        ["🛡️","Ambiente escolar","Perfis moderados, funções por papel, RLS no banco e gestão administrativa separada."],
      ].map(([icon,title,body], i) => <motion.article key={title} initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i*.04 }}><span>{icon}</span><h3>{title}</h3><p>{body}</p></motion.article>)}
    </section>

    {user && <section className="v9-impact-live">
      <div className="v9-section-mini"><div><span>DADOS DA CONTA ATUAL</span><h2>{isTeacher ? "Impacto pedagógico do professor" : "Jornada de aprendizagem do aluno"}</h2></div><Activity /></div>
      {isTeacher ? <div className="v9-impact-metrics">
        <article><UsersRound /><strong>{radar?.summary.participants || 0}</strong><small>participações registradas</small></article>
        <article><Gamepad2 /><strong>{radar?.summary.games || 0}</strong><small>salas aplicadas</small></article>
        <article><BookOpenCheck /><strong>{creator?.stats.activities || 0}</strong><small>atividades criadas</small></article>
        <article><BrainCircuit /><strong>{radar?.summary.accuracy || 0}%</strong><small>acerto agregado</small></article>
        <article><HeartPulse /><strong>{radar?.hotspots.length || 0}</strong><small>pontos de atenção mapeados</small></article>
      </div> : <div className="v9-impact-metrics">
        <article><Gamepad2 /><strong>{player?.gamesCompleted || 0}</strong><small>missões concluídas</small></article>
        <article><BrainCircuit /><strong>{constellation?.mastery.length || 0}</strong><small>matérias mapeadas</small></article>
        <article><BookOpenCheck /><strong>{player?.answers || 0}</strong><small>respostas registradas</small></article>
        <article><Sparkles /><strong>{player?.accuracy || 0}%</strong><small>acerto geral</small></article>
        <article><HeartPulse /><strong>{user.streakDays}</strong><small>dias de sequência</small></article>
      </div>}
      <div className="v9-impact-note"><Sparkles /><p><b>Importante:</b> quando ainda não há uso suficiente, a plataforma mostra zero em vez de inventar “números bonitos” para apresentação.</p></div>
    </section>}

    <section className="v9-impact-story">
      <div className="v9-section-heading"><span>ROTEIRO PRA MOSTRAR O PROJETO</span><h2>Uma aula deixa rastros úteis.</h2></div>
      <div className="v9-story-line">
        <article><b>1</b><GraduationCap /><h3>Professor cria</h3><p>Escolhe conteúdo, modo, visual e objetivo.</p></article><i />
        <article><b>2</b><Gamepad2 /><h3>Turma participa</h3><p>Joga, reage, tenta, acerta e erra.</p></article><i />
        <article><b>3</b><BrainCircuit /><h3>Sistema aprende</h3><p>Registra dificuldade e evolução por matéria.</p></article><i />
        <article><b>4</b><BarChart3 /><h3>Professor decide</h3><p>Vê onde revisar e o que funcionou.</p></article>
      </div>
    </section>

    <section className="v9-impact-cta"><div><span>PRONTO PRA DEMONSTRAR</span><h2>{isTeacher ? "Abre o Studio e cria uma experiência na hora." : "Entra numa missão e mostra a aprendizagem acontecendo."}</h2></div><button className="v9-cta primary" onClick={isTeacher ? onStudio : onLearn}>{isTeacher ? "Abrir Studio" : "Abrir Aprender"} <ArrowRight /></button></section>
  </div>;
}
