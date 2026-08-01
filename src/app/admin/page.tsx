"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import Link from "next/link";
import Y2KFrame from "@/components/Y2KFrame";
import AdminUpload from "@/components/AdminUpload";
import AdminGallery from "@/components/AdminGallery";
import { GposeImage } from "@/types";

type Tab = "upload" | "manage" | "profile";

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

const ICON_OPTIONS = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "bluesky", label: "Bluesky" },
  { value: "youtube", label: "YouTube" },
  { value: "tiktok", label: "TikTok" },
  { value: "link", label: "Autre lien" },
];

export default function AdminPage() {
  const [images, setImages] = useState<GposeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("upload");
  const [about, setAbout] = useState<AboutData>({ bio: "", socials: [] });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchImages();
    fetchAbout();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setImages(data.images);
    } catch {
      console.error("Failed to fetch images");
    } finally {
      setLoading(false);
    }
  }

  async function fetchAbout() {
    try {
      const res = await fetch("/api/about");
      if (!res.ok) return;
      setAbout(await res.json());
    } catch {}
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const handleUploadSuccess = () => {
    fetchImages();
    setActiveTab("manage");
  };

  const handleDelete = (publicId: string) => {
    setImages((prev) => prev.filter((img) => img.public_id !== publicId));
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await fetch("/api/about", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(about),
      });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch {}
    setSavingProfile(false);
  };

  const updateSocial = (idx: number, field: keyof Social, value: string) => {
    setAbout((prev) => {
      const socials = [...prev.socials];
      socials[idx] = { ...socials[idx], [field]: value };
      return { ...prev, socials };
    });
  };

  const addSocial = () => {
    setAbout((prev) => ({
      ...prev,
      socials: [...prev.socials, { label: "Nouveau lien", url: "https://", icon: "link" }],
    }));
  };

  const removeSocial = (idx: number) => {
    setAbout((prev) => ({
      ...prev,
      socials: prev.socials.filter((_, i) => i !== idx),
    }));
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: "upload", label: "⊕ UPLOAD" },
    { id: "manage", label: `⊞ MANAGE (${images.length})` },
    { id: "profile", label: "◈ PROFILE" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-void)" }}>
      {/* Header */}
      <header
        style={{
          borderBottom: "1px solid var(--border-default)",
          padding: "0 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: "56px",
          background: "rgba(244,245,249,0.95)",
          backdropFilter: "blur(12px)",
          position: "sticky",
          top: 0,
          zIndex: 100,
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
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.18em",
              color: "var(--white)",
            }}
          >
            ZERICARD
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--cyan)",
              letterSpacing: "0.12em",
              borderLeft: "1px solid var(--border-default)",
              paddingLeft: "12px",
              opacity: 0.8,
            }}
          >
            ADMIN_CONSOLE
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              color: "var(--silver-dim)",
              letterSpacing: "0.1em",
              textDecoration: "none",
            }}
          >
            ← PUBLIC GALLERY
          </Link>
          <button
            onClick={handleLogout}
            className="y2k-btn y2k-btn-ghost"
            style={{ fontSize: "9px", padding: "5px 12px" }}
          >
            LOGOUT
          </button>
        </div>
      </header>

      {/* Main */}
      <main style={{ padding: "28px 32px 60px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          style={{ display: "flex", gap: "12px", marginBottom: "24px", flexWrap: "wrap" }}
        >
          {[
            { label: "TOTAL ASSETS", value: images.length.toString().padStart(3, "0") },
            { label: "CLOUDINARY", value: "CONNECTED" },
            { label: "STATUS", value: "ONLINE" },
          ].map((stat) => (
            <div
              key={stat.label}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                padding: "10px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "8px",
                  color: "var(--silver-dim)",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {stat.label}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "18px",
                  fontWeight: 700,
                  color:
                    stat.value === "ONLINE" || stat.value === "CONNECTED"
                      ? "var(--cyan)"
                      : "var(--white)",
                  letterSpacing: "0.04em",
                }}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </motion.div>

        {/* Tabs */}
        <div
          style={{
            display: "flex",
            gap: "0",
            marginBottom: "16px",
            borderBottom: "1px solid var(--border-default)",
          }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "10px 20px",
                background: "transparent",
                border: "none",
                borderBottom: `2px solid ${activeTab === tab.id ? "var(--cyan)" : "transparent"}`,
                color: activeTab === tab.id ? "var(--cyan)" : "var(--silver-dim)",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          {activeTab === "upload" && (
            <Y2KFrame title="UPLOAD_ASSET — Cloudinary">
              <div style={{ padding: "20px" }}>
                <AdminUpload onUploadSuccess={handleUploadSuccess} />
              </div>
            </Y2KFrame>
          )}

          {activeTab === "manage" && (
            <Y2KFrame title={`ASSET_MANAGER — ${images.length} files`}>
              <div style={{ padding: "16px" }}>
                {loading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "40px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--silver-dim)",
                      fontSize: "11px",
                    }}
                  >
                    LOADING...
                  </div>
                ) : (
                  <AdminGallery images={images} onDelete={handleDelete} />
                )}
              </div>
            </Y2KFrame>
          )}

          {activeTab === "profile" && (
            <Y2KFrame title="PROFILE_EDITOR — Bio & Réseaux">
              <div style={{ padding: "24px" }}>
                {/* Bio */}
                <div style={{ marginBottom: "28px" }}>
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
                    BIOGRAPHIE / DESCRIPTION
                  </label>
                  <textarea
                    className="y2k-input"
                    rows={4}
                    placeholder="Écris quelque chose sur toi, ton style GPose, tes inspirations..."
                    value={about.bio}
                    onChange={(e) =>
                      setAbout((prev) => ({ ...prev, bio: e.target.value }))
                    }
                    style={{ resize: "vertical", fontFamily: "var(--font-sans)", fontSize: "13px" }}
                  />
                </div>

                {/* Social links */}
                <div style={{ marginBottom: "20px" }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "10px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--silver-dim)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      RÉSEAUX SOCIAUX
                    </label>
                    <button
                      onClick={addSocial}
                      className="y2k-btn y2k-btn-ghost"
                      style={{ fontSize: "9px", padding: "4px 10px" }}
                    >
                      + AJOUTER
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {about.socials.map((social, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "130px 1fr 1fr auto",
                          gap: "8px",
                          alignItems: "center",
                          padding: "10px",
                          background: "var(--bg-void)",
                          border: "1px solid var(--border-subtle)",
                          borderRadius: "var(--radius-sm)",
                        }}
                      >
                        {/* Icon select */}
                        <select
                          className="y2k-input"
                          value={social.icon}
                          onChange={(e) => {
                            const opt = ICON_OPTIONS.find(
                              (o) => o.value === e.target.value
                            );
                            updateSocial(idx, "icon", e.target.value);
                            if (opt) updateSocial(idx, "label", opt.label);
                          }}
                          style={{ padding: "6px 8px" }}
                        >
                          {ICON_OPTIONS.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>

                        {/* Label */}
                        <input
                          className="y2k-input"
                          type="text"
                          placeholder="Label affiché"
                          value={social.label}
                          onChange={(e) =>
                            updateSocial(idx, "label", e.target.value)
                          }
                        />

                        {/* URL */}
                        <input
                          className="y2k-input"
                          type="url"
                          placeholder="https://..."
                          value={social.url}
                          onChange={(e) =>
                            updateSocial(idx, "url", e.target.value)
                          }
                        />

                        <button
                          onClick={() => removeSocial(idx)}
                          className="y2k-btn y2k-btn-danger"
                          style={{ padding: "6px 10px", fontSize: "10px" }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}

                    {about.socials.length === 0 && (
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "10px",
                          color: "var(--border-accent)",
                          textAlign: "center",
                          padding: "20px",
                        }}
                      >
                        Aucun réseau — clique sur &quot;+ AJOUTER&quot;
                      </p>
                    )}
                  </div>
                </div>

                {/* Background Music Settings */}
                <div
                  style={{
                    marginBottom: "28px",
                    padding: "16px",
                    background: "var(--bg-void)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-sm)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      marginBottom: "12px",
                    }}
                  >
                    <label
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--silver-dim)",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                      }}
                    >
                      ♫ MUSIQUE DE FOND (BGM)
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        cursor: "pointer",
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: about.bgm?.enabled ? "var(--cyan)" : "var(--silver-dim)",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(about.bgm?.enabled)}
                        onChange={(e) =>
                          setAbout((prev) => ({
                            ...prev,
                            bgm: { ...prev.bgm, enabled: e.target.checked },
                          }))
                        }
                        style={{ accentColor: "var(--cyan)", cursor: "pointer" }}
                      />
                      {about.bgm?.enabled ? "ACTIVÉ" : "DÉSACTIVÉ"}
                    </label>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 2fr",
                      gap: "12px",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "8px",
                          color: "var(--silver-dim)",
                          marginBottom: "4px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        TITRE DU MORCEAU
                      </label>
                      <input
                        className="y2k-input"
                        type="text"
                        placeholder="ex: FFXIV - Gridania Night"
                        value={about.bgm?.title || ""}
                        onChange={(e) =>
                          setAbout((prev) => ({
                            ...prev,
                            bgm: { ...prev.bgm, title: e.target.value },
                          }))
                        }
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "8px",
                          color: "var(--silver-dim)",
                          marginBottom: "4px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        URL YOUTUBE OU FICHIER MP3
                      </label>
                      <input
                        className="y2k-input"
                        type="text"
                        placeholder="ex: https://www.youtube.com/watch?v=... ou /bgm.mp3"
                        value={about.bgm?.url || ""}
                        onChange={(e) =>
                          setAbout((prev) => ({
                            ...prev,
                            bgm: { ...prev.bgm, url: e.target.value },
                          }))
                        }
                      />
                    </div>
                  </div>
                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "8px",
                      color: "var(--silver-dim)",
                      marginTop: "8px",
                      opacity: 0.7,
                    }}
                  >
                    ★ <b>Support YouTube & MP3</b> : Colle n&apos;importe quelle vidéo/musique <b>YouTube</b> (ex: <code>https://youtube.com/watch?v=...</code>) ou un fichier MP3 (<code>/bgm.mp3</code> dans <code>public/</code>). Le lecteur Cyber Y2K gère le son, la pause, le volume et le lancement automatique !
                  </p>
                </div>

                {/* Save button */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <button
                    onClick={handleSaveProfile}
                    className="y2k-btn y2k-btn-primary"
                    disabled={savingProfile}
                    style={{ opacity: savingProfile ? 0.6 : 1 }}
                  >
                    {savingProfile ? "SAVING..." : "SAVE PROFILE"}
                  </button>
                  {profileSaved && (
                    <motion.span
                      initial={{ opacity: 0, x: -4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "10px",
                        color: "var(--cyan)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      ✓ Sauvegardé
                    </motion.span>
                  )}
                </div>
              </div>
            </Y2KFrame>
          )}
        </motion.div>
      </main>
    </div>
  );
}
