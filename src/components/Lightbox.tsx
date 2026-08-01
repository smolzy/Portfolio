"use client";

import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { GposeImage } from "@/types";

interface LightboxProps {
  image: GposeImage | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  currentIndex?: number;
  totalCount?: number;
}

export default function Lightbox({
  image,
  onClose,
  onNext,
  onPrev,
  currentIndex,
  totalCount,
}: LightboxProps) {
  const [copied, setCopied] = useState(false);
  const [imageCopied, setImageCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      } else if (e.key === "ArrowRight" && onNext) {
        onNext();
      } else if (e.key === "ArrowLeft" && onPrev) {
        onPrev();
      }
    };

    if (image) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [image, onClose, onNext, onPrev, isFullscreen]);

  if (!image) return null;

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/?img=${encodeURIComponent(image.public_id)}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleCopyImage = async () => {
    try {
      const response = await fetch(image.secure_url);
      const blob = await response.blob();
      const canvas = document.createElement("canvas");
      const img = document.createElement("img");
      const url = URL.createObjectURL(blob);

      await new Promise((resolve) => {
        img.onload = resolve;
        img.src = url;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      canvas.toBlob(async (pngBlob) => {
        if (!pngBlob) return;
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": pngBlob }),
        ]);
        setImageCopied(true);
        setTimeout(() => setImageCopied(false), 2500);
      }, "image/png");
    } catch {
      console.error("Failed to copy image to clipboard");
    }
  };

  return (
    <>
      {/* ── 1. FULLSCREEN THEATER MODE OVERLAY ───────────────────────── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 4000,
              background: "#000",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "relative", width: "100vw", height: "100vh" }}>
              <Image
                src={image.secure_url}
                alt={image.title}
                fill
                style={{ objectFit: "contain" }}
                priority
              />

              {/* Prev / Next controls in Fullscreen */}
              {onPrev && (
                <button
                  onClick={onPrev}
                  className="y2k-btn y2k-btn-ghost"
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 4100,
                    background: "rgba(0,0,0,0.6)",
                    fontSize: "18px",
                    padding: "12px 16px",
                    borderRadius: "50%",
                  }}
                  title="Previous image (◄)"
                >
                  ◄
                </button>
              )}
              {onNext && (
                <button
                  onClick={onNext}
                  className="y2k-btn y2k-btn-ghost"
                  style={{
                    position: "absolute",
                    right: "20px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    zIndex: 4100,
                    background: "rgba(0,0,0,0.6)",
                    fontSize: "18px",
                    padding: "12px 16px",
                    borderRadius: "50%",
                  }}
                  title="Next image (►)"
                >
                  ►
                </button>
              )}

              {/* Exit Fullscreen button */}
              <div
                style={{
                  position: "absolute",
                  top: "20px",
                  right: "20px",
                  zIndex: 4100,
                }}
              >
                <button
                  onClick={() => setIsFullscreen(false)}
                  className="y2k-btn y2k-btn-primary"
                  style={{ fontSize: "11px", padding: "6px 14px" }}
                >
                  ✕ EXIT FULLSCREEN
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 2. REGULAR LIGHTBOX MODAL ────────────────────────────────── */}
      <AnimatePresence>
        <motion.div
          key="lightbox-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          className="lightbox-backdrop"
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
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  flex: 1,
                  minWidth: 0,
                }}
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
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  VIEWER_v2.5 — {image.title}
                  {typeof currentIndex === "number" && typeof totalCount === "number" && (
                    <span style={{ color: "var(--cyan)", marginLeft: "8px" }}>
                      [{currentIndex + 1} / {totalCount}]
                    </span>
                  )}
                </span>
              </div>

              {/* Window Controls */}
              <div
                style={{
                  display: "flex",
                  gap: "6px",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <button
                  onClick={() => setIsFullscreen(true)}
                  className="y2k-btn y2k-btn-ghost"
                  style={{ padding: "3px 8px", fontSize: "9px" }}
                  title="View Fullscreen 4K"
                >
                  🗖 FULLSCREEN
                </button>
                <button
                  onClick={onClose}
                  className="y2k-btn y2k-btn-ghost"
                  style={{ padding: "3px 8px", fontSize: "9px" }}
                >
                  [ESC] CLOSE
                </button>
              </div>
            </div>

            {/* Body */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                minHeight: 0,
                flex: 1,
              }}
            >
              {/* Image Container with Side Nav Buttons */}
              <div
                style={{
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--bg-elevated)",
                  flexShrink: 0,
                }}
              >
                {/* Left Arrow Button */}
                {onPrev && (
                  <button
                    onClick={onPrev}
                    className="y2k-btn y2k-btn-ghost"
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      padding: "8px 12px",
                      fontSize: "14px",
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(4px)",
                      borderColor: "var(--border-accent)",
                    }}
                    title="Previous image (◄)"
                  >
                    ◄
                  </button>
                )}

                {/* Right Arrow Button */}
                {onNext && (
                  <button
                    onClick={onNext}
                    className="y2k-btn y2k-btn-ghost"
                    style={{
                      position: "absolute",
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: 10,
                      padding: "8px 12px",
                      fontSize: "14px",
                      background: "rgba(0,0,0,0.4)",
                      backdropFilter: "blur(4px)",
                      borderColor: "var(--border-accent)",
                    }}
                    title="Next image (►)"
                  >
                    ►
                  </button>
                )}

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

                {/* Corner resolution badge */}
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
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "14px",
                }}
              >
                <div>
                  {image.title?.trim() && (
                    <h3
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "var(--cyan)",
                        letterSpacing: "0.06em",
                        marginBottom: "6px",
                      }}
                    >
                      {image.title}
                    </h3>
                  )}
                  {image.tags.length > 0 && (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                      {image.tags.map((tag) => (
                        <span key={tag} className="tag-pill active">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={handleCopyImage}
                    className="y2k-btn y2k-btn-ghost"
                    style={{
                      fontSize: "10px",
                      padding: "6px 12px",
                    }}
                    title="Copy image directly to clipboard to paste (Ctrl+V) into Discord or X"
                  >
                    {imageCopied ? "✓ IMAGE COPIED!" : "📋 COPY IMAGE"}
                  </button>

                  <a
                    href={image.secure_url}
                    target="_blank"
                    download={`${image.title || "gpose"}.jpg`}
                    className="y2k-btn y2k-btn-ghost"
                    style={{
                      fontSize: "10px",
                      padding: "6px 12px",
                      textDecoration: "none",
                    }}
                  >
                    💾 DOWNLOAD HD
                  </a>

                  <button
                    onClick={handleCopyLink}
                    className="y2k-btn y2k-btn-primary"
                    style={{
                      fontSize: "10px",
                      padding: "6px 14px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <span>{copied ? "✓ LINK COPIED!" : "🔗 SHARE LINK"}</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </>
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
          fontSize: accent ? "13px" : "11px",
          fontWeight: accent ? 700 : 400,
          color: accent ? "var(--cyan)" : "var(--white)",
          letterSpacing: "0.04em",
        }}
      >
        {value}
      </span>
    </div>
  );
}
