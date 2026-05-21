import Link from "next/link";

const SECTION_LABEL =
  "text-xs font-medium uppercase tracking-widest text-[#48845c]";

const PROJECTS = [
  { name: "Bikaner", mw: "1,460 MW" },
  { name: "Fatehgarh", mw: "1,300 MW" },
  { name: "Gadag", mw: "650 MW" },
  { name: "Koppal", mw: "700 MW" },
  { name: "Annigeri", mw: "500 MW" },
  { name: "Kurnool/Anantapur", mw: "1,000 MW" },
  { name: "Lakadia", mw: "400 MW" },
] as const;

const OBLIGATIONS = [
  {
    name: "MoEF Greenbelt Mandate",
    tag: "33% of project area",
    consequence:
      "~660 acres of mandated plantation for a 2,000-acre solar site.",
    severity: "#48845c",
    severityLabel: "low-risk if compliant",
  },
  {
    name: "Compensatory Afforestation",
    tag: "CAMPA Act, 2016",
    consequence:
      "Non-compliance triggers NGT action and security deposit forfeiture.",
    severity: "#f59e0b",
    severityLabel: "financial risk",
  },
  {
    name: "7-Year Maintenance Obligation",
    tag: "Environmental Clearance",
    consequence: "NGT has directed 10× replanting for non-compliant projects.",
    severity: "#ef4444",
    severityLabel: "legal risk",
  },
  {
    name: "Green Credit Programme",
    tag: "Tradeable Credits",
    consequence:
      "Every verified tree older than 5 years earns one tradeable credit.",
    severity: "#48845c",
    severityLabel: "opportunity",
  },
] as const;

const BURDEN_BARS = [
  { label: "Greenbelt 33%", value: "60%", width: 0.6, color: "#48845c" },
  { label: "CAMPA replacement", value: "45%", width: 0.45, color: "#16a34a" },
  { label: "7-year EC window", value: "75%", width: 0.75, color: "#15803d" },
  {
    label: "Credit eligibility",
    value: "50%",
    width: 0.5,
    color: "#4ade80",
  },
] as const;

