import type { AvatarConfig } from "../types";

type Props = { seed: string; config: AvatarConfig; alt?: string };

type Species = {
  id: string;
  body: string;
  accent: string;
  inner: string;
  kind: "bear" | "fox" | "penguin" | "capybara" | "owl" | "dragon" | "robot" | "cat" | "axolotl" | "bunny" | "monkey" | "yeti";
};

const speciesList: Species[] = [
  { id: "moon-bear", body: "#f5c24b", accent: "#d99c22", inner: "#ffe9aa", kind: "bear" },
  { id: "nebula-fox", body: "#f58a45", accent: "#c75b28", inner: "#fff0cf", kind: "fox" },
  { id: "cosmic-penguin", body: "#27365d", accent: "#101a36", inner: "#f7f5ed", kind: "penguin" },
  { id: "lunar-capybara", body: "#bd7a4f", accent: "#8c5030", inner: "#f4cf9f", kind: "capybara" },
  { id: "wise-owl", body: "#b98bd9", accent: "#8056a8", inner: "#fff0c8", kind: "owl" },
  { id: "pocket-dragon", body: "#6dce72", accent: "#2b9b63", inner: "#d7ffd7", kind: "dragon" },
  { id: "orbit-robot", body: "#63d9ef", accent: "#2b75ba", inner: "#eefcff", kind: "robot" },
  { id: "astro-cat", body: "#f5b14a", accent: "#bd6f27", inner: "#fff0d1", kind: "cat" },
  { id: "prism-axolotl", body: "#ff91c2", accent: "#d85f9f", inner: "#ffe8f5", kind: "axolotl" },
  { id: "star-bunny", body: "#d9d7ef", accent: "#9a91c8", inner: "#fff7fb", kind: "bunny" },
  { id: "comet-monkey", body: "#c78557", accent: "#7c4934", inner: "#f2c49f", kind: "monkey" },
  { id: "cloud-yeti", body: "#dbeaf5", accent: "#8cb5d0", inner: "#ffffff", kind: "yeti" },
];

const companions: Record<string, string> = {
  "mini-moon": "🌙",
  "book-sprite": "📘",
  "mini-rocket": "🚀",
  "star-buddy": "⭐",
  "robot-pet": "🤖",
  "frog-orbit": "🐸",
  "planet-buddy": "🪐",
};

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Math.abs(h >>> 0);
}

