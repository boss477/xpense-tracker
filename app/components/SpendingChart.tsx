"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { ChartPie, ChartColumnBig, ChevronDown, X, Wallet } from "lucide-react";
import { SPENDING_CATEGORIES, type CategoryConfig } from "../categories";

const getSupabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Slice {
  cfg: CategoryConfig;
  total: number;
  count: number;
}

// --- Donut geometry helpers ---
const SIZE = 280;
const CENTER = SIZE / 2;
const OUTER_R = 120;
const INNER_R = 74;
const BADGE_R = (OUTER_R + INNER_R) / 2;
const GAP_DEG = 2;
const POP = 9; // how far the selected slice pops out

function pointOnCircle(r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CENTER + r * Math.cos(a), CENTER + r * Math.sin(a)];
}

function arcPath(start: number, end: number): string {
  const large = end - start > 180 ? 1 : 0;
  const [x0, y0] = pointOnCircle(OUTER_R, start);
  const [x1, y1] = pointOnCircle(OUTER_R, end);
  const [x2, y2] = pointOnCircle(INNER_R, end);
  const [x3, y3] = pointOnCircle(INNER_R, start);
  return `M ${x0} ${y0} A ${OUTER_R} ${OUTER_R} 0 ${large} 1 ${x1} ${y1} L ${x2} ${y2} A ${INNER_R} ${INNER_R} 0 ${large} 0 ${x3} ${y3} Z`;
}

function popOffset(mid: number): [number, number] {
  const a = ((mid - 90) * Math.PI) / 180;
  return [POP * Math.cos(a), POP * Math.sin(a)];
}

const inr = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function SpendingChart() {
  const [slices, setSlices] = useState<Slice[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"donut" | "bar">("donut");
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await getSupabase()
        .from("expenses")
        .select("amount, category")
        .neq("category", "Uncategorized");

      if (error) {
        console.error("Failed to load spending:", error);
        setLoading(false);
        return;
      }

      const totals = new Map<string, { total: number; count: number }>();
      for (const row of data ?? []) {
        const cur = totals.get(row.category) ?? { total: 0, count: 0 };
        cur.total += Number(row.amount) || 0;
        cur.count += 1;
        totals.set(row.category, cur);
      }

      const next = SPENDING_CATEGORIES.map((cfg) => ({
        cfg,
        total: totals.get(cfg.dbValue)?.total ?? 0,
        count: totals.get(cfg.dbValue)?.count ?? 0,
      }))
        .filter((s) => s.total > 0)
        .sort((a, b) => b.total - a.total);

      setSlices(next);
      setLoading(false);
    };

    load();
  }, []);

  const total = useMemo(() => slices.reduce((sum, s) => sum + s.total, 0), [slices]);

  const arcs = useMemo(() => {
    let cursor = 0;
    const result = [];
    for (const s of slices) {
      const frac = total > 0 ? s.total / total : 0;
      const start = cursor * 360;
      const end = (cursor + frac) * 360;
      cursor += frac;
      result.push({ ...s, start, end, mid: (start + end) / 2, frac });
    }
    return result;
  }, [slices, total]);

  const selectedSlice = arcs.find((a) => a.cfg.dbValue === selected) ?? null;
  const toggle = (dbValue: string) =>
    setSelected((cur) => (cur === dbValue ? null : dbValue));

  return (
    <div className="rounded-3xl bg-[#1c1f17] text-white p-5 shadow-xl border border-white/5">
      {/* Header: title + view toggle */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-base font-bold tracking-tight">Spending</h2>
          <p className="text-xs text-white/40">By category</p>
        </div>
        <div className="flex items-center gap-1 bg-white/5 rounded-full p-1">
          <button
            onClick={() => setView("donut")}
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
              view === "donut" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
            aria-label="Donut chart"
          >
            <ChartPie className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("bar")}
            className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${
              view === "bar" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"
            }`}
            aria-label="Bar chart"
          >
            <ChartColumnBig className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-72 flex items-center justify-center text-white/40 text-sm">
          Loading…
        </div>
      ) : slices.length === 0 ? (
        <div className="h-72 flex flex-col items-center justify-center gap-2 text-white/40">
          <Wallet className="h-10 w-10 text-white/20" />
          <p className="text-sm">No categorized spending yet.</p>
        </div>
      ) : (
        <>
          {view === "donut" ? (
            <DonutView
              arcs={arcs}
              total={total}
              selected={selected}
              onSelect={toggle}
            />
          ) : (
            <BarView slices={slices} selected={selected} onSelect={toggle} />
          )}

          <div className="my-4 h-px bg-white/10" />
          <DetailPanel
            selectedSlice={selectedSlice}
            total={total}
            categories={slices.length}
            transactions={slices.reduce((n, s) => n + s.count, 0)}
            onClear={() => setSelected(null)}
          />
        </>
      )}
    </div>
  );
}

// --- Donut ---
function DonutView({
  arcs,
  total,
  selected,
  onSelect,
}: {
  arcs: (Slice & { start: number; end: number; mid: number; frac: number })[];
  total: number;
  selected: string | null;
  onSelect: (dbValue: string) => void;
}) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[300px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full h-full">
        {arcs.map((a) => {
          const isSel = selected === a.cfg.dbValue;
          const dimmed = selected && !isSel;
          const ds = a.start + GAP_DEG / 2;
          const de = Math.max(ds + 0.5, a.end - GAP_DEG / 2);
          const [dx, dy] = isSel ? popOffset(a.mid) : [0, 0];
          return (
            <path
              key={a.cfg.dbValue}
              d={arcPath(ds, de)}
              fill={a.cfg.color}
              transform={`translate(${dx} ${dy})`}
              opacity={dimmed ? 0.35 : 1}
              onClick={() => onSelect(a.cfg.dbValue)}
              className="cursor-pointer transition-opacity"
            />
          );
        })}
      </svg>

      {/* Icon badges floating on each slice */}
      {arcs.map((a) => {
        const isSel = selected === a.cfg.dbValue;
        const dimmed = selected && !isSel;
        const [dx, dy] = isSel ? popOffset(a.mid) : [0, 0];
        const [bx, by] = pointOnCircle(BADGE_R, a.mid);
        const Icon = a.cfg.icon;
        return (
          <button
            key={a.cfg.dbValue}
            onClick={() => onSelect(a.cfg.dbValue)}
            style={{
              left: `${((bx + dx) / SIZE) * 100}%`,
              top: `${((by + dy) / SIZE) * 100}%`,
              backgroundColor: a.cfg.color,
            }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center rounded-full h-8 w-8 ring-2 ring-[#1c1f17] shadow-md transition-all ${
              dimmed ? "opacity-40" : "opacity-100"
            } ${isSel ? "scale-110" : ""}`}
            aria-label={a.cfg.label}
          >
            <Icon className="h-4 w-4 text-white" strokeWidth={2.5} />
          </button>
        );
      })}

      {/* Center total */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
          Total
        </span>
        <span className="text-xl font-bold tracking-tight">{inr(total)}</span>
      </div>
    </div>
  );
}

