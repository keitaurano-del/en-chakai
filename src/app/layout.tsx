import type { ReactNode } from "react";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e1e1a",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
