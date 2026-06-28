"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { TrendPoint } from "@/lib/intelligence/types";

const tooltipStyle = {
  contentStyle: {
    background: "#0a1628",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "12px",
    fontSize: "12px",
    color: "#D9E6F3",
  },
  labelStyle: { color: "#91A4B7" },
};

function formatAxisDate(date: string) {
  const d = new Date(date);
  return d.toLocaleDateString("fr-MA", { day: "numeric", month: "short" });
}

export function TrendAreaChart({
  data,
  color = "#37D6B5",
  height = 280,
  valueSuffix = "",
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
  valueSuffix?: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tick={{ fill: "#6B8299", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B8299", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          {...tooltipStyle}
          formatter={(value) => [`${Number(value ?? 0)}${valueSuffix}`, ""]}
          labelFormatter={(label) => formatAxisDate(String(label ?? ""))}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2}
          fill={`url(#grad-${color})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function TrendBarChart({
  data,
  color = "#37D6B5",
  height = 280,
}: {
  data: TrendPoint[];
  color?: string;
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatAxisDate}
          tick={{ fill: "#6B8299", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#6B8299", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip {...tooltipStyle} labelFormatter={(label) => formatAxisDate(String(label ?? ""))} />
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={32} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function HorizontalBarList({
  items,
  maxItems = 10,
}: {
  items: { name: string; count: number; delta?: number }[];
  maxItems?: number;
}) {
  const top = items.slice(0, maxItems);
  const max = Math.max(...top.map((i) => i.count), 1);

  return (
    <div className="space-y-3">
      {top.map((item) => (
        <div key={item.name}>
          <div className="mb-1 flex items-center justify-between gap-2 text-sm">
            <span className="truncate text-white">{item.name}</span>
            <span className="shrink-0 tabular-nums text-slate-muted">
              {item.count.toLocaleString("fr-MA")}
              {item.delta != null && item.delta !== 0 && (
                <span className={item.delta > 0 ? " text-emerald-400" : " text-red-400"}>
                  {" "}
                  {item.delta > 0 ? "+" : ""}
                  {item.delta}
                </span>
              )}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-mint/80 to-mint transition-all duration-700"
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CoverageDonut({
  segments,
}: {
  segments: { label: string; value: number; color: string }[];
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg viewBox="0 0 36 36" className="h-32 w-32 -rotate-90">
        {segments.map((seg) => {
          const pct = (seg.value / total) * 100;
          const dash = `${pct} ${100 - pct}`;
          const el = (
            <circle
              key={seg.label}
              cx="18"
              cy="18"
              r="15.9"
              fill="none"
              stroke={seg.color}
              strokeWidth="3.2"
              strokeDasharray={dash}
              strokeDashoffset={-offset}
              className="transition-all duration-700"
            />
          );
          offset += pct;
          return el;
        })}
      </svg>
      <div className="space-y-2 text-sm">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full" style={{ background: seg.color }} />
            <span className="text-slate-muted">{seg.label}</span>
            <span className="ml-auto tabular-nums text-white">
              {Math.round((seg.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
