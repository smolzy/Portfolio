"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";
import ImageCard from "./ImageCard";
import FilterBar from "./FilterBar";
import Lightbox from "./Lightbox";

// Tracks which images have been assigned 'priority' prop (first row visible above fold)
const PRIORITY_COUNT = 4;

function useColumnCount() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w < 360) setColumns(1);
      else if (w < 640) setColumns(2);
      else if (w < 1000) setColumns(3);
      else setColumns(4);
    };

    updateColumns();
    window.addEventListener("resize", updateColumns);
    return () => window.removeEventListener("resize", updateColumns);
  }, []);

  return columns;
}

export default function Gallery() {
  const [images, setImages] = useState<GposeImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState("All");
  const [selectedImage, setSelectedImage] = useState<GposeImage | null>(null);
  const [layoutMode, setLayoutMode] = useState<"grid" | "feed">("grid");
  const columnCount = useColumnCount();

  useEffect(() => {
    fetchImages();
  }, []);

  async function fetchImages() {
    try {
      const res = await fetch("/api/gallery");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setImages(data.images);

      // Auto open lightbox if ?img=public_id is in URL
      const params = new URLSearchParams(window.location.search);
      const imgId = params.get("img");
      if (imgId && data.images) {
        const match = data.images.find((i: GposeImage) => i.public_id === imgId);
        if (match) setSelectedImage(match);
      }
    } catch {
      setError("Could not load gallery. Check Cloudinary configuration.");
    } finally {
      setLoading(false);
    }
  }

  const handleSelectImage = (img: GposeImage | null) => {
    setSelectedImage(img);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (img) {
        url.searchParams.set("img", img.public_id);
      } else {
        url.searchParams.delete("img");
      }
      window.history.replaceState({}, "", url.toString());
    }
  };

  // Collect unique tags from all images
  const allTags = Array.from(new Set(images.flatMap((img) => img.tags))).filter(
    Boolean
  );

  const filtered =
    activeTag === "All"
      ? images
      : images.filter((img) => img.tags.includes(activeTag));

  // Distribute items round-robin across columns so newest items fill top row!
  const columns: GposeImage[][] = Array.from({ length: columnCount }, () => []);
  filtered.forEach((img, idx) => {
    columns[idx % columnCount].push(img);
  });

  // Current selected image index within filtered list
  const selectedIndex = selectedImage
    ? filtered.findIndex((img) => img.public_id === selectedImage.public_id)
    : -1;

  const handleNext =
    selectedIndex !== -1 && filtered.length > 1
      ? () => handleSelectImage(filtered[(selectedIndex + 1) % filtered.length])
      : undefined;

  const handlePrev =
    selectedIndex !== -1 && filtered.length > 1
      ? () =>
          handleSelectImage(
            filtered[(selectedIndex - 1 + filtered.length) % filtered.length]
          )
      : undefined;

  return (
    <div>
      {/* Top Header: Filter bar + Layout Switcher */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "28px",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        {allTags.length > 0 ? (
          <FilterBar
            tags={allTags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        ) : (
          <div />
        )}

        {/* Layout Mode Switcher */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            className={`y2k-btn ${layoutMode === "grid" ? "y2k-btn-primary" : "y2k-btn-ghost"}`}
            style={{ padding: "4px 12px", fontSize: "10px" }}
            onClick={() => setLayoutMode("grid")}
            title="Masonry Grid View"
          >
            ⊞ GRID
          </button>
          <button
            className={`y2k-btn ${layoutMode === "feed" ? "y2k-btn-primary" : "y2k-btn-ghost"}`}
            style={{ padding: "4px 12px", fontSize: "10px" }}
            onClick={() => setLayoutMode("feed")}
            title="Single Column Feed View"
          >
            ☰ FEED
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontFamily: "var(--font-mono)",
            color: "var(--silver-dim)",
            fontSize: "12px",
            letterSpacing: "0.1em",
          }}
        >
          <motion.span
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            LOADING ASSETS...
          </motion.span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontFamily: "var(--font-mono)",
            color: "rgba(255,80,80,0.7)",
            fontSize: "11px",
            letterSpacing: "0.08em",
          }}
        >
          ⚠ {error}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "80px 0",
            fontFamily: "var(--font-mono)",
            color: "var(--silver-dim)",
            fontSize: "11px",
            letterSpacing: "0.08em",
          }}
        >
          NO_ASSETS_FOUND :: Upload images via /admin
        </div>
      )}

      {/* ── 1. MASONRY GRID LAYOUT ───────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && layoutMode === "grid" && (
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {columns.map((colImages, colIdx) => (
            <div
              key={colIdx}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <AnimatePresence>
                {colImages.map((image, i) => {
                  // Global index: first row items across all columns get priority
                  const globalIdx = colIdx + i * columnCount;
                  return (
                    <motion.div
                      key={image.public_id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(i * 0.04, 0.3), duration: 0.35 }}
                    >
                      <ImageCard
                        image={image}
                        onClick={() => handleSelectImage(image)}
                        priority={globalIdx < PRIORITY_COUNT}
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* ── 2. SINGLE COLUMN FEED LAYOUT ────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && layoutMode === "feed" && (
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: "32px",
          }}
        >
          <AnimatePresence>
            {filtered.map((image, i) => (
              <motion.div
                key={image.public_id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.4 }}
                onClick={() => handleSelectImage(image)}
                style={{
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  cursor: "pointer",
                  boxShadow: "var(--glow-subtle)",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: `${image.width} / ${image.height}`,
                    maxHeight: "75vh",
                    background: "#000",
                  }}
                >
                  <Image
                    src={image.secure_url}
                    alt={image.title}
                    fill
                    style={{ objectFit: "contain" }}
                    sizes="(max-width: 768px) 100vw, 760px"
                    priority={i < 2}
                  />
                </div>

                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderTop: "1px solid var(--border-subtle)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "13px",
                        fontWeight: 700,
                        color: "var(--white)",
                        marginBottom: "4px",
                      }}
                    >
                      {image.title}
                    </h3>
                    {image.tags.length > 0 && (
                      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                        {image.tags.map((t) => (
                          <span key={t} className="tag-pill active">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "var(--cyan)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    [ ⚡ EXPAND ]
                  </span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        image={selectedImage}
        onClose={() => handleSelectImage(null)}
        onNext={handleNext}
        onPrev={handlePrev}
        currentIndex={selectedIndex !== -1 ? selectedIndex : undefined}
        totalCount={filtered.length}
      />
    </div>
  );
}