export function LuaMateAvatar({ seed, config, alt = "" }: Props) {
  const hash = hashSeed(seed || "rede-lua");
  const selected = typeof config._luaSpecies === "string" ? String(config._luaSpecies) : speciesList[hash % speciesList.length].id;
  const species = speciesList.find((item) => item.id === selected) || speciesList[0];
  const expression = typeof config._luaExpression === "string" ? String(config._luaExpression) : ["happy", "curious", "confident", "surprised"][hash % 4];
  const outfit = typeof config._luaOutfit === "string" ? String(config._luaOutfit) : "academy";
  const companion = typeof config._luaCompanion === "string" ? String(config._luaCompanion) : "none";
  const custom = typeof config._luaBodyColor === "string" ? String(config._luaBodyColor) : "";
  const body = /^#[0-9a-f]{6}$/i.test(custom) ? custom : species.body;

  return <div className={`lua-mate lua-mate-${species.kind} lua-expression-${expression}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
    <svg viewBox="0 0 220 220" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`mateBg-${species.id}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#eef7ff"/><stop offset="1" stopColor="#fff5cf"/></linearGradient>
        <linearGradient id={`mateOutfit-${outfit}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={outfit === "arcade" ? "#7447e7" : outfit === "science" ? "#ecf6ff" : outfit === "space" ? "#21396d" : outfit === "pirate" ? "#7f3b32" : "#1a5db0"}/><stop offset="1" stopColor={outfit === "arcade" ? "#36d9ef" : outfit === "science" ? "#b9dcf5" : outfit === "space" ? "#0c1d43" : outfit === "pirate" ? "#2f1d2b" : "#0b2d68"}/></linearGradient>
      </defs>
      <rect x="6" y="6" width="208" height="208" rx="55" fill={`url(#mateBg-${species.id})`} />
      <g className="mate-back-detail">{backDetail(species.kind, body, species.accent, species.inner)}</g>
      <ellipse cx="110" cy="186" rx="62" ry="26" fill={`url(#mateOutfit-${outfit})`} stroke="#071c45" strokeWidth="6" />
      {outfitDetail(outfit)}
      <g className="mate-head">
        {headShape(species.kind, body, species.accent, species.inner)}
        {faceFeatures(expression, species.kind)}
      </g>
      <g opacity=".9"><circle cx="43" cy="45" r="4" fill="#ffcf45"/><circle cx="178" cy="39" r="3" fill="#65e8ff"/><circle cx="184" cy="86" r="5" fill="#a77cff"/></g>
    </svg>
    {companion !== "none" && companions[companion] && <span className="lua-mate-companion" aria-hidden="true">{companions[companion]}</span>}
  </div>;
}

function headShape(kind: Species["kind"], body: string, accent: string, inner: string) {
  if (kind === "robot") return <>
    <rect x="51" y="48" width="118" height="112" rx="40" fill={body} stroke="#071c45" strokeWidth="7" />
    <rect x="67" y="65" width="86" height="58" rx="24" fill="#102550" />
    <path d="M110 48V29" stroke="#071c45" strokeWidth="6" strokeLinecap="round"/><circle cx="110" cy="23" r="10" fill="#ffcf45" stroke="#071c45" strokeWidth="5"/>
    <circle cx="55" cy="92" r="12" fill={accent} stroke="#071c45" strokeWidth="5"/><circle cx="165" cy="92" r="12" fill={accent} stroke="#071c45" strokeWidth="5"/>
  </>;
  if (kind === "penguin") return <>
    <ellipse cx="110" cy="105" rx="63" ry="70" fill={accent} stroke="#071c45" strokeWidth="7" />
    <ellipse cx="110" cy="112" rx="48" ry="54" fill={inner} />
    <ellipse cx="110" cy="126" rx="14" ry="10" fill="#f0a934" stroke="#071c45" strokeWidth="4" />
  </>;
  if (kind === "axolotl") return <>
    <path d="M55 80 28 58l14 35-25 12 34 13M165 80l27-22-14 35 25 12-34 13" fill={accent} stroke="#071c45" strokeWidth="6" strokeLinejoin="round" />
    <rect x="48" y="47" width="124" height="117" rx="54" fill={body} stroke="#071c45" strokeWidth="7" />
  </>;
  if (kind === "dragon") return <>
    <path d="m75 57-25-24 4 36M145 57l25-24-4 36" fill={accent} stroke="#071c45" strokeWidth="6" strokeLinejoin="round" />
    <path d="M82 48 96 22l14 30 14-30 14 29" fill={inner} stroke="#071c45" strokeWidth="5" strokeLinejoin="round" />
    <rect x="48" y="49" width="124" height="114" rx="49" fill={body} stroke="#071c45" strokeWidth="7" />
  </>;
  if (kind === "fox" || kind === "cat") return <>
    <path d="M59 66 47 28l39 28M161 66l12-38-39 28" fill={body} stroke="#071c45" strokeWidth="7" strokeLinejoin="round" />
    <path d="M59 57 54 41l18 12M161 57l5-16-18 12" fill={inner} />
    <rect x="48" y="49" width="124" height="114" rx="50" fill={body} stroke="#071c45" strokeWidth="7" />
    {kind === "fox" && <path d="M110 155 77 126h66Z" fill={inner} opacity=".9" />}
  </>;
  if (kind === "bunny") return <>
    <ellipse cx="77" cy="44" rx="19" ry="44" fill={body} stroke="#071c45" strokeWidth="7" transform="rotate(-10 77 44)"/><ellipse cx="143" cy="44" rx="19" ry="44" fill={body} stroke="#071c45" strokeWidth="7" transform="rotate(10 143 44)"/>
    <ellipse cx="77" cy="44" rx="8" ry="29" fill="#f4b8ce"/><ellipse cx="143" cy="44" rx="8" ry="29" fill="#f4b8ce"/>
    <rect x="48" y="57" width="124" height="106" rx="52" fill={body} stroke="#071c45" strokeWidth="7" />
  </>;
  if (kind === "owl") return <>
    <path d="M54 71 40 43l35 17M166 71l14-28-35 17" fill={accent} stroke="#071c45" strokeWidth="6"/>
    <rect x="48" y="50" width="124" height="114" rx="49" fill={body} stroke="#071c45" strokeWidth="7" />
    <circle cx="82" cy="99" r="28" fill={inner}/><circle cx="138" cy="99" r="28" fill={inner}/><path d="m110 103-10 13h20Z" fill="#f0a934" stroke="#071c45" strokeWidth="3"/>
  </>;
  if (kind === "capybara") return <>
    <ellipse cx="65" cy="63" rx="17" ry="19" fill={body} stroke="#071c45" strokeWidth="6"/><ellipse cx="155" cy="63" rx="17" ry="19" fill={body} stroke="#071c45" strokeWidth="6"/>
    <rect x="42" y="55" width="136" height="108" rx="46" fill={body} stroke="#071c45" strokeWidth="7" />
    <ellipse cx="110" cy="128" rx="38" ry="26" fill={inner}/>
  </>;
  if (kind === "monkey") return <>
    <circle cx="47" cy="102" r="25" fill={body} stroke="#071c45" strokeWidth="7"/><circle cx="173" cy="102" r="25" fill={body} stroke="#071c45" strokeWidth="7"/>
    <rect x="48" y="49" width="124" height="114" rx="50" fill={body} stroke="#071c45" strokeWidth="7" />
    <ellipse cx="110" cy="119" rx="44" ry="39" fill={inner}/>
  </>;
  if (kind === "yeti") return <>
    <path d="M43 95c0-41 22-64 67-64 44 0 67 23 67 64v32c0 27-24 43-67 43-44 0-67-16-67-43Z" fill={body} stroke="#071c45" strokeWidth="7" />
    <path d="m48 77-14 18 17 4-13 18 17 1M172 77l14 18-17 4 13 18-17 1" fill="none" stroke={accent} strokeWidth="7" strokeLinecap="round"/>
    <ellipse cx="110" cy="116" rx="47" ry="41" fill={inner}/>
  </>;
  return <>
    <circle cx="64" cy="67" r="24" fill={body} stroke="#071c45" strokeWidth="7"/><circle cx="156" cy="67" r="24" fill={body} stroke="#071c45" strokeWidth="7"/>
    <circle cx="64" cy="67" r="10" fill={inner}/><circle cx="156" cy="67" r="10" fill={inner}/>
    <rect x="48" y="49" width="124" height="114" rx="52" fill={body} stroke="#071c45" strokeWidth="7" />
  </>;
}

function faceFeatures(expression: string, kind: Species["kind"]) {
  const dark = kind === "robot" ? "#65e9ff" : "#071c45";
  const eyeY = kind === "robot" ? 94 : 101;
  const eyes = expression === "happy"
    ? <><path d={`M72 ${eyeY}q10-12 20 0`} fill="none" stroke={dark} strokeWidth="7" strokeLinecap="round"/><path d={`M128 ${eyeY}q10-12 20 0`} fill="none" stroke={dark} strokeWidth="7" strokeLinecap="round"/></>
    : expression === "confident"
      ? <><path d={`M72 ${eyeY-5}l21 4`} stroke={dark} strokeWidth="7" strokeLinecap="round"/><path d={`M128 ${eyeY-1}l21-4`} stroke={dark} strokeWidth="7" strokeLinecap="round"/></>
      : expression === "surprised"
        ? <><circle cx="83" cy={eyeY} r="9" fill={dark}/><circle cx="139" cy={eyeY} r="9" fill={dark}/></>
        : <><circle cx="83" cy={eyeY} r="8" fill={dark}/><circle cx="139" cy={eyeY} r="8" fill={dark}/><circle cx="86" cy={eyeY-3} r="2.5" fill="#fff"/><circle cx="142" cy={eyeY-3} r="2.5" fill="#fff"/></>;
  const mouth = expression === "surprised"
    ? <ellipse cx="111" cy="133" rx="10" ry="13" fill="#7c2b3f" stroke="#071c45" strokeWidth="4"/>
    : expression === "confident"
      ? <path d="M91 132q20 9 40-3" fill="none" stroke="#071c45" strokeWidth="6" strokeLinecap="round"/>
      : expression === "curious"
        ? <path d="M95 135q15-8 31 0" fill="none" stroke="#071c45" strokeWidth="6" strokeLinecap="round"/>
        : <path d="M88 128q22 28 45 0" fill="#fff" stroke="#071c45" strokeWidth="5" strokeLinejoin="round"/>;
  return <>{eyes}{kind !== "robot" && kind !== "penguin" && kind !== "owl" && <ellipse cx="111" cy="119" rx="8" ry="6" fill="#6f3f30"/>}{mouth}</>;
}

function backDetail(kind: Species["kind"], body: string, accent: string, inner: string) {
  if (kind === "dragon") return <><path d="M50 130 19 111l17 42Z" fill={body} stroke="#071c45" strokeWidth="6"/><path d="M170 130 201 111l-17 42Z" fill={body} stroke="#071c45" strokeWidth="6"/></>;
  if (kind === "fox") return <path d="M166 139c39 8 38 42 10 48-17 3-28-9-23-21 5-11 18-7 18 2" fill="none" stroke={accent} strokeWidth="18" strokeLinecap="round"/>;
  if (kind === "yeti") return <><circle cx="43" cy="141" r="19" fill={inner} stroke="#071c45" strokeWidth="6"/><circle cx="177" cy="141" r="19" fill={inner} stroke="#071c45" strokeWidth="6"/></>;
  return null;
}

function outfitDetail(outfit: string) {
  if (outfit === "science") return <><path d="M78 172v27M142 172v27" stroke="#ffffff" strokeWidth="9"/><path d="M102 169v31" stroke="#5598c5" strokeWidth="4"/><circle cx="121" cy="187" r="6" fill="#ffcf45"/></>;
  if (outfit === "space") return <><path d="M76 176h68" stroke="#65e9ff" strokeWidth="5"/><circle cx="110" cy="187" r="13" fill="#ffcf45" stroke="#071c45" strokeWidth="4"/><path d="m110 178 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#fff"/></>;
  if (outfit === "pirate") return <><path d="M74 177h72" stroke="#f4c24d" strokeWidth="6"/><path d="M110 169v31" stroke="#fff0d2" strokeWidth="5"/></>;
  if (outfit === "arcade") return <><rect x="91" y="176" width="38" height="20" rx="7" fill="#101935" stroke="#071c45" strokeWidth="4"/><circle cx="103" cy="186" r="4" fill="#35f2b5"/><circle cx="119" cy="186" r="4" fill="#ff5d8f"/></>;
  return <path d="M84 178h52" stroke="#ffcf45" strokeWidth="6" strokeLinecap="round"/>;
}

export const LUA_MATE_SPECIES = speciesList.map(({ id, kind }) => ({ id, kind }));
