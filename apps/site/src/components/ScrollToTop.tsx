import { useState, useEffect, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

const ScrollToTop = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtTop, setIsAtTop] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [autoHideVisible, setAutoHideVisible] = useState(true);

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY;
    setIsAtTop(scrollY < 100);
    setIsVisible(scrollY > 200 || (scrollY < 100 && lastScrollY > 200));
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const handleClick = () => {
    const scrollY = window.scrollY;
    if (scrollY < 100 && lastScrollY > 200) {
      // At top, go back to reading position
      window.scrollTo({ top: lastScrollY, behavior: "smooth" });
    } else {
      // Not at top, save position and go to top
      setLastScrollY(scrollY);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsAtTop(y < 100);
      if (y > 200) {
        setIsVisible(true);
      } else if (y < 100 && lastScrollY <= 200) {
        setIsVisible(false);
      } else if (y < 100 && lastScrollY > 200) {
        setIsVisible(true);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // Auto-hide on mobile after 5 seconds of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimer = () => {
      setAutoHideVisible(true);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setAutoHideVisible(false);
      }, 5000);
    };

    // Detect touch events on mobile
    const handleTouch = () => {
      resetTimer();
    };

    // Detect scroll events
    const handleScrollActivity = () => {
      resetTimer();
    };

    // Start timer on mount
    resetTimer();

    // Add event listeners
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });
    window.addEventListener("scroll", handleScrollActivity, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("scroll", handleScrollActivity);
    };
  }, []);

  if (!isVisible || !autoHideVisible) return null;

  const label = isAtTop ? "Reprendre la lecture" : "Monter au début";

  return (
    <div className="fixed bottom-6 right-0 z-50 flex flex-col items-center gap-2 group md:right-6">
      <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground text-background text-xs font-medium px-2.5 py-1 rounded-md shadow-sm whitespace-nowrap pointer-events-none">
        {label}
      </span>
      <button
        onClick={handleClick}
        className="w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90 transition-all duration-300 flex items-center justify-center"
        aria-label={label}
      >
        {isAtTop ? <ChevronDown className="w-6 h-6" /> : <ChevronUp className="w-6 h-6" />}
      </button>
    </div>
  );
};

export default ScrollToTop;
