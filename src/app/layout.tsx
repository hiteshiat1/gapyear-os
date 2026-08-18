import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALevels.io",
  description:
    "A private A-Level planning, assessment, evidence, and progress platform for Year 12, Year 13, and resit students.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
