export function AnalyticsSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 130"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="max-h-[7.5rem]"
      aria-hidden
    >
      <defs>
        <linearGradient id="an-bar-fade" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(74, 137, 92)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="rgb(74, 137, 92)" stopOpacity="0.06" />
        </linearGradient>
        <style>{`
          .an-grid { stroke: rgba(14, 14, 14, 0.07); stroke-width: 1; }
          .an-line { fill: none; stroke: rgb(74, 137, 92); stroke-width: 2.2; stroke-linecap: round; stroke-linejoin: round; }
          .an-scan { fill: rgba(205, 147, 77, 0.22); mix-blend-mode: multiply; }
          .an-bar { fill: url(#an-bar-fade); transform-origin: bottom center; transform-box: fill-box; }
          .an-dot { fill: rgb(74, 137, 92); stroke: rgba(255,255,255,0.85); stroke-width: 1.6; }
          .an-ripple { fill: none; stroke: rgba(205, 147, 77, 0.45); stroke-width: 1.2; opacity: 0; }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes an-draw {
              0% { stroke-dashoffset: 120; }
              100% { stroke-dashoffset: 0; }
            }
            @keyframes an-bar-rise {
              0%, 8% { transform: scaleY(0.15); opacity: 0.35; }
              100% { transform: scaleY(1); opacity: 1; }
            }
            @keyframes an-scan-move {
              0% { transform: translateX(-86px); opacity: 0; }
              8% { opacity: 1; }
              92% { opacity: 1; }
              100% { transform: translateX(86px); opacity: 0; }
            }
            @keyframes an-dot-in {
              0%, 35% { transform: scale(0); opacity: 0; }
              55% { transform: scale(1.12); opacity: 1; }
              70%, 100% { transform: scale(1); opacity: 1; }
            }
            @keyframes an-ripple-pulse {
              0%, 100% { transform: scale(0.75); opacity: 0; }
              40% { transform: scale(1.35); opacity: 0.55; }
              70% { transform: scale(1.6); opacity: 0; }
            }

            .an-line {
              stroke-dasharray: 120;
              stroke-dashoffset: 120;
              animation: an-draw 4s cubic-bezier(0.45, 0, 0.2, 1) infinite;
            }
            .an-bar:nth-of-type(1) { animation: an-bar-rise 4.2s ease-out infinite; animation-delay: 0s; }
            .an-bar:nth-of-type(2) { animation: an-bar-rise 4.2s ease-out infinite; animation-delay: 0.12s; }
            .an-bar:nth-of-type(3) { animation: an-bar-rise 4.2s ease-out infinite; animation-delay: 0.24s; }
            .an-bar:nth-of-type(4) { animation: an-bar-rise 4.2s ease-out infinite; animation-delay: 0.36s; }
            .an-bar:nth-of-type(5) { animation: an-bar-rise 4.2s ease-out infinite; animation-delay: 0.48s; }

            .an-scan {
              animation: an-scan-move 5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }
            .feature-card:hover .an-scan {
              animation-duration: 2.6s;
            }

            .an-dot-wrap:nth-child(1) .an-dot { animation: an-dot-in 4s ease-out infinite; animation-delay: 0.5s; }
            .an-dot-wrap:nth-child(1) .an-ripple { animation: an-ripple-pulse 4s ease-out infinite; animation-delay: 0.55s; }
            .an-dot-wrap:nth-child(2) .an-dot { animation: an-dot-in 4s ease-out infinite; animation-delay: 1.1s; }
            .an-dot-wrap:nth-child(2) .an-ripple { animation: an-ripple-pulse 4s ease-out infinite; animation-delay: 1.15s; }
            .an-dot-wrap:nth-child(3) .an-dot { animation: an-dot-in 4s ease-out infinite; animation-delay: 1.65s; }
            .an-dot-wrap:nth-child(3) .an-ripple { animation: an-ripple-pulse 4s ease-out infinite; animation-delay: 1.7s; }

            .feature-card:hover .an-dot-wrap .an-ripple {
              animation-duration: 2s;
            }
            .feature-card:hover .an-dot-wrap .an-dot {
              animation-duration: 2s;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .an-line { stroke-dashoffset: 0; }
            .an-bar { transform: scaleY(1); opacity: 0.85; }
            .an-scan { opacity: 0.35; transform: translateX(0); }
          }
        `}</style>
      </defs>

      <g opacity="0.9">
        <line className="an-grid" x1="36" y1="28" x2="176" y2="28" />
        <line className="an-grid" x1="36" y1="52" x2="176" y2="52" />
        <line className="an-grid" x1="36" y1="76" x2="176" y2="76" />
        <line className="an-grid" x1="36" y1="100" x2="176" y2="100" />
        <line className="an-grid" x1="52" y1="16" x2="52" y2="108" />
        <line className="an-grid" x1="92" y1="16" x2="92" y2="108" />
        <line className="an-grid" x1="132" y1="16" x2="132" y2="108" />
        <line className="an-grid" x1="172" y1="16" x2="172" y2="108" />
      </g>

      <g transform="translate(0 104)" opacity="0.35">
        <rect className="an-bar" x="44" y="-32" width="10" height="32" rx="2" />
        <rect className="an-bar" x="64" y="-38" width="10" height="38" rx="2" />
        <rect className="an-bar" x="84" y="-28" width="10" height="28" rx="2" />
        <rect className="an-bar" x="104" y="-42" width="10" height="42" rx="2" />
        <rect className="an-bar" x="124" y="-34" width="10" height="34" rx="2" />
      </g>

      <path
        className="an-line"
        d="M48 88 C68 72, 78 68, 92 58 S118 38, 132 44 S158 28, 172 22"
      />

      <rect className="an-scan" x="92" y="18" width="3" height="92" rx="1.5" />

      <g className="an-dot-wrap">
        <circle className="an-ripple" cx="92" cy="58" r="14" />
        <circle className="an-dot" cx="92" cy="58" r="5" />
      </g>
      <g className="an-dot-wrap">
        <circle className="an-ripple" cx="132" cy="44" r="14" />
        <circle className="an-dot" cx="132" cy="44" r="5" />
      </g>
      <g className="an-dot-wrap">
        <circle className="an-ripple" cx="172" cy="22" r="14" />
        <circle className="an-dot" cx="172" cy="22" r="5" />
      </g>
    </svg>
  );
}
