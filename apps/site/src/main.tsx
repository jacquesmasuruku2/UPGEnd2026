import { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { LOGO_UPG_SRC } from "@/lib/brand";
import "./index.css";

// Thème par défaut : clair (localStorage peut lever en navigation privée → ne pas faire planter le chargement)
try {
  if (!localStorage.getItem("theme")) {
    localStorage.setItem("theme", "light");
  }
} catch {
  /* stockage bloqué */
}

const AppWithPreloader = () => {
  /** 1ère s: U · 2e s: +P · 3e s: +G · puis entrée site */
  const totalMs = 3000;
  const [visibleLetters, setVisibleLetters] = useState(1);
  const [showLoader, setShowLoader] = useState(true);

  useEffect(() => {
    const t2 = window.setTimeout(() => setVisibleLetters(2), 1000);
    const t3 = window.setTimeout(() => setVisibleLetters(3), 2000);
    const done = window.setTimeout(() => setShowLoader(false), totalMs);

    return () => {
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.clearTimeout(done);
    };
  }, []);

  if (showLoader) {
    return (
      <div className="upg-preloader min-h-screen bg-gradient-to-b from-[hsl(215,35%,12%)] via-[hsl(215,30%,10%)] to-[hsl(220,25%,8%)] flex items-center justify-center px-4 overflow-hidden">
        <div className="w-full max-w-2xl text-center">
          <div className="upg-preloader-logo mb-10 flex justify-center">
            <img
              src={LOGO_UPG_SRC}
              alt="Logo UPG — Université Polytechnique de Goma"
              className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover ring-2 ring-white/25 ring-offset-4 ring-offset-[hsl(215,30%,10%)] shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
              width={96}
              height={96}
            />
          </div>

          <div
            className="flex items-center justify-center gap-2 sm:gap-4 md:gap-6 mb-8 min-h-[5.5rem] sm:min-h-[7rem]"
            aria-hidden="true"
          >
            {visibleLetters >= 1 && (
              <span className="upg-preloader-letter text-[4.5rem] leading-none sm:text-[6rem] md:text-[7.5rem] font-black tracking-tight text-[hsl(200,85%,58%)] drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]">
                U
              </span>
            )}
            {visibleLetters >= 2 && (
              <span className="upg-preloader-letter text-[4.5rem] leading-none sm:text-[6rem] md:text-[7.5rem] font-black tracking-tight text-[hsl(200,85%,58%)] drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]">
                P
              </span>
            )}
            {visibleLetters >= 3 && (
              <span className="upg-preloader-letter text-[4.5rem] leading-none sm:text-[6rem] md:text-[7.5rem] font-black tracking-tight text-[hsl(200,85%,58%)] drop-shadow-[0_4px_24px_rgba(56,189,248,0.35)]">
                G
              </span>
            )}
          </div>

          <p className="upg-preloader-subtitle text-lg sm:text-xl md:text-2xl font-bold text-[hsl(0,72%,48%)] tracking-wide px-2 drop-shadow-sm">
            Université Polytechnique de Goma
          </p>

          <div className="mt-10 mx-auto max-w-xs h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="upg-preloader-bar h-full rounded-full bg-gradient-to-r from-sky-400/80 via-sky-300 to-sky-500/90"
              style={{
                width: `${(visibleLetters / 3) * 100}%`,
                transition: "width 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            />
          </div>

          <div className="mt-6 flex justify-center gap-1.5" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={`upg-preloader-dot h-2 w-2 rounded-full ${
                  visibleLetters > i ? "bg-sky-400 scale-110" : "bg-white/20"
                } transition-all duration-300`}
              />
            ))}
          </div>

          <p className="mt-8 text-white/45 text-xs font-medium tracking-widest uppercase">
            Chargement en cours
          </p>
        </div>
      </div>
    );
  }

  return <App />;
};

createRoot(document.getElementById("root")!).render(
  <AppErrorBoundary>
    <AppWithPreloader />
  </AppErrorBoundary>
);
