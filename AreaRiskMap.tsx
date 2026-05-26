import React from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";

interface AreaInfo {
  id: string;
  name: string;
  score: number;
  status: 'Critical' | 'High' | 'Medium' | 'Low';
  color: string;
  darkColor: string;
  pattern: string;
  svgPath: string;
}

interface AreaRiskMapProps {
  onAreaSelect: (areaName: string) => void;
  selectedArea: string;
}

const areas: AreaInfo[] = [
  {
    id: "municipal",
    name: "Kano Municipal",
    score: 92,
    status: "Critical",
    color: "#4A0E0E", // Dark red
    darkColor: "#ef4444",
    pattern: "diagonal-stripes",
    svgPath: "M  20,10 L 180,10 L 150,90 L  50,90 Z"
  },
  {
    id: "north",
    name: "Kano North",
    score: 78,
    status: "High",
    color: "#C62828", // Red
    darkColor: "#f87171",
    pattern: "crosshatch",
    svgPath: "M 150,90 L 280,90 L 250,170 L  80,170 Z"
  },
  {
    id: "south",
    name: "Kano South",
    score: 65,
    status: "Medium",
    color: "#F57C00", // Amber
    darkColor: "#fb923c",
    pattern: "dots",
    svgPath: "M  80,170 L 250,170 L 220,250 L  40,250 Z"
  },
  {
    id: "kumbotso",
    name: "Kumbotso",
    score: 58,
    status: "Medium",
    color: "#F57C00", // Amber
    darkColor: "#fb923c",
    pattern: "dots",
    svgPath: "M  40,250 L 220,250 L 190,320 L  10,320 Z"
  },
  {
    id: "dala",
    name: "Dala",
    score: 35,
    status: "Low",
    color: "#2E7D32", // Green
    darkColor: "#4ade80",
    pattern: "solid",
    svgPath: "M 180,10 L 320,10 L 280,90 L 150,90 Z"
  }
];

