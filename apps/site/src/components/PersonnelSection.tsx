import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { usePersonnel } from "@/hooks/useSupabaseData";
import AnimatedSection from "./AnimatedSection";
import { useLanguage } from "@/i18n/LanguageContext";

const staticPersonnel = [
  { name: "Jean de Dieu MUTABAZI MUNGUIKO", role: "Recteur", photo_url: null, email: null, linkedin_url: null },
  { name: "André MUSAVULI BALIKWISHA", role: "Secrétaire Général Académique", photo_url: null, email: null, linkedin_url: null },
  { name: "Claver NDABIJIMANA", role: "Secrétaire Administratif et Financier", photo_url: null, email: null, linkedin_url: null },
  { name: "Jacques Masuruku", role: "Informaticien", photo_url: null, email: null, linkedin_url: null },
  { name: "Joel SEBAGENI", role: "Appariteur", photo_url: null, email: null, linkedin_url: null },
];

const PersonnelSection = () => {
  const { data: dbPersonnel } = usePersonnel();
  const { t } = useLanguage();
  const personnel = dbPersonnel && dbPersonnel.length > 0
    ? dbPersonnel.map((p: any) => ({ name: p.name, role: p.role, photo_url: p.photo_url, email: p.email, linkedin_url: p.linkedin_url }))
    : staticPersonnel;

  return (
    <section id="rectorat" className="py-16 bg-secondary/30">
      <div className="container mx-auto px-4">
        <AnimatedSection>
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
              {t("personnel.title")}
            </h2>
            <div className="w-16 h-1 bg-[hsl(var(--upg-orange))] mx-auto rounded-full" />
          </div>
        </AnimatedSection>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
          {personnel.map((p: any, i: number) => (
            <AnimatedSection key={p.name} delay={i * 0.08}>
              <Link to="/personnel" className="block group text-center">
                <div className="mx-auto w-24 h-24 sm:w-28 sm:h-28 overflow-hidden border-3 border-border group-hover:border-primary transition-colors duration-300 mb-3 shadow-md">
                  {p.photo_url ? (
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-contain bg-muted" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/15 to-primary/5 flex items-center justify-center">
                      <UserIcon className="w-10 h-10 sm:w-12 sm:h-12 text-primary/60" />
                    </div>
                  )}
                </div>
                <h4 className="font-semibold text-foreground text-xs sm:text-sm leading-tight mb-1 group-hover:text-primary transition-colors">
                  {p.name}
                </h4>
                <p className="text-[hsl(var(--upg-orange))] text-[10px] sm:text-xs font-medium">
                  {p.role}
                </p>
                <div className="flex items-center justify-center gap-2 mt-1.5">
                  {p.email && <EnvelopeIcon className="w-3 h-3 text-muted-foreground" />}
                </div>
              </Link>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PersonnelSection;
