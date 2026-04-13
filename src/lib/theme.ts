export const theme = {
  colors: {
    primary: "#6C5CE7",
    primaryHover: "#5A4BD1",
    secondary: "#00CEC9",
    background: "#F8F9FA",
    surface: "#FFFFFF",
    text: "#2D3436",
    textLight: "#636E72",
    border: "#DFE6E9",
    success: "#00B894",
    error: "#E17055",
    errorLight: "#FFEAA7",
    gold: "#FDCB6E",
    silver: "#B2BEC3",
    bronze: "#E17055",
  },
  spacing: {
    xs: "4px",
    sm: "8px",
    md: "16px",
    lg: "24px",
    xl: "32px",
    xxl: "48px",
  },
  borderRadius: "12px",
  borderRadiusSm: "8px",
  fontSizes: {
    sm: "0.875rem",
    md: "1rem",
    lg: "1.25rem",
    xl: "1.5rem",
    xxl: "2rem",
  },
  breakpoints: {
    tablet: "768px",
    desktop: "1024px",
  },
} as const;

export type Theme = typeof theme;
