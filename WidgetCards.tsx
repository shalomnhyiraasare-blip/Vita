import React from "react";
import { 
  TrendingUp, 
  Map, 
  AlertTriangle, 
  FileSpreadsheet, 
  Cpu, 
  RefreshCw 
} from "lucide-react";
import { DashboardStats } from "../types";

interface WidgetCardsProps {
  stats: DashboardStats;
}

export default function WidgetCards({ stats }: WidgetCardsProps) {
  const cards = [
    {
      title: "Deprivation Index",
      value: stats.avgRiskScore,
      subtitle: `${stats.avgRiskScoreDelta > 0 ? "+" : ""}${stats.avgRiskScoreDelta} deviation points`,
      badge: "Critical Stress",
      badgeColor: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900",
      icon: TrendingUp,
      iconColor: "text-red-500 bg-red-50/50 dark:bg-red-950/20",
    },
    {
      title: "Areas Monitored",
      value: stats.areasMonitoredCount,
      subtitle: "High-poverty sectors",
      badge: "Active Areas",
      badgeColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900",
      icon: Map,
      iconColor: "text-green-500 bg-green-50/50 dark:bg-green-950/20",
    },
    {
      title: "Acute Stress Signals",
      value: stats.activeAlertsCount,
      subtitle: `${stats.criticalAlertsCount} critical shortages`,
      badge: "Action Required",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900",
      icon: AlertTriangle,
      iconColor: "text-amber-500 bg-amber-50/50 dark:bg-red-950/20",
    },
    {
      title: "Daily Field Surveys",
      value: stats.reportsTodayCount,
      subtitle: `+${stats.reportsTodayDelta} logs submitted`,
      badge: "Vetted Feedback",
      badgeColor: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900",
      icon: FileSpreadsheet,
      iconColor: "text-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
    },
    {
      title: "Vouched & Audited",
      value: stats.aiVerifiedCount,
      subtitle: `${stats.aiVerifiedPercent}% accuracy rate`,
      badge: "Audit Perfect",
      badgeColor: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/20 dark:text-violet-400 dark:border-violet-900",
      icon: Cpu,
      iconColor: "text-violet-500 bg-violet-50/50 dark:bg-violet-950/20",
    },
    {
      title: "Telemetry Latency",
      value: `${stats.freshnessPercent}%`,
      subtitle: "Near real-time sync",
      badge: "Fresh Stream",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900",
      icon: RefreshCw,
      iconColor: "text-teal-500 bg-teal-50/50 dark:bg-teal-950/20",
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div 
            key={idx} 
            className="flex flex-col justify-between bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800 transition shadow-xs hover:border-gray-300 dark:hover:border-gray-705 group"
          >
            {/* Header part */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 truncate max-w-[80%]">
                {card.title}
              </span>
              <div className={`p-1.5 rounded-lg ${card.iconColor} group-hover:scale-105 transition duration-200`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            {/* Numerical Core */}
            <div className="mt-2.5">
              <span className="font-display text-2.5xl md:text-3.5xl font-bold text-gray-900 dark:text-white leading-none">
                {card.value}
              </span>
            </div>

            {/* Status Footer and Deltas */}
            <div className="mt-3.5 flex flex-col space-y-1.5">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-mono truncate">
                {card.subtitle}
              </span>
              <div className="flex">
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] font-bold font-mono tracking-wide border uppercase ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
