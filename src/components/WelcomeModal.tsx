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
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Bloquer le scroll d'arrière-plan tant que la modal est ouverte
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleEnter = (withAudio: boolean = true) => {
    if (withAudio) {
      localStorage.setItem("zericard_bgm_muted", "false");
    } else {
      localStorage.setItem("zericard_bgm_muted", "true");
    }
    // Notifier le système pour débloquer l'audio interactif du navigateur
    window._zericard_interacted = true;
    setIsOpen(false);
    if (onEnter) onEnter();
  };

  const activeTrackTitle = bgmTitle || "Eorzea Atmosphere";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="welcome-cd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98, filter: "blur(12px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 2000,
            background: "rgba(10, 12, 18, 0.78)",
            backdropFilter: "blur(20px) saturate(1.3)",
            WebkitBackdropFilter: "blur(20px) saturate(1.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          {/* Boîtier Jewel Case CD */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.96 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            style={{
              width: "100%",
              maxWidth: "680px",
              position: "relative",
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              borderRadius: "var(--radius-md)",
              boxShadow:
                "0 30px 60px -12px rgba(0, 0, 0, 0.55), 0 0 0 1px rgba(255, 255, 255, 0.06)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Charnière supérieure / Barre de boîtier style CD Jewel Case */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 16px",
                background: "var(--bg-surface)",
                borderBottom: "1px solid var(--border-subtle)",
                fontSize: "10px",
                fontFamily: "var(--font-mono)",
                letterSpacing: "0.12em",
                color: "var(--silver-dim)",
              }}
            >
              {/* Petits crans de boîtier transparents */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span
                  style={{
                    display: "inline-block",
                    width: "28px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "var(--border-accent)",
                    opacity: 0.7,
                  }}
                />
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "4px",
                    borderRadius: "2px",
                    background: "var(--border-accent)",
                    opacity: 0.4,
                  }}
                />
                <span style={{ marginLeft: "6px", textTransform: "uppercase" }}>
                  JEWEL CASE // AUDIO DISC
                </span>
              </div>

              {/* Logo Compact Disc Digital Audio stylisé */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  color: "var(--silver-dim)",
                  opacity: 0.85,
                }}
              >
                <svg width="22" height="14" viewBox="0 0 40 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c4.32 0 8.01-2.73 9.4-6.6h-4.35C15.93 18.73 14.1 20 12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8c2.1 0 3.93 1.27 5.05 3.1h4.35C20.01 4.73 16.32 2 12 2zm16 0c-2.21 0-4 1.79-4 4v12c0 2.21 1.79 4 4 4h6c3.31 0 6-2.69 6-6v-8c0-3.31-2.69-6-6-6h-6zm6 14c0 1.1-.9 2-2 2h-4V6h4c1.1 0 2 .9 2 2v8z" />
                </svg>
                <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em" }}>
                  STEREO
                </span>
              </div>
            </div>

            {/* Corps principal : Pochette / Livret à gauche, Disque à droite */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                alignItems: "center",
                gap: "24px",
                padding: "28px 24px 24px",
              }}
            >
              {/* Colonne Gauche : Livret & Informations d'écoute */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  zIndex: 2,
                }}
              >
                <div>
                  {/* Titre Artiste */}
                  <h1
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "clamp(26px, 4vw, 32px)",
                      fontWeight: 700,
                      color: "var(--white)",
                      letterSpacing: "0.04em",
                      lineHeight: 1.15,
                      marginBottom: "6px",
                    }}
                  >
                    {title}
                  </h1>

                  <p
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--silver-dim)",
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      marginBottom: "20px",
                    }}
                  >
                    Curated Virtual Photography Archive
                  </p>

                  {/* Carte lecteur piste BGM */}
                  <div
                    style={{
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "var(--radius-sm)",
                      padding: "12px 14px",
                      marginBottom: "24px",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: "6px",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--cyan)",
                          fontWeight: 700,
                          letterSpacing: "0.1em",
                        }}
                      >
                        ♫ CURRENT TRACK
                      </span>
                      {/* Mini égaliseur animé */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-end",
                          gap: "2.5px",
                          height: "12px",
                        }}
                      >
                        {[0.4, 0.9, 0.6, 1, 0.5].map((scale, i) => (
                          <motion.span
                            key={i}
                            animate={{
                              height: isHovered
                                ? [`${scale * 30}%`, `${scale * 100}%`, `${scale * 40}%`]
                                : `${scale * 50}%`,
                            }}
                            transition={{
                              duration: 0.6 + i * 0.15,
                              repeat: Infinity,
                              repeatType: "reverse",
                              ease: "easeInOut",
                            }}
                            style={{
                              width: "3px",
                              background: "var(--cyan)",
                              borderRadius: "1px",
                              display: "inline-block",
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <p
                      style={{
                        fontFamily: "var(--font-sans)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--white)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {activeTrackTitle}
                    </p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <motion.button
                    onClick={() => handleEnter(true)}
                    onHoverStart={() => setIsHovered(true)}
                    onHoverEnd={() => setIsHovered(false)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "10px",
                      padding: "12px 20px",
                      background: "var(--cyan)",
                      color: "#ffffff",
                      border: "none",
                      borderRadius: "var(--radius-sm)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "11px",
                      fontWeight: 700,
                      letterSpacing: "0.1em",
                      cursor: "pointer",
                      boxShadow:
                        "0 2px 8px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.2) inset",
                      transition: "box-shadow 0.2s ease",
                    }}
                  >
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      style={{ flexShrink: 0 }}
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    <span>LISTEN & ENTER</span>
                  </motion.button>

                  <button
                    onClick={() => handleEnter(false)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "6px",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--silver-dim)",
                      cursor: "pointer",
                      letterSpacing: "0.06em",
                      transition: "color 0.2s ease",
                      textAlign: "center",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "var(--white)")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--silver-dim)")}
                  >
                    Enter in silence (mute) →
                  </button>
                </div>
              </div>

              {/* Colonne Droite : Le Disque CD compact avec reflets prismatiques */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  padding: "10px 0",
                }}
              >
                {/* Réceptacle Jewel Case (Tray circulaire en retrait) */}
                <div
                  style={{
                    width: "230px",
                    height: "230px",
                    borderRadius: "50%",
                    position: "relative",
                    background: "rgba(0, 0, 0, 0.25)",
                    border: "1px solid var(--border-subtle)",
                    boxShadow: "inset 0 0 25px rgba(0, 0, 0, 0.5)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {/* Le Disque CD qui tourne */}
                  <motion.div
                    animate={{
                      rotate: 360,
                    }}
                    transition={{
                      duration: isHovered ? 4 : 20,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    style={{
                      width: "216px",
                      height: "216px",
                      borderRadius: "50%",
                      position: "relative",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow:
                        "0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 150, 255, 0.12)",
                      // Dégradé irisé / holographique simulant les reflets d'un vrai CD
                      background: `
                        radial-gradient(
                          circle at center,
                          transparent 34%,
                          rgba(0, 0, 0, 0.2) 35%,
                          transparent 36%
                        ),
                        conic-gradient(
                          from 0deg,
                          rgba(220, 230, 250, 0.85) 0deg,
                          rgba(150, 220, 255, 0.95) 45deg,
                          rgba(200, 180, 255, 0.85) 90deg,
                          rgba(255, 200, 220, 0.9) 135deg,
                          rgba(180, 240, 255, 0.85) 180deg,
                          rgba(220, 200, 255, 0.95) 225deg,
                          rgba(160, 230, 255, 0.85) 270deg,
                          rgba(255, 210, 230, 0.9) 315deg,
                          rgba(220, 230, 250, 0.85) 360deg
                        )
                      `,
                      cursor: "pointer",
                    }}
                    onClick={() => handleEnter(true)}
                  >
                    {/* Anneaux de sillons audio (data tracks) */}
                    <div
                      style={{
                        position: "absolute",
                        inset: "12px",
                        borderRadius: "50%",
                        border: "1px dashed rgba(255, 255, 255, 0.35)",
                        opacity: 0.6,
                        pointerEvents: "none",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: "24px",
                        borderRadius: "50%",
                        border: "1px solid rgba(255, 255, 255, 0.25)",
                        pointerEvents: "none",
                      }}
                    />

                    {/* Sérigraphie circulaire imprimée sur le CD */}
                    <div
                      style={{
                        position: "absolute",
                        top: "22px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "7px",
                        fontWeight: 700,
                        letterSpacing: "0.2em",
                        color: "rgba(20, 30, 60, 0.75)",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                      }}
                    >
                      ZERICARD ARCHIVE // VOL. 01
                    </div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: "22px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "6.5px",
                        fontWeight: 600,
                        letterSpacing: "0.16em",
                        color: "rgba(20, 30, 60, 0.65)",
                        textTransform: "uppercase",
                        pointerEvents: "none",
                      }}
                    >
                      FFXIV VIRTUAL PHOTOGRAPHY
                    </div>

                    {/* Anneau intérieur miroir transparent (Hub de serrage) */}
                    <div
                      style={{
                        width: "74px",
                        height: "74px",
                        borderRadius: "50%",
                        background:
                          "radial-gradient(circle, rgba(255, 255, 255, 0.7) 0%, rgba(200, 220, 240, 0.5) 70%, rgba(100, 140, 180, 0.8) 100%)",
                        border: "1px solid rgba(255, 255, 255, 0.6)",
                        boxShadow: "0 0 10px rgba(0, 0, 0, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        position: "relative",
                      }}
                    >
                      {/* Anneau intermédiaire transparent */}
                      <div
                        style={{
                          width: "44px",
                          height: "44px",
                          borderRadius: "50%",
                          background: "rgba(255, 255, 255, 0.3)",
                          border: "1px solid rgba(0, 0, 0, 0.15)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {/* Trou central translucide (perforation du CD) */}
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "var(--bg-elevated)",
                            border: "1px solid rgba(0, 0, 0, 0.3)",
                            boxShadow: "inset 0 1px 4px rgba(0, 0, 0, 0.4)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          {/* 3 petits crans de broche de lecteur CD */}
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              border: "1.5px dashed var(--border-accent)",
                              opacity: 0.7,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* Pied de boîte : Code barre rétro & mentions légales légères */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "8px",
                padding: "8px 20px",
                background: "var(--bg-surface)",
                borderTop: "1px solid var(--border-subtle)",
                fontFamily: "var(--font-mono)",
                fontSize: "8.5px",
                color: "var(--silver-dim)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                {/* Code-barre graphique Y2K */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1.5px",
                    height: "12px",
                    opacity: 0.6,
                  }}
                >
                  {[2, 1, 3, 1, 2, 4, 1, 2, 1, 3, 2, 1, 3, 1].map((w, idx) => (
                    <span
                      key={idx}
                      style={{
                        width: `${w}px`,
                        height: "100%",
                        background: "var(--silver-dim)",
                        display: "inline-block",
                      }}
                    />
                  ))}
                </div>
                <span>CAT. NO. ZERI-001</span>
              </div>

              <div style={{ letterSpacing: "0.06em" }}>
                MADE IN EORZEA · ALL RIGHTS RESERVED
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
