import type { Metadata } from "next";
import { Michroma, Lexend, Space_Mono } from "next/font/google";
import { AuthProvider } from "@/context/AuthContext";
import { ToastProvider } from "@/context/ToastContext";
import "./globals.css";

const michroma = Michroma({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const lexend = Lexend({
  weight: ["300", "400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-body",
});

const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Welkinrim Admin",
  description: "Admin portal for Welkinrim Technologies product management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${michroma.variable} ${lexend.variable} ${spaceMono.variable}`}>
      <body className="min-h-screen antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
