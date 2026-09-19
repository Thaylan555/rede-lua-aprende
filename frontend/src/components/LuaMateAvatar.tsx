import type { AvatarConfig } from "../types";

type Props = { seed: string; config: AvatarConfig; alt?: string };

type SpeciesKind =
  | "bear" | "fox" | "penguin" | "capybara" | "owl" | "dragon" | "robot" | "cat"
  | "axolotl" | "bunny" | "monkey" | "yeti" | "panda" | "frog" | "otter" | "raccoon";

type Species = {
  id: string;
  kind: SpeciesKind;
  body: string;
  shade: string;
  cream: string;
  iris: string;
};

const speciesList: Species[] = [
  { id: "moon-bear", kind: "bear", body: "#F4B94D", shade: "#C98624", cream: "#FFE8AD", iris: "#3D78E8" },
  { id: "nebula-fox", kind: "fox", body: "#F18248", shade: "#C9552B", cream: "#FFF0D6", iris: "#4C7D49" },
  { id: "cosmic-penguin", kind: "penguin", body: "#293556", shade: "#111A31", cream: "#FAF8F0", iris: "#47A6FF" },
  { id: "lunar-capybara", kind: "capybara", body: "#B8784F", shade: "#7B452C", cream: "#EFC99D", iris: "#5B382B" },
  { id: "wise-owl", kind: "owl", body: "#B580D7", shade: "#744BA0", cream: "#FFF0C8", iris: "#7855C8" },
  { id: "pocket-dragon", kind: "dragon", body: "#69CB76", shade: "#2A985C", cream: "#D8FFD9", iris: "#5B48CF" },
  { id: "orbit-robot", kind: "robot", body: "#59D3EA", shade: "#2F78BC", cream: "#EFFFFF", iris: "#42EAFF" },
  { id: "astro-cat", kind: "cat", body: "#F2AD47", shade: "#B96928", cream: "#FFECCF", iris: "#3E8B6C" },
  { id: "prism-axolotl", kind: "axolotl", body: "#FF8FBE", shade: "#CF5596", cream: "#FFE8F5", iris: "#6650CF" },
  { id: "star-bunny", kind: "bunny", body: "#D8D5EC", shade: "#948BC2", cream: "#FFF7FB", iris: "#5386DA" },
  { id: "comet-monkey", kind: "monkey", body: "#C17F54", shade: "#784633", cream: "#EEC09A", iris: "#6A4532" },
  { id: "cloud-yeti", kind: "yeti", body: "#DDEBF6", shade: "#84AEC9", cream: "#FFFFFF", iris: "#4E90D8" },
  { id: "panda-pop", kind: "panda", body: "#F8F8F4", shade: "#21263A", cream: "#FFFFFF", iris: "#4D82DB" },
  { id: "frog-orbit", kind: "frog", body: "#79D868", shade: "#3B9D52", cream: "#DBFFD4", iris: "#7756D8" },
  { id: "otter-wave", kind: "otter", body: "#B57A56", shade: "#754A37", cream: "#EBC8A8", iris: "#4485C8" },
  { id: "raccoon-moon", kind: "raccoon", body: "#9AA4B9", shade: "#4A536A", cream: "#E9ECF4", iris: "#4B81DB" },
];

const companions: Record<string, string> = {
  "mini-moon": "🌙", "book-sprite": "📘", "mini-rocket": "🚀", "star-buddy": "⭐",
  "robot-pet": "🤖", "frog-orbit": "🐸", "planet-buddy": "🪐", "pencil-sprite": "✏️",
};

const paletteShifts = [
  { warm: 0, sat: 1 }, { warm: 8, sat: .94 }, { warm: -7, sat: 1.04 }, { warm: 4, sat: 1.08 },
];

function hashSeed(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  return Math.abs(h >>> 0);
}

function configText(config: AvatarConfig, key: string, fallback = "") {
  return typeof config[key] === "string" ? String(config[key]) : fallback;
}

