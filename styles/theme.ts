export const theme = {
  colors: {
    primary:        "#FF6B35",
    primaryLight:   "#FFF3EE",
    background:     "#F5F5F5",
    white:          "#FFFFFF",
    text:           "#1A1A1A",
    textSecondary:  "#888888",
    border:         "#EEEEEE",
    star:           "#FFC107",
    success:        "#4CAF50",
  },
  borderRadius: {
    card:   "12px",
    button: "24px",
    pill:   "999px",
  },
  shadows: {
    card: "0 2px 8px rgba(0, 0, 0, 0.08)",
  },
  spacing: {
    xs:  "4px",
    sm:  "8px",
    md:  "16px",
    lg:  "24px",
    xl:  "32px",
  },
} as const;

export type Theme = typeof theme;
