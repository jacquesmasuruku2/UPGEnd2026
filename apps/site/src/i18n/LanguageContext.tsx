import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import translations, { Lang, langLabels } from "./translations";

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: "fr",
  setLang: () => {},
  t: (key) => key,
});

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<Lang>(() => {
    try {
      const saved = localStorage.getItem("upg-lang");
      return (saved as Lang) || "fr";
    } catch {
      return "fr";
    }
  });

  const changeLang = useCallback((newLang: Lang) => {
    setLang(newLang);
    try {
      localStorage.setItem("upg-lang", newLang);
    } catch {
      /* navigation privée / stockage bloqué */
    }
  }, []);

  const t = useCallback(
    (key: string) => translations[lang]?.[key] || translations.fr[key] || key,
    [lang]
  );

  return (
    <LanguageContext.Provider value={{ lang, setLang: changeLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
export { langLabels };
export type { Lang };
