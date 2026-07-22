export type CoverPreset = {
  id: string;
  label: string;
  emoji: string;
  /** Utility class applied to the cover element */
  className: string;
  /** Preview background used in the picker swatch */
  preview: string;
  /** Text color for elements over the cover */
  textColor?: string;
};

export const COVER_PRESETS: CoverPreset[] = [
  {
    id: "preset:lisa-frank",
    label: "Lisa Frank",
    emoji: "🌈",
    className: "cover-lisa-frank",
    preview:
      "linear-gradient(135deg, #ff6ec7, #ffb86b 25%, #ffe66b 50%, #6bffb8 75%, #6bb8ff)",
  },
  {
    id: "preset:rainbow",
    label: "Rainbow",
    emoji: "🎨",
    className: "cover-rainbow",
    preview:
      "linear-gradient(135deg, #ff6b6b, #feca57, #48dbfb, #1dd1a1, #a29bfe, #ff9ff3)",
  },
  {
    id: "preset:holographic",
    label: "Holographic",
    emoji: "✨",
    className: "cover-holographic",
    preview:
      "linear-gradient(115deg, #ff9a9e, #fad0c4, #a1c4fd, #c2e9fb, #d4fc79, #f6d365, #fda085)",
  },
  {
    id: "preset:galaxy",
    label: "Galaxy",
    emoji: "🌌",
    className: "cover-galaxy",
    preview: "linear-gradient(160deg, #0f0524, #2b0a5a 40%, #6b1b8f 80%, #ff6bd6)",
  },
  {
    id: "preset:faith",
    label: "Faith",
    emoji: "✝️",
    className: "cover-faith",
    preview: "linear-gradient(160deg, #1e3a8a, #4c1d95 60%, #d4af37)",
  },
  {
    id: "preset:floral",
    label: "Floral",
    emoji: "🌸",
    className: "cover-floral",
    preview: "linear-gradient(180deg, #fff1f2, #fce7f3)",
    textColor: "#831843",
  },
  {
    id: "preset:butterfly",
    label: "Butterfly",
    emoji: "🦋",
    className: "cover-butterfly",
    preview: "linear-gradient(135deg, #a78bfa, #ec4899 50%, #f472b6)",
  },
  {
    id: "preset:ocean",
    label: "Ocean",
    emoji: "🌊",
    className: "cover-ocean",
    preview: "linear-gradient(180deg, #0e7490, #155e75 60%, #0c4a6e)",
  },
  {
    id: "preset:sunset",
    label: "Sunset",
    emoji: "🌅",
    className: "cover-sunset",
    preview: "linear-gradient(180deg, #fde68a, #fb923c 40%, #ec4899 75%, #7c3aed)",
  },
  {
    id: "preset:forest",
    label: "Forest",
    emoji: "🌿",
    className: "cover-forest",
    preview: "linear-gradient(160deg, #14532d, #166534 60%, #4d7c0f)",
  },
  {
    id: "preset:leopard",
    label: "Leopard",
    emoji: "🐆",
    className: "cover-leopard",
    preview:
      "radial-gradient(ellipse 8px 6px at 30% 40%, #3a2410 40%, transparent 45%), #d4a574",
  },
];

export function isPreset(color: string | null | undefined): boolean {
  return typeof color === "string" && color.startsWith("preset:");
}

export function getPreset(color: string | null | undefined): CoverPreset | undefined {
  if (!isPreset(color)) return undefined;
  return COVER_PRESETS.find((p) => p.id === color);
}

export function getCoverStyle(color: string | null | undefined): {
  className: string;
  style: React.CSSProperties;
} {
  const preset = getPreset(color);
  if (preset) {
    return {
      className: preset.className,
      style: preset.textColor ? { color: preset.textColor } : {},
    };
  }
  return {
    className: "",
    style: { backgroundColor: color || "#B91C1C" },
  };
}