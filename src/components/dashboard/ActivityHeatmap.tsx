"use client";
/**
 * ActivityHeatmap — GitHub-style 52-week activity grid.
 *
 * Receives an array of { date, count } spanning the last 365 days.
 * Renders 7 rows (Mon–Sun) × 53 columns (weeks).
 */

import { useMemo } from "react";
import { format, parseISO, startOfWeek, addDays } from "date-fns";

export interface HeatmapDay {
  date: string; // "YYYY-MM-DD"
  count: number;
}

interface ActivityHeatmapProps {
  data: HeatmapDay[];
}

const CELL = 12; // px — cell size
const GAP = 2; // px — gap between cells
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""]; // label every other row

function intensityColor(count: number, max: number): string {
  if (count === 0) return "#1F2937";
  if (max === 0) return "#22C55E";
  const ratio = count / max;
  if (ratio < 0.25) return "#14532d";
  if (ratio < 0.5) return "#166534";
  if (ratio < 0.75) return "#16a34a";
  return "#22C55E";
}

export function ActivityHeatmap({ data }: ActivityHeatmapProps) {
  const { weeks, monthLabels, maxCount } = useMemo(() => {
    if (data.length === 0) return { weeks: [], monthLabels: [], maxCount: 0 };

    const max = Math.max(...data.map((d) => d.count));

    // Build lookup: date → count
    const lookup: Record<string, number> = {};
    for (const d of data) {
      lookup[d.date] = d.count;
    }

    // Find the Sunday before the first data day
    const firstDate = parseISO(data[0].date);
    const gridStart = startOfWeek(firstDate, { weekStartsOn: 0 }); // Sunday

    // Build a flat list of days from gridStart covering all data
    const lastDate = parseISO(data[data.length - 1].date);

    const allDays: Array<{ date: string; count: number; inRange: boolean }> =
      [];
    let cursor = gridStart;
    while (cursor <= lastDate) {
      const ds = format(cursor, "yyyy-MM-dd");
      const inRange = ds >= data[0].date && ds <= data[data.length - 1].date;
      allDays.push({ date: ds, count: lookup[ds] ?? 0, inRange });
      cursor = addDays(cursor, 1);
    }

    // Split into columns (weeks of 7 days each)
    const weeksArr: (typeof allDays)[] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeksArr.push(allDays.slice(i, i + 7));
    }

    // Month label positions: track when month changes per column
    const labels: Array<{ col: number; label: string }> = [];
    let lastMonth = -1;
    for (let col = 0; col < weeksArr.length; col++) {
      const week = weeksArr[col];
      const firstInWeek = week[0];
      if (firstInWeek) {
        const month = parseISO(firstInWeek.date).getMonth();
        if (month !== lastMonth) {
          labels.push({ col, label: MONTHS[month] });
          lastMonth = month;
        }
      }
    }

    return { weeks: weeksArr, monthLabels: labels, maxCount: max };
  }, [data]);

  if (weeks.length === 0) {
    return (
      <div className="h-28 flex items-center justify-center text-[#4B5563] text-sm">
        No activity data yet.
      </div>
    );
  }

  const svgWidth = weeks.length * (CELL + GAP);
  const svgHeight = 7 * (CELL + GAP) + 20; // +20 for month labels at top

  return (
    <div className="overflow-x-auto">
      <svg
        width={svgWidth + 32}
        height={svgHeight + 8}
        className="text-[10px]"
        style={{ fontFamily: "inherit" }}
      >
        {/* Day labels */}
        {DAYS.map((label, row) =>
          label ? (
            <text
              key={row}
              x={28}
              y={20 + row * (CELL + GAP) + CELL - 1}
              textAnchor="end"
              fill="#4B5563"
              fontSize={9}
            >
              {label}
            </text>
          ) : null,
        )}

        {/* Month labels */}
        {monthLabels.map(({ col, label }) => (
          <text
            key={`${col}-${label}`}
            x={32 + col * (CELL + GAP)}
            y={12}
            fill="#6B7280"
            fontSize={9}
          >
            {label}
          </text>
        ))}

        {/* Cells */}
        <g transform="translate(32, 20)">
          {weeks.map((week, col) =>
            week.map((day, row) => (
              <rect
                key={day.date}
                x={col * (CELL + GAP)}
                y={row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx={2}
                ry={2}
                fill={
                  day.inRange
                    ? intensityColor(day.count, maxCount)
                    : "transparent"
                }
              >
                <title>
                  {day.inRange
                    ? `${day.date}: ${day.count} task${day.count !== 1 ? "s" : ""}`
                    : ""}
                </title>
              </rect>
            )),
          )}
        </g>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-1 pl-8">
        <span className="text-[10px] text-[#4B5563]">Less</span>
        {["#1F2937", "#14532d", "#166534", "#16a34a", "#22C55E"].map((c) => (
          <div
            key={c}
            className="rounded-sm"
            style={{ width: CELL, height: CELL, backgroundColor: c }}
          />
        ))}
        <span className="text-[10px] text-[#4B5563]">More</span>
      </div>
    </div>
  );
}
