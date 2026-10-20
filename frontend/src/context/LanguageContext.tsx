"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import en from "../locales/en.json";
import am from "../locales/am.json";
import om from "../locales/om.json";

export type Locale = "en" | "am" | "om";

export interface LanguageOption {
  code: Locale;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "am", name: "Amharic", nativeName: "አማርኛ" },
  { code: "om", name: "Afaan Oromo", nativeName: "Afaan Oromoo" },
];

const dictionaries: Record<Locale, any> = {
  en,
  am,
  om,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (loc: Locale) => void;
  t: (keyPath: string) => string;
  isAmharic: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = localStorage.getItem("studymate_locale") as Locale;
    if (saved && (saved === "en" || saved === "am" || saved === "om")) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("studymate_locale", newLocale);
    document.documentElement.lang = newLocale;
  };

  const t = (keyPath: string): string => {
    const dict = dictionaries[locale] || dictionaries.en;
    const parts = keyPath.split(".");
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === "object" && part in current) {
        current = current[part];
      } else {
        // Fallback to English dictionary
        let fallback: any = dictionaries.en;
        for (const fbPart of parts) {
          if (fallback && typeof fallback === "object" && fbPart in fallback) {
            fallback = fallback[fbPart];
          } else {
            return keyPath;
          }
        }
        return typeof fallback === "string" ? fallback : keyPath;
      }
    }

    return typeof current === "string" ? current : keyPath;
  };

  return (
    <LanguageContext.Provider
      value={{
        locale,
        setLocale,
        t,
        isAmharic: locale === "am",
      }}
    >
      <div className={locale === "am" ? "font-amharic" : "font-sans"}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useTranslation must be used within a LanguageProvider");
  }
  return context;
}
