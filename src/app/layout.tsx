import type { Metadata, Viewport } from "next";
import "./globals.css";
import StyledComponentsRegistry from "@/lib/registry";
import ThemeClient from "@/lib/ThemeClient";

export const metadata: Metadata = {
  title: "Weekender Quiz",
  description: "A weekend quiz app for teams",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>
          <ThemeClient>{children}</ThemeClient>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
