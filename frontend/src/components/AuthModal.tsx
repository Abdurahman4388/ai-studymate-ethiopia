"use client";

import React, { useState } from "react";
import { X, Lock, Mail, User as UserIcon, School, Sparkles, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTranslation, SUPPORTED_LANGUAGES, Locale } from "../context/LanguageContext";

const ETHIOPIAN_UNIVERSITIES = [
  "Addis Ababa University",
  "Jimma University",
  "Hawassa University",
  "Bahir Dar University",
  "Haramaya University",
  "Arba Minch University",
  "Adama Science and Technology University (ASTU)",
  "Addis Ababa Science and Technology University (AASTU)",
  "Mekelle University",
  "Gondar University",
  "Wollo University",
  "Dilla University",
  "Other / Private College",
];

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, openAuthModal, login, register } = useAuth();
  const { t, locale, setLocale } = useTranslation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [university, setUniversity] = useState(ETHIOPIAN_UNIVERSITIES[0]);
  const [department, setDepartment] = useState("");
  const [aiResponseLang, setAiResponseLang] = useState<string>(locale);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    if (authModalMode === "login") {
      const res = await login(email, password);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to sign in. Please verify your credentials.");
      }
    } else {
      if (!fullName.trim()) {
        setErrorMsg("Please enter your full name.");
        setIsSubmitting(false);
        return;
      }
      const res = await register({
        email,
        password,
        full_name: fullName,
        interface_language: locale,
        ai_response_language: aiResponseLang,
        university,
        department,
      });
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || "Failed to create account. Please check the information provided.");
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-2xl p-6 sm:p-8 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="space-y-1 text-center pb-5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 mb-2 shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            {authModalMode === "login" ? t("auth.signInTitle") : t("auth.registerTitle")}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {authModalMode === "login" ? t("auth.signInSubtitle") : t("auth.registerSubtitle")}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1 mb-6 text-sm font-medium">
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              openAuthModal("login");
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              authModalMode === "login"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-semibold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            {t("auth.tabSignIn")}
          </button>
          <button
            type="button"
            onClick={() => {
              setErrorMsg(null);
              openAuthModal("register");
            }}
            className={`flex-1 py-2 text-center rounded-lg transition-all ${
              authModalMode === "register"
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm font-semibold"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-900"
            }`}
          >
            {t("auth.tabRegister")}
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name (Registration only) */}
          {authModalMode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                {t("auth.fullName")}
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t("auth.fullNamePlaceholder")}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.email")}
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("auth.emailPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              {t("auth.password")}
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("auth.passwordPlaceholder")}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* University & Department (Registration only) */}
          {authModalMode === "register" && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t("auth.university")}
                </label>
                <div className="relative">
                  <School className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <select
                    value={university}
                    onChange={(e) => setUniversity(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {ETHIOPIAN_UNIVERSITIES.map((uni) => (
                      <option key={uni} value={uni}>
                        {uni}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AI Response Language */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  {t("auth.aiResponseLang")}
                </label>
                <select
                  value={aiResponseLang}
                  onChange={(e) => setAiResponseLang(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="en">English (Academic terms)</option>
                  <option value="am">አማርኛ (Amharic explanations)</option>
                  <option value="om">Afaan Oromoo (Qubee)</option>
                </select>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-semibold text-sm shadow-md shadow-primary-500/20 hover:shadow-lg transition-all disabled:opacity-60 mt-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>{t("auth.loading")}</span>
              </>
            ) : (
              <span>{authModalMode === "login" ? t("auth.btnSignIn") : t("auth.btnRegister")}</span>
            )}
          </button>
        </form>

        {/* Footer switch prompt */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          {authModalMode === "login" ? (
            <p>
              {t("auth.noAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  openAuthModal("register");
                }}
                className="font-semibold text-primary-600 hover:underline"
              >
                {t("auth.signUpLink")}
              </button>
            </p>
          ) : (
            <p>
              {t("auth.alreadyHaveAccount")}{" "}
              <button
                type="button"
                onClick={() => {
                  setErrorMsg(null);
                  openAuthModal("login");
                }}
                className="font-semibold text-primary-600 hover:underline"
              >
                {t("auth.signInLink")}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
