export function TreeHealthSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 132"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="max-h-[7.5rem]"
      aria-hidden
    >
      <defs>
        <linearGradient id="th-health-fill" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="rgb(46, 139, 87)" stopOpacity="0.85" />
          <stop offset="55%" stopColor="rgb(74, 137, 92)" stopOpacity="0.75" />
          <stop offset="100%" stopColor="rgb(205, 147, 77)" stopOpacity="0.55" />
        </linearGradient>
        <style>{`
          .th-trunk {
            fill: rgba(74, 137, 92, 0.18);
            stroke: rgba(74, 137, 92, 0.7);
            stroke-width: 1.4;
            stroke-linejoin: round;
            transform-origin: 100px 108px;
            transform-box: fill-box;
          }
          .th-canopy {
            fill: rgba(74, 137, 92, 0.16);
            stroke: rgba(74, 137, 92, 0.65);
            stroke-width: 1.35;
            stroke-linejoin: round;
            transform-origin: 100px 88px;
          }
          .th-leaf {
            fill: rgba(46, 139, 87, 0.55);
            stroke: rgba(74, 137, 92, 0.45);
            stroke-width: 0.8;
          }
          .th-meter-bg {
            fill: rgba(14, 14, 14, 0.06);
            stroke: rgba(74, 137, 92, 0.35);
            stroke-width: 1.2;
          }
          .th-meter-fill {
            fill: url(#th-health-fill);
            transform-origin: 25px 102px;
            transform-box: fill-box;
          }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes th-grow-trunk {
              0% { transform: scaleY(0.15); opacity: 0.7; }
              28%, 100% { transform: scaleY(1); opacity: 1; }
            }
            @keyframes th-grow-canopy {
              0%, 18% { transform: scale(0.75); opacity: 0; }
              42%, 100% { transform: scale(1); opacity: 1; }
            }
            @keyframes th-leaf-a {
              0% { transform: translate(0, 0) rotate(-12deg); opacity: 0; }
              12% { opacity: 0.95; }
              100% { transform: translate(-18px, -26px) rotate(-28deg); opacity: 0; }
            }
            @keyframes th-leaf-b {
              0% { transform: translate(0, 0) rotate(8deg); opacity: 0; }
              12% { opacity: 0.9; }
              100% { transform: translate(16px, -30px) rotate(22deg); opacity: 0; }
            }
            @keyframes th-leaf-c {
              0% { transform: translate(0, 0); opacity: 0; }
              14% { opacity: 0.88; }
              100% { transform: translate(-6px, -34px) rotate(6deg); opacity: 0; }
            }
            @keyframes th-leaf-d {
              0% { transform: translate(0, 0); opacity: 0; }
              14% { opacity: 0.88; }
              100% { transform: translate(10px, -28px) rotate(-10deg); opacity: 0; }
            }
            @keyframes th-fill-meter {
              0%, 25% { transform: scaleY(0.08); opacity: 0.86; }
              55%, 100% { transform: scaleY(1); opacity: 1; }
            }
            @keyframes th-meter-pulse {
              0%, 100% { filter: none; opacity: 1; }
              50% { filter: brightness(1.08); opacity: 0.92; }
            }
            @keyframes th-leaf-hova {
              0% { transform: translate(0, 0) scale(1); opacity: 0; }
              18% { opacity: 0.95; }
              100% { transform: translate(-22px, -30px) scale(0.92); opacity: 0; }
            }
            @keyframes th-leaf-hovb {
              0% { transform: translate(0, 0) scale(1); opacity: 0; }
              18% { opacity: 0.95; }
              100% { transform: translate(20px, -32px) scale(0.92); opacity: 0; }
            }
            @keyframes th-leaf-hovc {
              0% { transform: translate(0, 0) scale(1); opacity: 0; }
              18% { opacity: 0.92; }
              100% { transform: translate(-8px, -36px) scale(0.92); opacity: 0; }
            }
            @keyframes th-leaf-hovd {
              0% { transform: translate(0, 0) scale(1); opacity: 0; }
              18% { opacity: 0.92; }
              100% { transform: translate(14px, -30px) scale(0.92); opacity: 0; }
            }

            .th-trunk {
              animation: th-grow-trunk 4s cubic-bezier(0.45, 0, 0.2, 1) infinite;
            }
            .th-canopy {
              animation: th-grow-canopy 4s cubic-bezier(0.45, 0, 0.2, 1) infinite;
            }
            .th-leaf.th-a {
              animation: th-leaf-a 5.2s ease-in-out infinite;
              animation-delay: 0.4s;
            }
            .th-leaf.th-b {
              animation: th-leaf-b 5.8s ease-in-out infinite;
              animation-delay: 1.1s;
            }
            .th-leaf.th-c {
              animation: th-leaf-c 6s ease-in-out infinite;
              animation-delay: 0.2s;
            }
            .th-leaf.th-d {
              animation: th-leaf-d 5.4s ease-in-out infinite;
              animation-delay: 1.6s;
            }
            .th-meter-fill {
              animation: th-fill-meter 4.5s cubic-bezier(0.45, 0, 0.2, 1) infinite;
            }

            .feature-card:hover .th-meter-fill {
              animation: th-fill-meter 4.5s cubic-bezier(0.45, 0, 0.2, 1) infinite,
                th-meter-pulse 2.2s ease-in-out infinite;
            }
            .feature-card:hover .th-leaf.th-a {
              animation: th-leaf-hova 2.4s ease-out infinite;
            }
            .feature-card:hover .th-leaf.th-b {
              animation: th-leaf-hovb 2.6s ease-out infinite;
              animation-delay: 0.2s;
            }
            .feature-card:hover .th-leaf.th-c {
              animation: th-leaf-hovc 2.5s ease-out infinite;
              animation-delay: 0.35s;
            }
            .feature-card:hover .th-leaf.th-d {
              animation: th-leaf-hovd 2.7s ease-out infinite;
              animation-delay: 0.5s;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .th-trunk { transform: scaleY(1); opacity: 1; }
            .th-canopy { transform: scale(1); opacity: 1; }
            .th-meter-fill { transform: scaleY(0.82); }
            .th-leaf { opacity: 0.75; transform: none; }
          }
        `}</style>
      </defs>

      <rect className="th-meter-bg" x="14" y="28" width="22" height="78" rx="5" />
      <rect className="th-meter-fill" x="18" y="42" width="14" height="60" rx="3" />

      <path
        className="th-trunk"
        d="M93.5 108V73.5Q100 67.5 106.5 73.5V108z"
      />

      <path
        className="th-canopy"
        d="M100 32c18 0 32 14 32 32 0 10-4 19-11 25-7-6-14-9-21-9s-14 3-21 9c-7-6-11-15-11-25 0-18 14-32 32-32z"
      />
      <path
        fill="rgba(74,137,92,0.1)"
        stroke="rgba(74,137,92,0.4)"
        strokeWidth="1"
        d="M100 44c12 4 20 14 20 26 0 6-2 11-5 15-5-4-10-6-15-6s-10 2-15 6c-3-4-5-9-5-15 0-12 8-22 20-26z"
      />

      <g transform="translate(100 58)">
        <ellipse className="th-leaf th-a" cx="-14" cy="4" rx="7" ry="4.5" transform="rotate(-25)" />
        <ellipse className="th-leaf th-b" cx="16" cy="2" rx="6.5" ry="4" transform="rotate(18)" />
        <ellipse className="th-leaf th-c" cx="-6" cy="-8" rx="6" ry="3.8" transform="rotate(8)" />
        <ellipse className="th-leaf th-d" cx="10" cy="-6" rx="6.2" ry="3.6" transform="rotate(-12)" />
      </g>
    </svg>
  );
}
