import type { ReactNode } from "react";
import type { Viewport } from "next";
import { Noto_Sans_JP, Noto_Serif_JP } from "next/font/google";

const serifJp = Noto_Serif_JP({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-serif-jp",
  display: "swap",
});

const sansJp = Noto_Sans_JP({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-sans-jp",
  display: "swap",
});

export const metadata = {
  title: "Admin — En Chakai",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f4efe5",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${serifJp.variable} ${sansJp.variable} min-h-screen bg-washi text-sumi antialiased`}
      style={{ fontFamily: "var(--font-sans-jp), 'Noto Sans JP', sans-serif" }}
    >
      {children}
    </div>
  );
}
