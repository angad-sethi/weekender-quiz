"use client";

import { createContext, useContext, useState, useEffect, useLayoutEffect, useCallback } from "react";
import { ThemeProvider } from "styled-components";
import { lightTheme, darkTheme } from "./theme";
import { GlobalStyles } from "./GlobalStyles";
import ThemeToggle from "@/components/ThemeToggle";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  isDark: false,
  toggleTheme: () => {},
});

export function useThemeMode() {
  return useContext(ThemeContext);
}

const STORAGE_KEY = "weekender-dark-mode";

export default function ThemeClient({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false);

  useLayoutEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === "true") setIsDark(true);
    } catch {}
    document.documentElement.setAttribute("data-hydrated", "");
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(isDark));
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } catch {}
  }, [isDark]);

  const toggleTheme = useCallback(() => setIsDark((prev) => !prev), []);

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        {children}
        <ThemeToggle />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}
