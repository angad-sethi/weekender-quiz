import type { Metadata, Viewport } from "next";
import "./globals.css";
import { playfairDisplay, lora } from "./fonts";
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
    <html
      lang="en"
      className={`${playfairDisplay.variable} ${lora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=localStorage.getItem('weekender-dark-mode');if(d==='true'){document.documentElement.setAttribute('data-theme','dark')}}catch(e){}})();`,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `html[data-theme="dark"] body{background:#1A1A2E;color:#EAEAEA}html[data-theme="dark"]:not([data-hydrated]) body>*{visibility:hidden}`,
          }}
        />
      </head>
      <body>
        <StyledComponentsRegistry>
          <ThemeClient>{children}</ThemeClient>
        </StyledComponentsRegistry>
      </body>
    </html>
  );
}
