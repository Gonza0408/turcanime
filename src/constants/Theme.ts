/**
 * Turcanime Minimalist Design System
 * Unified tokens for colors, spacing, and radius.
 */

export const Theme = {
  colors: {
    background: "#000000",
    surface: "#0A0A0A",
    surfaceElevated: "#1A1A1A",
    border: "#1F1F1F",
    black: "#000000",

    primary: "#A855F7",
    primaryMuted: "rgba(168, 85, 247, 0.15)",
    error: "#EF4444",

    text: {
      primary: "#FFFFFF",
      secondary: "#AAAAAA",
      muted: "#777777",
      dark: "#444444",
      accent: "#A855F7",
    },

    status: {
      airing: "#A855F7",
      finished: "#777777",
    },

    overlay: {
      light: "rgba(0, 0, 0, 0.3)",
      dark: "rgba(0, 0, 0, 0.6)",
      heavy: "rgba(0, 0, 0, 0.8)",
      glass: "rgba(255, 255, 255, 0.05)",
      scrim: ["rgba(0, 0, 0, 0.8)", "transparent"],
      gradient: ["transparent", "rgba(0, 0, 0, 0.5)", "#000000"] as const,
      mid: "rgba(0, 0, 0, 0.4)",
      midStrong: "rgba(0, 0, 0, 0.7)",
      scrimGradient: [
        "rgba(0, 0, 0, 0.4)",
        "rgba(0, 0, 0, 0.7)",
      ] as const,
    },
  },

  // Unified spacing system - single source of truth
  // Base unit: 4px, semantic naming by use case
  spacing: {
    xs: 4,      // Micro - inside tiny components (badges, small icons)
    sm: 8,      // Compact - gaps between related items (icon + text)
    md: 12,     // Base - padding between related components
    lg: 16,     // Comfortable - standard padding inside sections
    xl: 20,     // Generous - section edges, hero horizontal padding
    xxl: 24,    // Spacious - between major sections
    xxxl: 32,   // Extra spacious - large separations
    xxxxl: 48,  // Hero - maximum spacing for hero elements
  },

  radius: {
    s: 4,
    m: 8,
    l: 12,
    full: 9999,
  },

  fontSize: {
    xs: 10,
    s: 12,
    m: 15,
    l: 17,
    xl: 20,
    xxl: 24,
    xxxl: 30,
  },

  lineHeight: {
    xs: 14,
    s: 16,
    m: 20,
    l: 23,
    xl: 27,
    xxl: 32,
  },

  fontWeight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    heavy: "800" as const,
  },

  transitions: {
    quick: 100,
    standard: 150,
  },

  edge: {
    horizontal: 20,
  },

  screen: {
    search: {
      gridColumnGap: 10,
      gridRowGap: 8,
    },
  },

  dimensions: {
    inputHeight: 48,
    iconSm: 14,
    iconMd: 18,
    iconLg: 20,
    touchTarget: 48,
    cardPosterSm: { width: 40, height: 56 },
    cardPosterMd: { width: 110, height: 165 },
    backButton: 48,
    modalHandle: { width: 36, height: 4, radius: 2 },
    playIcon: { width: 28, height: 28 },
    minHeight: 400,
    loaderHeight: 200,
    episodeRangeBadge: { width: 90, gap: 12 },
  },

  borders: {
    thin: 1,
  },
};
