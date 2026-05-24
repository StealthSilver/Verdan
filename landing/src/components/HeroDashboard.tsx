import Image from "next/image";
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, FileSpreadsheet, Plus } from "lucide-react";
import { DashboardTreeAvatar } from "@/components/dashboardTreeAvatars";
import { cn } from "@/lib/utils";

export type HeroDashboardVariant = "hero" | "compact" | "feature";

const iconSm = "h-3.5 w-3.5 shrink-0";
const iconXs = "h-3 w-3 shrink-0";

const actionBtn =
  "flex items-center justify-center gap-1.5 rounded bg-[#48845c] px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-[#3d7149] active:bg-[#356340]";

const outlineBtn =
  "flex items-center justify-center gap-1.5 rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-medium text-gray-800 transition-colors hover:border-[#48845c]/40 hover:bg-gray-50 hover:text-[#48845c]";

const pageBtn =
  "min-w-[1.75rem] rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-[#48845c]/40 hover:bg-gray-50 hover:text-[#48845c]";

const pageBtnActive =
  "min-w-[1.75rem] rounded border border-[#48845c] bg-[#48845c] px-2 py-1 text-xs font-medium text-white transition-colors hover:bg-[#3d7149]";

const pageNavBtn =
  "flex items-center gap-1 rounded border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 transition-colors hover:border-[#48845c]/40 hover:bg-gray-50 hover:text-[#48845c] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-300 disabled:hover:bg-white disabled:hover:text-gray-700";

const editBtn =
  "rounded border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-gray-800 transition-colors hover:border-[#48845c]/40 hover:bg-gray-50 hover:text-[#48845c]";

const detailsBtn =
  "rounded bg-[#48845c] px-2.5 py-1 text-[10px] font-medium text-white transition-colors hover:bg-[#3d7149] active:bg-[#356340]";

const deleteBtn =
  "rounded px-2.5 py-1 text-[10px] font-medium text-red-600 transition-colors hover:bg-red-50 hover:text-red-700 active:bg-red-100";

const MOCK_CURRENT_PAGE: number = 1;
const MOCK_TOTAL_PAGES: number = 3;
const MOCK_PAGE_NUMBERS = [1, 2, 3] as const;

