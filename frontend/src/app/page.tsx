"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Brain,
  FileCheck2,
  Sparkles,
  BookOpenCheck,
  CheckCircle,
  Layers,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { HealthStatusCard } from "../components/HealthStatusCard";

export default function HomePage() {
  const { t } = useTranslation();
  const { isAuthenticated, openAuthModal } = useAuth();
  const router = useRouter();

  const handleAction = (mode: "login" | "register" = "register") => {
    if (isAuthenticated) {
      router.push("/dashboard");
    } else {
      openAuthModal(mode);
    }
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24 border-b border-gray-100 dark:border-gray-800/80">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent dark:from-blue-950/20" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary-50 dark:bg-primary-950/60 border border-primary-200 dark:border-primary-800/60 text-xs font-semibold text-primary-700 dark:text-primary-300 shadow-sm animate-fade-in">
            <Sparkles className="h-3.5 w-3.5 text-primary-600" />
            <span>{t("hero.tagline")}</span>
          </div>

          {/* Headline */}
          <h1 className="max-w-4xl mx-auto text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.2]">
            {t("hero.title")}
          </h1>

          {/* Subtitle */}
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          {/* Call to Actions (Fully Wired Interactive Buttons) */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleAction("register")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-3.5 shadow-md shadow-primary-500/20 hover:shadow-lg transition-all hover:scale-[1.02] cursor-pointer"
            >
              <UploadCloud className="h-5 w-5" />
              <span>{t("hero.ctaUpload")}</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction("login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-100 font-semibold px-6 py-3.5 shadow-sm transition-all cursor-pointer"
            >
              <Brain className="h-5 w-5 text-primary-600" />
              <span>{t("hero.ctaExplore")}</span>
              <ArrowRight className="h-4 w-4 ml-1" />
            </button>
          </div>

          {/* Highlights */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Supported: PDF, DOCX, PPTX
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              English, አማርኛ, Afaan Oromoo
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              Exact Page Citations
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Real-time System Connectivity Monitor */}
        <section>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              <span>Live System Health & Architecture</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Interactive diagnostics connecting the Next.js frontend with the FastAPI backend.
            </p>
          </div>
          <HealthStatusCard />
        </section>

        {/* Core Features Grid (Interactive cards that trigger workspace) */}
        <section id="features" className="space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
              {t("features.title")}
            </h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {t("features.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div
              onClick={() => handleAction("register")}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-3 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <FileCheck2 className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {t("features.ragTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("features.ragDesc")}
              </p>
            </div>

            {/* Feature 2 */}
            <div
              onClick={() => handleAction("login")}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-3 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Brain className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {t("features.multilingualTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("features.multilingualDesc")}
              </p>
            </div>

            {/* Feature 3 */}
            <div
              onClick={() => handleAction("register")}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-3 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpenCheck className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {t("features.quizzesTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("features.quizzesDesc")}
              </p>
            </div>

            {/* Feature 4 */}
            <div
              onClick={() => handleAction("register")}
              className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40 p-6 space-y-3 hover:border-primary-400 hover:shadow-md transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                {t("features.flashcardsTitle")}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                {t("features.flashcardsDesc")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
