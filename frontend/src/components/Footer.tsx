"use client";

import React from "react";
import { useTranslation } from "../context/LanguageContext";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-8 text-center text-xs text-gray-500 dark:text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>{t("footer.copyright")}</div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-primary-600 transition-colors">
            {t("footer.privacy")}
          </a>
          <a href="#" className="hover:text-primary-600 transition-colors">
            {t("footer.terms")}
          </a>
          <a href="#" className="hover:text-primary-600 transition-colors">
            {t("footer.contact")}
          </a>
        </div>
      </div>
    </footer>
  );
}
