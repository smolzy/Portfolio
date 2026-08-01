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
      className="masonry-item chrome-border"
      style={{
        cursor: "pointer",
        overflow: "hidden",
        borderRadius: "var(--radius-md)",
        position: "relative",
        background: "var(--bg-surface)",
      }}
      onClick={onClick}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      {/* Image */}
      <div style={{ position: "relative", display: "block" }}>
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

        {/* Hover overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(to top, rgba(13,14,18,0.9) 0%, rgba(13,14,18,0.3) 40%, transparent 70%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "14px",
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
              opacity: 0.6,
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
            <div
              style={{
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
              }}
            >
              {image.zone?.trim() && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--cyan)",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    opacity: 0.8,
                  }}
                >
                  {image.zone}
                </span>
              )}
              {image.job?.trim() && (
                <span
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "9px",
                    color: "var(--silver-dim)",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                  }}
                >
                  {image.zone?.trim() ? `/ ${image.job}` : image.job}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
