"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";
import Y2KFrame from "./Y2KFrame";

interface AdminGalleryProps {
  images: GposeImage[];
  onDelete: (publicId: string) => void;
  onUpdate?: (updatedImage: GposeImage) => void;
}

export default function AdminGallery({ images, onDelete, onUpdate }: AdminGalleryProps) {
  const [deleting, setDeleting] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<GposeImage | null>(null);

  // Form state for edit modal
  const [editForm, setEditForm] = useState({
    title: "",
    zone: "",
    job: "",
    preset: "",
    tags: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const handleDelete = async (publicId: string) => {
    if (confirmId !== publicId) {
      setConfirmId(publicId);
      return;
    }

    setDeleting(publicId);
    setConfirmId(null);
    try {
      const res = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(publicId);
    } catch {
      console.error("Delete error");
    } finally {
      setDeleting(null);
    }
  };

  const openEditModal = (img: GposeImage) => {
    setEditingImage(img);
    setEditForm({
      title: img.title || "",
      zone: img.zone || "",
      job: img.job || "",
      preset: img.preset || "",
      tags: img.tags.join(", "),
    });
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    setSavingEdit(true);
    setEditError(null);

    const tagsArray = editForm.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: editingImage.public_id,
          title: editForm.title,
          zone: editForm.zone,
          job: editForm.job,
          preset: editForm.preset,
          tags: tagsArray,
        }),
      });

      const resData = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(resData.error || "Save failed");
      }

      const updatedImg: GposeImage = {
        ...editingImage,
        title: editForm.title,
        zone: editForm.zone,
        job: editForm.job,
        preset: editForm.preset,
        tags: tagsArray,
      };

      if (onUpdate) onUpdate(updatedImg);
      setEditingImage(null);
    } catch (err: any) {
      setEditError(err?.message || "Failed to update tags");
    } finally {
      setSavingEdit(false);
    }
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px",
          fontFamily: "var(--font-mono)",
          color: "var(--silver-dim)",
          fontSize: "11px",
          letterSpacing: "0.08em",
        }}
      >
        NO_ASSETS :: Upload images above
      </div>
    );
  }

  return (
    <>
      <div className="admin-grid">
        <AnimatePresence>
          {images.map((image) => (
            <motion.div
              key={image.public_id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "var(--bg-surface)",
                border: "1px solid var(--border-default)",
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                position: "relative",
              }}
            >
              {/* Image */}
              <div
                style={{ position: "relative", aspectRatio: "1", background: "#000" }}
              >
                <Image
                  src={image.secure_url}
                  alt={image.title}
                  fill
                  style={{ objectFit: "cover" }}
                  sizes="200px"
                />
                {deleting === image.public_id && (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(0,0,0,0.8)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontFamily: "var(--font-mono)",
                      fontSize: "10px",
                      color: "rgba(255,100,120,0.9)",
                      letterSpacing: "0.08em",
                    }}
                  >
                    DELETING...
                  </div>
                )}
              </div>

              {/* Info */}
              <div style={{ padding: "8px" }}>
                <p
                  style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: "10px",
                    color: "var(--white)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    marginBottom: "4px",
                    fontWeight: 700,
                  }}
                >
                  {image.title}
                </p>

                {/* Display current tags */}
                {image.tags.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "3px",
                      flexWrap: "wrap",
                      marginBottom: "6px",
                    }}
                  >
                    {image.tags.map((t) => (
                      <span
                        key={t}
                        style={{
                          fontSize: "8px",
                          fontFamily: "var(--font-mono)",
                          padding: "1px 4px",
                          background: "var(--cyan-dim)",
                          border: "1px solid var(--cyan-mid)",
                          borderRadius: "var(--radius-sm)",
                          color: "var(--cyan)",
                        }}
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", gap: "4px", marginTop: "6px" }}>
                  <button
                    className="y2k-btn y2k-btn-primary"
                    style={{ flex: 1, fontSize: "9px", padding: "4px" }}
                    onClick={() => openEditModal(image)}
                  >
                    ✏ TAGS & EDIT
                  </button>
                  <button
                    className={`y2k-btn ${confirmId === image.public_id ? "y2k-btn-danger" : "y2k-btn-ghost"}`}
                    style={{ flex: 1, fontSize: "9px", padding: "4px" }}
                    onClick={() => handleDelete(image.public_id)}
                    disabled={deleting === image.public_id}
                  >
                    {confirmId === image.public_id ? "CONFIRM" : "DELETE"}
                  </button>
                </div>

                {confirmId === image.public_id && (
                  <button
                    className="y2k-btn y2k-btn-ghost"
                    style={{
                      width: "100%",
                      fontSize: "9px",
                      padding: "3px",
                      marginTop: "4px",
                    }}
                    onClick={() => setConfirmId(null)}
                  >
                    CANCEL
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* ── Edit Tags & Metadata Modal ───────────────────────────────── */}
      <AnimatePresence>
        {editingImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3000,
              background: "rgba(0, 0, 0, 0.75)",
              backdropFilter: "blur(6px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px",
            }}
            onClick={() => setEditingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "500px" }}
            >
              <Y2KFrame title={`EDIT_TAGS :: ${editingImage.title}`}>
                <div style={{ padding: "20px" }}>
                  {/* Thumbnail preview */}
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                      marginBottom: "16px",
                      padding: "10px",
                      background: "var(--bg-void)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "50px",
                        height: "50px",
                        borderRadius: "var(--radius-sm)",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                    >
                      <Image
                        src={editingImage.secure_url}
                        alt={editingImage.title}
                        fill
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "var(--white)",
                        }}
                      >
                        {editingImage.title}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--silver-dim)",
                        }}
                      >
                        ID: {editingImage.public_id}
                      </p>
                    </div>
                  </div>

                  {/* Form fields */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--cyan)",
                          letterSpacing: "0.1em",
                          marginBottom: "4px",
                          fontWeight: 700,
                        }}
                      >
                        TAGS (séparés par des virgules)
                      </label>
                      <input
                        className="y2k-input"
                        type="text"
                        placeholder="ex: Gpose, Astrologian, Il Mheg, Edited"
                        value={editForm.tags}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, tags: e.target.value }))
                        }
                      />
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            color: "var(--silver-dim)",
                            marginBottom: "4px",
                          }}
                        >
                          TITRE
                        </label>
                        <input
                          className="y2k-input"
                          type="text"
                          value={editForm.title}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, title: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            color: "var(--silver-dim)",
                            marginBottom: "4px",
                          }}
                        >
                          ZONE FFXIV
                        </label>
                        <input
                          className="y2k-input"
                          type="text"
                          value={editForm.zone}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, zone: e.target.value }))
                          }
                        />
                      </div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            color: "var(--silver-dim)",
                            marginBottom: "4px",
                          }}
                        >
                          JOB / CLASSE
                        </label>
                        <input
                          className="y2k-input"
                          type="text"
                          value={editForm.job}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, job: e.target.value }))
                          }
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            fontFamily: "var(--font-mono)",
                            fontSize: "9px",
                            color: "var(--silver-dim)",
                            marginBottom: "4px",
                          }}
                        >
                          PRESET GSHADE
                        </label>
                        <input
                          className="y2k-input"
                          type="text"
                          value={editForm.preset}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, preset: e.target.value }))
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {editError && (
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "rgba(255,100,120,0.9)",
                        marginTop: "10px",
                      }}
                    >
                      ⚠ {editError}
                    </p>
                  )}

                  {/* Modal Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                      marginTop: "20px",
                    }}
                  >
                    <button
                      className="y2k-btn y2k-btn-ghost"
                      onClick={() => setEditingImage(null)}
                      disabled={savingEdit}
                    >
                      CANCEL
                    </button>
                    <button
                      className="y2k-btn y2k-btn-primary"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                    >
                      {savingEdit ? "SAVING..." : "SAVE TAGS & INFO"}
                    </button>
                  </div>
                </div>
              </Y2KFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
