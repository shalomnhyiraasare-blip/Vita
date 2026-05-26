import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowRight, RefreshCw, Download } from "lucide-react";

interface NGODataUploadProps {
  onSuccessUpload: () => void;
}

export default function NGODataUpload({ onSuccessUpload }: NGODataUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'validating' | 'completed' | 'errors'>('idle');
  const [fileName, setFileName] = useState("");
  const [summary, setSummary] = useState({
    received: 0,
    rejected: 0,
    errors: [] as string[]
  });

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processMockFile = (name: string) => {
    setFileName(name);
    setUploadState('uploading');

    // Simulate progress pipeline
    setTimeout(() => {
      setUploadState('validating');
      setTimeout(() => {
        // Mock checking logic: Reject half if filename contains 'error' or 'bad'
        const containsErrors = name.toLowerCase().includes("error") || name.toLowerCase().includes("bad") || Math.random() > 0.6;
        
        if (containsErrors) {
          setSummary({
            received: 42,
            rejected: 3,
            errors: [
              "Row 12: Latitude coordinate is invalid or missing.",
              "Row 29: Incident severity indicator is empty.",
              "Row 34: Description exceeds permitted 1000 character limit."
            ]
          });
          setUploadState('errors');
        } else {
          setSummary({
            received: 65,
            rejected: 0,
            errors: []
          });
          setUploadState('completed');
          onSuccessUpload();
        }
      }, 1200);
    }, 1000);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processMockFile(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processMockFile(e.target.files[0].name);
    }
  };

  const handleReset = () => {
    setUploadState('idle');
    setFileName("");
    setSummary({ received: 0, rejected: 0, errors: [] });
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-150 dark:border-gray-800 p-4 max-w-md mx-auto transition-all">
      {/* Title */}
      <div className="border-b border-gray-100 dark:border-gray-850 pb-2.5 mb-4">
        <h3 className="font-display font-bold text-gray-900 dark:text-gray-100 text-sm leading-none">
          Data Upload Portal
        </h3>
        <span className="font-mono text-[9px] uppercase tracking-wider text-orange-605 mt-1 block">
          Screen 4 - Real-time bulk data integration
        </span>
      </div>

      {uploadState === 'idle' && (
        <div 
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-6 text-center transition ${
            dragActive 
              ? "border-orange-500 bg-orange-50/20 dark:bg-orange-950/10" 
              : "border-gray-300 dark:border-gray-800 hover:border-orange-400"
          }`}
        >
          <Upload className="h-10 w-10 text-gray-400 mx-auto stroke-[1.5] mb-2 animate-bounce" />
          <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
            Drag and drop your dataset file here
          </p>
          <p className="text-[10px] text-gray-500 mt-1">
            Supports standardized CSV, JSON formats
          </p>

          <div className="relative mt-4">
            <input 
              type="file" 
              accept=".csv,.json"
              onChange={handleFileInput}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
              aria-label="File upload selector"
            />
            <button type="button" className="text-xs font-bold text-white bg-orange-650 hover:bg-orange-700 px-3.5 py-1.8 rounded-lg pointer-events-none">
              Browse Files
            </button>
          </div>
        </div>
      )}

      {(uploadState === 'uploading' || uploadState === 'validating') && (
        <div className="py-8 text-center space-y-3">
          <RefreshCw className="h-9 w-9 text-orange-600 animate-spin mx-auto" />
          <div>
            <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
              {uploadState === 'uploading' ? "Uploading Dataset File..." : "Validating Structure Constraints..."}
            </p>
            <p className="text-[10px] text-gray-400 font-mono mt-1">
              File: {fileName}
            </p>
          </div>
          {/* Progress simulated bar */}
          <div className="w-44 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden mx-auto">
            <div className={`h-full bg-orange-600 rounded-full ${
              uploadState === 'uploading' ? 'w-1/2 animate-pulse' : 'w-5/6'
            }`} />
          </div>
        </div>
      )}

      {uploadState === 'completed' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-green-50/50 dark:bg-green-950/10 border border-green-200 dark:border-green-900/40 p-3.5 text-center">
            <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-xs font-bold text-green-800 dark:text-green-300">
              Uploader Validations Succeeded
            </p>
            <p className="text-[10px] text-green-600 dark:text-green-400 font-mono mt-1">
              File: {fileName}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 p-3 rounded-xl divide-y divide-gray-100 dark:divide-gray-850 text-xs">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400 font-medium">Rows received & loaded:</span>
              <span className="font-bold text-green-600">{summary.received}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400 font-medium">Rows rejected:</span>
              <span className="font-bold text-gray-700 dark:text-gray-300">{summary.rejected}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="flex items-center justify-center w-full bg-orange-600 text-white text-xs font-bold py-2.5 rounded-lg hover:bg-orange-700 cursor-pointer"
          >
            Upload Another Dataset File
          </button>
        </div>
      )}

      {uploadState === 'errors' && (
        <div className="space-y-4">
          <div className="rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 p-3.5 text-center">
            <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-red-800 dark:text-red-400">
              Bulk validation errors detected
            </p>
            <p className="text-[10px] text-red-600 dark:text-red-500 font-mono mt-1">
              File: {fileName}
            </p>
          </div>

          {/* Validation report container */}
          <div className="bg-gray-50 dark:bg-gray-950 border border-gray-150 dark:border-gray-850 p-3 rounded-xl space-y-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-wide border-b border-gray-200/40 pb-1.5">
              <span>Error Vetting Logs</span>
              <span className="text-red-600">3 Rows Rejected</span>
            </div>
            <div className="space-y-1">
              {summary.errors.map((err, idx) => (
                <p key={idx} className="text-[10.5px] font-mono text-red-600 dark:text-red-400 leading-normal">
                  • {err}
                </p>
              ))}
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={handleReset}
              className="flex-1 bg-gray-100 hover:bg-gray-250 text-gray-800 text-xs font-bold py-2.5 rounded-lg dark:bg-gray-800 dark:text-white transition cursor-pointer"
            >
              Retry Upload
            </button>
            <button
              type="button"
              className="inline-flex items-center justify-center border border-gray-200 hover:bg-gray-50 dark:border-gray-800 text-gray-600 dark:text-gray-400 p-2.5 rounded-lg transition text-xs"
              title="Download full errors logging report"
            >
              <Download className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
