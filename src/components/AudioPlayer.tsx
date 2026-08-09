"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

interface AudioPlayerProps {
  url?: string;
  title?: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: any;
    _zericard_interacted?: boolean;
  }
}

function getYouTubeVideoId(url?: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

export default function AudioPlayer({
  url = "",
  title = "Background Music",
  enabled = true,
}: AudioPlayerProps) {
  const ytVideoId = getYouTubeVideoId(url);

  // States
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(0.2); // 0.0 to 1.0
  const [showVolume, setShowVolume] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const ytContainerId = "yt-bgm-player-element";

  // Load saved preferences
  useEffect(() => {
    const savedMuted = localStorage.getItem("zericard_bgm_muted");
    const savedVol = localStorage.getItem("zericard_bgm_vol");

    if (savedMuted !== null) setIsMuted(savedMuted === "true");
    if (savedVol !== null) setVolume(parseFloat(savedVol));
  }, []);

  // ── 1. YOUTUBE MODE ──────────────────────────────────────────────
  useEffect(() => {
    if (!enabled || !url || !ytVideoId) return;

    let isSubscribed = true;

    const initYouTubePlayer = () => {
      if (!window.YT || !window.YT.Player) return;

      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch { }
      }

      ytPlayerRef.current = new window.YT.Player(ytContainerId, {
        videoId: ytVideoId,
        playerVars: {
          autoplay: 1,
          loop: 1,
          playlist: ytVideoId,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            if (!isSubscribed) return;
            const target = event.target;

            const savedVol = localStorage.getItem("zericard_bgm_vol");
            const savedMuted = localStorage.getItem("zericard_bgm_muted");
            const volNum = savedVol !== null ? parseFloat(savedVol) : 0.2;

            target.setVolume(volNum * 100);

            const hasInteracted = Boolean(window._zericard_interacted);

            if (!hasInteracted) {
              // Mute first to bypass Chrome silent autoplay block
              target.mute();
              target.playVideo();
              setIsPlaying(true);
              setAutoplayBlocked(true);
            } else {
              if (savedMuted === "true") {
                target.mute();
              } else {
                target.unMute();
              }
              target.playVideo();
              setIsPlaying(true);
              setAutoplayBlocked(false);
            }
          },
          onStateChange: (event: any) => {
            if (!isSubscribed) return;
            if (window.YT && event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (
              window.YT &&
              (event.data === window.YT.PlayerState.PAUSED ||
                event.data === window.YT.PlayerState.ENDED)
            ) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    // Load YouTube API script if not present
    if (!window.YT) {
      const existingScript = document.getElementById("youtube-iframe-api");
      if (!existingScript) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag?.parentNode?.insertBefore(tag, firstScriptTag);
      }

      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    } else {
      initYouTubePlayer();
    }

    // Global interaction listener to un-mute and unlock audio on first click/touch
    const unlockAudio = () => {
      window._zericard_interacted = true;
      setAutoplayBlocked(false);

      if (ytPlayerRef.current && typeof ytPlayerRef.current.playVideo === "function") {
        const savedMuted = localStorage.getItem("zericard_bgm_muted");
        const savedVol = localStorage.getItem("zericard_bgm_vol");
        const volNum = savedVol !== null ? parseFloat(savedVol) : 0.2;

        ytPlayerRef.current.setVolume(volNum * 100);

        if (savedMuted !== "true") {
          try {
            ytPlayerRef.current.unMute();
            setIsMuted(false);
          } catch { }
        }
        try {
          ytPlayerRef.current.playVideo();
          setIsPlaying(true);
        } catch { }
      }
    };

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      isSubscribed = false;
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch { }
      }
    };
  }, [ytVideoId, enabled, url]);

  // ── 2. DIRECT MP3 / AUDIO MODE ───────────────────────────────────
  useEffect(() => {
    if (!enabled || !url || ytVideoId) return;

    const savedMuted = localStorage.getItem("zericard_bgm_muted");
    const savedVol = localStorage.getItem("zericard_bgm_vol");

    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = savedVol !== null ? parseFloat(savedVol) : 0.2;
    audio.muted = savedMuted === "true";
    audioRef.current = audio;

    const unlockAudio = () => {
      window._zericard_interacted = true;
      setAutoplayBlocked(false);
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => { });
      }
    };

    const tryAutoplay = async () => {
      try {
        await audio.play();
        setIsPlaying(true);
        setAutoplayBlocked(false);
      } catch {
        setIsPlaying(false);
        setAutoplayBlocked(true);
      }
    };

    tryAutoplay();

    window.addEventListener("pointerdown", unlockAudio, { once: true });
    window.addEventListener("click", unlockAudio, { once: true });
    window.addEventListener("keydown", unlockAudio, { once: true });

    return () => {
      window.removeEventListener("pointerdown", unlockAudio);
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
      audio.pause();
      audio.src = "";
    };
  }, [url, enabled, ytVideoId]);

  // ── 3. SYNC VOLUME & MUTE STATE ──────────────────────────────────
  useEffect(() => {
    // Sync HTML5 Audio
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = isMuted;
    }

    // Sync YouTube API
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setVolume === "function") {
      ytPlayerRef.current.setVolume(volume * 100);
      if (isMuted) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    }

    localStorage.setItem("zericard_bgm_vol", volume.toString());
    localStorage.setItem("zericard_bgm_muted", isMuted.toString());
  }, [volume, isMuted]);

  // ── CONTROLS ─────────────────────────────────────────────────────
  const togglePlay = () => {
    window._zericard_interacted = true;
    setAutoplayBlocked(false);

    if (ytVideoId && ytPlayerRef.current) {
      if (isPlaying && !isMuted) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.unMute();
        setIsMuted(false);
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
      return;
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => { });
      }
    }
  };

  const toggleMute = () => {
    window._zericard_interacted = true;
    setAutoplayBlocked(false);
    setIsMuted((prev) => !prev);
  };

  if (!enabled || !url) return null;

  return (
    <>
      {/* Hidden container for YouTube iframe player */}
      {ytVideoId && (
        <div
          style={{
            position: "fixed",
            bottom: "-1000px",
            right: "-1000px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <div id={ytContainerId} />
        </div>
      )}

      {/* Cyber Y2K Player Widget */}
      <div
        className="audio-player-widget"
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{
            background: "var(--bg-elevated)",
            border: `1px solid ${autoplayBlocked ? "var(--cyan)" : "var(--border-default)"}`,
            borderRadius: "var(--radius-md)",
            padding: "6px 12px",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            boxShadow: autoplayBlocked
              ? "var(--glow-cyan), 0 10px 30px rgba(0,0,0,0.1)"
              : "0 10px 30px rgba(0,0,0,0.1), var(--glow-subtle)",
            fontFamily: "var(--font-mono)",
            fontSize: "10px",
            color: "var(--white)",
            transition: "all 0.3s ease",
          }}
        >
          {/* Equalizer animation / Icon */}
          <button
            onClick={togglePlay}
            style={{
              background: "transparent",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "3px",
              height: "16px",
              padding: 0,
            }}
            title={isPlaying ? "Pause BGM" : "Play BGM"}
          >
            {isPlaying && !isMuted && !autoplayBlocked ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: "2px", height: "12px" }}>
                <span className="eq-bar eq-bar-1" />
                <span className="eq-bar eq-bar-2" />
                <span className="eq-bar eq-bar-3" />
              </div>
            ) : (
              <span style={{ color: "var(--cyan)", fontSize: "11px" }}>
                {isPlaying && !isMuted ? "▮▮" : "▶"}
              </span>
            )}
          </button>

          {/* Track Info */}
          <div className="audio-player-track-info" style={{ display: "flex", flexDirection: "column", maxWidth: "160px" }}>
            <span
              style={{
                fontSize: "8px",
                color: autoplayBlocked ? "var(--cyan)" : "var(--silver-dim)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                fontWeight: autoplayBlocked ? 700 : 400,
              }}
            >
              BGM :: {autoplayBlocked ? "CLICK ANYWHERE TO UNMUTE" : isPlaying && !isMuted ? "PLAYING" : "MUTED"}
            </span>
            <span
              style={{
                fontSize: "10px",
                color: "var(--white)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                fontWeight: 700,
              }}
            >
              {title || (ytVideoId ? "YouTube Audio" : "Background Track")}
            </span>
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="y2k-btn y2k-btn-primary"
            style={{
              padding: "3px 8px",
              fontSize: "9px",
            }}
          >
            <span className="audio-player-btn-play-label">
              {isPlaying && !isMuted && !autoplayBlocked ? "PAUSE" : "ENABLE AUDIO"}
            </span>
          </button>

          {/* Mute Button */}
          <button
            onClick={toggleMute}
            className="y2k-btn y2k-btn-ghost"
            style={{
              padding: "3px 8px",
              fontSize: "9px",
              color: isMuted || autoplayBlocked ? "rgba(255,100,120,0.9)" : "var(--silver)",
            }}
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted || autoplayBlocked ? "MUTED" : "VOL"}
          </button>

          {/* Volume popover toggle button */}
          <button
            onClick={() => setShowVolume((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: "var(--silver-dim)",
              fontSize: "10px",
              cursor: "pointer",
              padding: "0 2px",
            }}
          >
            ⚙
          </button>

          {/* Volume Slider Popover */}
          <AnimatePresence>
            {showVolume && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                style={{
                  position: "absolute",
                  bottom: "42px",
                  right: 0,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-sm)",
                  padding: "8px 12px",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
                }}
              >
                <span style={{ fontSize: "9px", color: "var(--silver-dim)" }}>VOL</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => {
                    const newVol = parseFloat(e.target.value);
                    setVolume(newVol);
                    if (newVol === 0) {
                      setIsMuted(true);
                    } else if (isMuted) {
                      setIsMuted(false);
                    }
                  }}
                  style={{
                    accentColor: "var(--cyan)",
                    width: "70px",
                    cursor: "pointer",
                  }}
                />
                <span style={{ fontSize: "9px", color: "var(--cyan)" }}>
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}
