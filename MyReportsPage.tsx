import React, { useState, useEffect } from "react";
import { 
  FileText, 
  Trash2, 
  RotateCcw, 
  PlusCircle, 
  CheckCircle, 
  CloudRain, 
  Archive,
  AlertCircle,
  Inbox,
  PenTool,
  Loader2
} from "lucide-react";
import { FieldReport, UserProfile } from "../types";
import { 
  subscribeToReports, 
  deleteFieldReport, 
  recoverFieldReport,
  addFieldReport
} from "../lib/firebase";

interface MyReportsPageProps {
  user: UserProfile | null;
  onNavigateToSubmit: () => void;
}

export default function MyReportsPage({ user, onNavigateToSubmit }: MyReportsPageProps) {
  const [activeSubTab, setActiveSubTab] = useState<"drafts" | "saved" | "deleted">("saved");
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Load backend reports
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToReports((data) => {
      // If beneficiary, filter reports to only show theirs. Otherwise show all for testing.
      if (user && user.role === "beneficiary") {
        setReports(data.filter(r => r.submittedBy === user.uid || r.submittedBy === "anonymous-chw"));
      } else {
        setReports(data);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  // Load Saved drafts from localStorage
  useEffect(() => {
    try {
      const data = localStorage.getItem("vitadata_local_db_reports_drafts");
      if (data) {
        setDrafts(JSON.parse(data));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Update drafts store
  const saveDraftsStore = (updatedDrafts: any[]) => {
    setDrafts(updatedDrafts);
    localStorage.setItem("vitadata_local_db_reports_drafts", JSON.stringify(updatedDrafts));
  };

  // Publish a draft to live database
  const handlePublishDraft = async (draftIndex: number) => {
    const draft = drafts[draftIndex];
    try {
      setStatusMessage("Syncing and publishing draft metadata...");
      await addFieldReport({
        location: draft.location || "Kano Municipal",
        latitude: draft.latitude || 12.06,
        longitude: draft.longitude || 8.52,
        incidentType: draft.incidentType || "Water Access Failure",
        severity: draft.severity || "Medium",
        description: draft.description || "",
        createdAt: new Date().toISOString(),
        submittedBy: user?.uid || "beneficiary-user",
        verifiedByAI: true,
        aiAnalysis: "Automatically approved from cached offline field sync node queue.",
        evidence: []
      });

      // Remove from drafts
      const nextDrafts = [...drafts];
      nextDrafts.splice(draftIndex, 1);
      saveDraftsStore(nextDrafts);

      setStatusMessage("Draft published successfully to central database!");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error(e);
      setStatusMessage("Failed to publish. Local draft cached.");
    }
  };

  // Delete a draft from draft view
  const handleDeleteDraft = (index: number) => {
    const nextDrafts = [...drafts];
    nextDrafts.splice(index, 1);
    saveDraftsStore(nextDrafts);
    setStatusMessage("Local draft report discarded.");
    setTimeout(() => setStatusMessage(null), 3000);
  };

  // Delete a submitted report (Soft delete)
  const handleSoftDeleteSubmitted = async (reportId: string) => {
    try {
      await deleteFieldReport(reportId);
      setStatusMessage("Report soft-deleted. Moved to Deleted section.");
      setTimeout(() => setStatusMessage(null), 3500);
    } catch (e) {
      console.error(e);
    }
  };

  // Recover/Restore a report from soft delete
  const handleRecoverReport = async (reportId: string) => {
    try {
      await recoverFieldReport(reportId);
      setStatusMessage("Report restored successfully back to live dashboard!");
      setTimeout(() => setStatusMessage(null), 3550);
    } catch (e) {
      console.error(e);
    }
  };

  // List filter states
  const savedReports = reports.filter(r => !r.isDeleted);
  const deletedReports = reports.filter(r => r.isDeleted);

  return (
    <div className="max-w-xl mx-auto space-y-4 select-none pb-20">
      
      {/* Banner */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-150 dark:border-gray-800 p-4 transition-colors duration-200">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="font-display font-bold text-gray-950 dark:text-gray-100 text-lg leading-tight">
              My Reports
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {user?.role === "beneficiary" 
                ? "Manage reports, look up indicators & track neighborhood audits." 
                : "Manage and recover extreme poverty reports on the file nodes."
              }
            </p>
          </div>
          <button 
            onClick={onNavigateToSubmit}
            className="flex items-center space-x-1 border border-orange-200 bg-orange-50 hover:bg-orange-100 dark:bg-orange-950/20 dark:border-orange-900/40 text-orange-600 text-xs font-bold py-2 px-3 rounded-lg active:scale-95 transition"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Submit Report</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40 text-orange-700 dark:text-orange-300 rounded-xl p-3 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="h-4 w-4" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Sub tabs selector */}
      <div className="grid grid-cols-3 gap-1 bg-gray-100/70 dark:bg-gray-950 rounded-xl p-1 border border-gray-150 dark:border-gray-850">
        {[
          { id: "drafts", label: "My Drafts", count: drafts.length, icon: PenTool },
          { id: "saved", label: "Saved Reports", count: savedReports.length, icon: CheckCircle },
          { id: "deleted", label: "Deleted", count: deletedReports.length, icon: Trash2 }
        ].map((subTab) => {
          const Icon = subTab.icon;
          const isActive = activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              onClick={() => setActiveSubTab(subTab.id as any)}
              className={`flex items-center justify-center space-x-1.5 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                isActive 
                  ? "bg-white dark:bg-gray-900 text-orange-600 shadow-sm dark:text-white" 
                  : "text-gray-500 hover:text-gray-800 dark:hover:text-gray-300"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{subTab.label}</span>
              <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded-full ${
                isActive ? "bg-orange-100 text-orange-700 dark:bg-orange-950/50" : "bg-gray-200 text-gray-600 dark:bg-gray-850 dark:text-gray-400"
              }`}>
                {subTab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Lists switcher */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-gray-500">
            <Loader2 className="h-8 w-8 animate-spin text-orange-600 mb-2" />
            <p className="text-xs font-mono">Syncing reporting ledger data...</p>
          </div>
        ) : (
          <>
            {/* Drafts Tab rendering */}
            {activeSubTab === "drafts" && (
              drafts.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-500">
                  <Inbox className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-300">No temporary drafts found</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Offline inputs are captured here when you select "Save as Draft" in the report page.</p>
                </div>
              ) : (
                drafts.map((draft, idx) => (
                  <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-orange-50 dark:bg-orange-950/20 text-orange-600 border border-orange-100 dark:border-orange-900/40 text-[9px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase mb-1">
                          {draft.incidentType}
                        </span>
                        <span className="text-[9px] text-gray-400 font-mono">Draft State</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{draft.location}</p>
                      <p className="text-[11px] text-gray-650 dark:text-gray-300 mt-1 lines-clamp-3 italic">
                        "{draft.description || "No description provided."}"
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 border-t border-gray-50 dark:border-gray-850 pt-2 text-[10px] font-semibold text-gray-500">
                      <span>Submitter Name: {draft.submitterName || "Anonymous Representative"}</span>
                      <span>• Role: {draft.submitterRole || "CHW"}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-2 border-t border-gray-50 dark:border-gray-850 pt-2.5">
                      <button
                        onClick={() => handleDeleteDraft(idx)}
                        className="flex items-center space-x-1 border border-red-200 bg-white hover:bg-red-50 text-red-650 text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition cursor-pointer dark:bg-gray-950 dark:border-red-905/30"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Discard</span>
                      </button>
                      <button
                        onClick={() => handlePublishDraft(idx)}
                        className="flex items-center space-x-1 border border-orange-550 bg-orange-600 text-white text-[10.5px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer hover:bg-orange-700"
                      >
                        <CheckCircle className="h-3.5 w-3.5" />
                        <span>Publish to Cloud</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Saved published reports view */}
            {activeSubTab === "saved" && (
              savedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-500">
                  <CheckCircle className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-300">No published reports submitted yet</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Use the Submit Report tab to capture real-time micro-level developments.</p>
                </div>
              ) : (
                savedReports.map((report) => (
                  <div key={report.id} className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-green-50 dark:bg-green-950/20 text-green-650 border border-green-150 dark:border-green-905/30 text-[9px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase">
                          {report.incidentType}
                        </span>
                        <span className="text-[9.5px] text-gray-400 font-mono">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-1 bg-gray-50 dark:bg-gray-950 p-1 px-1.5 rounded inline-block">
                        {report.location}
                      </p>
                      <p className="text-xs text-gray-650 dark:text-gray-300 mt-2">
                        {report.description}
                      </p>

                      {/* AI Vetted Assessment details inside the card */}
                      {report.aiAnalysis && (
                        <div className="mt-3 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 p-2 rounded-lg">
                          <div className="flex items-center space-x-1 mb-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-orange-600" />
                            <span className="text-[9px] font-bold font-mono tracking-wider text-orange-600 uppercase">
                              AI Risk Assessment Summary :
                            </span>
                          </div>
                          <p className="text-[10.5px] italic text-gray-500 leading-normal pl-2.5">
                            "{report.aiAnalysis}"
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-gray-50 dark:border-gray-850 pt-2.5">
                      <div className="text-[9px] font-sans text-gray-400">
                        Submitted By Node: <span className="font-mono text-[9px] text-gray-500 font-bold uppercase">{report.submittedBy.substring(0, 8)}</span>
                      </div>
                      <button
                        onClick={() => handleSoftDeleteSubmitted(report.id)}
                        className="flex items-center space-x-1 border border-pink-100 hover:bg-pink-50 text-pink-750 text-[10.5px] font-bold px-2.5 py-1.5 rounded-lg active:scale-95 transition cursor-pointer dark:bg-gray-950 dark:border-pink-905/30 hover:border-pink-600"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Delete (Trash)</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}

            {/* Deleted Section (Soft recycler bin) */}
            {activeSubTab === "deleted" && (
              deletedReports.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-10 bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-850 rounded-2xl text-center text-gray-500">
                  <Archive className="h-10 w-10 text-gray-300 mb-2" />
                  <p className="text-xs font-bold text-gray-800 dark:text-gray-300">Recycle bin is empty</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">Soft-deleted items appear here and can be recovered/restored at any point.</p>
                </div>
              ) : (
                deletedReports.map((report) => (
                  <div key={report.id} className="bg-pink-50/10 dark:bg-pink-950/5 border border-pink-100 dark:border-pink-950/20 p-4 rounded-xl flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="bg-pink-50 dark:bg-pink-950/25 text-pink-750 border border-pink-100 text-[9px] font-bold font-mono px-2 py-0.5 rounded-sm uppercase">
                          {report.incidentType}
                        </span>
                        <span className="text-[9.5px] text-pink-700 font-mono">Deleted Stored Node</span>
                      </div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white mt-1">{report.location}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 italic line-through">
                        "{report.description}"
                      </p>
                    </div>
                    <div className="flex items-center justify-end space-x-2 border-t border-pink-100/40 pt-2.5">
                      <button
                        onClick={() => handleRecoverReport(report.id)}
                        className="flex items-center space-x-1 border border-green-200 bg-white hover:bg-green-50 text-green-650 text-[10.5px] font-bold px-3 py-1.5 rounded-lg active:scale-95 transition cursor-pointer dark:bg-gray-950 dark:border-green-650/30"
                      >
                        <RotateCcw className="h-3.5 w-3.5 text-green-650" />
                        <span>Restore & Recover</span>
                      </button>
                    </div>
                  </div>
                ))
              )
            )}
          </>
        )}
      </div>

    </div>
  );
}
