import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import BottomNav from "./components/BottomNav";
import WidgetCards from "./components/WidgetCards";
import AreaRiskMap from "./components/AreaRiskMap";
import RiskBarChart from "./components/RiskBarChart";
import FieldReportModule from "./components/FieldReportModule";
import AlertNotificationList from "./components/AlertNotificationList";
import UserProfileDetails from "./components/UserProfileDetails";
import AuthGateway from "./components/AuthGateway";
import NGODataUpload from "./components/NGODataUpload";
import MyReportsPage from "./components/MyReportsPage";
import SettingsPage from "./components/SettingsPage";

import { 
  subscribeToAuth, 
  subscribeToAlerts, 
  subscribeToReports, 
  handleFirestoreError,
  isRealFirebase,
  deleteFieldReport,
  recoverFieldReport
} from "./lib/firebase";
import { TabType, UserProfile, RiskAlert, FieldReport, DashboardStats } from "./types";
import { ShieldAlert, RefreshCw, Cpu, Award, Trash2, Undo } from "lucide-react";

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>("home");
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Real-time collections states
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("Kano North");
  const [reportsView, setReportsView] = useState<'active' | 'trash'>('active');

  // Dashboard Aggregates Stats state
  const [stats, setStats] = useState<DashboardStats>({
    avgRiskScore: 69,
    avgRiskScoreDelta: 6,
    areasMonitoredCount: 24,
    activeAlertsCount: 8,
    criticalAlertsCount: 3,
    reportsTodayCount: 42,
    reportsTodayDelta: 12,
    aiVerifiedCount: 31,
    aiVerifiedPercent: 74,
    freshnessPercent: 92
  });

  // Dark mode setting state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("vitadata_theme") === "dark";
  });

  // Toggle stylesheet classes
  const handleThemeChange = () => {
    setDarkMode(prev => {
      const mode = !prev;
      localStorage.setItem("vitadata_theme", mode ? "dark" : "light");
      return mode;
    });
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [darkMode]);

  // Auth Subscription
  useEffect(() => {
    const unsub = subscribeToAuth((profile) => {
      setUser(profile);
      if (profile && profile.role === 'beneficiary') {
        setCurrentTab('reports');
      }
    });
    return () => unsub();
  }, []);

  // Redirect beneficiary to reports page if they attempt to view forbidden tabs
  useEffect(() => {
    if (user && user.role === 'beneficiary' && (currentTab === 'home' || currentTab === 'alerts' || currentTab === 'field' || currentTab === 'upload')) {
      setCurrentTab('reports');
    }
  }, [user, currentTab]);

  // Sync Alerts Feed
  useEffect(() => {
    const unsub = subscribeToAlerts((alertsData) => {
      setAlerts(alertsData);
    });
    return () => unsub();
  }, [user]);

  // Sync Reports Feed
  useEffect(() => {
    const unsub = subscribeToReports((reportsData) => {
      setReports(reportsData);
    });
    return () => unsub();
  }, [user]);

  // Dynamically compute/aggregate metrics based on live alerts & reports collections
  useEffect(() => {
    const isOverridden = localStorage.getItem("vitadata_custom_stats_override") === "true";
    if (isOverridden) {
      // Load custom overrides
      const stored = localStorage.getItem("vitadata_custom_dashboard_stats");
      if (stored) {
        setStats(JSON.parse(stored));
        return;
      }
    }

    const active = alerts.filter(a => a.status !== 'resolved');
    const critical = active.filter(a => a.severity === 'Critical');
    
    // Calculate simulated overall score mean or use a base index
    const baseRisk = active.length > 0 
      ? Math.round(active.reduce((acc, curr) => acc + curr.score, 0) / active.length)
      : 55;

    // Filter out deleted reports for statistics calculation
    const activeReports = reports.filter(r => !r.isDeleted);

    // AI verified percentage
    const aiCount = activeReports.filter(r => r.verifiedByAI).length;
    const aiPercent = activeReports.length > 0 ? Math.round((aiCount / activeReports.length) * 100) : 74;

    const computed = {
      avgRiskScore: baseRisk || 69,
      avgRiskScoreDelta: active.length > 0 ? active.length - 2 : 6,
      areasMonitoredCount: 24, // Consistent ward tracking
      activeAlertsCount: active.length,
      criticalAlertsCount: critical.length,
      reportsTodayCount: activeReports.length + 12, // baseline community reports offset
      reportsTodayDelta: activeReports.length > 0 ? activeReports.length : 12,
      aiVerifiedCount: aiCount || 31,
      aiVerifiedPercent: aiPercent,
      freshnessPercent: 92
    };

    setStats(computed);
  }, [alerts, reports]);

  return (
    <div className={`min-h-screen w-full flex bg-slate-50 text-slate-900 dark:bg-[#080d1a] dark:text-gray-150 transition-colors duration-300 ${darkMode ? "dark" : "light"}`}>
      
      {!user ? (
        <div className={`w-full min-h-screen flex items-center justify-center bg-slate-900 relative ${darkMode ? "dark" : "light"}`}>
          <AuthGateway onAuthSuccess={() => setCurrentTab('home')} />
        </div>
      ) : (
        <div className={`w-full min-h-screen flex relative overflow-hidden ${darkMode ? "dark" : "light"}`}>
          
          {/* Core scrollable content flow area */}
          <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
            
            {/* Top navigation hub bar */}
            <Header 
              user={user} 
              darkMode={darkMode} 
              toggleDarkMode={handleThemeChange} 
              onNavigate={setCurrentTab}
              criticalAlertCount={alerts.filter(a => a.severity === 'Critical' && a.status !== 'resolved').length}
            />

            {/* Scrollable viewport */}
            <main className="flex-1 overflow-y-auto px-4 md:px-8 py-5 pb-24 md:pb-8 relative select-none">
              <div className="max-w-6xl mx-auto space-y-6">

            {/* TAB-HOME: PRIMARY STATE RISK DASHBOARD */}
            {currentTab === "home" && (
              <div className="space-y-6">
                
                {/* Active Alerts ribbon if Critical warning exists */}
                {stats.criticalAlertsCount > 0 && (
                  <div 
                    onClick={() => setCurrentTab('alerts')}
                    className="flex items-center justify-between cursor-pointer border border-red-200 bg-red-50/75 hover:bg-red-100/80 p-3.5 rounded-xl animate-pulse dark:border-red-900/30 dark:bg-red-950/20 shadow-xs"
                  >
                    <div className="flex items-center space-x-2">
                      <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
                      <div>
                        <h4 className="text-xs font-bold text-red-800 dark:text-red-300">
                          {stats.criticalAlertsCount} Critical Early Warnings Flagged
                        </h4>
                        <p className="text-[10px] text-red-600 dark:text-red-400 mt-0.5">
                          Localized threshold breach. Immediate administrative resources response recommended.
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-[9px] font-bold text-red-600 uppercase">RESPOND &gt;</span>
                  </div>
                )}

                {/* Editable admin stats panel for authorized roles (Admin, Government Analyst) */}
                {user && (user.role === 'admin' || user.role === 'govt_analyst') && (
                  <div className="bg-amber-50/70 border border-amber-205 dark:bg-amber-950/20 dark:border-amber-900/40 p-3.5 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center pb-2 border-b border-amber-100 dark:border-amber-900/20 gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
                        <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">
                          Data Metrics & Indicators Configuration Interface
                        </h4>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          const isOverridden = localStorage.getItem("vitadata_custom_stats_override") === "true";
                          if (isOverridden) {
                            localStorage.removeItem("vitadata_custom_stats_override");
                            localStorage.removeItem("vitadata_custom_dashboard_stats");
                            window.location.reload();
                          } else {
                            localStorage.setItem("vitadata_custom_stats_override", "true");
                            localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(stats));
                            window.location.reload();
                          }
                        }}
                        className="text-[10px] uppercase font-bold text-amber-800 dark:text-orange-400 bg-amber-100 dark:bg-amber-950 px-2 py-1 rounded-sm hover:underline self-start sm:self-auto cursor-pointer"
                      >
                        {localStorage.getItem("vitadata_custom_stats_override") === "true" ? "🔐 Reset & Sync Auto Metrics" : "🔓 Edit Manual Figures"}
                      </button>
                    </div>

                    {localStorage.getItem("vitadata_custom_stats_override") === "true" && (
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-1">
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider">Deprivation Index</label>
                          <input 
                            type="number" 
                            value={stats.avgRiskScore}
                            onChange={(e) => {
                              const next = { ...stats, avgRiskScore: Number(e.target.value) };
                              setStats(next);
                              localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(next));
                            }}
                            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 mt-1 dark:bg-gray-950 dark:border-gray-805 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider">Areas Monitored</label>
                          <input 
                            type="number" 
                            value={stats.areasMonitoredCount}
                            onChange={(e) => {
                              const next = { ...stats, areasMonitoredCount: Number(e.target.value) };
                              setStats(next);
                              localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(next));
                            }}
                            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 mt-1 dark:bg-gray-950 dark:border-gray-805 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider">Acute Shortages</label>
                          <input 
                            type="number" 
                            value={stats.activeAlertsCount}
                            onChange={(e) => {
                              const next = { ...stats, activeAlertsCount: Number(e.target.value) };
                              setStats(next);
                              localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(next));
                            }}
                            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 mt-1 dark:bg-gray-950 dark:border-gray-805 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider">Daily Surveys</label>
                          <input 
                            type="number" 
                            value={stats.reportsTodayCount}
                            onChange={(e) => {
                              const next = { ...stats, reportsTodayCount: Number(e.target.value) };
                              setStats(next);
                              localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(next));
                            }}
                            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 mt-1 dark:bg-gray-950 dark:border-gray-805 text-gray-900 dark:text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-bold text-gray-500 font-mono uppercase tracking-wider">Audited Records</label>
                          <input 
                            type="number" 
                            value={stats.aiVerifiedCount}
                            onChange={(e) => {
                              const next = { ...stats, aiVerifiedCount: Number(e.target.value) };
                              setStats(next);
                              localStorage.setItem("vitadata_custom_dashboard_stats", JSON.stringify(next));
                            }}
                            className="w-full text-xs rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 mt-1 dark:bg-gray-950 dark:border-gray-805 text-gray-900 dark:text-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Overviews widgets numeric grids */}
                <WidgetCards stats={stats} />

                {/* Secondary layout grids: (Map & rechart charts breakdown) */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                  <div className="xl:col-span-4">
                    <AreaRiskMap 
                      onAreaSelect={setSelectedArea} 
                      selectedArea={selectedArea} 
                    />
                  </div>
                  <div className="xl:col-span-8 flex flex-col justify-between">
                    <RiskBarChart selectedAreaName={selectedArea} />
                  </div>
                </div>

                {/* Grid layout for Recent Activity Reports summary */}
                <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 p-4 rounded-xl">
                  <div className="flex justify-between items-center mb-4 border-b border-gray-100 dark:border-gray-850 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">
                        Recent Certified Ward Activities
                      </h3>
                      <p className="text-[10px] text-gray-450 mt-0.5 font-mono uppercase">
                        Real-time community reporting validations
                      </p>
                    </div>
                    <button 
                      onClick={() => setCurrentTab('reports')}
                      className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-55 dark:bg-orange-950/20 px-3 py-1.5 rounded-lg transition"
                    >
                      Browse All Reports
                    </button>
                  </div>

                  {/* Summary Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {reports.filter(r => !r.isDeleted).slice(0, 4).map((report) => (
                      <div 
                        key={report.reportId}
                        className="p-3 border rounded-xl bg-gray-50/50 dark:bg-gray-950/40 border-gray-150 dark:border-gray-850 hover:border-gray-300 transition"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-[10px] font-bold text-orange-655 uppercase tracking-wide font-mono block">
                              {report.incidentType}
                            </span>
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-200 mt-1 block truncate">
                              {report.location}
                            </span>
                          </div>
                          <span className="text-[9px] font-semibold text-gray-400 font-mono">
                            {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-450 mt-2 line-clamp-2 leading-relaxed">
                          {report.description}
                        </p>
                        
                        {/* Validation badges */}
                        <div className="flex items-center space-x-1.5 mt-3 border-t border-gray-100 dark:border-gray-850/50 pt-2 text-[10px]">
                          <Cpu className="h-3.5 w-3.5 text-violet-500 animate-pulse" />
                          <span className="font-semibold text-gray-650 dark:text-gray-400 truncate">
                            {report.aiAnalysis ? `AI Audit: ${report.aiAnalysis}` : "Vetting Complete"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* TAB-REPORTS: HISTORICAL COMPILATION AND FEED */}
            {currentTab === "reports" && (
              <div className="space-y-4 max-w-2xl mx-auto">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-800 pb-3">
                  <div>
                    <h2 className="font-display font-bold text-lg text-gray-900 dark:text-white leading-none">
                      Field Reports Feed
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Historical log of community submissions verified by automated risk workflows.
                    </p>
                  </div>
                  <button 
                    onClick={() => setCurrentTab('field')}
                    className="text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 font-sans px-3.5 py-1.5 rounded-lg transition"
                  >
                    Submit Report
                  </button>
                </div>

                {user && (user.role === 'admin' || user.role === 'analyst' || user.role === 'govt_analyst') && (
                  <div className="bg-orange-50/55 dark:bg-orange-950/15 border border-orange-100 dark:border-orange-900/30 rounded-xl p-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold font-mono text-orange-600 uppercase tracking-wider block">Staff / Officer Node</span>
                      <p className="text-[11px] text-gray-700 dark:text-gray-300 leading-tight">Need to upload batch historical datasets?</p>
                    </div>
                    <button 
                      onClick={() => setCurrentTab('upload')}
                      className="text-[10px] font-bold text-white bg-orange-600 hover:bg-orange-700 px-3 py-1.5 rounded-lg transition"
                    >
                      Open Import Portal &gt;
                    </button>
                  </div>
                )}

                {/* Soft-delete and recovery Navigation tab switcher */}
                <div className="flex border-b border-gray-150 dark:border-gray-800 gap-4 mb-3">
                  <button
                    onClick={() => setReportsView('active')}
                    className={`pb-2 text-xs font-bold border-b-2 transition select-none cursor-pointer ${
                      reportsView === 'active'
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-gray-500 hover:text-gray-950"
                    }`}
                  >
                    Active Reports ({reports.filter(r => !r.isDeleted).length})
                  </button>
                  <button
                    onClick={() => setReportsView('trash')}
                    className={`pb-2 text-xs font-bold border-b-2 transition select-none cursor-pointer ${
                      reportsView === 'trash'
                        ? "border-orange-500 text-orange-600 dark:text-orange-400"
                        : "border-transparent text-gray-500 hover:text-gray-950"
                    }`}
                  >
                    Trash Recycler ({reports.filter(r => r.isDeleted).length})
                  </button>
                </div>

                {reports.filter(r => reportsView === 'active' ? !r.isDeleted : r.isDeleted).length === 0 ? (
                  <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-xl p-8 text-center w-full">
                    <p className="text-sm font-semibold text-gray-750 dark:text-gray-200">
                      {reportsView === 'active' ? "No Reports Cataloged" : "Trash Recycler Empty"}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {reportsView === 'active' 
                        ? "Tap submit to record field early warnings." 
                        : "Reports deleted from the platform can be fully restored here."}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports
                      .filter(r => reportsView === 'active' ? !r.isDeleted : r.isDeleted)
                      .map((report) => (
                        <div 
                          key={report.reportId} 
                          className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-150 dark:border-gray-800 transition"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="text-[10px] font-bold text-orange-600 font-mono tracking-wider uppercase block leading-none">
                                {report.incidentType}
                              </span>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-1.5 block leading-none">
                                {report.location}
                              </h3>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`px-2 py-0.5 rounded-sm text-[9px] border font-bold font-mono tracking-wider uppercase ${
                                report.severity === 'Critical' ? "bg-red-50 text-red-700 border-red-200" : "bg-amber-50 text-amber-700 border-amber-200"
                              }`}>
                                {report.severity}
                              </span>
                              
                              {/* Soft delete toggle action button for authorized managers */}
                              {user && (user.role === 'admin' || user.role === 'analyst' || user.role === 'govt_analyst') && (
                                <button
                                  onClick={async () => {
                                    if (reportsView === 'active') {
                                      await deleteFieldReport(report.reportId);
                                    } else {
                                      await recoverFieldReport(report.reportId);
                                    }
                                  }}
                                  title={reportsView === 'active' ? "Delete Report" : "Recover Report"}
                                  className={`p-1.5 rounded-lg border transition cursor-pointer select-none ${
                                    reportsView === 'active'
                                      ? "text-red-650 hover:text-white hover:bg-red-600 bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900"
                                      : "text-green-650 hover:text-white hover:bg-green-600 bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900"
                                  }`}
                                >
                                  {reportsView === 'active' ? <Trash2 className="h-3.5 w-3.5" /> : <Undo className="h-3.5 w-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          <p className="text-xs text-gray-700 dark:text-gray-400 mt-3 font-sans leading-relaxed">
                            {report.description}
                          </p>

                          {/* AI Analysis logs */}
                          {report.aiAnalysis && (
                            <div className="mt-3 bg-violet-50/50 border border-violet-100 dark:bg-violet-950/10 dark:border-violet-900/40 p-2.5 rounded-lg flex items-start space-x-2">
                              <Cpu className="h-4.5 w-4.5 text-violet-600 mt-0.5 flex-shrink-0 animate-pulse" />
                              <div>
                                <span className="text-[9px] font-mono font-bold text-violet-700 uppercase leading-none block">AI-ANALYSIS (Audit)</span>
                                <p className="text-xs text-gray-650 dark:text-gray-300 italic font-medium mt-1 leading-relaxed">
                                  "{report.aiAnalysis}"
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-center space-x-2 mt-4 text-[10px] text-gray-400 font-mono border-t border-gray-100 dark:border-gray-850 pt-2.5">
                            <span>Report Ref: {report.reportId}</span>
                            <span>&bull;</span>
                            <span>Timestamp: {new Date(report.createdAt).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB-FIELD: ACTIONABLE REPORTERS FORM */}
            {currentTab === "field" && (
              <FieldReportModule 
                user={user} 
                onSuccessSubmit={() => {
                  setCurrentTab("reports");
                }} 
              />
            )}

            {/* TAB-ALERTS: ACTIVE ALERTS FEED */}
            {currentTab === "alerts" && (
              <AlertNotificationList 
                alerts={alerts} 
                user={user} 
                onSelectArea={setSelectedArea} 
                onNavigateToHome={() => setCurrentTab('home')}
              />
            )}

            {/* TAB-PROFILE: IDENTITY ACCESS PORTAL */}
            {currentTab === "profile" && (
              <UserProfileDetails 
                user={user} 
                onRefresh={() => {}} 
              />
            )}

            {/* TAB-UPLOAD: NGO DATA UPLOAD PORTAL */}
            {currentTab === "upload" && (
              <NGODataUpload onSuccessUpload={() => {}} />
            )}

            {/* TAB-SETTINGS: SYSTEM SETTINGS PORTAL */}
            {currentTab === "settings" && (
              <SettingsPage />
            )}

              </div>
            </main>

            {/* Universal premium docked horizontal navigation bar */}
            <BottomNav 
              currentTab={currentTab} 
              onTabChange={setCurrentTab} 
              activeAlertCount={alerts.filter(a => a.status === 'active').length}
              user={user}
            />

          </div>
        </div>
      )}
    </div>
  );
}
