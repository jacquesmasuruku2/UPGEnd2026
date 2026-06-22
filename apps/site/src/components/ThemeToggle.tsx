import { useState, useEffect } from "react"; // Force Vercel deploy for theme fix - 2026-05-04

import { MoonIcon, SunIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

const ThemeToggle = () => {
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));

  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      try {
        localStorage.setItem("theme", "dark");
      } catch {
        /* stockage bloqué */
      }
    } else {
      document.documentElement.classList.remove("dark");
      try {
        localStorage.setItem("theme", "light");
      } catch {
        /* stockage bloqué */
      }
    }
  }, [dark]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") setDark(true);
      else setDark(false);
    } catch {
      /* garder l’état initial dérivé du DOM */
    }
  }, []);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDark(!dark)}
      className="text-foreground hover:bg-secondary"
    >
      {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
    </Button>
  );
};

export default ThemeToggle;
