"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("ACCESS DENIED :: Invalid credentials");
        setPassword("");
        return;
      }

      router.push("/admin");
    } catch {
      setError("CONNECTION_ERROR :: Try again");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--bg-void)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "500px",
          height: "500px",
          background:
            "radial-gradient(ellipse, rgba(0,240,255,0.04) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Scan line decoration */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,240,255,0.008) 3px, rgba(0,240,255,0.008) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ marginBottom: "32px", textAlign: "center" }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            marginBottom: "8px",
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
            className="glitch"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.2em",
              color: "var(--white)",
            }}
          >
            ZERICARD
          </span>
        </div>
        <p
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "9px",
            color: "var(--silver-dim)",
            letterSpacing: "0.15em",
          }}
        >
          SECURE_ADMIN_ACCESS
        </p>
      </motion.div>

      {/* Login Window */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        style={{
          width: "100%",
          maxWidth: "360px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-md)",
          overflow: "hidden",
          boxShadow: "0 0 0 1px var(--border-subtle), 0 20px 60px rgba(0,0,0,0.12)",
        }}
      >
        {/* Title bar */}
        <div className="y2k-titlebar">
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ display: "flex", gap: "5px" }}>
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--border-accent)",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--border-accent)",
                }}
              />
              <div
                style={{
                  width: "10px",
                  height: "10px",
                  borderRadius: "50%",
                  background: "var(--border-accent)",
                }}
              />
            </div>
            <span>AUTH_DIALOG — v2.1</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "24px" }}>
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--silver-dim)",
              letterSpacing: "0.1em",
              marginBottom: "20px",
              borderLeft: "2px solid var(--cyan)",
              paddingLeft: "10px",
            }}
          >
            Administrator authentication required.
            <br />
            Enter master password to continue.
          </p>

          <form onSubmit={handleSubmit}>
            <label
              style={{
                display: "block",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--silver-dim)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "6px",
              }}
            >
              MASTER_KEY
            </label>
            <input
              id="password"
              className="y2k-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              autoComplete="current-password"
              autoFocus
              style={{ marginBottom: "12px", letterSpacing: "0.2em" }}
            />

            {/* Error message */}
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "rgba(255,100,120,0.9)",
                  letterSpacing: "0.06em",
                  marginBottom: "12px",
                }}
              >
                ⚠ {error}
              </motion.p>
            )}

            <button
              type="submit"
              className="y2k-btn y2k-btn-primary"
              disabled={loading || !password}
              style={{
                width: "100%",
                opacity: loading || !password ? 0.5 : 1,
                cursor: loading || !password ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "AUTHENTICATING..." : "AUTHENTICATE"}
            </button>
          </form>

          <div
            style={{
              marginTop: "16px",
              textAlign: "center",
            }}
          >
            <Link
              href="/"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--border-accent)",
                letterSpacing: "0.1em",
                textDecoration: "none",
              }}
            >
              ← RETURN TO GALLERY
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Bottom decoration */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        style={{
          marginTop: "24px",
          fontFamily: "var(--font-mono)",
          fontSize: "8px",
          color: "var(--border-default)",
          letterSpacing: "0.1em",
          textAlign: "center",
        }}
      >
        ZERICARD_ADMIN_PORTAL // UNAUTHORIZED ACCESS PROHIBITED
      </motion.p>
    </div>
  );
}