function TablePagination({ small = false }: { small?: boolean }) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-between gap-2 border-t border-gray-200 bg-white sm:flex-row",
        small ? "px-3 py-2" : "gap-3 px-5 py-3",
      )}
    >
      <p className={cn("text-gray-600", small ? "text-[9px]" : "text-xs")}>
        Showing{" "}
        <span className="font-medium text-gray-800">1</span> to{" "}
        <span className="font-medium text-gray-800">8</span> of{" "}
        <span className="font-medium text-gray-800">24</span> trees
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={cn(pageNavBtn, small && "gap-0.5 px-2 py-0.5 text-[10px]")}
          disabled={MOCK_CURRENT_PAGE === 1}
          aria-label="Previous page"
        >
          <ChevronLeft
            className={cn("shrink-0", small ? "h-3 w-3" : "h-3.5 w-3.5")}
            aria-hidden
          />
          Previous
        </button>
        <div className="flex items-center gap-0.5 px-0.5">
          {MOCK_PAGE_NUMBERS.map((page) => (
            <button
              key={page}
              type="button"
              className={cn(
                page === MOCK_CURRENT_PAGE ? pageBtnActive : pageBtn,
                small && "min-w-[1.5rem] px-1.5 py-0.5 text-[10px]",
              )}
              aria-label={`Page ${page}`}
              aria-current={page === MOCK_CURRENT_PAGE ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={cn(pageNavBtn, small && "gap-0.5 px-2 py-0.5 text-[10px]")}
          disabled={MOCK_CURRENT_PAGE === MOCK_TOTAL_PAGES}
          aria-label="Next page"
        >
          Next
          <ChevronRight
            className={cn("shrink-0", small ? "h-3 w-3" : "h-3.5 w-3.5")}
            aria-hidden
          />
        </button>
      </div>
    </div>
  );
}

const TABLE_ROWS = [
  {
    no: 1,
    treeId: "c89fa42d",
    name: "Oak",
    date: "15/05/2026",
    time: "11:06:00",
    coords: "15.325540, 75.968754",
  },
  {
    no: 2,
    treeId: "c89fa447",
    name: "Pine",
    date: "15/05/2026",
    time: "11:06:00",
    coords: "15.325549, 75.968723",
  },
  {
    no: 3,
    treeId: "c89fa46a",
    name: "Bush",
    date: "15/05/2026",
    time: "11:07:00",
    coords: "15.325506, 75.968722",
  },
  {
    no: 4,
    treeId: "c89fa483",
    name: "Willow",
    date: "15/05/2026",
    time: "11:07:00",
    coords: "15.325582, 75.968720",
  },
  {
    no: 5,
    treeId: "c89fa49b",
    name: "Sakura",
    date: "15/05/2026",
    time: "11:08:00",
    coords: "15.324611, 75.968107",
  },
  {
    no: 6,
    treeId: "c89fa4b4",
    name: "Palm",
    date: "15/05/2026",
    time: "11:09:00",
    coords: "15.325487, 75.968711",
  },
  {
    no: 7,
    treeId: "c89fa4cb",
    name: "Bonsai",
    date: "15/05/2026",
    time: "11:09:00",
    coords: "15.325543, 75.968569",
  },
  {
    no: 8,
    treeId: "c89fa4e2",
    name: "Fruit Tree",
    date: "15/05/2026",
    time: "11:10:00",
    coords: "15.325479, 75.968535",
  },
] as const;

export function DashboardNavbar({
  small = false,
  showAdmin = true,
}: {
  small?: boolean;
  showAdmin?: boolean;
}) {
  return (
    <header
      className={cn(
        "flex shrink-0 items-center justify-between border-b border-gray-200 bg-white",
        small ? "px-3 py-2" : "px-5 py-3",
      )}
    >
      <div className="flex items-center gap-2">
        <Image
          src="/icon.svg"
          alt=""
          width={30}
          height={30}
          unoptimized
          className={cn("shrink-0", small ? "h-5 w-5" : "h-6 w-6")}
        />
        <span
          className={cn("font-bold text-gray-900", small ? "text-xs" : "text-sm")}
        >
          हरित
        </span>
      </div>
      <div className="flex items-center gap-2">
        <BellIcon small={small} />
        <AdminAvatar small={small} />
        {showAdmin && (
          <span
            className={cn(
              "font-medium text-gray-700",
              small ? "text-[10px]" : "text-xs",
            )}
          >
            Admin
          </span>
        )}
      </div>
    </header>
  );
}

function BellIcon({ small = false }: { small?: boolean }) {
  return (
    <button
      type="button"
      className={cn(
        "group flex items-center justify-center rounded-md border border-gray-200 bg-white transition-colors hover:border-[#48845c]/30 hover:bg-gray-50",
        small ? "p-1" : "p-1.5",
      )}
      aria-label="Notifications"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className={cn(
          "text-gray-500 transition-colors group-hover:text-[#48845c]",
          small ? "h-3.5 w-3.5" : "h-4 w-4",
        )}
        aria-hidden
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Purple bonsai avatar (matches frontend avatars.ts index 3). */
function AdminAvatar({ small = false }: { small?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200",
        small ? "h-5 w-5" : "h-6 w-6",
      )}
      aria-hidden
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="h-full w-full">
        <rect width="64" height="64" fill="#F8FAFC" />
        <rect x="8" y="8" width="48" height="48" rx="12" fill="#F5F3FF" />
        <rect x="20" y="18" width="24" height="12" fill="#7C3AED" />
        <rect x="18" y="22" width="28" height="10" fill="#8B5CF6" />
        <rect x="24" y="16" width="16" height="8" fill="#6D28D9" />
        <rect x="30" y="30" width="4" height="16" fill="#92400E" />
        <rect x="22" y="46" width="20" height="6" fill="#1F2937" />
        <rect x="20" y="44" width="24" height="3" fill="#374151" />
        <rect x="24" y="20" width="2" height="2" fill="#DDD6FE" />
        <rect x="38" y="24" width="2" height="2" fill="#EDE9FE" />
      </svg>
    </span>
  );
}

function InfoIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      className="h-3.5 w-3.5 shrink-0 text-gray-400"
      aria-hidden
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M8 7v4M8 5.25v.01" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

/** Features bento dashboard — tighter controls below md only */
const featureBtnMobile =
  "max-md:min-h-0 max-md:gap-0.5 max-md:px-1.5 max-md:py-0.5 max-md:text-[8px] max-md:leading-tight";
const featureIconMobile = "max-md:h-2.5 max-md:w-2.5";

const HeroDashboard = ({ variant = "hero" }: { variant?: HeroDashboardVariant }) => {
  const compact = variant === "compact";
  const feature = variant === "feature";
  const small = compact || feature;
  const fullContent = !compact;
  const displayRows = compact ? TABLE_ROWS.slice(0, 5) : TABLE_ROWS;
  const icon = small ? iconXs : iconSm;
  const btnIcon = cn(icon, feature && featureIconMobile);

  return (
    <div
      className="w-full"
      role="img"
      aria-label="Harit plantation dashboard preview with tree records, GPS coordinates, and verification status"
    >
      <div
        className={cn(
          "overflow-hidden rounded-[8px] bg-[#f8fafc]",
          variant === "hero" && "hero-dashboard-panel",
          variant === "compact" &&
            "hero-dashboard-panel shadow-[0_8px_28px_-8px_rgba(0,0,0,0.12),0_0_24px_rgba(72,132,92,0.12)]",
          feature && "border border-black/[0.06] shadow-sm",
        )}
      >
        <div className="flex w-full flex-col overflow-hidden bg-white">
            <DashboardNavbar small={small} showAdmin={fullContent} />

            {/* Main content */}
            <div
              className={cn(
                "flex flex-col overflow-hidden bg-[#f8fafc]",
                small ? "px-3 py-2.5" : "px-5 py-4",
              )}
            >
              {/* Page title section */}
              <div
                className={cn(
                  "flex shrink-0",
                  small ? "mb-2 gap-2" : "mb-4 gap-6",
                  feature && "flex-col sm:flex-row sm:items-start max-md:mb-1.5 max-md:gap-1.5",
                )}
              >
                <div className="min-w-0 flex-1">
                  <h2
                    className={cn(
                      "font-bold leading-snug text-gray-900",
                      small ? "text-[11px]" : "text-base",
                    )}
                  >
                    Coastal Mangrove Restoration — Block C
                  </h2>
                  <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                    <span
                      className={cn(
                        "text-gray-500",
                        small ? "text-[9px]" : "text-xs",
                      )}
                    >
                      ID: a9f2e841c73b056d2e8f4a1c
                    </span>
                    <span
                      className={cn(
                        "rounded-full bg-green-100 font-medium text-[#2d6a4f]",
                        small
                          ? "px-1.5 py-px text-[8px]"
                          : "px-2.5 py-0.5 text-xs",
                      )}
                    >
                      active
                    </span>
                  </div>
                  {fullContent && (
                    <p
                      className={cn(
                        "mt-1 flex items-start gap-1 leading-snug text-gray-500",
                        small ? "text-[9px]" : "text-xs",
                      )}
                    >
                      <span className="line-clamp-1">
                        Velore Creek Sanctuary, Alappuzha, Kerala 688003 — 145 ha
                        coastal wetland plantation
                      </span>
                      <InfoIcon />
                    </p>
                  )}
                </div>

                <div
                  className={cn(
                    "grid shrink-0 gap-1.5",
                    compact ? "grid-cols-1" : "grid-cols-2",
                    !small && "gap-2",
                    feature && "max-md:w-full max-md:gap-1",
                  )}
                >
                  {fullContent && (
                    <button
                      type="button"
                      className={cn(
                        outlineBtn,
                        small && "gap-1 px-2 py-1 text-[10px]",
                        feature && cn(featureBtnMobile, "max-md:justify-center"),
                      )}
                    >
                      <ArrowLeft className={btnIcon} aria-hidden />
                      <span className={cn(feature && "max-md:sr-only")}>Back</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={cn(
                      actionBtn,
                      small && "gap-1 px-2 py-1 text-[10px]",
                      feature && featureBtnMobile,
                    )}
                  >
                    <Plus className={btnIcon} aria-hidden />
                    <span className="max-md:hidden">Add Plants</span>
                    <span className="hidden max-md:inline">Add</span>
                  </button>
                  <button
                    type="button"
                    className={cn(
                      actionBtn,
                      small && "gap-1 px-2 py-1 text-[10px]",
                      feature && featureBtnMobile,
                    )}
                  >
                    <BarChart3 className={btnIcon} aria-hidden />
                    Analytics
                  </button>
                  {fullContent && (
                    <button
                      type="button"
                      className={cn(
                        actionBtn,
                        small && "gap-1 px-2 py-1 text-[10px]",
                        feature && featureBtnMobile,
                      )}
                    >
                      <FileSpreadsheet className={btnIcon} aria-hidden />
                      <span className="max-md:hidden">Export as Excel</span>
                      <span className="hidden max-md:inline">Export</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Data table */}
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    {fullContent ? (
                      <>
                        <col className="w-[5%]" />
                        <col className="w-[8%]" />
                        <col className="w-[11%]" />
                        <col className="w-[11%]" />
                        <col className="w-[9%]" />
                        <col className="w-[9%]" />
                        <col className="w-[20%]" />
                        <col className="w-[9%]" />
                        <col className="w-[18%]" />
                      </>
                    ) : (
                      <>
                        <col className="w-[6%]" />
                        <col className="w-[11%]" />
                        <col className="w-[18%]" />
                        <col className="w-[14%]" />
                        <col className="w-[36%]" />
                        <col className="w-[15%]" />
                      </>
                    )}
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {[
                        { label: "NO.", align: "text-left", show: true },
                        { label: "IMAGE", align: "text-left", show: true },
                        { label: "TREE ID", align: "text-left", show: true },
                        { label: "NAME", align: "text-left", show: true },
                        { label: "DATE", align: "text-left", show: fullContent },
                        { label: "TIME", align: "text-left", show: fullContent },
                        { label: "COORDINATES", align: "text-left", show: true },
                        { label: "VERIFIED", align: "text-left", show: true },
                        { label: "ACTIONS", align: "text-right", show: fullContent },
                      ]
                        .filter((col) => col.show)
                        .map(({ label, align }) => (
                          <th
                            key={label}
                            className={cn(
                              "whitespace-nowrap font-semibold uppercase tracking-wide text-gray-500",
                              small
                                ? "px-2 py-1.5 text-[8px]"
                                : "px-5 py-3 text-[10px]",
                              align,
                            )}
                          >
                            {label}
                          </th>
                        ))}
                    </tr>
                  </thead>
                  <tbody>
                    {displayRows.map((row, rowIndex) => (
                      <tr
                        key={row.no}
                        className="border-b border-gray-100 bg-white last:border-b-0"
                      >
                        <td
                          className={cn(
                            "whitespace-nowrap text-gray-500",
                            small ? "px-2 py-1.5 text-[9px]" : "px-5 py-3 text-xs",
                          )}
                        >
                          {row.no}
                        </td>
                        <td className={small ? "px-2 py-1.5" : "px-5 py-3"}>
                          <DashboardTreeAvatar
                            index={rowIndex}
                            size={small ? "sm" : "md"}
                          />
                        </td>
                        <td
                          className={cn(
                            "truncate font-mono text-gray-500",
                            small
                              ? "px-2 py-1.5 text-[8px]"
                              : "px-5 py-3 text-xs",
                          )}
                        >
                          {row.treeId}
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap font-semibold text-gray-900",
                            small ? "px-2 py-1.5 text-[9px]" : "px-5 py-3 text-xs",
                          )}
                        >
                          {row.name}
                        </td>
                        {fullContent && (
                          <>
                            <td
                              className={cn(
                                "whitespace-nowrap text-gray-600",
                                small
                                  ? "px-2 py-1.5 text-[8px]"
                                  : "px-5 py-3 text-xs",
                              )}
                            >
                              {row.date}
                            </td>
                            <td
                              className={cn(
                                "whitespace-nowrap text-gray-600",
                                small
                                  ? "px-2 py-1.5 text-[8px]"
                                  : "px-5 py-3 text-xs",
                              )}
                            >
                              {row.time}
                            </td>
                          </>
                        )}
                        <td
                          className={cn(
                            "truncate font-mono text-gray-500",
                            small
                              ? "px-2 py-1.5 text-[8px]"
                              : "px-5 py-3 text-[11px]",
                          )}
                        >
                          {row.coords}
                        </td>
                        <td
                          className={cn(
                            "whitespace-nowrap",
                            small ? "px-2 py-1.5" : "px-5 py-3",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex rounded-full border border-[#48845c] font-medium text-[#48845c]",
                              small
                                ? "px-1.5 py-px text-[7px]"
                                : "px-2.5 py-0.5 text-[10px]",
                            )}
                          >
                            Verified
                          </span>
                        </td>
                        {fullContent && (
                          <td
                            className={cn(
                              "whitespace-nowrap text-right",
                              small ? "px-2 py-1.5" : "px-5 py-3",
                            )}
                          >
                            <div
                              className={cn(
                                "flex items-center justify-end",
                                small ? "gap-1" : "gap-2",
                              )}
                            >
                              <button
                                type="button"
                                className={cn(
                                  editBtn,
                                  small && "px-1.5 py-0.5 text-[8px]",
                                )}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  detailsBtn,
                                  small && "px-1.5 py-0.5 text-[8px]",
                                )}
                              >
                                Details
                              </button>
                              <button
                                type="button"
                                className={cn(
                                  deleteBtn,
                                  small && "px-1.5 py-0.5 text-[8px]",
                                )}
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
                {fullContent && <TablePagination small={small} />}
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HeroDashboard;
