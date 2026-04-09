"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Loader2, CheckCircle2, AlertCircle, ImagePlus } from "lucide-react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const MAX_SIZE = 10 * 1024 * 1024;

interface UploadResult {
  publicUrl: string;
  key: string;
}

export async function uploadToR2(
  file: File,
  context: string
): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("context", context);

  const res = await fetch("/api/v1/uploads/direct", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || "Upload failed");
  }

  const { data } = await res.json();
  return { publicUrl: data.publicUrl, key: data.key };
}

function validateFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return `Invalid type: ${file.type}. Use JPEG, PNG, WebP, or AVIF.`;
  }
  if (file.size > MAX_SIZE) {
    return `Too large: ${(file.size / 1024 / 1024).toFixed(1)}MB (max 10MB)`;
  }
  return null;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Drop Zone ──────────────────────────────────────────────────

interface DropZoneProps {
  context: string;
  multiple?: boolean;
  onUpload: (url: string) => void;
  className?: string;
}

interface UploadingFile {
  id: string;
  file: File;
  preview: string;
  status: "uploading" | "done" | "error";
  error?: string;
}

export function DropZone({
  context,
  multiple = false,
  onUpload,
  className = "",
}: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);

  const processFiles = useCallback(
    async (files: File[]) => {
      const items: UploadingFile[] = files.map((file) => {
        const error = validateFile(file);
        return {
          id: crypto.randomUUID(),
          file,
          preview: error ? "" : URL.createObjectURL(file),
          status: error ? ("error" as const) : ("uploading" as const),
          error: error || undefined,
        };
      });

      setUploading((prev) => [...prev, ...items]);

      for (const item of items) {
        if (item.status === "error") continue;

        try {
          const result = await uploadToR2(item.file, context);
          setUploading((prev) =>
            prev.map((f) =>
              f.id === item.id ? { ...f, status: "done" as const } : f
            )
          );
          onUpload(result.publicUrl);

          setTimeout(() => {
            setUploading((prev) => prev.filter((f) => f.id !== item.id));
            URL.revokeObjectURL(item.preview);
          }, 1200);
        } catch (err) {
          setUploading((prev) =>
            prev.map((f) =>
              f.id === item.id
                ? {
                    ...f,
                    status: "error" as const,
                    error: err instanceof Error ? err.message : "Upload failed",
                  }
                : f
            )
          );
        }
      }
    },
    [context, onUpload]
  );

  return (
    <div className={className}>
      {/* Drop zone */}
      <div
        onDragEnter={(e) => {
          e.preventDefault();
          dragCounter.current++;
          setIsDragging(true);
        }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={(e) => {
          e.preventDefault();
          dragCounter.current--;
          if (dragCounter.current === 0) setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();
          dragCounter.current = 0;
          setIsDragging(false);
          const files = Array.from(e.dataTransfer.files);
          processFiles(multiple ? files : files.slice(0, 1));
        }}
        onClick={() => inputRef.current?.click()}
        className={`group relative flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-6 py-10 transition-all duration-300 ${
          isDragging
            ? "border-emerald-500 bg-emerald-500/[0.04] shadow-[inset_0_0_30px_rgba(16,185,129,0.04)]"
            : "border-zinc-800 hover:border-zinc-600 hover:bg-white/[0.01]"
        }`}
      >
        {/* Animated background grid on drag */}
        {isDragging && (
          <div
            className="pointer-events-none absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.15) 1px, transparent 0)",
              backgroundSize: "24px 24px",
            }}
          />
        )}

        <div
          className={`mb-3 flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-300 ${
            isDragging
              ? "bg-emerald-500/15 text-emerald-400 scale-110"
              : "bg-zinc-800/50 text-zinc-500 group-hover:bg-zinc-800 group-hover:text-zinc-400"
          }`}
        >
          <ImagePlus className="h-5 w-5" />
        </div>
        <p className="text-[13px] text-zinc-400">
          Drop {multiple ? "images" : "an image"} here or{" "}
          <span className="font-medium text-emerald-400 underline-offset-2 group-hover:underline">
            browse
          </span>
        </p>
        <p className="mt-1.5 text-[11px] text-zinc-600">
          JPEG, PNG, WebP, AVIF — max 10MB
        </p>
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_TYPES.join(",")}
          multiple={multiple}
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            processFiles(multiple ? files : files.slice(0, 1));
            e.target.value = "";
          }}
          className="hidden"
        />
      </div>

      {/* Upload cards */}
      {uploading.length > 0 && (
        <div className="mt-3 space-y-2">
          {uploading.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-all duration-300 ${
                item.status === "done"
                  ? "border-emerald-500/20 bg-emerald-500/[0.03]"
                  : item.status === "error"
                    ? "border-red-500/20 bg-red-500/[0.03]"
                    : "border-zinc-800 bg-zinc-900/50"
              }`}
            >
              {/* Preview thumbnail */}
              {item.preview ? (
                <img
                  src={item.preview}
                  alt=""
                  className="h-11 w-11 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-zinc-800">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                </div>
              )}

              {/* Info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] font-medium text-foreground">
                  {item.file.name}
                </p>
                <div className="mt-0.5 flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">
                    {formatBytes(item.file.size)}
                  </span>
                  {item.status === "uploading" && (
                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                        style={{
                          animation: "upload-progress 2s ease-in-out infinite",
                          width: "100%",
                        }}
                      />
                    </div>
                  )}
                  {item.status === "done" && (
                    <span className="text-[10px] font-medium text-emerald-400">
                      Uploaded
                    </span>
                  )}
                  {item.status === "error" && (
                    <span className="truncate text-[10px] text-red-400">
                      {item.error}
                    </span>
                  )}
                </div>
              </div>

              {/* Status icon */}
              {item.status === "uploading" && (
                <Loader2 className="h-4 w-4 shrink-0 animate-spin text-emerald-400" />
              )}
              {item.status === "done" && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
              )}
              {item.status === "error" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setUploading((prev) =>
                      prev.filter((f) => f.id !== item.id)
                    );
                  }}
                  className="shrink-0 rounded-md p-1 text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        @keyframes upload-progress {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

// ─── Single Image Upload (for categories) ───────────────────────

interface SingleImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  context: string;
}

export function SingleImageUpload({
  value,
  onChange,
  context,
}: SingleImageUploadProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);

  if (value) {
    return (
      <div className="space-y-3">
        <div className="group relative inline-block overflow-hidden rounded-xl">
          <img
            src={value}
            alt="Category"
            className="h-36 w-36 rounded-xl border border-zinc-800 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onChange("")}
              className="rounded-lg bg-red-500 px-3 py-1.5 text-[11px] font-medium text-white shadow-lg transition-transform hover:bg-red-400 active:scale-95"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <DropZone context={context} multiple={false} onUpload={onChange} />
      <button
        type="button"
        onClick={() => setShowUrlInput(!showUrlInput)}
        className="text-[11px] text-zinc-500 transition-colors hover:text-zinc-300"
      >
        {showUrlInput ? "Hide URL input" : "Or enter URL manually"}
      </button>
      {showUrlInput && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://..."
          className="w-full rounded-xl border border-zinc-800 bg-zinc-900/50 px-3 py-2 text-[13px] outline-none transition-all duration-200 placeholder:text-zinc-600 focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.06)]"
        />
      )}
    </div>
  );
}
