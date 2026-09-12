"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import { GposeImage } from "@/types";
import Y2KFrame from "./Y2KFrame";
import Lightbox from "./Lightbox";

interface AdminGalleryProps {
  images: GposeImage[];
  onDelete: (publicId: string) => void;
  onUpdate?: (updatedImage: GposeImage) => void;
}

export default function AdminGallery({ images, onDelete, onUpdate }: AdminGalleryProps) {
  // State: Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTagFilter, setActiveTagFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "title-asc" | "title-desc" | "tags-count"
  >("newest");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // State: Multi-selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // State: Deletion & Feedback
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [confirmSingleDeleteId, setConfirmSingleDeleteId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // State: Lightbox & Modals
  const [activeLightboxImage, setActiveLightboxImage] = useState<GposeImage | null>(null);
  const [editingImage, setEditingImage] = useState<GposeImage | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // State: Batch Tag Modal
  const [batchTagModalOpen, setBatchTagModalOpen] = useState(false);
  const [batchTagInput, setBatchTagInput] = useState("");
  const [savingBatchTag, setSavingBatchTag] = useState(false);

  // ── Computed Tag Stats ──────────────────────────────────────────────
  const tagStats = useMemo(() => {
    const counts: Record<string, number> = {};
    let untaggedCount = 0;

    images.forEach((img) => {
      if (!img.tags || img.tags.length === 0) {
        untaggedCount++;
      } else {
        img.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });

    const sortedTags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    return { counts, sortedTags, untaggedCount };
  }, [images]);

  // ── Filter & Sort Images ───────────────────────────────────────────
  const filteredImages = useMemo(() => {
    let result = [...images];

    // Filter by tag
    if (activeTagFilter === "UNTAGGED") {
      result = result.filter((img) => !img.tags || img.tags.length === 0);
    } else if (activeTagFilter !== "ALL") {
      result = result.filter((img) => img.tags && img.tags.includes(activeTagFilter));
    }

    // Search query (search in title, tags, public_id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (img) =>
          img.title?.toLowerCase().includes(q) ||
          img.public_id?.toLowerCase().includes(q) ||
          img.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
      if (sortBy === "oldest") {
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      }
      if (sortBy === "title-asc") {
        return (a.title || "").localeCompare(b.title || "");
      }
      if (sortBy === "title-desc") {
        return (b.title || "").localeCompare(a.title || "");
      }
      if (sortBy === "tags-count") {
        return (b.tags?.length || 0) - (a.tags?.length || 0);
      }
      return 0;
    });

    return result;
  }, [images, activeTagFilter, searchQuery, sortBy]);

  // ── Multi-selection helpers ─────────────────────────────────────────
  const allVisibleSelected =
    filteredImages.length > 0 &&
    filteredImages.every((img) => selectedIds.has(img.public_id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      const next = new Set(selectedIds);
      filteredImages.forEach((img) => next.add(img.public_id));
      setSelectedIds(next);
    }
  };

  const toggleSelectOne = (publicId: string) => {
    const next = new Set(selectedIds);
    if (next.has(publicId)) {
      next.delete(publicId);
    } else {
      next.add(publicId);
    }
    setSelectedIds(next);
  };

  // ── Single & Batch Delete ──────────────────────────────────────────
  const handleDeleteSingle = async (publicId: string) => {
    if (confirmSingleDeleteId !== publicId) {
      setConfirmSingleDeleteId(publicId);
      return;
    }

    setConfirmSingleDeleteId(null);
    setDeletingIds((prev) => new Set(prev).add(publicId));

    try {
      const res = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_id: publicId }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onDelete(publicId);
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(publicId);
        return next;
      });
    } catch {
      alert("Erreur lors de la suppression de la photo.");
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(publicId);
        return next;
      });
    }
  };

  const handleBatchDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;

    if (!window.confirm(`Supprimer définitivement ${count} photo(s) sélectionnée(s) de Cloudinary ?`)) {
      return;
    }

    const idsToDelete = Array.from(selectedIds);
    setDeletingIds(new Set(idsToDelete));

    try {
      const res = await fetch("/api/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ public_ids: idsToDelete }),
      });
      if (!res.ok) throw new Error("Batch delete failed");

      idsToDelete.forEach((id) => onDelete(id));
      setSelectedIds(new Set());
    } catch {
      alert("Erreur lors de la suppression groupée.");
    } finally {
      setDeletingIds(new Set());
    }
  };

  // ── Batch Tag Add ──────────────────────────────────────────────────
  const handleBatchAddTag = async (tagToAdd: string) => {
    const cleanTag = tagToAdd.trim();
    if (!cleanTag || selectedIds.size === 0) return;

    setSavingBatchTag(true);
    const idsToUpdate = Array.from(selectedIds);

    try {
      for (const id of idsToUpdate) {
        const img = images.find((i) => i.public_id === id);
        if (img && !img.tags.includes(cleanTag)) {
          const newTags = [...img.tags, cleanTag];
          await fetch("/api/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              public_id: id,
              title: img.title,
              tags: newTags,
            }),
          });
          if (onUpdate) onUpdate({ ...img, tags: newTags });
        }
      }
      setBatchTagModalOpen(false);
      setBatchTagInput("");
    } catch {
      alert("Erreur lors de l'application du tag groupé.");
    } finally {
      setSavingBatchTag(false);
    }
  };

  // ── Single Edit Modal Helpers ───────────────────────────────────────
  const openEditModal = (img: GposeImage) => {
    setEditingImage(img);
    setEditTitle(img.title || "");
    setEditTags(img.tags ? [...img.tags] : []);
    setNewTagInput("");
    setEditError(null);
  };

  const handleAddTagToEdit = (tag: string) => {
    const clean = tag.trim().replace(/^#/, "");
    if (!clean) return;
    if (!editTags.includes(clean)) {
      setEditTags((prev) => [...prev, clean]);
    }
    setNewTagInput("");
  };

  const handleRemoveTagFromEdit = (tagToRemove: string) => {
    setEditTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleSaveEdit = async () => {
    if (!editingImage) return;

    setSavingEdit(true);
    setEditError(null);

    try {
      const res = await fetch("/api/edit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_id: editingImage.public_id,
          title: editTitle,
          tags: editTags,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Save failed");

      const updated: GposeImage = {
        ...editingImage,
        title: editTitle,
        tags: editTags,
      };

      if (onUpdate) onUpdate(updated);
      setEditingImage(null);
    } catch (err: any) {
      setEditError(err?.message || "Failed to update tags");
    } finally {
      setSavingEdit(false);
    }
  };

  // ── Copy direct share link ─────────────────────────────────────────
  const handleCopyLink = (publicId: string) => {
    const url = `${window.location.origin}/?img=${encodeURIComponent(publicId)}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(publicId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  if (images.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "60px 20px",
          fontFamily: "var(--font-mono)",
          color: "var(--silver-dim)",
          fontSize: "12px",
          letterSpacing: "0.08em",
        }}
      >
        <p style={{ fontSize: "24px", marginBottom: "8px" }}>⊕</p>
        <p>AUCUNE PHOTO TROUVÉE DANS LA GALERIE</p>
        <p style={{ fontSize: "10px", marginTop: "6px", opacity: 0.7 }}>
          Uploadez vos premières photos via l&apos;onglet UPLOAD ci-dessus.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* ── 1. TAG DISCOVERY BAR (Tous les tags existants visibles) ───── */}
      <div
        style={{
          background: "var(--bg-void)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          padding: "12px 14px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "9px",
              fontWeight: 700,
              color: "var(--cyan)",
              letterSpacing: "0.14em",
              textTransform: "uppercase",
            }}
          >
            🏷 TAGS EXISTANTS ({tagStats.sortedTags.length}) — FILTRAGE RAPIDE
          </span>
          {activeTagFilter !== "ALL" && (
            <button
              onClick={() => setActiveTagFilter("ALL")}
              style={{
                background: "none",
                border: "none",
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--silver-dim)",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Réinitialiser le filtre
            </button>
          )}
        </div>

        {/* Tag pills bar */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          <button
            onClick={() => setActiveTagFilter("ALL")}
            className={`tag-pill ${activeTagFilter === "ALL" ? "active" : ""}`}
            style={{ fontSize: "10px", padding: "3px 8px" }}
          >
            TOUT ({images.length})
          </button>

          {tagStats.sortedTags.map((tag) => {
            const count = tagStats.counts[tag];
            const isActive = activeTagFilter === tag;
            return (
              <button
                key={tag}
                onClick={() => setActiveTagFilter(isActive ? "ALL" : tag)}
                className={`tag-pill ${isActive ? "active" : ""}`}
                style={{
                  fontSize: "10px",
                  padding: "3px 8px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <span>#{tag}</span>
                <span
                  style={{
                    fontSize: "8px",
                    opacity: 0.75,
                    background: isActive ? "rgba(0,0,0,0.2)" : "var(--bg-elevated)",
                    padding: "1px 4px",
                    borderRadius: "2px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {tagStats.untaggedCount > 0 && (
            <button
              onClick={() =>
                setActiveTagFilter(activeTagFilter === "UNTAGGED" ? "ALL" : "UNTAGGED")
              }
              className={`tag-pill ${activeTagFilter === "UNTAGGED" ? "active" : ""}`}
              style={{
                fontSize: "10px",
                padding: "3px 8px",
                color: activeTagFilter === "UNTAGGED" ? "#fff" : "rgba(255, 120, 120, 0.9)",
                borderColor: "rgba(255, 120, 120, 0.3)",
              }}
            >
              ⚠ Sans tag ({tagStats.untaggedCount})
            </button>
          )}
        </div>
      </div>

      {/* ── 2. TOOLBAR: Search, Sort & View Mode ──────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          background: "var(--bg-surface)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-sm)",
          padding: "10px 14px",
        }}
      >
        {/* Left: Search input */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: "220px" }}>
          <div style={{ position: "relative", width: "100%", maxWidth: "340px" }}>
            <input
              className="y2k-input"
              type="text"
              placeholder="Rechercher par titre, tag, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: "26px", fontSize: "11px", height: "30px", width: "100%" }}
            />
            <span
              style={{
                position: "absolute",
                left: "8px",
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "11px",
                color: "var(--silver-dim)",
              }}
            >
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                style={{
                  position: "absolute",
                  right: "6px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "var(--silver-dim)",
                  cursor: "pointer",
                  fontSize: "10px",
                  padding: "2px",
                }}
              >
                ✕
              </button>
            )}
          </div>

          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "10px",
              color: "var(--silver-dim)",
              whiteSpace: "nowrap",
            }}
          >
            {filteredImages.length} / {images.length} photo{filteredImages.length > 1 ? "s" : ""}
          </span>
        </div>

        {/* Right: Sort & View Mode controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Tri */}
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "9px",
                color: "var(--silver-dim)",
                letterSpacing: "0.08em",
              }}
            >
              TRI :
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="y2k-input"
              style={{
                fontSize: "10px",
                padding: "4px 8px",
                height: "30px",
                fontFamily: "var(--font-mono)",
              }}
            >
              <option value="newest">Plus récent</option>
              <option value="oldest">Plus ancien</option>
              <option value="title-asc">Titre (A → Z)</option>
              <option value="title-desc">Titre (Z → A)</option>
              <option value="tags-count">Plus de tags</option>
            </select>
          </div>

          {/* Mode d'affichage Grille / Table */}
          <div style={{ display: "flex", gap: "4px" }}>
            <button
              onClick={() => setViewMode("cards")}
              className={`y2k-btn ${viewMode === "cards" ? "y2k-btn-primary" : "y2k-btn-ghost"}`}
              style={{ padding: "5px 10px", fontSize: "10px", height: "30px" }}
              title="Vue Cartes"
            >
              ⊞ CARTES
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`y2k-btn ${viewMode === "table" ? "y2k-btn-primary" : "y2k-btn-ghost"}`}
              style={{ padding: "5px 10px", fontSize: "10px", height: "30px" }}
              title="Vue Tableau Liste"
            >
              ☰ TABLE
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. BATCH ACTIONS BAR (S'affiche si au moins 1 photo cochée) ─ */}
      <AnimatePresence>
        {selectedIds.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--cyan)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 16px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "10px",
              boxShadow: "0 4px 15px var(--cyan-dim)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "11px",
                  fontWeight: 700,
                  color: "var(--cyan)",
                }}
              >
                ✓ {selectedIds.size} PHOTO{selectedIds.size > 1 ? "S" : ""} SÉLECTIONNÉE{selectedIds.size > 1 ? "S" : ""}
              </span>
              <button
                onClick={toggleSelectAll}
                className="y2k-btn y2k-btn-ghost"
                style={{ fontSize: "9px", padding: "2px 8px" }}
              >
                {allVisibleSelected ? "Tout désélectionner" : "Sélectionner tout"}
              </button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <button
                onClick={() => setBatchTagModalOpen(true)}
                className="y2k-btn y2k-btn-primary"
                style={{ fontSize: "10px", padding: "5px 12px" }}
              >
                🏷 AJOUTER UN TAG AUX SÉLECTIONNÉES
              </button>
              <button
                onClick={handleBatchDelete}
                className="y2k-btn y2k-btn-danger"
                style={{ fontSize: "10px", padding: "5px 12px" }}
                disabled={deletingIds.size > 0}
              >
                🗑 SUPPRIMER LA SÉLECTION ({selectedIds.size})
              </button>
              <button
                onClick={() => setSelectedIds(new Set())}
                className="y2k-btn y2k-btn-ghost"
                style={{ fontSize: "10px", padding: "5px 10px" }}
              >
                ✕ ANNULER
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 4. MAIN DISPLAY (Cards View vs Table View) ─────────────────── */}
      {filteredImages.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "40px",
            fontFamily: "var(--font-mono)",
            color: "var(--silver-dim)",
            fontSize: "11px",
            background: "var(--bg-surface)",
            border: "1px dashed var(--border-default)",
            borderRadius: "var(--radius-sm)",
          }}
        >
          Aucune photo ne correspond à votre recherche ou filtre actuel.
        </div>
      ) : viewMode === "cards" ? (
        /* ── CARDS VIEW ──────────────────────────────────────────────── */
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: "14px",
          }}
        >
          <AnimatePresence>
            {filteredImages.map((image) => {
              const isSelected = selectedIds.has(image.public_id);
              const isDeleting = deletingIds.has(image.public_id);
              const isConfirming = confirmSingleDeleteId === image.public_id;

              return (
                <motion.div
                  key={image.public_id}
                  layout
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: "var(--bg-surface)",
                    border: `1px solid ${isSelected ? "var(--cyan)" : "var(--border-default)"}`,
                    borderRadius: "var(--radius-sm)",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    position: "relative",
                    boxShadow: isSelected ? "0 0 10px var(--cyan-dim)" : "none",
                    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                  }}
                >
                  {/* Card Thumbnail Area with Ratio & Hover Actions */}
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "16 / 10",
                      background: "#080a0f",
                      cursor: "pointer",
                      overflow: "hidden",
                    }}
                    onClick={() => setActiveLightboxImage(image)}
                  >
                    <Image
                      src={image.secure_url}
                      alt={image.title || "Gpose"}
                      fill
                      style={{ objectFit: "cover" }}
                      sizes="(max-width: 600px) 100vw, 320px"
                    />

                    {/* Checkbox Overlay (Top Left) */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        left: "8px",
                        zIndex: 2,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelectOne(image.public_id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{
                          cursor: "pointer",
                          width: "16px",
                          height: "16px",
                          accentColor: "var(--cyan)",
                        }}
                      />
                    </div>

                    {/* Dimensions & Resolution Badge (Top Right) */}
                    <div
                      style={{
                        position: "absolute",
                        top: "8px",
                        right: "8px",
                        background: "rgba(0, 0, 0, 0.75)",
                        backdropFilter: "blur(4px)",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "2px",
                        padding: "2px 6px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "8px",
                        color: "var(--silver)",
                        letterSpacing: "0.05em",
                        zIndex: 2,
                      }}
                    >
                      {image.width}×{image.height}
                    </div>

                    {/* Quick Preview Hover Overlay */}
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0,0,0,0.4)",
                        opacity: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "opacity 0.2s ease",
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "#ffffff",
                        letterSpacing: "0.1em",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
                      onMouseLeave={(e) => (e.currentTarget.style.opacity = "0")}
                    >
                      🔍 APERÇU PLEIN ÉCRAN
                    </div>

                    {/* Deleting Indicator */}
                    {isDeleting && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(0,0,0,0.85)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontFamily: "var(--font-mono)",
                          fontSize: "11px",
                          color: "rgba(255,100,120,0.9)",
                          zIndex: 5,
                        }}
                      >
                        SUPPRESSION EN COURS...
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: "12px", display: "flex", flexDirection: "column", flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                        gap: "8px",
                        marginBottom: "6px",
                      }}
                    >
                      <h4
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--white)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={image.title}
                      >
                        {image.title || "Sans titre"}
                      </h4>

                      <button
                        onClick={() => handleCopyLink(image.public_id)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontFamily: "var(--font-mono)",
                          fontSize: "8.5px",
                          color: copiedId === image.public_id ? "var(--cyan)" : "var(--silver-dim)",
                          whiteSpace: "nowrap",
                        }}
                        title="Copier le lien public vers cette photo"
                      >
                        {copiedId === image.public_id ? "✓ COPIÉ" : "🔗 LIEN"}
                      </button>
                    </div>

                    {/* Tags */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "4px",
                        marginBottom: "12px",
                        minHeight: "22px",
                      }}
                    >
                      {image.tags && image.tags.length > 0 ? (
                        image.tags.map((t) => (
                          <span
                            key={t}
                            onClick={() => setActiveTagFilter(t)}
                            style={{
                              fontSize: "8.5px",
                              fontFamily: "var(--font-mono)",
                              padding: "1px 5px",
                              background: "var(--cyan-dim)",
                              border: "1px solid var(--cyan-mid)",
                              borderRadius: "var(--radius-sm)",
                              color: "var(--cyan)",
                              cursor: "pointer",
                            }}
                            title={`Filtrer par #${t}`}
                          >
                            #{t}
                          </span>
                        ))
                      ) : (
                        <span
                          style={{
                            fontSize: "8px",
                            fontFamily: "var(--font-mono)",
                            color: "var(--silver-dim)",
                            fontStyle: "italic",
                          }}
                        >
                          Aucun tag
                        </span>
                      )}
                    </div>

                    {/* Bottom Actions */}
                    <div style={{ marginTop: "auto", display: "flex", gap: "6px" }}>
                      <button
                        className="y2k-btn y2k-btn-primary"
                        style={{ flex: 1, fontSize: "9px", padding: "5px 8px", justifyContent: "center" }}
                        onClick={() => openEditModal(image)}
                      >
                        ✏ MODIFIER
                      </button>
                      <button
                        className={`y2k-btn ${isConfirming ? "y2k-btn-danger" : "y2k-btn-ghost"}`}
                        style={{
                          flex: isConfirming ? 1.4 : 1,
                          fontSize: "9px",
                          padding: "5px 8px",
                          justifyContent: "center",
                        }}
                        onClick={() => handleDeleteSingle(image.public_id)}
                        disabled={isDeleting}
                      >
                        {isConfirming ? "CONFIRMER ?" : "🗑 SUPPRIMER"}
                      </button>
                      {isConfirming && (
                        <button
                          className="y2k-btn y2k-btn-ghost"
                          style={{ fontSize: "9px", padding: "5px" }}
                          onClick={() => setConfirmSingleDeleteId(null)}
                          title="Annuler la suppression"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      ) : (
        /* ── TABLE VIEW ──────────────────────────────────────────────── */
        <div
          style={{
            background: "var(--bg-surface)",
            border: "1px solid var(--border-default)",
            borderRadius: "var(--radius-sm)",
            overflowX: "auto",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
            <thead>
              <tr
                style={{
                  background: "var(--bg-void)",
                  borderBottom: "1px solid var(--border-default)",
                  fontFamily: "var(--font-mono)",
                  fontSize: "9px",
                  color: "var(--silver-dim)",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                <th style={{ padding: "10px 12px", width: "36px" }}>
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={toggleSelectAll}
                    style={{ cursor: "pointer", accentColor: "var(--cyan)" }}
                  />
                </th>
                <th style={{ padding: "10px 12px", width: "64px" }}>PHOTO</th>
                <th style={{ padding: "10px 12px" }}>TITRE / ID</th>
                <th style={{ padding: "10px 12px" }}>TAGS</th>
                <th style={{ padding: "10px 12px", width: "100px" }}>DIMENSIONS</th>
                <th style={{ padding: "10px 12px", width: "170px", textAlign: "right" }}>
                  ACTIONS
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredImages.map((image) => {
                const isSelected = selectedIds.has(image.public_id);
                const isDeleting = deletingIds.has(image.public_id);
                const isConfirming = confirmSingleDeleteId === image.public_id;

                return (
                  <tr
                    key={image.public_id}
                    style={{
                      borderBottom: "1px solid var(--border-subtle)",
                      background: isSelected ? "var(--cyan-dim)" : "transparent",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ padding: "8px 12px" }}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelectOne(image.public_id)}
                        style={{ cursor: "pointer", accentColor: "var(--cyan)" }}
                      />
                    </td>

                    {/* Thumbnail */}
                    <td style={{ padding: "8px 12px" }}>
                      <div
                        style={{
                          position: "relative",
                          width: "48px",
                          height: "36px",
                          borderRadius: "2px",
                          overflow: "hidden",
                          cursor: "pointer",
                          background: "#000",
                        }}
                        onClick={() => setActiveLightboxImage(image)}
                        title="Cliquer pour voir en plein écran"
                      >
                        <Image
                          src={image.secure_url}
                          alt={image.title}
                          fill
                          style={{ objectFit: "cover" }}
                          sizes="48px"
                        />
                      </div>
                    </td>

                    {/* Title & ID */}
                    <td style={{ padding: "8px 12px" }}>
                      <div
                        style={{
                          fontFamily: "var(--font-sans)",
                          fontSize: "12px",
                          fontWeight: 600,
                          color: "var(--white)",
                        }}
                      >
                        {image.title || "Sans titre"}
                      </div>
                      <div
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "8.5px",
                          color: "var(--silver-dim)",
                          marginTop: "2px",
                        }}
                      >
                        ID: {image.public_id}
                      </div>
                    </td>

                    {/* Tags */}
                    <td style={{ padding: "8px 12px" }}>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px" }}>
                        {image.tags && image.tags.length > 0 ? (
                          image.tags.map((t) => (
                            <span
                              key={t}
                              onClick={() => setActiveTagFilter(t)}
                              style={{
                                fontSize: "8.5px",
                                fontFamily: "var(--font-mono)",
                                padding: "1px 5px",
                                background: "var(--cyan-dim)",
                                border: "1px solid var(--cyan-mid)",
                                borderRadius: "2px",
                                color: "var(--cyan)",
                                cursor: "pointer",
                              }}
                            >
                              #{t}
                            </span>
                          ))
                        ) : (
                          <span style={{ fontSize: "8.5px", color: "var(--silver-dim)", fontStyle: "italic" }}>
                            Aucun tag
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dimensions */}
                    <td
                      style={{
                        padding: "8px 12px",
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "var(--silver)",
                      }}
                    >
                      {image.width} × {image.height}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "8px 12px", textAlign: "right" }}>
                      <div style={{ display: "inline-flex", gap: "4px" }}>
                        <button
                          onClick={() => handleCopyLink(image.public_id)}
                          className="y2k-btn y2k-btn-ghost"
                          style={{ padding: "4px 8px", fontSize: "9px" }}
                          title="Copier le lien public"
                        >
                          {copiedId === image.public_id ? "✓" : "🔗"}
                        </button>
                        <button
                          onClick={() => openEditModal(image)}
                          className="y2k-btn y2k-btn-primary"
                          style={{ padding: "4px 8px", fontSize: "9px" }}
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => handleDeleteSingle(image.public_id)}
                          className={`y2k-btn ${isConfirming ? "y2k-btn-danger" : "y2k-btn-ghost"}`}
                          style={{ padding: "4px 8px", fontSize: "9px" }}
                          disabled={isDeleting}
                        >
                          {isConfirming ? "CONFIRMER" : "🗑"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 5. SINGLE EDIT MODAL (Tag Manager interactif) ────────────── */}
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
              background: "rgba(0, 0, 0, 0.78)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setEditingImage(null)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "560px" }}
            >
              <Y2KFrame title={`ÉDITION PHOTO :: ${editingImage.title || editingImage.public_id}`}>
                <div style={{ padding: "20px" }}>
                  {/* Photo Info Banner */}
                  <div
                    style={{
                      display: "flex",
                      gap: "14px",
                      alignItems: "center",
                      marginBottom: "20px",
                      padding: "10px 14px",
                      background: "var(--bg-void)",
                      borderRadius: "var(--radius-sm)",
                      border: "1px solid var(--border-subtle)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "60px",
                        height: "44px",
                        borderRadius: "2px",
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
                          fontFamily: "var(--font-sans)",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "var(--white)",
                        }}
                      >
                        {editingImage.title || "Sans titre"}
                      </p>
                      <p
                        style={{
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--silver-dim)",
                          marginTop: "2px",
                        }}
                      >
                        {editingImage.width}×{editingImage.height} · ID: {editingImage.public_id}
                      </p>
                    </div>
                  </div>

                  {/* Form */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    {/* Title */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--silver-dim)",
                          marginBottom: "4px",
                          letterSpacing: "0.08em",
                        }}
                      >
                        TITRE DE LA PHOTO
                      </label>
                      <input
                        className="y2k-input"
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Ex: Night in Ishgard"
                        style={{ width: "100%", fontSize: "12px" }}
                      />
                    </div>

                    {/* Tags Manager */}
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "9px",
                          color: "var(--cyan)",
                          fontWeight: 700,
                          letterSpacing: "0.08em",
                          marginBottom: "6px",
                        }}
                      >
                        TAGS DE LA PHOTO ({editTags.length})
                      </label>

                      {/* Current Tags Chips */}
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "6px",
                          padding: "8px 10px",
                          background: "var(--bg-surface)",
                          border: "1px solid var(--border-default)",
                          borderRadius: "var(--radius-sm)",
                          minHeight: "40px",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        {editTags.length === 0 ? (
                          <span
                            style={{
                              fontFamily: "var(--font-mono)",
                              fontSize: "9px",
                              color: "var(--silver-dim)",
                            }}
                          >
                            Aucun tag assigné. Choisissez ou ajoutez un tag ci-dessous.
                          </span>
                        ) : (
                          editTags.map((tag) => (
                            <span
                              key={tag}
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "5px",
                                background: "var(--cyan-dim)",
                                border: "1px solid var(--cyan-mid)",
                                borderRadius: "2px",
                                padding: "3px 8px",
                                fontFamily: "var(--font-mono)",
                                fontSize: "10px",
                                color: "var(--cyan)",
                              }}
                            >
                              #{tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTagFromEdit(tag)}
                                style={{
                                  background: "none",
                                  border: "none",
                                  color: "var(--cyan)",
                                  cursor: "pointer",
                                  fontSize: "11px",
                                  lineHeight: 1,
                                  padding: 0,
                                }}
                                title="Supprimer ce tag"
                              >
                                ×
                              </button>
                            </span>
                          ))
                        )}
                      </div>

                      {/* Available Existing Tags (Click to toggle/add) */}
                      {tagStats.sortedTags.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                          <span
                            style={{
                              display: "block",
                              fontFamily: "var(--font-mono)",
                              fontSize: "8.5px",
                              color: "var(--silver-dim)",
                              marginBottom: "4px",
                            }}
                          >
                            TAGS EXISTANTS DISPONIBLES (cliquer pour ajouter) :
                          </span>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {tagStats.sortedTags.map((t) => {
                              const isAlreadyAdded = editTags.includes(t);
                              return (
                                <button
                                  key={t}
                                  type="button"
                                  onClick={() =>
                                    isAlreadyAdded
                                      ? handleRemoveTagFromEdit(t)
                                      : handleAddTagToEdit(t)
                                  }
                                  className={`tag-pill ${isAlreadyAdded ? "active" : ""}`}
                                  style={{
                                    fontSize: "9px",
                                    padding: "2px 7px",
                                    opacity: isAlreadyAdded ? 0.6 : 1,
                                  }}
                                >
                                  {isAlreadyAdded ? `✓ #${t}` : `+ #${t}`}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Add new tag field */}
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input
                          className="y2k-input"
                          type="text"
                          placeholder="Créer un nouveau tag..."
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleAddTagToEdit(newTagInput);
                            }
                          }}
                          style={{ flex: 1, fontSize: "11px", height: "32px" }}
                        />
                        <button
                          type="button"
                          onClick={() => handleAddTagToEdit(newTagInput)}
                          className="y2k-btn y2k-btn-ghost"
                          style={{ fontSize: "10px", padding: "0 14px" }}
                        >
                          + AJOUTER
                        </button>
                      </div>
                    </div>
                  </div>

                  {editError && (
                    <p
                      style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "9px",
                        color: "rgba(255,100,120,0.9)",
                        marginTop: "12px",
                      }}
                    >
                      ⚠ {editError}
                    </p>
                  )}

                  {/* Actions */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-end",
                      gap: "8px",
                      marginTop: "24px",
                      borderTop: "1px solid var(--border-subtle)",
                      paddingTop: "16px",
                    }}
                  >
                    <button
                      className="y2k-btn y2k-btn-ghost"
                      onClick={() => setEditingImage(null)}
                      disabled={savingEdit}
                    >
                      ANNULER
                    </button>
                    <button
                      className="y2k-btn y2k-btn-primary"
                      onClick={handleSaveEdit}
                      disabled={savingEdit}
                    >
                      {savingEdit ? "ENREGISTREMENT..." : "SAUVEGARDER LES MODIFICATIONS"}
                    </button>
                  </div>
                </div>
              </Y2KFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 6. BATCH TAG MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {batchTagModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 3100,
              background: "rgba(0, 0, 0, 0.8)",
              backdropFilter: "blur(10px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "16px",
            }}
            onClick={() => setBatchTagModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.94, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              style={{ width: "100%", maxWidth: "480px" }}
            >
              <Y2KFrame title={`AJOUT DE TAG GROUPÉ — ${selectedIds.size} photos`}>
                <div style={{ padding: "20px" }}>
                  <p
                    style={{
                      fontFamily: "var(--font-sans)",
                      fontSize: "12px",
                      color: "var(--silver)",
                      marginBottom: "16px",
                    }}
                  >
                    Choisissez un tag existant ou saisissez-en un nouveau à ajouter aux{" "}
                    <strong>{selectedIds.size} photo(s)</strong> sélectionnée(s).
                  </p>

                  {/* Existing Tags Suggestions */}
                  {tagStats.sortedTags.length > 0 && (
                    <div style={{ marginBottom: "14px" }}>
                      <span
                        style={{
                          display: "block",
                          fontFamily: "var(--font-mono)",
                          fontSize: "8.5px",
                          color: "var(--silver-dim)",
                          marginBottom: "6px",
                        }}
                      >
                        CLIQUER SUR UN TAG EXISTANT POUR L&apos;APPLIQUER :
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
                        {tagStats.sortedTags.map((t) => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => handleBatchAddTag(t)}
                            className="tag-pill"
                            style={{ fontSize: "10px", padding: "3px 8px" }}
                            disabled={savingBatchTag}
                          >
                            + #{t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Custom tag input */}
                  <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                    <input
                      className="y2k-input"
                      type="text"
                      placeholder="Ou tapez un nouveau tag..."
                      value={batchTagInput}
                      onChange={(e) => setBatchTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleBatchAddTag(batchTagInput);
                        }
                      }}
                      style={{ flex: 1, fontSize: "12px" }}
                    />
                    <button
                      className="y2k-btn y2k-btn-primary"
                      onClick={() => handleBatchAddTag(batchTagInput)}
                      disabled={savingBatchTag || !batchTagInput.trim()}
                    >
                      {savingBatchTag ? "APPLICATION..." : "APPLIQUER"}
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                    <button
                      className="y2k-btn y2k-btn-ghost"
                      onClick={() => setBatchTagModalOpen(false)}
                      disabled={savingBatchTag}
                    >
                      FERMER
                    </button>
                  </div>
                </div>
              </Y2KFrame>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 7. LIGHTBOX PREVIEW (Aperçu plein écran dans l'admin) ────── */}
      <Lightbox
        image={activeLightboxImage}
        onClose={() => setActiveLightboxImage(null)}
        onNext={() => {
          if (!activeLightboxImage) return;
          const idx = filteredImages.findIndex(
            (i) => i.public_id === activeLightboxImage.public_id
          );
          if (idx < filteredImages.length - 1) {
            setActiveLightboxImage(filteredImages[idx + 1]);
          }
        }}
        onPrev={() => {
          if (!activeLightboxImage) return;
          const idx = filteredImages.findIndex(
            (i) => i.public_id === activeLightboxImage.public_id
          );
          if (idx > 0) {
            setActiveLightboxImage(filteredImages[idx - 1]);
          }
        }}
        currentIndex={
          activeLightboxImage
            ? filteredImages.findIndex(
                (i) => i.public_id === activeLightboxImage.public_id
              )
            : undefined
        }
        totalCount={filteredImages.length}
      />
    </div>
  );
}
