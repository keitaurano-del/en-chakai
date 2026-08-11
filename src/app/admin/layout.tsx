import type { ReactNode } from "react";
import "../globals.css";

export const metadata = {
  title: "Admin — En Chakai",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return children;
}
