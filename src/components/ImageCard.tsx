"use client";

import { motion } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";

interface ImageCardProps {
  image: GposeImage;
  onClick: () => void;
}

export default function ImageCard({ image, onClick }: ImageCardProps) {
  return (
    <motion.div
      className="masonry-item image-card-wrapper"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
        position: "relative",
        background: "var(--bg-surface)",
        border: "1px solid var(--border-subtle)",
      }}
      onClick={onClick}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 350, damping: 22 }}
    >
      {/* Image with zoom effect */}
      <div style={{ position: "relative", display: "block", overflow: "hidden" }}>
        <motion.div
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src={image.secure_url}
            alt={image.title}
            width={image.width}
            height={image.height}
            style={{
              width: "100%",
              height: "auto",
              display: "block",
              objectFit: "contain",
            }}
            sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 25vw"
          />
        </motion.div>

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(13,14,18,0.92) 0%, rgba(13,14,18,0.4) 45%, transparent 75%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "14px",
            pointerEvents: "none",
          }}
        >
          {/* Cyan accent line at top */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background:
                "linear-gradient(90deg, transparent, var(--cyan), transparent)",
              opacity: 0.8,
            }}
          />

          {/* Meta info */}
          <div>
            <p
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "11px",
                color: "var(--white)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                marginBottom: "4px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {image.title}
            </p>
            {image.tags.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "4px",
                  flexWrap: "wrap",
                }}
              >
                {image.tags.map((t) => (
                  <span
                    key={t}
                    style={{
                      fontFamily: "var(--font-mono)",
                      fontSize: "9px",
                      color: "var(--cyan)",
                      letterSpacing: "0.06em",
                      opacity: 0.9,
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
