export function PhotoDocSVG() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 148"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid meet"
      className="max-h-[7.5rem]"
      aria-hidden
    >
      <defs>
        <style>{`
          .pd-body { fill: rgba(74, 137, 92, 0.12); stroke: rgba(74, 137, 92, 0.78); stroke-width: 1.4; stroke-linejoin: round; }
          .pd-lens-ring { fill: rgba(255,255,255,0.35); stroke: rgba(74, 137, 92, 0.65); stroke-width: 1.2; }
          .pd-blade { fill: rgba(74, 137, 92, 0.22); stroke: rgba(74, 137, 92, 0.55); stroke-width: 0.9; stroke-linejoin: round; transform-origin: 100px 76px; }
          .pd-flash { fill: rgba(205, 147, 77, 0.35); opacity: 0; transform-origin: 100px 76px; }
          .pd-thumb { fill: rgba(74, 137, 92, 0.15); stroke: rgba(74, 137, 92, 0.55); stroke-width: 1; opacity: 0; transform: translateY(10px); }
          .pd-iris { transform-origin: 100px 76px; }

          @media (prefers-reduced-motion: no-preference) {
            @keyframes pd-iris-cycle {
              0%, 100% { transform: rotate(0deg); }
              35% { transform: rotate(14deg); }
              50% { transform: rotate(22deg); }
              65% { transform: rotate(14deg); }
            }
            @keyframes pd-flash-pop {
              0%, 44%, 100% { opacity: 0; transform: scale(0.4); }
              48% { opacity: 0.85; transform: scale(1.05); }
              54% { opacity: 0; transform: scale(1.25); }
            }
            @keyframes pd-thumb-in {
              0%, 15% { opacity: 0; transform: translateY(12px); }
              35%, 100% { opacity: 1; transform: translateY(0); }
            }
            @keyframes pd-thumb-glow {
              0%, 100% { stroke: rgba(74, 137, 92, 0.55); filter: none; }
              50% { stroke: rgba(205, 147, 77, 0.75); filter: drop-shadow(0 0 4px rgba(205, 147, 77, 0.45)); }
            }

            .pd-iris {
              animation: pd-iris-cycle 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }
            .feature-card:hover .pd-iris {
              animation-duration: 2.2s;
            }
            .pd-flash {
              animation: pd-flash-pop 4.5s cubic-bezier(0.45, 0, 0.55, 1) infinite;
            }
            .feature-card:hover .pd-flash {
              animation-duration: 2.2s;
            }
            .pd-thumb:nth-child(1) { animation: pd-thumb-in 4.5s ease-out infinite; animation-delay: 0.3s; }
            .pd-thumb:nth-child(2) { animation: pd-thumb-in 4.5s ease-out infinite; animation-delay: 0.55s; }
            .pd-thumb:nth-child(3) { animation: pd-thumb-in 4.5s ease-out infinite; animation-delay: 0.8s; }
            .feature-card:hover .pd-thumb {
              animation: pd-thumb-in 2.2s ease-out infinite, pd-thumb-glow 2.2s ease-in-out infinite;
            }
            .feature-card:hover .pd-thumb:nth-child(1) { animation-delay: 0.15s; }
            .feature-card:hover .pd-thumb:nth-child(2) { animation-delay: 0.35s; }
            .feature-card:hover .pd-thumb:nth-child(3) { animation-delay: 0.55s; }
          }
          @media (prefers-reduced-motion: reduce) {
            .pd-blade, .pd-thumb { opacity: 1; transform: none; }
            .pd-flash { opacity: 0; }
          }
        `}</style>
      </defs>

      <path
        className="pd-body"
        d="M44 48h112c4.5 0 8 3.2 8.8 7.2l4.2 18c1 4.5 5 7.8 9.8 7.8h4.2c3.8 0 6.8 3 6.8 6.8V96c0 7.4-6 13.4-13.4 13.4H44c-7.4 0-13.4-6-13.4-13.4V61.4c0-7.4 6-13.4 13.4-13.4z"
      />
      <path
        fill="none"
        stroke="rgba(74,137,92,0.45)"
        strokeWidth="1"
        strokeLinecap="round"
        d="M58 46v-6c0-3.3 2.7-6 6-6h14"
      />

      <circle className="pd-lens-ring" cx="100" cy="76" r="38" />
      <circle
        fill="rgba(14,14,14,0.06)"
        stroke="rgba(74,137,92,0.35)"
        strokeWidth="1"
        cx="100"
        cy="76"
        r="30"
      />

      <g className="pd-iris">
        {[0, 60, 120, 180, 240, 300].map((deg) => (
          <path
            key={deg}
            className="pd-blade"
            transform={`rotate(${deg} 100 76)`}
            d="M100 76l8.5-19c2.2 1.4 3.7 3.8 4 6.6l1.2 12.4z"
          />
        ))}
      </g>

      <circle className="pd-flash" cx="100" cy="76" r="48" />

      <g transform="translate(0 118)">
        <rect className="pd-thumb" x="46" y="0" width="28" height="22" rx="3" />
        <rect className="pd-thumb" x="86" y="0" width="28" height="22" rx="3" />
        <rect className="pd-thumb" x="126" y="0" width="28" height="22" rx="3" />
      </g>
    </svg>
  );
}
