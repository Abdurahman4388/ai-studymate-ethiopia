import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LanguageProvider } from "../context/LanguageContext";
import { AuthProvider } from "../context/AuthContext";
import { AuthModal } from "../components/AuthModal";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "AI StudyMate Ethiopia | Multilingual AI Learning Assistant",
  description:
    "AI-powered learning platform for Ethiopian university students. Study lecture notes, generate flashcards, practice quizzes, and learn with an AI tutor in English, Amharic, and Afaan Oromo.",
  keywords: [
    "AI StudyMate",
    "Ethiopia",
    "University",
    "Amharic AI",
    "Afaan Oromo AI",
    "Flashcards",
    "Exam Preparation",
  ],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 antialiased selection:bg-primary-500 selection:text-white">
        <LanguageProvider>
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <AuthModal />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
