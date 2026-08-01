"use client";

import { motion } from "motion/react";
import { ReactNode } from "react";

interface Y2KFrameProps {
  title: string;
  children: ReactNode;
  className?: string;
  onClose?: () => void;
  actions?: ReactNode;
  variant?: "default" | "dialog" | "panel";
}

export default function Y2KFrame({
  title,
  children,
  className = "",
  onClose,
  actions,
  variant = "default",
}: Y2KFrameProps) {
  return (
    <motion.div
      className={`chrome-border ${className}`}
      style={{
        background: "var(--bg-elevated)",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
      }}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Title Bar */}
      <div className="y2k-titlebar">
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Traffic lights */}
          <div
            style={{ display: "flex", gap: "5px", alignItems: "center" }}
          >
            <button
              onClick={onClose}
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                background: onClose ? "rgba(255,80,80,0.7)" : "var(--border-accent)",
                border: "none",
                cursor: onClose ? "pointer" : "default",
                transition: "opacity 0.2s",
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
          </div>
          <span
            style={{
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "var(--silver-dim)",
            }}
          >
            {title}
          </span>
        </div>
        {actions && <div style={{ display: "flex", gap: "8px" }}>{actions}</div>}
      </div>

      {/* Content */}
      <div>{children}</div>
    </motion.div>
  );
}
