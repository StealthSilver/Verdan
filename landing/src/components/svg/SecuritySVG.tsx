export function SecuritySVG() {
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
        <linearGradient id="sc-border-sheen" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="rgb(74, 137, 92)" stopOpacity="0.35" />
          <stop offset="50%" stopColor="rgb(205, 147, 77)" stopOpacity="0.65" />
          <stop offset="100%" stopColor="rgb(74, 137, 92)" stopOpacity="0.35" />
        </linearGradient>
        <style>{`
          .sc-shield-fill {
            fill: rgba(74, 137, 92, 0.1);
            stroke: rgba(74, 137, 92, 0.55);
            stroke-width: 1.35;
            stroke-linejoin: round;
          }
          .sc-shield-border {
            fill: none;
            stroke: url(#sc-border-sheen);
            stroke-width: 2.4;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
          .sc-scan {
            fill: rgba(205, 147, 77, 0.18);
            mix-blend-mode: multiply;
          }
          .sc-body {
            fill: rgba(74, 137, 92, 0.18);
            stroke: rgba(74, 137, 92, 0.72);
            stroke-width: 1.35;
            stroke-linejoin: round;
          }
          .sc-shackle {
            fill: none;
            stroke: rgba(74, 137, 92, 0.78);
            stroke-width: 1.6;
            stroke-linecap: round;
            transform-origin: 100px 62px;
          }
          .sc-particle {
            fill: rgba(205, 147, 77, 0.65);
          }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes sc-dash-spin {
              to { stroke-dashoffset: -124; }
            }
            @keyframes sc-shackle-close {
              0%, 18% { transform: rotate(18deg); }
              42%, 72% { transform: rotate(0deg); }
              100% { transform: rotate(18deg); }
            }
            @keyframes sc-scan-move {
              0% { transform: translateY(-46px); opacity: 0; }
              15% { opacity: 1; }
              85% { opacity: 1; }
              100% { transform: translateY(46px); opacity: 0; }
            }
            @keyframes sc-orbit-a {
              from { transform: rotate(0deg) translateX(34px) rotate(0deg); }
              to { transform: rotate(360deg) translateX(34px) rotate(-360deg); }
            }
            @keyframes sc-orbit-b {
              from { transform: rotate(40deg) translateX(26px) rotate(-40deg); }
              to { transform: rotate(400deg) translateX(26px) rotate(-400deg); }
            }
            @keyframes sc-orbit-c {
              from { transform: rotate(120deg) translateX(40px) rotate(-120deg); }
              to { transform: rotate(480deg) translateX(40px) rotate(-480deg); }
            }
            @keyframes sc-border-glow {
              0%, 100% { stroke-width: 2.4; filter: drop-shadow(0 0 0 rgba(74, 137, 92, 0)); }
              50% { stroke-width: 2.8; filter: drop-shadow(0 0 6px rgba(205, 147, 77, 0.45)); }
            }

            .sc-shield-border {
              stroke-dasharray: 62 62;
              stroke-dashoffset: 0;
              animation: sc-dash-spin 5s linear infinite;
            }
            .feature-card:hover .sc-shield-border {
              animation:
                sc-dash-spin 2.8s linear infinite,
                sc-border-glow 2.4s ease-in-out infinite;
            }

            .sc-shackle {
              animation: sc-shackle-close 5.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }

            .sc-scan {
              animation: sc-scan-move 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }

            .sc-orbit-g {
              transform-origin: 100px 72px;
            }
            .sc-particles .sc-orbit-g:nth-child(1) {
              animation: sc-orbit-a 9s linear infinite;
            }
            .sc-particles .sc-orbit-g:nth-child(2) {
              animation: sc-orbit-b 11s linear infinite;
            }
            .sc-particles .sc-orbit-g:nth-child(3) {
              animation: sc-orbit-c 13s linear infinite;
            }
            .sc-particles .sc-orbit-g:nth-child(4) {
              animation: sc-orbit-a 10s linear infinite reverse;
              animation-delay: 1s;
            }
            .sc-particles .sc-orbit-g:nth-child(5) {
              animation: sc-orbit-b 10.5s linear infinite reverse;
              animation-delay: 0.4s;
            }
            .sc-particles .sc-orbit-g:nth-child(6) {
              animation: sc-orbit-c 12s linear infinite reverse;
              animation-delay: 0.8s;
            }
            .sc-particles .sc-orbit-g:nth-child(7) {
              animation: sc-orbit-a 8.5s linear infinite;
              animation-delay: 1.2s;
            }
            .sc-particles .sc-orbit-g:nth-child(8) {
              animation: sc-orbit-b 9.5s linear infinite;
              animation-delay: 1.6s;
            }

            .feature-card:hover .sc-particles .sc-orbit-g {
              animation-duration: 5s !important;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .sc-shield-border {
              stroke-dasharray: 124;
              stroke-dashoffset: 0;
            }
            .sc-shackle {
              transform: rotate(0deg);
            }
            .sc-scan {
              opacity: 0.35;
              transform: translateY(0);
            }
            .sc-particles .sc-orbit-g {
              animation: none !important;
            }
          }
        `}</style>
      </defs>

      <path
        className="sc-shield-fill"
        d="M100 22c18 5 30 18 30 34v28c0 22-18 38-30 44-12-6-30-22-30-44V56c0-16 12-29 30-34z"
      />
      <path
        className="sc-shield-border"
        d="M100 22c18 5 30 18 30 34v28c0 22-18 38-30 44-12-6-30-22-30-44V56c0-16 12-29 30-34z"
      />

      <rect className="sc-scan" x="72" y="56" width="56" height="3" rx="1.5" />

      <g className="sc-particles">
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="2.4" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="2" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="2.2" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="1.8" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" fill="rgb(74,137,92)" cx="100" cy="72" r="2" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="1.6" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" fill="rgb(74,137,92)" cx="100" cy="72" r="1.8" />
        </g>
        <g className="sc-orbit-g">
          <circle className="sc-particle" cx="100" cy="72" r="2.1" />
        </g>
      </g>

      <path
        className="sc-shackle"
        d="M86 62c0-8 6.2-14 14-14s14 6 14 14"
      />

      <path
        className="sc-body"
        d="M82 68h36c3 0 5.5 2.5 5.5 5.5v18c0 6.5-5.5 11.5-12 11.5h-23c-6.5 0-12-5-12-11.5v-18c0-3 2.5-5.5 5.5-5.5z"
      />
      <path
        fill="none"
        stroke="rgba(74,137,92,0.35)"
        strokeWidth="1"
        d="M92 88h16"
      />
    </svg>
  );
}
