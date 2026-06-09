import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import AnimatedSection from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";
import { useState } from "react";
import { useAllFacultyContent } from "@/hooks/useSupabaseData";

const FacultiesSection = () => {
  const { t } = useLanguage();
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const { data: dbFaculties } = useAllFacultyContent();

  const faculties = (dbFaculties || []).map((f) => ({
    name: f.name,
    slug: f.slug,
    desc: f.description || "",
    departments: f.departments || [],
    image_url: f.image_url || null,
  }));

  if (faculties.length === 0) return null;

  const first = faculties[0];

  return (
    <section id="facultes" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-14">
            <span className="inline-block text-muted-foreground text-sm font-semibold tracking-wider uppercase mb-2">
              Nos Domaines de Formation
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">
              {t("fac.title")}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto text-sm">
              {t("fac.subtitle")}
            </p>
          </div>
        </AnimatedSection>

        {/* Featured first faculty */}
        <AnimatedSection>
          <Link
            to={`/faculte/${first.slug}`}
            className="block max-w-6xl mx-auto mb-8 group"
            onMouseEnter={() => setHoveredIdx(0)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            <div className="bg-card border border-border overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 grid grid-cols-1 lg:grid-cols-2">
              <div className="p-8 lg:p-10 flex flex-col justify-center order-2 lg:order-1">
                <h3 className="text-xl lg:text-2xl font-bold text-foreground mb-3 group-hover:text-primary transition-colors">
                  {first.name}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {first.desc}
                </p>
                <div className="flex items-center gap-1.5 text-sm text-primary font-semibold group-hover:gap-3 transition-all">
                  Explorer la faculté <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              <div className="order-1 lg:order-2 flex flex-col min-h-0 bg-secondary/40 border-b border-border lg:border-b-0 lg:border-l border-border/60">
                {first.image_url ? (
                  <div className="overflow-hidden bg-muted/20">
                    <img
                      src={first.image_url}
                      alt={first.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block align-middle"
                    />
                  </div>
                ) : null}
                <div className="p-8 lg:p-10 flex flex-col justify-center flex-1">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                    Départements
                  </p>
                  <div className="space-y-2.5">
                    {first.departments.map((d) => (
                      <div key={d} className="flex items-center gap-3">
                        <span className="text-foreground text-sm">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </AnimatedSection>

        {/* Remaining faculties grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {faculties.slice(1).map((f, i) => (
            <AnimatedSection key={f.name} delay={i * 0.08}>
              <Link
                to={`/faculte/${f.slug}`}
                className="block bg-card border border-border overflow-hidden hover:shadow-lg hover:border-primary/20 transition-all duration-300 group h-full"
                onMouseEnter={() => setHoveredIdx(i + 1)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {f.image_url ? (
                  <div className="overflow-hidden bg-muted/30 border-b border-border/80">
                    <img
                      src={f.image_url}
                      alt={f.name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block align-middle transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                  </div>
                ) : null}

                <div className="p-6">
                  <h3 className="font-bold text-foreground text-base mb-2 group-hover:text-primary transition-colors">
                    {f.name}
                  </h3>
                  <p className="text-muted-foreground text-xs leading-relaxed mb-4">{f.desc}</p>

                  {/* Departments */}
                  <div className="space-y-1.5 mb-4">
                    {f.departments.slice(0, 3).map((d) => (
                      <div key={d} className="flex items-center gap-2">
                        <span className="text-muted-foreground text-xs">{d}</span>
                      </div>
                    ))}
                    {f.departments.length > 3 && (
                      <span className="text-xs text-muted-foreground/60">
                        +{f.departments.length - 3} autres
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-primary font-semibold group-hover:gap-2 transition-all">
                    Découvrir <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FacultiesSection;
