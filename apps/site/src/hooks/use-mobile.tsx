import * as React from "react";

const MOBILE_BREAKPOINT = 768;
/** Aligné sur la breakpoint Tailwind `lg` (1024px) — menu desktop / libellé navbar */
const LG_BREAKPOINT = 1024;

export function useIsLgUp() {
  const [lg, setLg] = React.useState(() =>
    typeof window !== "undefined" ? window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`).matches : false
  );

  React.useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LG_BREAKPOINT}px)`);
    const onChange = () => setLg(mql.matches);
    mql.addEventListener("change", onChange);
    setLg(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return lg;
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    mql.addEventListener("change", onChange);
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!isMobile;
}
