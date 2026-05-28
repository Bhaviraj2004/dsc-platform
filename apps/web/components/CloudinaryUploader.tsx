"use client";

import { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import axios from "axios";

interface CloudinaryUploaderProps {
  onUploadSuccess: (url: string, name: string) => void;
  onUploadStart?: () => void;
}

export default function CloudinaryUploader({
  onUploadSuccess,
  onUploadStart,
}: CloudinaryUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndUpload(droppedFile);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      validateAndUpload(selectedFile);
    }
  };

  const validateAndUpload = (fileToUpload: File) => {
    // Basic validation
    if (fileToUpload.size > 10 * 1024 * 1024) {
      setErrorMsg("File size must be less than 10MB");
      setStatus("error");
      return;
    }

    setFile(fileToUpload);
    uploadFile(fileToUpload);
  };

  const uploadFile = async (targetFile: File) => {
    try {
      setStatus("uploading");
      setErrorMsg("");
      setProgress(10);
      if (onUploadStart) onUploadStart();

      // Check if Cloudinary is configured
      if (cloudName && uploadPreset) {
        const formData = new FormData();
        formData.append("file", targetFile);
        formData.append("upload_preset", uploadPreset);

        const response = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
          formData,
          {
            onUploadProgress: (progressEvent) => {
              const total = progressEvent.total || targetFile.size;
              const current = progressEvent.loaded;
              const percentCompleted = Math.round((current * 100) / total);
              setProgress(percentCompleted);
            },
          }
        );

        const secureUrl = response.data.secure_url;
        setStatus("success");
        onUploadSuccess(secureUrl, targetFile.name);
      } else {
        // Fallback Mock Simulation
        console.log("Cloudinary credentials not detected. Simulating file upload...");
        let currentProgress = 10;
        const interval = setInterval(() => {
          currentProgress += Math.floor(Math.random() * 20) + 10;
          if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            setStatus("success");
            // Standard simulated file URL
            const simulatedUrl = `https://res.cloudinary.com/demo/image/upload/v1570979139/sample.jpg`;
            onUploadSuccess(simulatedUrl, targetFile.name);
          }
          setProgress(currentProgress);
        }, 150);
      }
    } catch (err: any) {
      console.error("Upload error details:", err);
      setErrorMsg(err.response?.data?.error?.message || "Upload failed. Check console for details.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={() => status !== "uploading" && inputRef.current?.click()}
        className={`w-full relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center transition-all cursor-pointer select-none
          ${dragActive ? "border-zinc-900 bg-zinc-50" : "border-zinc-200 bg-white hover:border-zinc-400"}
          ${status === "uploading" ? "pointer-events-none bg-zinc-50/50" : ""}
          ${status === "success" ? "border-green-200 bg-green-50/20" : ""}
          ${status === "error" ? "border-red-200 bg-red-50/20" : ""}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
        />

        {status === "idle" && (
          <>
            <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
              <UploadCloud className="w-6 h-6 text-zinc-400" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 mb-1">
              Drag & drop document here, or click to browse
            </p>
            <p className="text-xs text-zinc-400">
              PDF, DOC, DOCX, PNG, JPG up to 10MB
            </p>
            {!cloudName && (
              <span className="mt-3 text-[10px] bg-zinc-100 text-zinc-500 font-medium px-2 py-0.5 rounded-full">
                ⚡ Simulation Mode Enabled (Ready)
              </span>
            )}
          </>
        )}

        {status === "uploading" && (
          <div className="w-full flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-zinc-500 animate-pulse" />
            </div>
            <p className="text-sm font-semibold text-zinc-800 mb-2 truncate max-w-xs">
              Uploading {file?.name}...
            </p>
            <div className="w-full max-w-[240px] bg-zinc-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-zinc-900 h-1.5 rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-400 mt-2 font-medium">
              {progress}% uploaded
            </span>
          </div>
        )}

        {status === "success" && (
          <div className="w-full flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <p className="text-sm font-semibold text-green-900 mb-1 truncate max-w-xs">
              {file?.name}
            </p>
            <p className="text-xs text-green-600 font-medium mb-3">
              Upload completed successfully!
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatus("idle");
                setFile(null);
                setProgress(0);
              }}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors border border-zinc-200 bg-white rounded-lg px-3 py-1.5"
            >
              Upload another file
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="w-full flex flex-col items-center">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <p className="text-sm font-semibold text-red-900 mb-1">
              Upload Failed
            </p>
            <p className="text-xs text-red-600 font-medium mb-3 text-center max-w-[260px]">
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setStatus("idle");
                setFile(null);
                setProgress(0);
              }}
              className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 transition-colors border border-zinc-200 bg-white rounded-lg px-3 py-1.5"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
