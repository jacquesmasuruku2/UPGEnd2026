import heroBg from "@/assets/hero-bg.jpg";
import formationImg from "@/assets/formation.jpg";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState, useEffect } from "react";

const heroImages = [heroBg, formationImg];

const HeroSection = () => {
  const { t } = useLanguage();
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-[80vh] flex items-center justify-center overflow-hidden"
    >
      {/* Crossfade : pas de popLayout (WebKit mobile peut laisser le fond sans hauteur). */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImages[currentImage]})` }}
        />
      </AnimatePresence>

      <div className="absolute inset-0 bg-foreground/70" />

      {/* Indicators */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {heroImages.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentImage(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
              i === currentImage ? "bg-white scale-125" : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Image ${i + 1}`}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-20 text-center">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-primary-foreground/80 text-xs sm:text-sm font-medium mb-6 tracking-wide uppercase"
        >
          {t("hero.badge")}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-primary-foreground mb-4 leading-tight"
        >
          {t("hero.title")}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl md:text-2xl italic text-primary-foreground/90 mb-4"
        >
          {t("hero.subtitle")}
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="max-w-2xl mx-auto text-primary-foreground/80 text-sm sm:text-base mb-8"
        >
          {t("hero.desc")}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold px-8"
            onClick={() => document.getElementById("admission")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("hero.cta1")}
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="border-primary-foreground text-primary-foreground bg-transparent hover:bg-primary-foreground/10 font-semibold px-8"
            onClick={() => document.getElementById("actualites")?.scrollIntoView({ behavior: "smooth" })}
          >
            {t("hero.cta2")}
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
