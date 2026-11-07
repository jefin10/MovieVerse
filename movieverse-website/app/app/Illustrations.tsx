// Line illustrations, one per feature. White on black; motion lives in app.css.

export function SwipeArt() {
  return (
    <svg className="art art-swipe" viewBox="0 0 320 240" fill="none" aria-hidden>
      <g className="art-swipe-back">
        <rect x="96" y="44" width="112" height="160" rx="14" transform="rotate(-11 152 124)" />
        <rect x="108" y="42" width="112" height="160" rx="14" transform="rotate(-4 164 122)" />
      </g>
      <g className="art-swipe-card">
        <rect x="118" y="38" width="112" height="160" rx="14" className="art-fill" />
        <rect x="130" y="52" width="88" height="96" rx="7" className="art-dim" />
        <path d="M130 162h62M130 176h38" />
        <path className="art-heart" d="M174 92c-6-11-22-7-22 5 0 10 14 18 22 25 8-7 22-15 22-25 0-12-16-16-22-5z" />
      </g>
      <path className="art-dash" d="M58 206c58 26 150 26 214-22" />
      <path d="M272 184l-3 15M272 184l-15-1" />
      <g className="art-pulse">
        <circle cx="50" cy="96" r="3" />
        <path d="M34 72l-8-8M66 72l8-8M50 62V50" />
      </g>
    </svg>
  );
}

export function MoodArt() {
  const inputs = [52, 92, 132, 172];
  const outputs = [
    { y: 44, label: "Comedy" },
    { y: 92, label: "Horror" },
    { y: 140, label: "Sci-Fi" },
    { y: 188, label: "Drama" },
  ];
  return (
    <svg className="art art-mood" viewBox="0 0 320 240" fill="none" aria-hidden>
      <rect x="10" y="88" width="84" height="56" rx="16" className="art-fill" />
      <path d="M26 108h52M26 122h34" />
      <path d="M36 144l-6 15 20-15" />
      {inputs.map((y) =>
        outputs.map((o) => (
          <path key={`${y}-${o.y}`} className="art-link" d={`M150 ${y + 8}C182 ${y + 8} 186 ${o.y} 216 ${o.y}`} />
        )),
      )}
      {inputs.map((y) => (
        <path key={y} className="art-link" d={`M94 116C114 116 122 ${y + 8} 150 ${y + 8}`} />
      ))}
      {inputs.map((y, i) => (
        <circle key={y} cx="150" cy={y + 8} r="5" className="art-node" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      {outputs.map((o, i) => (
        <g key={o.y} className={i === 1 ? "art-chosen" : "art-option"}>
          <rect x="216" y={o.y - 13} width="90" height="26" rx="13" />
          <text x="261" y={o.y + 4.5} textAnchor="middle">
            {o.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function TasteArt() {
  const signals = [
    { x: 54, y: 66, label: "Genre" },
    { x: 54, y: 120, label: "Director" },
    { x: 54, y: 174, label: "Cast" },
  ];
  return (
    <svg className="art art-taste" viewBox="0 0 320 240" fill="none" aria-hidden>
      <circle cx="160" cy="120" r="82" className="art-orbit" />
      <circle cx="160" cy="120" r="52" className="art-orbit art-orbit-b" />
      {signals.map((s) => (
        <path key={s.label} className="art-link" d={`M${s.x + 46} ${s.y}C130 ${s.y} 128 120 160 120`} />
      ))}
      {signals.map((s) => (
        <g key={s.label} className="art-option">
          <rect x={s.x - 44} y={s.y - 13} width="90" height="26" rx="13" />
          <text x={s.x + 1} y={s.y + 4.5} textAnchor="middle">
            {s.label}
          </text>
        </g>
      ))}
      <circle cx="160" cy="120" r="20" className="art-core" />
      <path className="art-core-star" d="M160 109l3.3 7 7.7.9-5.7 5.2 1.5 7.6-6.8-3.8-6.8 3.8 1.5-7.6-5.7-5.2 7.7-.9z" />
      {[60, 120, 180].map((y, i) => (
        <g key={y} style={{ animationDelay: `${i * 0.3}s` }} className="art-result">
          <path d={`M180 120C206 120 208 ${y} 236 ${y}`} className="art-link" />
          <rect x="236" y={y - 21} width="30" height="42" rx="5" className="art-fill" />
          <path d={`M274 ${y - 8}h${34 - i * 8}M274 ${y + 6}h${22 - i * 6}`} />
        </g>
      ))}
    </svg>
  );
}

export function WatchlistArt() {
  return (
    <svg className="art art-watch" viewBox="0 0 320 240" fill="none" aria-hidden>
      <g className="art-strip">
        <rect x="44" y="28" width="150" height="184" rx="10" className="art-fill" />
        {[40, 62, 84, 106, 128, 150, 172, 194].map((y) => (
          <g key={y}>
            <rect x="52" y={y} width="8" height="11" rx="2" className="art-hole" />
            <rect x="178" y={y} width="8" height="11" rx="2" className="art-hole" />
          </g>
        ))}
        <rect x="70" y="40" width="98" height="48" rx="4" className="art-dim" />
        <rect x="70" y="96" width="98" height="48" rx="4" className="art-dim" />
        <rect x="70" y="152" width="98" height="48" rx="4" className="art-dim" />
      </g>
      <path className="art-ribbon" d="M212 54h60v128l-30-22-30 22z" />
      <path className="art-check" d="M228 96l11 12 19-24" />
      <path className="art-dash" d="M196 120h14" />
    </svg>
  );
}

export function ProjectorArt() {
  return (
    <svg className="art art-projector" viewBox="0 0 640 300" fill="none" aria-hidden>
      <defs>
        <linearGradient id="mv-beam" x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".5" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path className="art-beam" d="M196 128L640 20v240L196 158z" fill="url(#mv-beam)" stroke="none" />
      <g className="art-reel" style={{ transformOrigin: "78px 70px" }}>
        <circle cx="78" cy="70" r="46" />
        <circle cx="78" cy="70" r="7" />
        <circle cx="78" cy="42" r="10" />
        <circle cx="78" cy="98" r="10" />
        <circle cx="50" cy="70" r="10" />
        <circle cx="106" cy="70" r="10" />
      </g>
      <g className="art-reel" style={{ transformOrigin: "156px 78px" }}>
        <circle cx="156" cy="78" r="34" />
        <circle cx="156" cy="78" r="6" />
        <circle cx="156" cy="57" r="8" />
        <circle cx="156" cy="99" r="8" />
        <circle cx="135" cy="78" r="8" />
        <circle cx="177" cy="78" r="8" />
      </g>
      <rect x="40" y="116" width="156" height="58" rx="10" className="art-fill" />
      <rect x="196" y="126" width="24" height="34" rx="4" className="art-fill" />
      <path d="M60 134h40M60 148h24" />
      <circle cx="166" cy="144" r="10" />
      <path d="M78 174l-22 66M160 174l22 66M36 240h168" />
    </svg>
  );
}
