"use client";

import Gallery from "@/components/Gallery";
import HyperspaceCanvas from "@/components/HyperspaceCanvas";
import AudioPlayer from "@/components/AudioPlayer";
import WelcomeModal from "@/components/WelcomeModal";
import ThemeToggle from "@/components/ThemeToggle";
import Link from "next/link";
import { useEffect, useState, ReactNode } from "react";
import { motion } from "motion/react";

interface Social {
  label: string;
  url: string;
  icon: string;
}

interface BgmData {
  url?: string;
  title?: string;
  enabled?: boolean;
}

interface AboutData {
  bio: string;
  socials: Social[];
  bgm?: BgmData;
}

const ICON_MAP: Record<string, ReactNode> = {
  twitter: "𝕏",
  instagram: "◈",
  bluesky: "☁",
  youtube: "▶",
  tiktok: "◉",
  kofi: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 2.424 2.586 2.672 2.586 2.672s8.267-.023 11.966-.049c2.438-.426 2.683-2.566 2.658-3.143V14.28c.325.048 2.518.257 3.993-1.077 1.488-1.348 2.656-4.255 2.656-4.255zm-7.054 3.754H17.2V9.923h1.002c.983 0 1.583.565 1.583.565s.61 1.096.342 2.052c-.22.784-1.3 1.162-1.3 1.162z"/>
    </svg>
  ),
  link: "⌘",
};

export default function Home() {
  // Show default bio immediately to avoid LCP delay waiting for API
  const [about, setAbout] = useState<AboutData>({
    bio: "Hai!! I'm Zericard also known as Zeri, I'm just having fun making gposes (not a professional photographer, I just love the art of it).",
    socials: [],
  });

  useEffect(() => {
    fetch("/api/about")
      .then((r) => r.json())
      .then(setAbout)
      .catch(() => { });
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)", position: "relative" }}>
      {/* ── Welcome Gateway Modal ───────────────────────────────────── */}
      <WelcomeModal bgmTitle={about.bgm?.title} />

      {/* ── Hyperspace background ──────────────────────────────────── */}
      <HyperspaceCanvas />

      {/* ── Audio Player Widget ────────────────────────────────────── */}
      <AudioPlayer
        url={about.bgm?.url}
        title={about.bgm?.title}
        enabled={about.bgm?.enabled}
      />

      {/* ── All page content sits above the canvas ─────────────────── */}
      <main style={{ position: "relative", zIndex: 1 }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <header
          className="site-header"
          style={{
            borderBottom: "1px solid var(--border-default)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "56px",
            position: "sticky",
            top: 0,
            zIndex: 100,
            background: "var(--bg-overlay)",
            backdropFilter: "blur(12px)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                background: "var(--cyan)",
                boxShadow: "var(--glow-cyan)",
              }}
            />
            <span
              className="glitch"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.16em",
                color: "var(--white)",
                textTransform: "uppercase",
                cursor: "default",
              }}
            >
              ZERICARD
            </span>
            <span
              className="header-subtitle"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--silver-dim)",
                letterSpacing: "0.12em",
                borderLeft: "1px solid var(--border-default)",
                paddingLeft: "12px",
              }}
            >
              GPOSE // FFXIV
            </span>
          </div>

          {/* Social links in nav */}
          <nav style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            {about.socials.map(
              (s) =>
                s.url && s.url !== "https://" && (
                  <a
                    key={s.label}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      width: "30px",
                      height: "30px",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)",
                      color: "var(--silver-dim)",
                      fontSize: "12px",
                      textDecoration: "none",
                      transition: "all 0.15s",
                      background: "var(--bg-surface)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "var(--cyan)";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--cyan)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.borderColor =
                        "var(--border-default)";
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "var(--silver-dim)";
                    }}
                  >
                    {ICON_MAP[s.icon] ?? "⌘"}
                  </a>
                )
            )}
            <ThemeToggle />
            <Link
              href="/login"
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--border-accent)",
                letterSpacing: "0.1em",
                textDecoration: "none",
                marginLeft: "8px",
              }}
            >
              [ADMIN]
            </Link>
          </nav>
        </header>

        {/* ── Hero / About ──────────────────────────────────────────── */}
        <section
          className="hero-section"
          style={{
            borderBottom: "1px solid var(--border-default)",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: "absolute",
              top: "-80px",
              right: "-60px",
              width: "500px",
              height: "300px",
              background:
                "radial-gradient(ellipse, rgba(0,85,255,0.05) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            className="hero-grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Left: name + bio */}
            <div>
              <p
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--cyan)",
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                  opacity: 0.7,
                }}
              >
                sys::gallery_v1.0 — ONLINE
              </p>
              <h1
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "clamp(24px, 4vw, 40px)",
                  fontWeight: 700,
                  color: "var(--white)",
                  letterSpacing: "0.06em",
                  lineHeight: 1.1,
                  marginBottom: "16px",
                  textTransform: "uppercase",
                }}
              >
                Zericard
              </h1>
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: "14px",
                  color: "var(--silver)",
                  lineHeight: 1.75,
                  fontWeight: 400,
                  maxWidth: "520px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {about.bio}
              </motion.p>
            </div>

            {/* Right / Bottom on mobile: social cards */}
            {about.socials.length > 0 && (
              <div>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--silver-dim)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    marginBottom: "8px",
                  }}
                >
                  CONNECT
                </p>
                <div className="social-links-box">
                  {about.socials.map(
                    (s, index) =>
                      s.url &&
                      s.url !== "https://" && (
                        <motion.a
                          key={s.label}
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.15 + index * 0.05, duration: 0.4 }}
                          whileHover={{ scale: 1.04, x: 2 }}
                          whileTap={{ scale: 0.96 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "7px 12px",
                            background: "var(--bg-surface)",
                            border: "1px solid var(--border-default)",
                            borderRadius: "var(--radius-sm)",
                            textDecoration: "none",
                            transition: "border-color 0.2s, color 0.2s, box-shadow 0.2s",
                            color: "var(--silver)",
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor =
                              "var(--cyan)";
                            (e.currentTarget as HTMLAnchorElement).style.color =
                              "var(--cyan)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow =
                              "0 0 12px var(--cyan-dim)";
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.borderColor =
                              "var(--border-default)";
                            (e.currentTarget as HTMLAnchorElement).style.color =
                              "var(--silver)";
                            (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                          }}
                        >
                          <span style={{ fontSize: "13px", flexShrink: 0, color: "var(--cyan)" }}>
                            {ICON_MAP[s.icon] ?? "⌘"}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "10px",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {s.label}
                          </span>
                        </motion.a>
                      )
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </section>

        {/* ── Gallery ───────────────────────────────────────────────── */}
        <section className="gallery-section" style={{ minHeight: "600px" }}>
          <Gallery />
        </section>

        {/* ── Footer ────────────────────────────────────────────────── */}
        <footer
          className="site-footer"
          style={{
            borderTop: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--silver-dim)",
              letterSpacing: "0.1em",
            }}
          >
            © ZERICARD — FFXIV IS © SQUARE ENIX
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--border-accent)",
              letterSpacing: "0.06em",
            }}
          >
            BUILT_WITH :: NEXT.JS / CLOUDINARY
          </span>
        </footer>
      </main>
    </div>
  );
}
