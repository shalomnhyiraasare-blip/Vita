import React from "react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  LineChart, 
  Line,
  Cell
} from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface RiskBarChartProps {
  selectedAreaName: string;
}

// Poverty-feel indicators / incident type alignment
const areaFactorsMapping: { [key: string]: { name: string; value: number; color: string }[] } = {
  "Kano Municipal": [
    { name: "Water Access Failure", value: 94, color: "#EA580C" },
    { name: "Food Crisis Surge", value: 88, color: "#e11d48" },
    { name: "Sanitation Outbreak", value: 75, color: "#1319c9" },
    { name: "Extreme Shelter Stress", value: 68, color: "#d97706" },
    { name: "Clinic Supply Deficit", value: 90, color: "#EA580C" },
    { name: "Education Disruption", value: 45, color: "#2563eb" }
  ],
  "Kano North": [
    { name: "Water Access Failure", value: 85, color: "#EA580C" },
    { name: "Food Crisis Surge", value: 72, color: "#e11d48" },
    { name: "Sanitation Outbreak", value: 65, color: "#1319c9" },
    { name: "Extreme Shelter Stress", value: 45, color: "#d97706" },
    { name: "Clinic Supply Deficit", value: 38, color: "#EA580C" },
    { name: "Education Disruption", value: 30, color: "#2563eb" }
  ],
  "Kano South": [
    { name: "Water Access Failure", value: 62, color: "#EA580C" },
    { name: "Food Crisis Surge", value: 58, color: "#e11d48" },
    { name: "Sanitation Outbreak", value: 55, color: "#1319c9" },
    { name: "Extreme Shelter Stress", value: 42, color: "#d97706" },
    { name: "Clinic Supply Deficit", value: 30, color: "#EA580C" },
    { name: "Education Disruption", value: 25, color: "#2563eb" }
  ],
  "Kumbotso": [
    { name: "Water Access Failure", value: 55, color: "#EA580C" },
    { name: "Food Crisis Surge", value: 48, color: "#e11d48" },
    { name: "Sanitation Outbreak", value: 40, color: "#1319c9" },
    { name: "Extreme Shelter Stress", value: 35, color: "#d97706" },
    { name: "Clinic Supply Deficit", value: 52, color: "#EA580C" },
    { name: "Education Disruption", value: 20, color: "#2563eb" }
  ],
  "Dala": [
    { name: "Water Access Failure", value: 32, color: "#EA580C" },
    { name: "Food Crisis Surge", value: 28, color: "#e11d48" },
    { name: "Sanitation Outbreak", value: 22, color: "#1319c9" },
    { name: "Extreme Shelter Stress", value: 15, color: "#d97706" },
    { name: "Clinic Supply Deficit", value: 18, color: "#EA580C" },
    { name: "Education Disruption", value: 12, color: "#2563eb" }
  ]
};

// Past 30 Days historical extreme poverty score tracking trends (per Area)
const areaTrendMapping: { [key: string]: { day: string; score: number }[] } = {
  "Kano Municipal": [
    { day: "Day 5", score: 85 }, { day: "Day 10", score: 88 }, { day: "Day 15", score: 87 },
    { day: "Day 20", score: 91 }, { day: "Day 25", score: 90 }, { day: "Day 30", score: 92 }
  ],
  "Kano North": [
    { day: "Day 5", score: 70 }, { day: "Day 10", score: 72 }, { day: "Day 15", score: 75 },
    { day: "Day 20", score: 74 }, { day: "Day 25", score: 76 }, { day: "Day 30", score: 78 }
  ],
  "Kano South": [
    { day: "Day 5", score: 68 }, { day: "Day 10", score: 66 }, { day: "Day 15", score: 67 },
    { day: "Day 20", score: 65 }, { day: "Day 25", score: 64 }, { day: "Day 30", score: 65 }
  ],
  "Kumbotso": [
    { day: "Day 5", score: 50 }, { day: "Day 10", score: 52 }, { day: "Day 15", score: 55 },
    { day: "Day 20", score: 57 }, { day: "Day 25", score: 56 }, { day: "Day 30", score: 58 }
  ],
  "Dala": [
    { day: "Day 5", score: 40 }, { day: "Day 10", score: 38 }, { day: "Day 15", score: 35 },
    { day: "Day 20", score: 34 }, { day: "Day 25", score: 36 }, { day: "Day 30", score: 35 }
  ]
};

export default function RiskBarChart({ selectedAreaName }: RiskBarChartProps) {
  const factorData = areaFactorsMapping[selectedAreaName] || areaFactorsMapping["Kano North"];
  const trendData = areaTrendMapping[selectedAreaName] || areaTrendMapping["Kano North"];

  const currentScore = trendData[trendData.length - 1].score;
  const previousScore = trendData[0].score;
  const isRising = currentScore >= previousScore;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 select-none">
      
      {/* Poverty Indicators Breakdown Card */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800 transition">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 gap-2">
          <div>
            <span className="text-[10px] font-bold text-gray-500 font-mono block uppercase">INDICATORS</span>
            <h4 className="text-sm font-display font-bold text-gray-950 dark:text-gray-150 leading-none mt-1">
              {selectedAreaName} Deprivation Breakdown
            </h4>
          </div>
          <span className="text-xs font-mono font-bold text-orange-650 bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/40 px-2.5 py-1 rounded-md shrink-0 self-start">
            Deprivation Index: {currentScore}/100
          </span>
        </div>

        {/* Factors Bar Chart Container */}
        <div className="h-64 cursor-default">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={factorData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" className="dark:opacity-10" />
              <XAxis dataKey="name" tick={{ fill: '#9CA3AF', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                cursor={{ fill: 'rgba(229, 231, 235, 0.15)' }}
                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none' }}
                labelStyle={{ color: '#F3F4F6', fontWeight: 'bold', fontSize: '11px' }}
                itemStyle={{ color: '#EA580C', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[5, 5, 0, 0]} barSize={28}>
                {factorData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 30-Day Deprivation Trends Card */}
      <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800 transition">
        <div className="flex justify-between items-center mb-4">
          <div>
            <span className="text-[10px] font-bold text-gray-500 font-mono block uppercase">HIST_TRENDLINE</span>
            <h4 className="text-sm font-display font-bold text-gray-950 dark:text-gray-150 leading-none mt-1">
              30-Day Deprivation Trends
            </h4>
          </div>
          <div className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold ${
            isRising 
              ? "bg-red-50 text-red-650 dark:bg-red-950/20 dark:text-red-400 border border-red-100 dark:border-red-900/30" 
              : "bg-green-50 text-green-650 dark:bg-green-950/20 dark:text-green-400 border border-green-100 dark:border-green-905/30"
          }`}>
            {isRising ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
            <span>{isRising ? "RISING SEVERITY" : "MITIGATED DEPRIVATION"}</span>
          </div>
        </div>

        {/* Trend Line Chart Container */}
        <div className="h-64 cursor-default">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" className="dark:opacity-10" />
              <XAxis dataKey="day" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', borderRadius: '8px', border: 'none' }}
                labelStyle={{ color: '#F3F4F6', fontWeight: 'bold', fontSize: '11px' }}
                itemStyle={{ color: '#EA580C', fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#EA580C" 
                strokeWidth={3} 
                dot={{ r: 5, fill: "#EA580C", strokeWidth: 0 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
