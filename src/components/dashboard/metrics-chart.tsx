"use client";

import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function MetricsChart({
  series,
  color = "#0ea5e9",
  label,
}: {
  series: { ts: string; value: number }[];
  color?: string;
  label: string;
}) {
  const data = series.map((s) => ({
    t: new Date(s.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    value: s.value,
  }));

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="t" hide />
          <YAxis
            width={44}
            tick={{ fill: "#6b7280", fontSize: 9 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(Math.round(v * 100) / 100)
            }
          />
          <Tooltip
            contentStyle={{
              background: "#0b1220",
              border: "1px solid #1c2740",
              borderRadius: 8,
              fontSize: 12,
              color: "#f9fafb",
            }}
            labelStyle={{ color: "#6b7280" }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${label})`}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
