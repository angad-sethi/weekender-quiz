import { Playfair_Display, Lora } from "next/font/google";

export const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-heading",
});

export const lora = Lora({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});
