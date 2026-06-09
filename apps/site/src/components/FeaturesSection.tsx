import AnimatedSection from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";

const FeaturesSection = () => {
  const { t } = useLanguage();

  const features = [
    { title: t("feat.teaching.title"), text: t("feat.teaching.text") },
    { title: t("feat.scholarship.title"), text: t("feat.scholarship.text") },
    { title: t("feat.internet.title"), text: t("feat.internet.text") },
    { title: t("feat.fees.title"), text: t("feat.fees.text") },
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <AnimatedSection key={i} delay={i * 0.15}>
              <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/30 transition-all duration-300 group">
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.text}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
