"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";

interface AdminGalleryProps {
  images: GposeImage[];
  onDelete: (publicId: string) => void;
}

export default function AdminGallery({ images, onDelete }: AdminGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleDelete = async (publicId: string) => {
    if (confirmId !== publicId) {
      setConfirmId(publicId);
      return;
    }

    setDeleting(publicId);
    setConfirmId(null);
    try {
      const res = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(publicId);
    } catch {
      console.error("Delete error");
    } finally {
      setDeleting(null);
    }
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          fontFamily: "var(--font-mono)",
          color: "var(--silver-dim)",
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        NO_ASSETS :: Upload images above
      </div>
    );
  }

  return (
    <div className="admin-grid">
      <AnimatePresence>
        {images.map((image) => (
          <motion.div
            key={image.public_id}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* Image */}
            <div
              style={{ position: "relative", aspectRatio: "1", background: "#000" }}
            >
              <Image
                src={image.secure_url}
                alt={image.title}
                fill
                style={{ objectFit: "cover" }}
                sizes="200px"
              />
              {deleting === image.public_id && (
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0.8)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "rgba(255,100,120,0.9)",
                    letterSpacing: "0.08em",
                  }}
                >
                  DELETING...
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ padding: "8px" }}>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "10px",
                  color: "var(--white)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  marginBottom: "6px",
                }}
              >
                {image.title}
              </p>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--silver-dim)",
                  marginBottom: "8px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {image.zone || "—"} / {image.job || "—"}
              </p>
              <button
                className={`y2k-btn ${confirmId === image.public_id ? "y2k-btn-danger" : "y2k-btn-ghost"}`}
                style={{ width: "100%", fontSize: "9px", padding: "5px" }}
                onClick={() => handleDelete(image.public_id)}
                disabled={deleting === image.public_id}
              >
                {confirmId === image.public_id
                  ? "CONFIRM DELETE"
                  : "DELETE"}
              </button>
              {confirmId === image.public_id && (
                <button
                  className="y2k-btn y2k-btn-ghost"
                  style={{
                    width: "100%",
                    fontSize: "9px",
                    padding: "4px",
                    marginTop: "4px",
                  }}
                  onClick={() => setConfirmId(null)}
                >
                  CANCEL
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