export default function AreaRiskMap({ onAreaSelect, selectedArea }: AreaRiskMapProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800 transition shadow-xs flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-gray-900 dark:text-gray-100 text-sm">
            Interactive Area Risk Heat Map
          </h3>
          <span className="font-mono text-[9px] uppercase tracking-wide text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md dark:bg-orange-950/20 dark:text-orange-400">
            Kano State
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          each area  is rendered with tactile patterns and standard severity scale to support accessible scanning. Tap a region to update factors.
        </p>
      </div>

      {/* SVG Interactive Map Container */}
      <div className="relative my-4 flex justify-center items-center bg-gray-50 dark:bg-gray-950 rounded-lg p-2 border border-gray-200/40 dark:border-gray-850 h-72">
        <svg 
          viewBox="0 0 350 340" 
          className="w-full max-w-72 h-full drop-shadow-md select-none"
          role="img"
          aria-label="Tactile choropleth map representing poverty risk indexes across municipal boundaries."
        >
          {/* SVG Pattern Definitions for Accessibility (Pattern overlays) */}
          <defs>
            <pattern id="diagonal-stripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="10" stroke="#374151" strokeWidth="2" opacity="0.15" />
            </pattern>
            <pattern id="crosshatch" width="8" height="8" patternUnits="userSpaceOnUse">
              <rect width="8" height="8" fill="none" />
              <path d="M 0 0 L 8 8 M 8 -0 L 0 8" stroke="#374151" strokeWidth="1" opacity="0.15" />
            </pattern>
            <pattern id="dots" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.5" fill="#374151" opacity="0.15" />
            </pattern>
          </defs>

          {/* Rendering the regions */}
          {areas.map((area) => {
            const isSelected = selectedArea === area.name;
            return (
              <g 
                key={area.id} 
                onClick={() => onAreaSelect(area.name)}
                className="cursor-pointer group focus:outline-hidden"
                role="button"
                aria-pressed={isSelected}
              >
                {/* Underlay representing Base Color */}
                <path
                  d={area.svgPath}
                  fill={area.color}
                  className="transition duration-300 group-hover:opacity-90 stroke-white dark:stroke-gray-900"
                  strokeWidth={isSelected ? "3" : "1.5"}
                />
                
                {/* Tactile Pattern Overlay */}
                {area.pattern !== "solid" && (
                  <path
                    d={area.svgPath}
                    fill={`url(#${area.pattern})`}
                    className="pointer-events-none stroke-none"
                  />
                )}

                {/* Selected Status Overlay Ring highlighting */}
                {isSelected && (
                  <path
                    d={area.svgPath}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="3.5"
                    className="animate-pulse pointer-events-none"
                  />
                )}
              </g>
            );
          })}

          {/* Interactive Human Read labels overlay on map */}
          <text x="75" y="45" fill="#ffffff" className="text-[12px] font-bold pointer-events-none font-display">Municipal</text>
          <text x="210" y="45" fill="#ffffff" className="text-[12px] font-bold pointer-events-none font-display">Dala</text>
          <text x="160" y="125" fill="#ffffff" className="text-[12px] font-bold pointer-events-none font-display">Kano North</text>
          <text x="135" y="205" fill="#ffffff" className="text-[12px] font-bold pointer-events-none font-display">Kano South</text>
          <text x="100" y="285" fill="#ffffff" className="text-[12px] font-bold pointer-events-none font-display">Kumbotso</text>
        </svg>

        {/* Floating current choice context indicator */}
        <div className="absolute top-2 right-2 bg-white/95 dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-lg p-2 text-left pointer-events-none shadow-sm max-w-[130px]">
          <span className="text-[8px] font-bold font-mono text-gray-400 block uppercase">Selected</span>
          <span className="text-xs font-bold text-gray-850 dark:text-gray-150 block truncate">{selectedArea}</span>
        </div>
      </div>

      {/* Map Legend: High-Fidelity Risk Overview with Horizontal indicator bars */}
      <div className="border-t border-gray-100 dark:border-gray-800 pt-3.5 mt-3 space-y-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-bold text-gray-850 dark:text-gray-200 font-display">
            Risk Overview by Local Area
          </span>
          <span className="text-[10px] font-mono font-medium text-gray-400">
            Click to Filter Map & Trends
          </span>
        </div>

        <div className="space-y-2.5">
          {areas.map((area) => {
            const isSelected = selectedArea === area.name;
            const scorePercent = area.score;
            
            // Assign color badge classes
            let progressBg = "bg-green-500";
            let textStatusColor = "text-green-700 dark:text-green-400";
            let badgeBg = "bg-green-50 dark:bg-green-950/20";

            if (area.status === 'Critical') {
              progressBg = "bg-red-700";
              textStatusColor = "text-red-700 dark:text-red-400";
              badgeBg = "bg-red-50 dark:bg-red-950/20";
            } else if (area.status === 'High') {
              progressBg = "bg-orange-600";
              textStatusColor = "text-orange-600 dark:text-orange-400";
              badgeBg = "bg-orange-50 dark:bg-orange-950/20";
            } else if (area.status === 'Medium') {
              progressBg = "bg-amber-500";
              textStatusColor = "text-amber-500 dark:text-amber-400";
              badgeBg = "bg-amber-50 dark:bg-amber-950/20";
            }

            return (
              <div 
                key={area.id}
                onClick={() => onAreaSelect(area.name)}
                className={`group p-2 rounded-xl border transition cursor-pointer ${
                  isSelected 
                    ? "bg-orange-55/40 border-orange-200 dark:bg-orange-950/10 dark:border-orange-900/40 shadow-xs" 
                    : "bg-transparent border-transparent hover:bg-gray-50 dark:hover:bg-gray-850"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center space-x-2">
                    {/* Small square indicator */}
                    <div 
                      className="w-2.5 h-2.5 rounded-xs" 
                      style={{ backgroundColor: area.color }}
                    />
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {area.name}
                    </span>
                  </div>
                  
                  {/* Score & Badge details */}
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-semibold text-gray-700 dark:text-gray-300">
                      {area.score}
                    </span>
                    <span className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wide border border-transparent ${textStatusColor} ${badgeBg}`}>
                      {area.status}
                    </span>
                  </div>
                </div>

                {/* Horizontal Level bar */}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${progressBg} rounded-full transition-all duration-500`}
                    style={{ width: `${scorePercent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
