export function TeamSVG() {
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
        <style>{`
          .tm-edge { stroke: rgba(74, 137, 92, 0.42); stroke-width: 1.35; stroke-linecap: round; fill: none; }
          .tm-node { fill: rgba(74, 137, 92, 0.14); stroke: rgba(74, 137, 92, 0.72); stroke-width: 1.35; }
          .tm-admin {
            fill: rgba(74, 137, 92, 0.22);
            stroke: rgba(74, 137, 92, 0.88);
            stroke-width: 1.65;
            transform-origin: 100px 74px;
          }
          .tm-orbit { fill: none; stroke: rgba(205, 147, 77, 0.45); stroke-width: 1; stroke-dasharray: 3 5; }
          .tm-orbit-dot { fill: rgb(205, 147, 77); }
          .tm-travel { fill: rgb(74, 137, 92); offset-rotate: 0deg; }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes tm-breathe-a {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.07); }
            }
            @keyframes tm-breathe-b {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.06); }
            }
            @keyframes tm-orbit-spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
            @keyframes tm-glow-node {
              0%, 100% {
                stroke: rgba(74, 137, 92, 0.72);
                filter: none;
              }
              50% {
                stroke: rgba(74, 137, 92, 0.98);
                filter: drop-shadow(0 0 5px rgba(74, 137, 92, 0.35));
              }
            }
            @keyframes tm-travel-a {
              0% { offset-distance: 0%; }
              100% { offset-distance: 100%; }
            }
            @keyframes tm-travel-b {
              0% { offset-distance: 0%; }
              100% { offset-distance: 100%; }
            }

            .tm-n1 {
              animation: tm-breathe-a 4.8s ease-in-out infinite;
              transform-origin: 100px 38px;
            }
            .tm-n2 {
              animation: tm-breathe-b 5.2s ease-in-out infinite;
              animation-delay: 0.35s;
              transform-origin: 54px 74px;
            }
            .tm-n3 {
              animation: tm-breathe-a 5s ease-in-out infinite;
              animation-delay: 0.7s;
              transform-origin: 146px 74px;
            }
            .tm-n4 {
              animation: tm-breathe-b 5.4s ease-in-out infinite;
              animation-delay: 0.2s;
              transform-origin: 72px 106px;
            }
            .tm-n5 {
              animation: tm-breathe-a 4.6s ease-in-out infinite;
              animation-delay: 0.55s;
              transform-origin: 128px 106px;
            }
            .tm-admin-breathe {
              animation: tm-breathe-b 5s ease-in-out infinite;
            }

            .tm-orbit-g {
              transform-origin: 100px 74px;
              animation: tm-orbit-spin 6s linear infinite;
            }
            .feature-card:hover .tm-orbit-g {
              animation-duration: 3.2s;
            }

            .feature-card:hover .tm-node {
              animation: tm-glow-node 2.4s ease-in-out infinite;
            }
            .feature-card:hover .tm-admin {
              animation: tm-glow-node 2.4s ease-in-out infinite;
            }

            .tm-t1 {
              offset-path: path("M 100 49 L 100 56");
              animation: tm-travel-a 5s linear infinite;
            }
            .tm-t2 {
              offset-path: path("M 82 74 L 64 74");
              animation: tm-travel-b 5.6s linear infinite;
              animation-delay: 0.3s;
              fill: rgb(205, 147, 77);
            }
            .tm-t3 {
              offset-path: path("M 118 74 L 136 74");
              animation: tm-travel-a 6s linear infinite;
              animation-delay: 0.6s;
            }
            .tm-t4 {
              offset-path: path("M 94 88 L 78 100");
              animation: tm-travel-b 6.4s linear infinite;
              animation-delay: 0.9s;
              fill: rgb(205, 147, 77);
            }

            .feature-card:hover .tm-travel.tm-t1,
            .feature-card:hover .tm-travel.tm-t2,
            .feature-card:hover .tm-travel.tm-t3,
            .feature-card:hover .tm-travel.tm-t4 {
              animation-duration: 2.6s;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .tm-n1,
            .tm-n2,
            .tm-n3,
            .tm-n4,
            .tm-n5,
            .tm-admin {
              transform: none !important;
              animation: none !important;
            }
            .tm-orbit-g {
              animation: none !important;
            }
            .tm-travel {
              display: none;
            }
          }
        `}</style>
      </defs>

      <path
        className="tm-edge"
        d="M100 49 L100 56 M82 74 L64 74 M118 74 L136 74 M94 88 L78 100 M106 88 L122 100"
      />

      <circle className="tm-node tm-n1" cx="100" cy="38" r="11" />
      <circle className="tm-node tm-n2" cx="54" cy="74" r="10" />
      <circle className="tm-node tm-n3" cx="146" cy="74" r="10" />
      <circle className="tm-node tm-n4" cx="72" cy="106" r="9.5" />
      <circle className="tm-node tm-n5" cx="128" cy="106" r="9.5" />

      <circle className="tm-admin tm-admin-breathe" cx="100" cy="74" r="18" />

      <g className="tm-orbit-g">
        <circle className="tm-orbit" cx="100" cy="74" r="28" />
        <circle className="tm-orbit-dot" cx="128" cy="74" r="3.5" />
      </g>

      <circle className="tm-travel tm-t1" r="3.2" cx="0" cy="0" />
      <circle className="tm-travel tm-t2" r="3" cx="0" cy="0" />
      <circle className="tm-travel tm-t3" r="3" cx="0" cy="0" />
      <circle className="tm-travel tm-t4" r="2.8" cx="0" cy="0" />
    </svg>
  );
}
