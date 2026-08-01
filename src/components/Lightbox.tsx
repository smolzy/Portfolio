"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";
import { useEffect, useCallback } from "react";

interface LightboxProps {
  image: GposeImage | null;
  onClose: () => void;
}

export default function Lightbox({ image, onClose }: LightboxProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // Lock scroll when open
  useEffect(() => {
    if (image) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [image]);

  return (
    <AnimatePresence>
      {image && (
        <motion.div
          key="lightbox-backdrop"
          className="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <motion.div
            key="lightbox-window"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "auto",
              maxWidth: "min(90vw, 1100px)",
              width: "100%",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
              boxShadow:
                "0 0 0 1px var(--border-subtle), 0 40px 80px rgba(0,0,0,0.5), var(--glow-subtle)",
            }}
          >
            {/* Title Bar */}
            <div className="y2k-titlebar">
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <button
                  onClick={onClose}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "rgba(255,80,80,0.7)",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    flexShrink: 0,
                  }}
                  aria-label="Close"
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--border-accent)",
                    flexShrink: 0,
                  }}
                />
                <div
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    background: "var(--border-accent)",
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    color: "var(--silver-dim)",
                  }}
                >
                  VIEWER_v2.1 — {image.title}
                </span>
              </div>
              <button
                onClick={onClose}
                className="y2k-btn y2k-btn-ghost"
                style={{ padding: "4px 10px", fontSize: "10px" }}
              >
                [ESC] CLOSE
              </button>
            </div>

            {/* Body — scrolls if content taller than modal */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
                flex: 1,
              }}
            >
              {/* Image */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-elevated)",
                  // No overflow:hidden here — the image constrains itself with maxHeight
                  flexShrink: 0,
                }}
              >
                <Image
                  src={image.secure_url}
                  alt={image.title}
                  width={image.width}
                  height={image.height}
                  style={{
                    display: "block",
                    maxWidth: "100%",
                    maxHeight: "65vh",
                    width: "auto",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  priority
                />

                {/* Corner decoration */}
                <div
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--cyan)",
                    opacity: 0.5,
                    letterSpacing: "0.1em",
                  }}
                >
                  {image.width} × {image.height}
                </div>
              </div>


              {/* Metadata Panel */}
              <div
                style={{
                  padding: "16px 20px",
                  borderTop: "1px solid var(--border-default)",
                  background: "var(--bg-surface)",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <MetaField label="TITLE" value={image.title} accent />
                  <MetaField label="ZONE" value={image.zone || "—"} />
                  <MetaField label="JOB" value={image.job || "—"} />
                  <MetaField label="PRESET" value={image.preset || "—"} />
                </div>
                <div>
                  {image.tags.length > 0 && (
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--silver-dim)",
                          letterSpacing: "0.1em",
                          textTransform: "uppercase",
                          marginBottom: "6px",
                        }}
                      >
                        TAGS
                      </p>
                      <div
                        style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}
                      >
                        {image.tags.map((tag) => (
                          <span key={tag} className="tag-pill active">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MetaField({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div style={{ marginBottom: "8px" }}>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "9px",
          color: "var(--silver-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          display: "block",
          marginBottom: "2px",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "12px",
          color: accent ? "var(--cyan)" : "var(--white)",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
