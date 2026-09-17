import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Award, BookOpenCheck, Clock3, Gamepad2, Rocket, Sparkles, Trophy, Users } from "lucide-react";
import { api } from "../api";
import { AvatarVisual } from "./AvatarVisual";
import type { CreatorProfile, DraftQuestion, ExperienceMode, GameConfig, ProfileTheme, QuizTheme, SessionUser, SharedForgeQuestion } from "../types";

export type CreatorTemplate = {
  id: string;
  title: string;
  note: string;
  badge: string;
  mode: ExperienceMode;
  description: string;
  theme: Partial<QuizTheme>;
  game: Partial<GameConfig>;
};

export const CREATOR_TEMPLATES: CreatorTemplate[] = [
  { id:"relampago", title:"Quiz Relâmpago", note:"Perguntas rápidas para revisão no começo ou fim da aula.", badge:"⚡", mode:"classic", description:"Revisão rápida para aquecer a turma e descobrir o que ainda precisa voltar.", theme:{ primary:"#185fd3", secondary:"#ffd23f", background:"#071c45", surface:"#ffffff", pattern:"stars", buttonShape:"rounded", fontStyle:"friendly" }, game:{ timerSeconds:18, enforceTimer:true, speedBonus:true, speedBonusPercent:20, showLeaderboard:true } },
  { id:"chefao", title:"Batalha de Chefão", note:"A turma acerta para derrubar a energia do chefão.", badge:"👾", mode:"lunar_rush", description:"Uma batalha coletiva em que cada resposta certa ajuda a turma a vencer o desafio final.", theme:{ primary:"#6b3fd6", secondary:"#ffb93d", background:"#160d38", surface:"#fff9ef", pattern:"orbit", buttonShape:"pill", fontStyle:"bold" }, game:{ timerSeconds:25, enforceTimer:false, speedBonus:true, speedBonusPercent:15, showLeaderboard:true } },
  { id:"tesouro", title:"Caça ao Tesouro", note:"Cada resposta revela mais uma pista da missão.", badge:"🗺️", mode:"star_hunt", description:"Uma missão por etapas para revisar conteúdo enquanto a turma avança por pistas.", theme:{ primary:"#177c67", secondary:"#ffd34d", background:"#0c2d2a", surface:"#fffdf4", pattern:"grid", buttonShape:"rounded", fontStyle:"friendly" }, game:{ timerSeconds:30, enforceTimer:false, speedBonus:false, showLeaderboard:false } },
  { id:"cartas", title:"Cartas de Desafio", note:"Ritmo mais calmo para pensar antes de responder.", badge:"🃏", mode:"focus", description:"Desafios em formato de cartas para trabalhar raciocínio sem pressão de velocidade.", theme:{ primary:"#b24e75", secondary:"#ffd66b", background:"#3b1730", surface:"#fff8fb", pattern:"dots", buttonShape:"square", fontStyle:"clean" }, game:{ timerSeconds:45, enforceTimer:false, speedBonus:false, showLeaderboard:false } },
];

export function TeacherCreatorHub({ user, subject, onTemplate, onUseShared }: { user: SessionUser; subject: string; onTemplate: (template: CreatorTemplate) => void; onUseShared: (question: SharedForgeQuestion) => void }) {
  const creator = useQuery({ queryKey:["creator-profile",user.id], queryFn:api.creatorProfile, staleTime:20_000, retry:1 });
  const shared = useQuery({ queryKey:["shared-question-bank",subject], queryFn:()=>api.sharedQuestions(subject), staleTime:20_000, retry:1 });
  const data = creator.data;
  const progress = data ? Math.min(100, ((data.stats.creatorXp % 500) / 500) * 100) : 0;

  return <>
    <section className="master-panel">
      <div className="master-card">
        <div className="master-avatar"><AvatarVisual style={user.avatarStyle} seed={user.avatarSeed} config={user.avatarConfig} size={180} alt={`Avatar de ${user.displayName}`} /></div>
        <div className="master-copy"><span>PAINEL DE MESTRE</span><h2>{user.displayName}</h2><p>{user.profileTitle || "Professor da Rede Lua"}</p><div className="master-level"><b>Nível {data?.stats.creatorLevel || 1}</b><div><i style={{width:`${progress}%`}} /></div><small>{data?.stats.creatorXp || 0} XP de educador</small></div></div>
        <div className="master-mini-badges">{data?.badges?.slice(0,3).map((badge)=><span key={badge.id} title={badge.note}><b>{badge.icon}</b>{badge.label}</span>)}{!data?.badges?.length && <span><b>🌱</b>Seu primeiro emblema aparece após criar uma atividade.</span>}</div>
      </div>
      <div className="master-metrics">
        <Metric icon={<Gamepad2 />} value={data?.stats.games || 0} label="partidas aplicadas" />
        <Metric icon={<Users />} value={data?.stats.participants || 0} label="participações" />
        <Metric icon={<Clock3 />} value={data?.stats.minutesPlayed || 0} label="minutos jogados" />
        <Metric icon={<Trophy />} value={`${data?.stats.accuracy || 0}%`} label="média de acerto" />
      </div>
      {!!data?.showcase?.length && <div className="creator-showcase"><div className="section-mini-title"><Award /><div><span>VITRINE DO PROFESSOR</span><strong>Jogos que já ganharam vida</strong></div></div><div>{data.showcase.map((item)=><article key={item.id} style={{["--showcase-accent" as string]:item.theme.secondary}}><span>{item.subject}</span><strong>{item.title}</strong><small>{item.questions} perguntas • {item.plays} partida{item.plays===1?"":"s"}</small></article>)}</div></div>}
    </section>

    <section className="creator-hub-section">
      <div className="section-mini-title"><Rocket /><div><span>HUB DE CRIAÇÃO</span><strong>Comece por um formato, não por uma tela vazia</strong></div></div>
      <div className="creator-template-grid">{CREATOR_TEMPLATES.map((template)=><button key={template.id} onClick={()=>onTemplate(template)}><b>{template.badge}</b><span>{template.title}</span><small>{template.note}</small></button>)}</div>
    </section>

    <section className="shared-bank-section">
      <div className="section-mini-title"><BookOpenCheck /><div><span>BANCO COMPARTILHADO</span><strong>Perguntas de professores da Rede Lua</strong></div></div>
      <p>Use como ponto de partida e mantenha o crédito de quem criou. Você pode adaptar a pergunta antes de publicar.</p>
      {shared.isLoading ? <div className="source-status">Carregando perguntas…</div> : shared.data?.questions.length ? <div className="shared-question-grid">{shared.data.questions.slice(0,6).map((item)=><button key={item.id} onClick={()=>onUseShared(item)}><span>{item.subject}</span><strong>{item.prompt}</strong><small>por {item.creatorName}</small></button>)}</div> : <div className="shared-empty"><Sparkles /><span>Ainda não há perguntas compartilhadas em {subject}. As primeiras podem sair da sua Forja.</span></div>}
    </section>
  </>;
}

function Metric({icon,value,label}:{icon:ReactNode;value:string|number;label:string}){return <article>{icon}<strong>{value}</strong><span>{label}</span></article>}