export function LuaMateAvatar({ seed, config, alt = "" }: Props) {
  const hash = hashSeed(seed || "rede-lua");
  const selected = configText(config, "_luaSpecies", speciesList[hash % speciesList.length].id);
  const species = speciesList.find((item) => item.id === selected) || speciesList[0];
  const expression = configText(config, "_luaExpression", ["happy", "curious", "confident", "surprised"][hash % 4]);
  const outfit = configText(config, "_luaOutfit", "academy");
  const companion = configText(config, "_luaCompanion", "none");
  const eyeStyle = configText(config, "_luaEyes", ["spark", "round", "soft", "bold"][hash % 4]);
  const marking = configText(config, "_luaMark", ["blush", "freckles", "star", "none"][hash % 4]);
  const palette = configText(config, "_luaPalette", `p${hash % paletteShifts.length}`);
  const custom = configText(config, "_luaBodyColor");
  const body = /^#[0-9a-f]{6}$/i.test(custom) ? custom : species.body;
  const uid = `lm-${(hash >>> 0).toString(36)}-${species.kind}`;

  return <div className={`lua-mate-v2 lua-mate-${species.kind} lua-expression-${expression} palette-${palette}`} role={alt ? "img" : undefined} aria-label={alt || undefined}>
    <svg viewBox="0 0 320 340" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={`${uid}-bg`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#F6FBFF"/><stop offset=".53" stopColor="#F7F1FF"/><stop offset="1" stopColor="#FFF1BD"/></linearGradient>
        <linearGradient id={`${uid}-fur`} x1=".15" y1=".05" x2=".8" y2="1"><stop stopColor={mixLight(body, .18)}/><stop offset=".55" stopColor={body}/><stop offset="1" stopColor={species.shade}/></linearGradient>
        <linearGradient id={`${uid}-outfit`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={outfitColor(outfit, 0)}/><stop offset="1" stopColor={outfitColor(outfit, 1)}/></linearGradient>
        <radialGradient id={`${uid}-gloss`} cx=".3" cy=".15" r=".9"><stop stopColor="#fff" stopOpacity=".72"/><stop offset=".45" stopColor="#fff" stopOpacity="0"/></radialGradient>
        <filter id={`${uid}-shadow`} x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="9" stdDeviation="9" floodColor="#071C45" floodOpacity=".18"/></filter>
        <filter id={`${uid}-soft`} x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#071C45" floodOpacity=".13"/></filter>
      </defs>

      <rect x="10" y="10" width="300" height="320" rx="88" fill={`url(#${uid}-bg)`}/>
      <circle cx="58" cy="62" r="9" fill="#FFD64A" opacity=".9"/><circle cx="273" cy="83" r="7" fill="#71DFF7" opacity=".85"/>
      <path d="m260 42 3.2 8.2 8.8.5-6.8 5.6 2.2 8.5-7.4-4.7-7.4 4.7 2.2-8.5-6.8-5.6 8.8-.5Z" fill="#8A6CFF" opacity=".85"/>
      <path d="M42 260c43 35 191 45 239-4" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="12" strokeLinecap="round"/>

      <g filter={`url(#${uid}-shadow)`}>
        <g className="lua-v2-body">
          <path d="M93 232c8-39 31-57 67-57 36 0 60 18 68 57l10 72H82Z" fill={`url(#${uid}-outfit)`}/>
          <path d="M105 225c14 13 31 20 55 20s42-7 56-20" fill="none" stroke="#fff" strokeOpacity=".26" strokeWidth="8" strokeLinecap="round"/>
          {outfitDetails(outfit)}
          <path d="M98 248c-22 9-31 30-26 51" fill="none" stroke={outfitColor(outfit, 1)} strokeWidth="25" strokeLinecap="round"/>
          <path d="M222 248c22 9 31 30 26 51" fill="none" stroke={outfitColor(outfit, 1)} strokeWidth="25" strokeLinecap="round"/>
        </g>

        <g className="lua-v2-head">
          {speciesBack(species.kind, body, species.shade, species.cream)}
          {headBase(species.kind, `url(#${uid}-fur)`, body, species.shade, species.cream)}
          <ellipse cx="132" cy="91" rx="42" ry="26" fill={`url(#${uid}-gloss)`} opacity=".44" transform="rotate(-18 132 91)"/>
          {speciesFaceBase(species.kind, species.shade, species.cream)}
          {eyes(expression, eyeStyle, species.iris, species.kind)}
          {markings(marking, species.kind)}
          {noseAndMouth(expression, species.kind, species.shade, species.cream)}
        </g>
      </g>

      <g opacity=".95" filter={`url(#${uid}-soft)`}>
        <circle cx="62" cy="201" r="5" fill="#FF6DA8"/><circle cx="273" cy="201" r="4" fill="#FFD64A"/>
      </g>
    </svg>
    {companion !== "none" && companions[companion] && <span className="lua-mate-companion lua-mate-companion-v2" aria-hidden="true">{companions[companion]}</span>}
  </div>;
}

function mixLight(hex: string, amount: number) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return hex;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.min(255, ((n >> 16) & 255) + Math.round(255 * amount));
  const g = Math.min(255, ((n >> 8) & 255) + Math.round(255 * amount));
  const b = Math.min(255, (n & 255) + Math.round(255 * amount));
  return `#${[r,g,b].map(v => v.toString(16).padStart(2,"0")).join("")}`;
}

function outfitColor(outfit: string, index: 0 | 1) {
  const map: Record<string,[string,string]> = {
    academy:["#2A79E6","#123D8E"], space:["#293C79","#111D45"], science:["#F7FBFF","#B8D9F1"],
    arcade:["#8A55F0","#2BD0E8"], pirate:["#A14B41","#3B2442"], street:["#1769FF","#5A43D6"],
  };
  return (map[outfit] || map.academy)[index];
}

function outfitDetails(outfit: string) {
  if (outfit === "science") return <><path d="M134 192h52l12 112h-76Z" fill="#fff" opacity=".84"/><path d="M151 211h19" stroke="#6B9CC0" strokeWidth="5" strokeLinecap="round"/><circle cx="184" cy="232" r="12" fill="#62D7C0"/><path d="M180 225h8v14h-8z" fill="#fff"/></>;
  if (outfit === "space") return <><path d="M121 209h78v31h-78z" fill="#EAF5FF" opacity=".18"/><circle cx="160" cy="226" r="14" fill="#FFCE42"/><path d="M155 220h10M160 215v21" stroke="#19325F" strokeWidth="4" strokeLinecap="round"/></>;
  if (outfit === "arcade") return <><path d="M119 203h82" stroke="#55F0D5" strokeWidth="8"/><path d="M142 226h36" stroke="#FFD94D" strokeWidth="6" strokeLinecap="round"/><circle cx="132" cy="225" r="5" fill="#FF6CAB"/><circle cx="188" cy="225" r="5" fill="#70E6FF"/></>;
  if (outfit === "pirate") return <><path d="M122 204h76" stroke="#F5C552" strokeWidth="7"/><path d="m145 221 15 12 15-12" fill="none" stroke="#F9E7B2" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></>;
  return <><path d="M124 205h72" stroke="#FFD64A" strokeWidth="7"/><path d="M160 207v34" stroke="#fff" strokeOpacity=".35" strokeWidth="4"/></>;
}

function speciesBack(kind: SpeciesKind, body: string, shade: string, cream: string) {
  if (kind === "bunny") return <><ellipse cx="116" cy="74" rx="29" ry="70" fill={body} stroke={shade} strokeWidth="5" transform="rotate(-8 116 74)"/><ellipse cx="204" cy="74" rx="29" ry="70" fill={body} stroke={shade} strokeWidth="5" transform="rotate(8 204 74)"/><ellipse cx="116" cy="73" rx="12" ry="48" fill="#F6BCD2"/><ellipse cx="204" cy="73" rx="12" ry="48" fill="#F6BCD2"/></>;
  if (kind === "fox" || kind === "cat" || kind === "raccoon") return <><path d="M95 94 78 36l59 43Z" fill={body} stroke={shade} strokeWidth="5" strokeLinejoin="round"/><path d="m225 94 17-58-59 43Z" fill={body} stroke={shade} strokeWidth="5" strokeLinejoin="round"/><path d="M95 79 87 53l28 20M225 79l8-26-28 20" fill={cream} opacity=".86"/></>;
  if (kind === "dragon") return <><path d="m105 82-28-41 5 48M215 82l28-41-5 48" fill={shade} stroke="#275A44" strokeWidth="5" strokeLinejoin="round"/><path d="M130 67 143 31l17 32 18-32 13 36" fill={cream} stroke={shade} strokeWidth="4" strokeLinejoin="round"/></>;
  if (kind === "axolotl") return <><path d="M92 100 47 65l20 48-37 14 52 16M228 100l45-35-20 48 37 14-52 16" fill={shade} stroke="#8E3D73" strokeWidth="5" strokeLinejoin="round"/></>;
  if (kind === "robot") return <><path d="M160 77V45" stroke="#294B79" strokeWidth="7" strokeLinecap="round"/><circle cx="160" cy="35" r="15" fill="#FFD74B" stroke="#294B79" strokeWidth="5"/></>;
  if (kind === "owl") return <><path d="m98 94-30-47 56 29M222 94l30-47-56 29" fill={shade} stroke="#62428C" strokeWidth="5"/></>;
  if (kind === "frog") return <><circle cx="112" cy="76" r="35" fill={body} stroke={shade} strokeWidth="5"/><circle cx="208" cy="76" r="35" fill={body} stroke={shade} strokeWidth="5"/></>;
  return null;
}

function headBase(kind: SpeciesKind, fill: string, body: string, shade: string, cream: string) {
  if (kind === "robot") return <rect x="78" y="75" width="164" height="151" rx="54" fill={fill} stroke="#294B79" strokeWidth="5"/>;
  if (kind === "penguin") return <><ellipse cx="160" cy="148" rx="91" ry="93" fill={shade}/><ellipse cx="160" cy="155" rx="73" ry="75" fill={cream}/></>;
  if (kind === "yeti") return <path d="M69 151c0-69 36-105 91-105 56 0 91 36 91 105v27c0 49-37 73-91 73-55 0-91-24-91-73Z" fill={fill} stroke={shade} strokeWidth="5"/>;
  if (kind === "capybara") return <path d="M67 143c0-58 35-91 93-91s93 33 93 91v35c0 43-39 67-93 67s-93-24-93-67Z" fill={fill} stroke={shade} strokeWidth="5"/>;
  return <ellipse cx="160" cy="149" rx="91" ry="91" fill={fill} stroke={shade} strokeWidth="5"/>;
}

function speciesFaceBase(kind: SpeciesKind, shade: string, cream: string) {
  if (kind === "bear" || kind === "otter") return <><circle cx="97" cy="91" r="27" fill={shade}/><circle cx="223" cy="91" r="27" fill={shade}/><circle cx="97" cy="91" r="14" fill={cream}/><circle cx="223" cy="91" r="14" fill={cream}/><ellipse cx="160" cy="181" rx="49" ry="35" fill={cream} opacity=".94"/></>;
  if (kind === "panda") return <><circle cx="96" cy="86" r="30" fill={shade}/><circle cx="224" cy="86" r="30" fill={shade}/><ellipse cx="124" cy="142" rx="35" ry="47" fill={shade} transform="rotate(18 124 142)"/><ellipse cx="196" cy="142" rx="35" ry="47" fill={shade} transform="rotate(-18 196 142)"/><ellipse cx="160" cy="183" rx="45" ry="31" fill="#fff"/></>;
  if (kind === "raccoon") return <><path d="M87 128c18-23 45-30 73-14-19 25-44 38-73 14ZM233 128c-18-23-45-30-73-14 19 25 44 38 73 14Z" fill={shade} opacity=".96"/><ellipse cx="160" cy="181" rx="43" ry="31" fill={cream}/></>;
  if (kind === "fox") return <path d="M160 222 103 168h114Z" fill={cream} opacity=".92"/>;
  if (kind === "monkey") return <><circle cx="67" cy="150" r="34" fill={shade}/><circle cx="253" cy="150" r="34" fill={shade}/><ellipse cx="160" cy="174" rx="64" ry="56" fill={cream}/></>;
  if (kind === "owl") return <><circle cx="124" cy="145" r="47" fill={cream}/><circle cx="196" cy="145" r="47" fill={cream}/><path d="m160 157-13 18h26Z" fill="#F2A834"/></>;
  if (kind === "frog") return <ellipse cx="160" cy="185" rx="56" ry="31" fill={cream} opacity=".58"/>;
  if (kind === "robot") return <rect x="101" y="105" width="118" height="78" rx="31" fill="#102750"/>;
  return null;
}

function eyes(expression: string, eyeStyle: string, iris: string, kind: SpeciesKind) {
  const y = kind === "robot" ? 140 : kind === "owl" ? 145 : kind === "frog" ? 92 : 143;
  const left = kind === "frog" ? 112 : 126;
  const right = kind === "frog" ? 208 : 194;
  if (expression === "happy") return <><path d={`M${left-16} ${y}q16-19 32 0`} fill="none" stroke={kind === "robot" ? "#66E8FF" : "#17233D"} strokeWidth="8" strokeLinecap="round"/><path d={`M${right-16} ${y}q16-19 32 0`} fill="none" stroke={kind === "robot" ? "#66E8FF" : "#17233D"} strokeWidth="8" strokeLinecap="round"/></>;
  if (expression === "confident") return <><path d={`M${left-17} ${y-7}l34 6`} stroke="#17233D" strokeWidth="8" strokeLinecap="round"/><path d={`M${right-17} ${y-1}l34-6`} stroke="#17233D" strokeWidth="8" strokeLinecap="round"/></>;
  const radius = eyeStyle === "bold" ? 22 : eyeStyle === "soft" ? 19 : 20;
  const pupil = eyeStyle === "spark" ? 9 : 10;
  return <>{[left,right].map((cx) => <g key={cx}><ellipse cx={cx} cy={y} rx={radius} ry={radius + 3} fill="#fff"/><circle cx={cx} cy={y+2} r={13} fill={iris}/><circle cx={cx} cy={y+3} r={pupil} fill="#13213D"/><circle cx={cx-5} cy={y-5} r="5" fill="#fff"/><circle cx={cx+5} cy={y+6} r="2.5" fill="#fff" opacity=".8"/></g>)}</>;
}

function markings(marking: string, kind: SpeciesKind) {
  if (kind === "robot") return null;
  if (marking === "freckles") return <g fill="#935C52" opacity=".45"><circle cx="111" cy="173" r="3"/><circle cx="121" cy="178" r="2.5"/><circle cx="209" cy="173" r="3"/><circle cx="199" cy="178" r="2.5"/></g>;
  if (marking === "star") return <path d="m94 169 4 8 9 1-6.5 6.3 1.5 8.7-8-4.2-8 4.2 1.5-8.7L81 178l9-1Z" fill="#FFD34D" opacity=".9"/>;
  if (marking === "blush") return <><ellipse cx="101" cy="174" rx="20" ry="9" fill="#FF7C9B" opacity=".28"/><ellipse cx="219" cy="174" rx="20" ry="9" fill="#FF7C9B" opacity=".28"/></>;
  return null;
}

function noseAndMouth(expression: string, kind: SpeciesKind, shade: string, cream: string) {
  const noseY = kind === "robot" ? 175 : 176;
  if (kind === "owl") return <path d="M139 195q21 18 42 0" fill="none" stroke="#17233D" strokeWidth="6" strokeLinecap="round"/>;
  if (kind === "frog") return <><circle cx="144" cy="164" r="4" fill="#356E42"/><circle cx="176" cy="164" r="4" fill="#356E42"/><path d="M124 193q36 31 72 0" fill="#FF7996" stroke="#17373A" strokeWidth="5" strokeLinecap="round"/></>;
  if (kind === "robot") {
    if (expression === "surprised") return <circle cx="160" cy="190" r="12" fill="#65E9FF"/>;
    return <path d="M132 189h56" stroke="#65E9FF" strokeWidth="8" strokeLinecap="round"/>;
  }
  const nose = kind === "penguin" ? <path d="m160 165-15 13h30Z" fill="#F1A83A"/> : <ellipse cx="160" cy={noseY} rx={kind === "capybara" ? 17 : 13} ry={kind === "capybara" ? 11 : 10} fill={shade}/>;
  const mouth = expression === "surprised"
    ? <ellipse cx="160" cy="204" rx="13" ry="18" fill="#762B43"/>
    : expression === "curious"
      ? <path d="M143 205q17 9 34 0" fill="none" stroke="#762B43" strokeWidth="6" strokeLinecap="round"/>
      : <path d="M135 201q25 28 50 0c-10 8-40 8-50 0Z" fill="#762B43" stroke="#5A2135" strokeWidth="3"/>;
  return <>{nose}{mouth}{expression === "happy" && <path d="M149 210q11 7 22 0" stroke="#fff" strokeWidth="5" strokeLinecap="round"/>}</>;
}
