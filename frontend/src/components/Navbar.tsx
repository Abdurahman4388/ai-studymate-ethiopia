"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GraduationCap, Menu, X, LayoutDashboard, LogOut } from "lucide-react";
import { useTranslation } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { LanguageSelector } from "./LanguageSelector";

export function Navbar() {
  const { t } = useTranslation();
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary-600 via-primary-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight tracking-tight text-gray-900 dark:text-white">
                AI StudyMate
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-primary-600 dark:text-primary-400">
                Ethiopia 🇪🇹
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t("nav.home")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t("nav.tutor")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t("nav.materials")}
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              {t("nav.quizzes")}
            </Link>
          </nav>

          {/* Right Action Bar */}
          <div className="hidden md:flex items-center gap-3">
            <LanguageSelector />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300 text-xs font-semibold hover:bg-primary-100"
                >
                  <LayoutDashboard className="h-3.5 w-3.5" />
                  <span>{t("nav.dashboard")}</span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  className="text-xs font-medium text-gray-500 hover:text-rose-600 px-2 py-1 transition-colors"
                >
                  {t("nav.signOut")}
                </button>
              </div>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => openAuthModal("login")}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 px-3 py-1.5 transition-colors cursor-pointer"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  type="button"
                  onClick={() => openAuthModal("register")}
                  className="text-sm font-semibold rounded-lg bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 shadow-sm transition-all hover:shadow hover:scale-[1.02] cursor-pointer"
                >
                  {t("nav.getStarted")}
                </button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <LanguageSelector />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("nav.tutor")}
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            {t("nav.materials")}
          </Link>

          <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-sm"
                >
                  {t("nav.dashboard")}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-700"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("login");
                  }}
                  className="w-full text-center py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openAuthModal("register");
                  }}
                  className="w-full text-center py-2.5 rounded-lg bg-primary-600 text-sm font-semibold text-white shadow-sm"
                >
                  {t("nav.getStarted")}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
