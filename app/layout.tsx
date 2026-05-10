import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Juices 4 Life - Task Management",
  description: "Modern task management for your team",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-background text-foreground min-h-screen">
        {children}
      </body>
    </html>
  );
}
