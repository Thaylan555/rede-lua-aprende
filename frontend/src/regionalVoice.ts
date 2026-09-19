import { useEffect, useMemo, useState } from "react";

export type RegionalVoice = "mix" | "mineiro" | "baiano" | "neutro";

const KEY = "rede-lua-regional-voice";

const phrases = {
  hero: {
    neutro: "Aprender ficou com cara de jogo de verdade.",
    mineiro: "Uai, aprender ficou com cara de jogo de verdade.",
    baiano: "Oxente, aprender ficou com cara de jogo de verdade.",
    mix: "Uai, oxente… aprender ficou com cara de jogo de verdade.",
  },
  record: {
    neutro: "Bora quebrar seu próprio recorde?",
    mineiro: "Uai, bora quebrar esse recorde, sô?",
    baiano: "Oxente, bora passar desse recorde?",
    mix: "Uai… oxente… bora bater esse recorde?",
  },
  nextMission: {
    neutro: "Tem missão nova te esperando.",
    mineiro: "Tem missão nova te esperando, uai.",
    baiano: "Tem missão nova te esperando, bora simbora.",
    mix: "Tem missão nova te esperando. Bora, uai!",
  },
  rebirthReady: {
    neutro: "Sua próxima vida já pode começar.",
    mineiro: "Uai, seu boneco já tá pronto pra uma vida nova.",
    baiano: "Oxente, seu boneco já tá pronto pra nascer de novo.",
    mix: "Uai, oxente… já dá pra começar uma vida novinha.",
  },
  empty: {
    neutro: "Ainda não tem nada aqui. Mas isso muda rapidinho.",
    mineiro: "Tá vazio por enquanto, uai. Daqui a pouco enche.",
    baiano: "Tá vazio agora, visse? Daqui a pouco aparece coisa boa.",
    mix: "Tá vazio por enquanto. Uai, daqui a pouco aparece coisa boa.",
  },
  teacher: {
    neutro: "Crie uma experiência que a turma vai lembrar.",
    mineiro: "Monta um trem bão que a turma vai lembrar.",
    baiano: "Monta uma aula arretada que a turma vai lembrar.",
    mix: "Monta um trem arretado que a turma vai lembrar.",
  },
  learnHeader: {
    neutro: "Hoje é dia de entender — não só acertar.",
    mineiro: "Uai, hoje é dia de entender o trem — não só acertar.",
    baiano: "Oxente, hoje é dia de entender de verdade — não só marcar opção.",
    mix: "Uai, oxente… hoje é dia de entender de verdade.",
  },
  teacherHeader: {
    neutro: "Da ideia à sala sem virar uma planilha infinita.",
    mineiro: "Da ideia à sala sem virar aquele trem infinito, uai.",
    baiano: "Da ideia à sala sem aperreio e sem formulário sem fim.",
    mix: "Da ideia à sala sem aperreio e sem aquele trem infinito.",
  },
  retry: {
    neutro: "Ainda não. Bora por outro caminho.",
    mineiro: "Ainda não, uai. Bora por outro caminho.",
    baiano: "Oxente, ainda não. Tenta por outro caminho.",
    mix: "Uai, ainda não. Oxente, bora por outro caminho.",
  },
  win: {
    neutro: "Mandou muito bem!",
    mineiro: "Uai, cê mandou bem demais!",
    baiano: "Oxente, mandou bem demais!",
    mix: "Uai! Mandou bem demais, oxente!",
  },
} as const;

export type VoicePhrase = keyof typeof phrases;

export function readVoiceMode(): RegionalVoice {
  const saved = localStorage.getItem(KEY);
  return saved === "mineiro" || saved === "baiano" || saved === "neutro" || saved === "mix" ? saved : "mix";
}

export function setVoiceMode(mode: RegionalVoice) {
  localStorage.setItem(KEY, mode);
  window.dispatchEvent(new CustomEvent("rede-lua:voice-change", { detail: mode }));
}

export function useRegionalVoice() {
  const [mode, setModeState] = useState<RegionalVoice>(() => readVoiceMode());
  useEffect(() => {
    const sync = (event: Event) => setModeState(((event as CustomEvent).detail || readVoiceMode()) as RegionalVoice);
    window.addEventListener("rede-lua:voice-change", sync);
    return () => window.removeEventListener("rede-lua:voice-change", sync);
  }, []);
  return useMemo(() => ({
    mode,
    setMode: (next: RegionalVoice) => { setVoiceMode(next); setModeState(next); },
    say: (key: VoicePhrase) => phrases[key][mode],
  }), [mode]);
}
