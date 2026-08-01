"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { GposeImage } from "@/types";
import ImageCard from "./ImageCard";
import FilterBar from "./FilterBar";
import Lightbox from "./Lightbox";

function useColumnCount() {
  const [columns, setColumns] = useState(3);

  useEffect(() => {
    const updateColumns = () => {
      const w = window.innerWidth;
      if (w < 640) setColumns(2);
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
    } catch {
      setError("Could not load gallery. Check Cloudinary configuration.");
    } finally {
      setLoading(false);
    }
  }

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

  return (
    <div>
      {/* Filter bar */}
      {allTags.length > 0 && (
        <div style={{ marginBottom: "28px" }}>
          <FilterBar
            tags={allTags}
            activeTag={activeTag}
            onTagChange={setActiveTag}
          />
        </div>
      )}

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

      {/* Responsive Masonry Grid (Newest items on top row across columns) */}
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
                {colImages.map((image, i) => (
                  <motion.div
                    key={image.public_id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04, duration: 0.35 }}
                  >
                    <ImageCard
                      image={image}
                      onClick={() => setSelectedImage(image)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Lightbox
        image={selectedImage}
        onClose={() => setSelectedImage(null)}
      />
    </div>
  );
}
