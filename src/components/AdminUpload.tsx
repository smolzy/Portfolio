"use client";

import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { UploadFormData } from "@/types";

interface AdminUploadProps {
  onUploadSuccess: () => void;
}

interface Notification {
  id: string;
  type: "success" | "error";
  message: string;
}

export default function AdminUpload({ onUploadSuccess }: AdminUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [form, setForm] = useState<UploadFormData>({
    title: "",
    zone: "",
    job: "",
    preset: "",
    tags: "",
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addNotification = (type: "success" | "error", message: string) => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  };

  const handleFile = (f: File) => {
    if (!f.type.startsWith("image/")) {
      addNotification("error", "Only image files are accepted.");
      return;
    }
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) handleFile(dropped);
  }, []);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const compressImageIfNeeded = async (originalFile: File): Promise<File> => {
    const MAX_TARGET_BYTES = 3.5 * 1024 * 1024; // 3.5 MB target for Vercel 4.5MB limit
    if (originalFile.size <= MAX_TARGET_BYTES) {
      return originalFile;
    }

    return new Promise((resolve) => {
      const img = document.createElement("img");
      const url = URL.createObjectURL(originalFile);

      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        const MAX_DIM = 3840;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(originalFile);

        ctx.drawImage(img, 0, 0, width, height);

        const tryQuality = (q: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) return resolve(originalFile);
              if (blob.size <= MAX_TARGET_BYTES || q <= 0.45) {
                const newName = originalFile.name.replace(/\.[^/.]+$/, "") + ".jpg";
                resolve(new File([blob], newName, { type: "image/jpeg" }));
              } else {
                tryQuality(q - 0.1);
              }
            },
            "image/jpeg",
            q
          );
        };

        tryQuality(0.92);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(originalFile);
      };

      img.src = url;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      addNotification("error", "Please select an image first.");
      return;
    }

    setUploading(true);
    try {
      // Auto-compress heavy GPose screenshots client-side if file > 3.5MB
      const uploadFile = await compressImageIfNeeded(file);

      const fd = new FormData();
      fd.append("file", uploadFile);
      fd.append("title", form.title || file.name.replace(/\.[^/.]+$/, ""));
      fd.append("zone", form.zone);
      fd.append("job", form.job);
      fd.append("preset", form.preset);
      fd.append("tags", form.tags);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      const resData = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(resData.error || `Upload failed (Status ${res.status})`);
      }

      addNotification("success", `"${form.title || file.name}" uploaded successfully.`);
      setFile(null);
      setPreview(null);
      setForm({ title: "", zone: "", job: "", preset: "", tags: "" });
      onUploadSuccess();
    } catch (err: any) {
      addNotification("error", err?.message || "Upload failed. Check Cloudinary configuration.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Notifications */}
      <div
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: "300px",
        }}
      >
        <AnimatePresence>
          {notifications.map((n) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "var(--bg-elevated)",
                border: `1px solid ${n.type === "success" ? "var(--cyan)" : "rgba(255,80,80,0.5)"}`,
                padding: "10px 14px",
                borderRadius: "var(--radius-md)",
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color:
                  n.type === "success" ? "var(--cyan)" : "rgba(255,100,120,0.9)",
                boxShadow:
                  n.type === "success"
                    ? "var(--glow-subtle)"
                    : "0 0 10px rgba(255,80,80,0.15)",
              }}
            >
              {n.type === "success" ? "✓ " : "⚠ "}
              {n.message}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          {/* Drop Zone */}
          <div>
            <div
              className={`drop-zone ${dragOver ? "drag-over" : ""}`}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: "var(--radius-md)",
                padding: "24px",
                minHeight: "220px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {preview ? (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  style={{ objectFit: "contain" }}
                />
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "28px",
                      marginBottom: "8px",
                      color: "var(--border-accent)",
                    }}
                  >
                    ⊕
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--silver-dim)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    DROP IMAGE HERE
                  </p>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--border-accent)",
                      marginTop: "4px",
                    }}
                  >
                    or click to browse
                  </p>
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
            {file && (
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--silver-dim)",
                  marginTop: "6px",
                  letterSpacing: "0.06em",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {file.name} — {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            )}
          </div>

          {/* Form fields */}
          <div
            style={{ display: "flex", flexDirection: "column", gap: "10px" }}
          >
            {(
              [
                { key: "title", label: "TITLE", placeholder: "Starfall" },
                { key: "zone", label: "ZONE", placeholder: "Il Mheg" },
                { key: "job", label: "JOB", placeholder: "Astrologian" },
                {
                  key: "preset",
                  label: "PRESET",
                  placeholder: "Neneko_Pastel_v3",
                },
                {
                  key: "tags",
                  label: "TAGS (comma separated)",
                  placeholder: "Au Ra, Dawntrail, Pastel",
                },
              ] as const
            ).map(({ key, label, placeholder }) => (
              <div key={key}>
                <label
                  style={{
                    display: "block",
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--silver-dim)",
                    letterSpacing: "0.1em",
                    textTransform: "uppercase",
                    marginBottom: "4px",
                  }}
                >
                  {label}
                </label>
                <input
                  className="y2k-input"
                  type="text"
                  placeholder={placeholder}
                  value={form[key as keyof typeof form]}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, [key]: e.target.value }))
                  }
                />
              </div>
            ))}

            <button
              type="submit"
              className="y2k-btn y2k-btn-primary"
              disabled={uploading || !file}
              style={{
                marginTop: "8px",
                opacity: uploading || !file ? 0.5 : 1,
                cursor: uploading || !file ? "not-allowed" : "pointer",
              }}
            >
              {uploading ? "UPLOADING..." : "UPLOAD TO CLOUDINARY"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
