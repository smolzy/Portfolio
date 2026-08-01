"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

interface WelcomeModalProps {
  onEnter?: () => void;
  title?: string;
  bgmTitle?: string;
}

export default function WelcomeModal({
  onEnter,
  title = "ZERICARD",
  bgmTitle,
}: WelcomeModalProps) {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Lock background scroll while welcome modal is open
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleEnter = () => {
    // Notify global window that user interacted so audio unlocks
    window._zericard_interacted = true;
    setIsOpen(false);
    if (onEnter) onEnter();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="welcome-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "var(--bg-overlay)",
            backdropFilter: "blur(16px) saturate(1.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          {/* Subtle grid background pattern */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(to right, rgba(0,85,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,85,255,0.03) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              pointerEvents: "none",
            }}
          />

          {/* Central Y2K Terminal Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "520px",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              overflow: "hidden",
              boxShadow:
                "0 0 0 1px var(--border-subtle), 0 30px 80px rgba(0,85,255,0.1), 0 20px 50px rgba(0,0,0,0.08)",
              position: "relative",
            }}
          >
            {/* Window Header */}
            <div className="y2k-titlebar" style={{ padding: "8px 14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ display: "flex", gap: "5px" }}>
                  <div
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "var(--cyan)",
                    }}
                  />
                  <div
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "var(--border-accent)",
                    }}
                  />
                  <div
                    style={{
                      width: "9px",
                      height: "9px",
                      borderRadius: "50%",
                      background: "var(--border-accent)",
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    letterSpacing: "0.14em",
                    color: "var(--silver-dim)",
                    textTransform: "uppercase",
                  }}
                >
                  GATEWAY_SYSTEM :: SECTOR_07
                </span>
              </div>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--cyan)",
                  letterSpacing: "0.1em",
                }}
              >
                [ ONLINE ]
              </span>
            </div>

            {/* Content Body */}
            <div style={{ padding: "36px 32px 32px", textAlign: "center" }}>
              {/* Top Tag */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  background: "var(--cyan-dim)",
                  border: "1px solid var(--cyan-mid)",
                  borderRadius: "var(--radius-sm)",
                  marginBottom: "20px",
                }}
              >
                <div
                  style={{
                    width: "5px",
                    height: "5px",
                    borderRadius: "50%",
                    background: "var(--cyan)",
                    boxShadow: "var(--glow-cyan)",
                  }}
                />
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--cyan)",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  FFXIV VIRTUAL PHOTOGRAPHY
                </span>
              </div>

              {/* Main Title */}
              <h1
                className="glitch"
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(32px, 6vw, 44px)",
                  fontWeight: 700,
                  color: "var(--white)",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "12px",
                  lineHeight: 1,
                }}
              >
                {title}
              </h1>

              {/* Subtitle / Quote */}
              <p
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "13px",
                  color: "var(--silver)",
                  lineHeight: 1.6,
                  fontWeight: 400,
                  marginBottom: "28px",
                  maxWidth: "400px",
                  margin: "0 auto 28px auto",
                  fontStyle: "italic",
                }}
              >
                &ldquo;In the silence between worlds, we capture light, shadows and stories.&rdquo;
              </p>

              {/* Cyber Metrics Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gap: "8px",
                  marginBottom: "32px",
                  padding: "12px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-subtle)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "8px",
                      color: "var(--silver-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    SYSTEM
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--cyan)",
                      fontWeight: 700,
                    }}
                  >
                    READY
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "8px",
                      color: "var(--silver-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    AUDIO
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--cyan)",
                      fontWeight: 700,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {bgmTitle ? "AVAILABLE" : "STEREO"}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-mono)",
                      fontSize: "8px",
                      color: "var(--silver-dim)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    MODE
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      color: "var(--cyan)",
                      fontWeight: 700,
                    }}
                  >
                    WARP 10
                  </span>
                </div>
              </div>

              {/* Enter Button */}
              <motion.button
                onClick={handleEnter}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="y2k-btn y2k-btn-primary"
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  fontSize: "12px",
                  letterSpacing: "0.18em",
                  fontWeight: 700,
                  boxShadow: "var(--glow-cyan), 0 10px 30px rgba(0,85,255,0.15)",
                }}
              >
                ⚡ ENTER ARCHIVE
              </motion.button>

              {/* Sub-caption */}
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--silver-dim)",
                  marginTop: "12px",
                  letterSpacing: "0.08em",
                }}
              >
                ♫ Click to experience audio & hyperspace visualizer
              </p>
            </div>

            {/* Footer stripe */}
            <div
              style={{
                borderTop: "1px solid var(--border-subtle)",
                padding: "8px 16px",
                background: "var(--bg-surface)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "var(--border-accent)",
                  letterSpacing: "0.1em",
                }}
              >
                PORTFOLIO_ID :: ZERICARD_01
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "var(--border-accent)",
                  letterSpacing: "0.1em",
                }}
              >
                PRESS [ENTER] OR CLICK
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
