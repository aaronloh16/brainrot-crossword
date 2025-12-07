import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RizzWord - AI Model Eval Game",
  description: "Which AI has the most rizz? Watch GPT-4o, Claude, Gemini, and Grok race to solve a Gen Z slang crossword!",
  openGraph: {
    title: "RizzWord - AI Model Eval Game",
    description: "Which AI has the most rizz? Watch AI models race to solve Gen Z slang!",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "RizzWord - AI Model Eval Game",
    description: "Which AI has the most rizz? Watch AI models race to solve Gen Z slang!",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
