"use client";

interface FilterBarProps {
  tags: string[];
  activeTag: string;
  onTagChange: (tag: string) => void;
}

export default function FilterBar({ tags, activeTag, onTagChange }: FilterBarProps) {
  const allTags = ["All", ...tags];

  return (
    <div
      style={{
        display: "flex",
        gap: "6px",
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <span
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "10px",
          color: "var(--silver-dim)",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          marginRight: "4px",
        }}
      >
        filter::
      </span>
      {allTags.map((tag) => (
        <button
          key={tag}
          className={`tag-pill ${activeTag === tag ? "active" : ""}`}
          onClick={() => onTagChange(tag)}
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