// --- Bar ---
function BarView({
  slices,
  selected,
  onSelect,
}: {
  slices: Slice[];
  selected: string | null;
  onSelect: (dbValue: string) => void;
}) {
  const max = Math.max(...slices.map((s) => s.total));

  return (
    <div className="px-1 pt-2">
      <div className="flex items-end justify-between gap-2 h-52">
        {slices.map((s) => {
          const isSel = selected === s.cfg.dbValue;
          const dimmed = selected && !isSel;
          const pct = max > 0 ? (s.total / max) * 100 : 0;
          const Icon = s.cfg.icon;
          return (
            <button
              key={s.cfg.dbValue}
              onClick={() => onSelect(s.cfg.dbValue)}
              className="group flex-1 flex flex-col items-center justify-end gap-2 h-full"
            >
              {/* amount label on the selected bar */}
              <span
                className={`text-[10px] font-bold tabular-nums transition-opacity ${
                  isSel ? "opacity-100" : "opacity-0 group-hover:opacity-60"
                }`}
              >
                {inr(s.total)}
              </span>
              {/* the bar */}
              <div className="w-full flex items-end justify-center" style={{ height: "100%" }}>
                <div
                  style={{
                    height: `${Math.max(pct, 3)}%`,
                    backgroundColor: s.cfg.color,
                    opacity: dimmed ? 0.35 : 1,
                  }}
                  className={`w-full max-w-9 rounded-t-lg transition-all ${
                    isSel ? "ring-2 ring-white/40" : ""
                  }`}
                />
              </div>
              {/* icon badge */}
              <span
                style={{ backgroundColor: s.cfg.color, opacity: dimmed ? 0.4 : 1 }}
                className={`flex items-center justify-center rounded-full h-7 w-7 shrink-0 transition-all ${
                  isSel ? "scale-110" : ""
                }`}
              >
                <Icon className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// --- Shared detail panel (bottom row) ---
function DetailPanel({
  selectedSlice,
  total,
  categories,
  transactions,
  onClear,
}: {
  selectedSlice: (Slice & { frac: number }) | null;
  total: number;
  categories: number;
  transactions: number;
  onClear: () => void;
}) {
  if (selectedSlice) {
    const Icon = selectedSlice.cfg.icon;
    const pct = Math.round(selectedSlice.frac * 100);
    return (
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            style={{ backgroundColor: selectedSlice.cfg.color }}
            className="flex items-center justify-center rounded-full h-11 w-11"
          >
            <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
          </span>
          <div>
            <p className="font-bold leading-tight">{selectedSlice.cfg.label}</p>
            <p className="text-xs text-white/40">{pct}% of total</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p
              className="font-bold leading-tight flex items-center justify-end gap-1"
              style={{ color: selectedSlice.cfg.color }}
            >
              <ChevronDown className="h-4 w-4" />
              {inr(selectedSlice.total)}
            </p>
            <p className="text-xs text-white/40">
              {selectedSlice.count} transaction{selectedSlice.count === 1 ? "" : "s"}
            </p>
          </div>
          <button
            onClick={onClear}
            className="flex items-center justify-center h-7 w-7 rounded-full bg-white/10 text-white/60 hover:bg-white/20 transition-colors"
            aria-label="Clear selection"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center rounded-full h-11 w-11 bg-white/10">
          <Wallet className="h-5 w-5 text-white/80" />
        </span>
        <div>
          <p className="font-bold leading-tight">Total spent</p>
          <p className="text-xs text-white/40">{categories} categories</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold leading-tight">{inr(total)}</p>
        <p className="text-xs text-white/40">{transactions} transactions</p>
      </div>
    </div>
  );
}