function CapacityRing() {
  const r = 20;
  const circumference = 2 * Math.PI * r;
  const filled = circumference * 0.35;

  return (
    <svg
      width={48}
      height={48}
      viewBox="0 0 48 48"
      aria-hidden
      className="mt-3"
    >
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth={3}
      />
      <circle
        cx={24}
        cy={24}
        r={r}
        fill="none"
        stroke="#48845c"
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circumference - filled}`}
        transform="rotate(-90 24 24)"
      />
    </svg>
  );
}

function StatesDots() {
  return (
    <svg
      width={80}
      height={12}
      viewBox="0 0 80 12"
      aria-hidden
      className="mt-3"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <circle key={i} cx={8 + i * 16} cy={6} r={4} fill="#48845c" />
      ))}
    </svg>
  );
}

function InvestmentBars() {
  const heights = [10, 16, 24];
  return (
    <svg
      width={36}
      height={28}
      viewBox="0 0 36 28"
      aria-hidden
      className="mt-3"
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={i * 10}
          y={28 - h}
          width={6}
          height={h}
          fill="#48845c"
          rx={1}
        />
      ))}
    </svg>
  );
}

function Co2Sparkline() {
  const points = "4,22 18,16 32,12 56,4";
  return (
    <svg
      width={60}
      height={28}
      viewBox="0 0 60 28"
      aria-hidden
      className="mt-3"
    >
      <polyline
        points={points}
        fill="none"
        stroke="#48845c"
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ProjectTimeline() {
  const count = PROJECTS.length;
  const padX = 60;
  const usable = 900 - padX * 2;

  return (
    <svg
      viewBox="0 0 900 80"
      className="hidden w-full md:block"
      preserveAspectRatio="xMidYMid meet"
      aria-label="Active and pipeline projects by capacity"
    >
      <line x1={padX} y1={40} x2={900 - padX} y2={40} stroke="#e5e7eb" strokeWidth={1} />
      {PROJECTS.map((project, i) => {
        const x = padX + (i / (count - 1)) * usable;
        return (
          <g key={project.name}>
            <text
              x={x}
              y={28}
              textAnchor="middle"
              className="fill-[#2d6a4f] text-[11px] font-medium"
              style={{ fontSize: 11 }}
            >
              {project.mw}
            </text>
            <circle cx={x} cy={40} r={4} fill="#48845c" />
            <text
              x={x}
              y={58}
              textAnchor="middle"
              fill="#6b7280"
              style={{ fontSize: 11 }}
            >
              {project.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function ComplianceBurdenChart() {
  const barMaxWidth = 720;
  const barHeight = 10;
  const barGap = 22;
  const startY = 28;
  const labelX = 0;
  const barX = 160;

  return (
    <svg
      viewBox="0 0 900 120"
      className="w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      {[0.2, 0.4, 0.6, 0.8].map((pct) => (
        <line
          key={pct}
          x1={barX + barMaxWidth * pct}
          y1={16}
          x2={barX + barMaxWidth * pct}
          y2={108}
          stroke="#f3f4f6"
          strokeWidth={1}
        />
      ))}
      {BURDEN_BARS.map((bar, i) => {
        const y = startY + i * barGap;
        const width = barMaxWidth * bar.width;
        return (
          <g key={bar.label}>
            <text
              x={labelX}
              y={y + barHeight}
              fill="#6b7280"
              style={{ fontSize: 11 }}
            >
              {bar.label}
            </text>
            <rect
              x={barX}
              y={y}
              width={width}
              height={barHeight}
              rx={5}
              fill={bar.color}
            />
            <text
              x={barX + width + 8}
              y={y + barHeight}
              fill="#2d6a4f"
              style={{ fontSize: 11 }}
            >
              {bar.value}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const NeedSection = () => {
  return (
    <section
      id="the-need"
      className="relative w-full bg-[var(--background)] py-20 text-[var(--color-font)] sm:py-24"
    >
      <div className="mx-auto w-full max-w-7xl px-3 sm:px-5">
        {/* Part 1 — Opening */}
        <div className="mx-auto max-w-3xl text-center">
          <p className={`mb-10 ${SECTION_LABEL}`}>The Need</p>
          <h2 className="text-4xl font-semibold leading-tight text-gray-900">
            Serentica is building
          </h2>
          <h2 className="text-4xl font-semibold leading-tight text-[#2d6a4f]">
            India&apos;s greenest energy grid.
          </h2>
          <p className="mt-4 text-lg italic text-gray-400">
            Harit makes sure the ground beneath stays green too.
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-gray-500">
            As Serentica scales to 17 GW by 2030 across five states, every site
            carries a legal plantation obligation — and a reputation on the line.
          </p>
        </div>

        {/* Part 2 — Scale stats */}
        <div className="mt-20">
          <p className={`mb-8 ${SECTION_LABEL}`}>
            Serentica&apos;s footprint at a glance
          </p>
          <div className="grid grid-cols-1 gap-0 border-t border-gray-200 sm:grid-cols-2 lg:grid-cols-4">
            <div className="border-b border-gray-200 px-0 py-6 transition-colors hover:bg-[#f0fdf4] sm:border-r sm:px-5 lg:border-b-0">
              <p className="text-5xl font-bold text-[#2d6a4f]">17 GW</p>
              <p className="mt-1 text-sm text-gray-400">
                Target capacity by 2030
              </p>
              <CapacityRing />
            </div>
            <div className="border-b border-gray-200 px-0 py-6 transition-colors hover:bg-[#f0fdf4] sm:px-5 lg:border-b-0 lg:border-r">
              <p className="text-5xl font-bold text-[#2d6a4f]">5 States</p>
              <p className="mt-1 text-sm text-gray-400">
                Rajasthan · Karnataka · Maharashtra · Gujarat · AP
              </p>
              <StatesDots />
            </div>
            <div className="border-b border-gray-200 px-0 py-6 transition-colors hover:bg-[#f0fdf4] sm:border-r sm:px-5 lg:border-b-0">
              <p className="text-5xl font-bold text-[#2d6a4f]">₹1.5L Cr</p>
              <p className="mt-1 text-sm text-gray-400">Investments announced</p>
              <InvestmentBars />
            </div>
            <div className="px-0 py-6 transition-colors hover:bg-[#f0fdf4] sm:px-5">
              <p className="text-5xl font-bold text-[#2d6a4f]">37 MT CO₂</p>
              <p className="mt-1 text-sm text-gray-400">
                Targeted for displacement annually
              </p>
              <Co2Sparkline />
            </div>
          </div>
        </div>

        {/* Part 3 — Project sites */}
        <div className="mt-20">
          <p className={`mb-8 ${SECTION_LABEL}`}>Active and pipeline projects</p>
          <ProjectTimeline />
          <div className="flex flex-wrap gap-2 md:hidden">
            {PROJECTS.map((project) => (
              <span
                key={project.name}
                className="rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-500"
              >
                <span className="font-medium text-[#2d6a4f]">{project.mw}</span>
                {" · "}
                {project.name}
              </span>
            ))}
          </div>
        </div>

        {/* Part 4 — Legal obligations */}
        <div className="mt-20">
          <p className={`mb-8 ${SECTION_LABEL}`}>What the law demands</p>
          <div className="overflow-hidden rounded-xl border border-gray-200">
            {OBLIGATIONS.map((row, index) => (
              <div
                key={row.name}
                className={`border-t border-gray-100 px-6 py-5 first:border-t-0 ${
                  index % 2 === 0 ? "bg-white" : "bg-[#fafafa]"
                }`}
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:gap-6">
                  <div className="md:w-[40%]">
                    <p className="text-sm font-bold text-gray-900">{row.name}</p>
                    <span className="mt-1 inline-block text-xs text-gray-400">
                      {row.tag}
                    </span>
                  </div>
                  <div className="flex gap-3 md:w-[60%]">
                    <span
                      className="mt-1.5 inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: row.severity }}
                      aria-label={row.severityLabel}
                    />
                    <p className="text-sm leading-relaxed text-gray-500">
                      {row.consequence}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-gray-400">
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#48845c]"
                aria-hidden
              />
              Opportunity
            </span>
            {"  "}
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]"
                aria-hidden
              />
              Financial risk
            </span>
            {"  "}
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#ef4444]"
                aria-hidden
              />
              Legal risk
            </span>
          </p>
        </div>

        {/* Part 5 — Compliance burden */}
        <div className="mt-16">
          <ComplianceBurdenChart />
        </div>

        {/* Part 6 — Closing */}
        <div className="mt-20 text-center">
          <p className="mx-auto max-w-2xl text-2xl font-semibold text-gray-900">
            Harit turns every one of these obligations into a checkbox.
          </p>
          <Link
            href="/#features"
            className="mt-6 inline-block text-sm text-[#48845c] hover:underline"
          >
            See how Harit works →
          </Link>
        </div>
      </div>
    </section>
  );
};

export default NeedSection;
