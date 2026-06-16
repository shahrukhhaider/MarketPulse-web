"use client";

/**
 * DateNavigator — displays available scan dates in descending order and
 * allows the user to select a date to view its signals.
 *
 * Requirements: 2.1 (descending order), 2.2 (select without reload),
 *               2.3 (highlighted selected state), 2.6 (scrollable when >30)
 */

interface DateNavigatorProps {
  dates: string[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
}

/**
 * Format a YYYY-MM-DD string into a user-friendly label like "Jun 15, 2025".
 */
function formatDateLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function DateNavigator({
  dates,
  selectedDate,
  onDateSelect,
}: DateNavigatorProps) {
  return (
    <nav aria-label="Scan date navigation">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400 mb-3">
        Scan Dates
      </h2>
      <div className="max-h-[400px] overflow-y-auto rounded-lg border border-slate-800 bg-slate-900/60">
        <ul className="flex flex-col" role="list">
          {dates.map((date) => {
            const isSelected = date === selectedDate;
            return (
              <li key={date}>
                <button
                  type="button"
                  onClick={() => onDateSelect(date)}
                  aria-current={isSelected ? "date" : undefined}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-inset ${
                    isSelected
                      ? "bg-blue-500/20 border-l-2 border-blue-500 text-blue-300 font-medium"
                      : "border-l-2 border-transparent text-slate-300 hover:bg-slate-800 hover:text-white"
                  }`}
                >
                  {formatDateLabel(date)}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
