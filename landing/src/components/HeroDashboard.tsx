import Image from "next/image";
import { ArrowLeft, BarChart3, ChevronLeft, ChevronRight, FileSpreadsheet, Plus } from "lucide-react";
import { DashboardTreeAvatar } from "@/components/dashboardTreeAvatars";

const iconSm = "h-3.5 w-3.5 shrink-0";

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

const MOCK_CURRENT_PAGE = 1;
const MOCK_TOTAL_PAGES = 3;
const MOCK_PAGE_NUMBERS = [1, 2, 3] as const;

function TablePagination() {
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-200 bg-white px-5 py-3 sm:flex-row">
      <p className="text-xs text-gray-600">
        Showing{" "}
        <span className="font-medium text-gray-800">1</span> to{" "}
        <span className="font-medium text-gray-800">8</span> of{" "}
        <span className="font-medium text-gray-800">24</span> trees
      </p>
      <div className="flex items-center gap-1">
        <button
          type="button"
          className={pageNavBtn}
          disabled={MOCK_CURRENT_PAGE === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Previous
        </button>
        <div className="flex items-center gap-0.5 px-0.5">
          {MOCK_PAGE_NUMBERS.map((page) => (
            <button
              key={page}
              type="button"
              className={page === MOCK_CURRENT_PAGE ? pageBtnActive : pageBtn}
              aria-label={`Page ${page}`}
              aria-current={page === MOCK_CURRENT_PAGE ? "page" : undefined}
            >
              {page}
            </button>
          ))}
        </div>
        <button
          type="button"
          className={pageNavBtn}
          disabled={MOCK_CURRENT_PAGE === MOCK_TOTAL_PAGES}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden />
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

function BellIcon() {
  return (
    <button
      type="button"
      className="group flex items-center justify-center rounded-md border border-gray-200 bg-white p-1.5 transition-colors hover:border-[#48845c]/30 hover:bg-gray-50"
      aria-label="Notifications"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        className="h-4 w-4 text-gray-500 transition-colors group-hover:text-[#48845c]"
        aria-hidden
      >
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

/** Purple bonsai avatar (matches frontend avatars.ts index 3). */
function AdminAvatar() {
  return (
    <span
      className="inline-flex h-6 w-6 shrink-0 overflow-hidden rounded-full ring-1 ring-gray-200"
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

const HeroDashboard = () => {
  return (
    <div
      className="w-full"
      role="img"
      aria-label="Harit plantation dashboard preview with tree records, GPS coordinates, and verification status"
    >
      <div className="overflow-hidden rounded-xl bg-[#f8fafc] shadow-2xl ring-1 ring-black/[0.06]">
        <div className="flex w-full flex-col overflow-hidden bg-white">
            {/* Top navbar */}
            <header className="flex shrink-0 items-center justify-between border-b border-gray-200 bg-white px-5 py-3">
              <div className="flex items-center gap-2">
                <Image
                  src="/icon.svg"
                  alt=""
                  width={30}
                  height={30}
                  unoptimized
                  className="h-6 w-6 shrink-0"
                />
                <span className="text-sm font-bold text-gray-900">हरित</span>
              </div>
              <div className="flex items-center gap-2.5">
                <BellIcon />
                <AdminAvatar />
                <span className="text-xs font-medium text-gray-700">Admin</span>
              </div>
            </header>

            {/* Main content */}
            <div className="flex flex-col overflow-hidden bg-[#f8fafc] px-5 py-4">
              {/* Page title section */}
              <div className="mb-4 flex shrink-0 gap-6">
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold leading-snug text-gray-900">
                    Coastal Mangrove Restoration — Block C
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-gray-500">
                      ID: a9f2e841c73b056d2e8f4a1c
                    </span>
                    <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-[#2d6a4f]">
                      active
                    </span>
                  </div>
                  <p className="mt-1.5 flex items-start gap-1.5 text-xs leading-snug text-gray-500">
                    <span className="line-clamp-1">
                      Velore Creek Sanctuary, Alappuzha, Kerala 688003 — 145 ha
                      coastal wetland plantation
                    </span>
                    <InfoIcon />
                  </p>
                </div>

                <div className="grid shrink-0 grid-cols-2 gap-2">
                  <button type="button" className={outlineBtn}>
                    <ArrowLeft className={iconSm} aria-hidden />
                    Back
                  </button>
                  <button type="button" className={actionBtn}>
                    <Plus className={iconSm} aria-hidden />
                    Add Plants
                  </button>
                  <button type="button" className={actionBtn}>
                    <BarChart3 className={iconSm} aria-hidden />
                    Analytics
                  </button>
                  <button type="button" className={actionBtn}>
                    <FileSpreadsheet className={iconSm} aria-hidden />
                    Export as Excel
                  </button>
                </div>
              </div>

              {/* Data table */}
              <div className="w-full overflow-hidden rounded-lg border border-gray-200 bg-white">
                <table className="w-full table-fixed border-collapse text-left">
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[8%]" />
                    <col className="w-[11%]" />
                    <col className="w-[12%]" />
                    <col className="w-[10%]" />
                    <col className="w-[10%]" />
                    <col className="w-[22%]" />
                    <col className="w-[10%]" />
                    <col className="w-[22%]" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      {[
                        { label: "NO.", align: "text-left" },
                        { label: "IMAGE", align: "text-left" },
                        { label: "TREE ID", align: "text-left" },
                        { label: "NAME", align: "text-left" },
                        { label: "DATE", align: "text-left" },
                        { label: "TIME", align: "text-left" },
                        { label: "COORDINATES", align: "text-left" },
                        { label: "VERIFIED", align: "text-left" },
                        { label: "ACTIONS", align: "text-right" },
                      ].map(({ label, align }) => (
                        <th
                          key={label}
                          className={`whitespace-nowrap px-5 py-3 text-[10px] font-semibold uppercase tracking-wide text-gray-500 ${align}`}
                        >
                          {label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TABLE_ROWS.map((row, rowIndex) => (
                      <tr
                        key={row.no}
                        className="border-b border-gray-100 bg-white last:border-b-0"
                      >
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-500">
                          {row.no}
                        </td>
                        <td className="px-5 py-3">
                          <DashboardTreeAvatar index={rowIndex} />
                        </td>
                        <td className="truncate px-5 py-3 font-mono text-xs text-gray-500">
                          {row.treeId}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs font-semibold text-gray-900">
                          {row.name}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-600">
                          {row.date}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-xs text-gray-600">
                          {row.time}
                        </td>
                        <td className="truncate px-5 py-3 font-mono text-[11px] text-gray-500">
                          {row.coords}
                        </td>
                        <td className="whitespace-nowrap px-5 py-3">
                          <span className="inline-flex rounded-full border border-[#48845c] px-2.5 py-0.5 text-[10px] font-medium text-[#48845c]">
                            Verified
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-5 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button type="button" className={editBtn}>
                              Edit
                            </button>
                            <button type="button" className={detailsBtn}>
                              Details
                            </button>
                            <button type="button" className={deleteBtn}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <TablePagination />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default HeroDashboard;
