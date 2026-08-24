import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, RefreshCw, Sparkles, FileCheck, ArrowRight } from 'lucide-react';

export default function ResumeUploadCard({ onUpload, isUploading, existingResume, onDelete }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState(null);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    setFileError(null);
    if (!file) return false;

    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidExt = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isValidExt) {
      setFileError('Invalid file type. Please upload a PDF (.pdf) or Word (.docx) document.');
      return false;
    }

    const maxSize = 5 * 1024 * 1024; // 5 MB
    if (file.size > maxSize) {
      setFileError('File size exceeds 5MB. Please upload a smaller document.');
      return false;
    }

    return true;
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onUpload(file);
      }
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
        onUpload(file);
      }
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 KB';
    const kb = bytes / 1024;
    if (kb < 1024) return `${Math.round(kb)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="w-full mb-8">
      {/* Existing Active Resume Banner */}
      {existingResume && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 glass-card rounded-2xl p-5 border border-emerald-500/30 bg-slate-950/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <FileCheck size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="text-white font-bold text-sm truncate max-w-xs sm:max-w-md">
                  {existingResume.fileName}
                </h4>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold border border-emerald-500/30">
                  Active Resume
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Analyzed on {formatDate(existingResume.analyzedAt || existingResume.updatedAt)} • {formatFileSize(existingResume.fileSize)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-2 border border-slate-700 disabled:opacity-50"
            >
              <RefreshCw size={14} className={isUploading ? 'animate-spin' : ''} />
              Upload Updated Resume
            </button>
          </div>
        </motion.div>
      )}

      {/* Upload Drop Zone (Always visible if no resume, or collapsed if resume exists) */}
      <div
        className={`relative glass-card rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden ${
          dragActive
            ? 'border-[#2F80FF] bg-[#2F80FF]/10 scale-[1.01]'
            : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
        } p-8 sm:p-10 text-center flex flex-col items-center justify-center cursor-pointer`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.doc,.txt"
          className="hidden"
          onChange={handleChange}
          disabled={isUploading}
        />

        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2F80FF]/5 via-transparent to-[#9A5BFF]/5 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#2F80FF]/20 to-[#9A5BFF]/20 border border-[#2F80FF]/30 text-[#4FA3FF] flex items-center justify-center mb-4 shadow-[0_0_25px_rgba(47,128,255,0.15)]">
            <UploadCloud size={32} />
          </div>

          <h3 className="text-xl font-bold text-white mb-1.5">
            {existingResume ? 'Upload an Updated Resume' : 'Upload Your Resume for AI Analysis'}
          </h3>
          <p className="text-slate-400 text-sm max-w-md mb-5">
            Drag & drop your PDF or DOCX file here, or <span className="text-[#4FA3FF] font-semibold underline underline-offset-2">browse your computer</span>.
          </p>

          <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap justify-center">
            <span className="flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800">
              <FileText size={12} className="text-[#2F80FF]" /> PDF / DOCX
            </span>
            <span>•</span>
            <span>Max 5MB</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">ATS & Role Matching Guaranteed</span>
          </div>

          {fileError && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"
            >
              <AlertCircle size={14} className="shrink-0" />
              <span>{fileError}</span>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
