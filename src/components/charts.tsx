"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { scoreTrend, weeklyStudy } from "@/lib/data";

export function StudyHoursChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weeklyStudy}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="day" tickLine={false} axisLine={false} />
          <YAxis tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Physics" fill="#0f172a" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Maths" fill="#0369a1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Further Maths" fill="#047857" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreTrendChart() {
  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={scoreTrend}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" tickLine={false} axisLine={false} />
          <YAxis domain={[40, 90]} tickLine={false} axisLine={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="Physics"
            stroke="#0f172a"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Maths"
            stroke="#0369a1"
            strokeWidth={2}
            dot={false}
          />
          <Line
            type="monotone"
            dataKey="Further Maths"
            stroke="#047857"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
