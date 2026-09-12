"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
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
      {/* Top Header: Filter bar */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <FilterBar
            tags={allTags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        </div>
      )}

      {/* Loading — skeleton masonry grid reserves space to avoid CLS */}
      {loading && (
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          {Array.from({ length: columnCount }).map((_, colIdx) => (
            <div
              key={colIdx}
              style={{ flex: 1, display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {/* Skeleton cards with varying heights that mimic the real grid */}
              {[colIdx % 2 === 0 ? "75%" : "56%", "56%", colIdx % 2 === 0 ? "56%" : "75%"].map(
                (pt, i) => (
                  <div
                    key={i}
                    style={{
                      width: "100%",
                      paddingTop: pt,
                      borderRadius: "var(--radius-md)",
                      background: "var(--bg-surface)",
                      border: "1px solid var(--border-subtle)",
                      animation: `pulse 1.8s ease-in-out ${i * 0.15}s infinite`,
                    }}
                  />
                )
              )}
            </div>
          ))}
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

      {/* ── MASONRY GRID LAYOUT ──────────────────────────────────────── */}
      {!loading && !error && filtered.length > 0 && (
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
