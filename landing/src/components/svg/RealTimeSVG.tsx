export function RealTimeSVG() {
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
        <style>{`
          .rt-bell {
            fill: rgba(74, 137, 92, 0.14);
            stroke: rgba(74, 137, 92, 0.78);
            stroke-width: 1.45;
            stroke-linejoin: round;
            transform-origin: 100px 38px;
          }
          .rt-clapper {
            fill: rgba(74, 137, 92, 0.22);
            stroke: rgba(74, 137, 92, 0.65);
            stroke-width: 1.2;
          }
          .rt-wave {
            fill: none;
            stroke: rgba(205, 147, 77, 0.45);
            stroke-width: 1.35;
            stroke-linecap: round;
            transform-origin: 100px 46px;
          }
          .rt-dot {
            fill: rgb(205, 147, 77);
            stroke: rgba(255, 255, 255, 0.85);
            stroke-width: 1.2;
            transform-origin: 124px 34px;
          }
          .rt-bar {
            fill: rgba(74, 137, 92, 0.22);
            stroke: rgba(74, 137, 92, 0.55);
            stroke-width: 1;
            stroke-linecap: round;
            transform-origin: center bottom;
            transform-box: fill-box;
          }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes rt-swing {
              0%, 100% { transform: rotate(-7deg); }
              50% { transform: rotate(7deg); }
            }
            @keyframes rt-swing-fast {
              0%, 100% { transform: rotate(-9deg); }
              50% { transform: rotate(9deg); }
            }
            @keyframes rt-wave-a {
              0% { transform: scale(0.72); opacity: 0.65; }
              70%, 100% { transform: scale(1.35); opacity: 0; }
            }
            @keyframes rt-wave-b {
              0%, 12% { transform: scale(0.72); opacity: 0.55; }
              72%, 100% { transform: scale(1.35); opacity: 0; }
            }
            @keyframes rt-wave-c {
              0%, 24% { transform: scale(0.72); opacity: 0.45; }
              76%, 100% { transform: scale(1.35); opacity: 0; }
            }
            @keyframes rt-dot-pulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.35); opacity: 0.65; }
            }
            @keyframes rt-bar-dance {
              0%, 100% { transform: scaleY(0.35); opacity: 0.55; }
              40% { transform: scaleY(1); opacity: 1; }
            }

            .rt-bell-group {
              animation: rt-swing 3.8s ease-in-out infinite;
              transform-origin: 100px 38px;
            }
            .feature-card:hover .rt-bell-group {
              animation: rt-swing-fast 1.8s ease-in-out infinite;
            }

            .rt-wave:nth-of-type(1) {
              animation: rt-wave-a 3.2s ease-out infinite;
            }
            .rt-wave:nth-of-type(2) {
              animation: rt-wave-b 3.2s ease-out infinite;
            }
            .rt-wave:nth-of-type(3) {
              animation: rt-wave-c 3.2s ease-out infinite;
            }
            .feature-card:hover .rt-wave:nth-of-type(1) {
              animation-duration: 1.6s;
            }
            .feature-card:hover .rt-wave:nth-of-type(2) {
              animation-duration: 1.6s;
            }
            .feature-card:hover .rt-wave:nth-of-type(3) {
              animation-duration: 1.6s;
            }

            .rt-dot {
              animation: rt-dot-pulse 2.6s ease-in-out infinite;
            }

            .rt-bar:nth-of-type(1) {
              animation: rt-bar-dance 2.8s ease-in-out infinite;
              animation-delay: 0ms;
            }
            .rt-bar:nth-of-type(2) {
              animation: rt-bar-dance 2.8s ease-in-out infinite;
              animation-delay: 180ms;
            }
            .rt-bar:nth-of-type(3) {
              animation: rt-bar-dance 2.8s ease-in-out infinite;
              animation-delay: 360ms;
            }
            .rt-bar:nth-of-type(4) {
              animation: rt-bar-dance 2.8s ease-in-out infinite;
              animation-delay: 540ms;
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .rt-bell-group { transform: rotate(0deg) !important; animation: none !important; }
            .rt-wave { opacity: 0.35; transform: scale(1); }
            .rt-bar { transform: scaleY(0.85); opacity: 0.85; }
          }
        `}</style>
      </defs>

      <g className="rt-bell-group">
        <path
          className="rt-wave"
          d="M100 46c14 0 26 10 26 22"
        />
        <path
          className="rt-wave"
          d="M100 46c19 0 34 12 34 26"
        />
        <path
          className="rt-wave"
          d="M100 46c24 0 42 14 42 30"
        />

        <path
          className="rt-bell"
          d="M72 42c0-12 12.5-22 28-22s28 10 28 22c0 14-5 26-14 34v10H86v-10c-9-8-14-20-14-34z"
        />
        <path
          className="rt-clapper"
          d="M86 86h28c2 0 3.5 2 4 4l3 8H79l3-8c0.5-2 2-4 4-4z"
        />

        <circle className="rt-dot" cx="124" cy="34" r="5" />
      </g>

      <g transform="translate(0 104)">
        <rect className="rt-bar" x="68" y="-22" width="6" height="22" rx="2" />
        <rect className="rt-bar" x="82" y="-28" width="6" height="28" rx="2" />
        <rect className="rt-bar" x="96" y="-34" width="6" height="34" rx="2" />
        <rect className="rt-bar" x="110" y="-26" width="6" height="26" rx="2" />
      </g>
    </svg>
  );
}
