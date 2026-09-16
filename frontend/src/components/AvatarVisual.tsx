import { buildAvatarUrl } from "../avatar";
import type { AvatarConfig, AvatarStyle } from "../types";

type Props = {
  style: AvatarStyle;
  seed: string;
  config: AvatarConfig;
  size?: number;
  alt?: string;
  compact?: boolean;
  className?: string;
};

const textValue = (config: AvatarConfig, key: string) => typeof config[key] === "string" ? String(config[key]) : "none";

export function AvatarVisual({ style, seed, config, size = 320, alt = "", compact = false, className = "" }: Props) {
  const head = textValue(config, "_luaHead");
  const face = textValue(config, "_luaFace");
  const aura = textValue(config, "_luaAura");
  const frame = textValue(config, "_luaFrame");

  return <div className={`lua-avatar ${compact ? "lua-avatar-compact" : ""} aura-${aura} frame-${frame} ${className}`.trim()}>
    <div className="lua-avatar-base"><img src={buildAvatarUrl(style, seed, config, size)} alt={alt} /></div>
    {!compact && aura !== "none" && <Aura kind={aura} />}
    {!compact && head !== "none" && <HeadGear kind={head} />}
    {!compact && face !== "none" && <FaceGear kind={face} />}
  </div>;
}

function Aura({ kind }: { kind: string }) {
  if (kind === "stars") return <div className="lua-aura lua-aura-stars" aria-hidden="true"><i /><i /><i /><i /><i /></div>;
  if (kind === "pixels") return <div className="lua-aura lua-aura-pixels" aria-hidden="true"><i /><i /><i /><i /><i /><i /></div>;
  if (kind === "neon") return <div className="lua-aura lua-aura-neon" aria-hidden="true" />;
  if (kind === "cosmic") return <div className="lua-aura lua-aura-cosmic" aria-hidden="true"><i /><i /></div>;
  return null;
}

function HeadGear({ kind }: { kind: string }) {
  if (kind === "pirate-hat") return <svg className="lua-gear lua-head-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M17 34c15-5 19-20 33-20s20 15 33 20c-5 7-15 11-33 11S22 41 17 34Z" fill="#102548" stroke="#071c45" strokeWidth="3" />
    <path d="M22 34h56" stroke="#f8be35" strokeWidth="5" strokeLinecap="round" />
    <path d="M42 28c5 2 11 2 16 0" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    <circle cx="47" cy="25" r="2.5" fill="#fff" /><circle cx="55" cy="25" r="2.5" fill="#fff" />
  </svg>;
  if (kind === "headset") return <svg className="lua-gear lua-head-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M26 51c0-24 10-36 24-36s24 12 24 36" fill="none" stroke="#182d61" strokeWidth="7" strokeLinecap="round" />
    <rect x="17" y="45" width="15" height="27" rx="7" fill="#31d3ff" stroke="#071c45" strokeWidth="3" />
    <rect x="68" y="45" width="15" height="27" rx="7" fill="#8f5cff" stroke="#071c45" strokeWidth="3" />
    <path d="M78 65c7 2 9 7 4 11" fill="none" stroke="#071c45" strokeWidth="3" strokeLinecap="round" />
  </svg>;
  if (kind === "wizard-hat") return <svg className="lua-gear lua-head-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M34 37 54 5l12 35Z" fill="#6546c7" stroke="#24145c" strokeWidth="3" />
    <path d="M22 40c15-6 42-7 57 0-7 8-50 9-57 0Z" fill="#3a267f" stroke="#24145c" strokeWidth="3" />
    <path d="m51 20 2 4 5 .7-3.5 3.4.8 4.9-4.3-2.3-4.3 2.3.8-4.9-3.5-3.4 5-.7Z" fill="#ffe36b" />
  </svg>;
  if (kind === "street-cap") return <svg className="lua-gear lua-head-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M27 33c3-15 13-22 26-22 14 0 23 9 24 24-15-3-34-3-50-2Z" fill="#155bd7" stroke="#071c45" strokeWidth="3" />
    <path d="M53 34c17-4 28-2 35 3-9 5-23 6-35 2Z" fill="#ffd449" stroke="#071c45" strokeWidth="3" />
  </svg>;
  if (kind === "robot-antenna") return <svg className="lua-gear lua-head-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50 34V15" stroke="#071c45" strokeWidth="4" strokeLinecap="round" />
    <circle cx="50" cy="11" r="7" fill="#41e5ff" stroke="#071c45" strokeWidth="3" />
    <path d="M35 31 25 20M65 31l10-11" stroke="#071c45" strokeWidth="4" strokeLinecap="round" />
    <circle cx="23" cy="18" r="4" fill="#ffcc3a" /><circle cx="77" cy="18" r="4" fill="#ff62b0" />
  </svg>;
  return null;
}

function FaceGear({ kind }: { kind: string }) {
  if (kind === "eyepatch") return <svg className="lua-gear lua-face-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M22 37 78 56" stroke="#101c31" strokeWidth="3" strokeLinecap="round" opacity=".94" />
    <path d="M57 42c8-2 15 2 18 8-3 7-9 11-16 10-6-2-9-8-8-13 1-2 3-4 6-5Z" fill="#101c31" stroke="#050a13" strokeWidth="2.5" />
    <path d="m61 47 2 3 4 .5-3 2.7.7 4-3.7-2-3.7 2 .7-4-3-2.7 4-.5Z" fill="#ffd449" />
  </svg>;
  if (kind === "neon-visor") return <svg className="lua-gear lua-face-gear" viewBox="0 0 100 100" aria-hidden="true">
    <defs><linearGradient id="visorGlow" x1="0" x2="1"><stop stopColor="#32e5ff"/><stop offset="1" stopColor="#af58ff"/></linearGradient></defs>
    <path d="M25 43c16-6 34-6 50 0l-3 15c-14 5-30 5-44 0Z" fill="url(#visorGlow)" fillOpacity=".65" stroke="#071c45" strokeWidth="3" />
    <path d="M32 48h35" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity=".8" />
  </svg>;
  if (kind === "star-glasses") return <svg className="lua-gear lua-face-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="m34 40 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Zm32 0 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z" fill="#ffd449" stroke="#071c45" strokeWidth="2" />
    <path d="M40 49h20" stroke="#071c45" strokeWidth="3" />
  </svg>;
  if (kind === "mask") return <svg className="lua-gear lua-face-gear" viewBox="0 0 100 100" aria-hidden="true">
    <path d="M27 44c14-7 32-7 46 0-1 10-8 18-23 18S28 54 27 44Z" fill="#172a5b" fillOpacity=".9" stroke="#071c45" strokeWidth="3" />
    <path d="M34 48c5-3 10-3 14 0M53 48c5-3 10-3 14 0" stroke="#65e9ff" strokeWidth="3" strokeLinecap="round" />
  </svg>;
  return null;
}
