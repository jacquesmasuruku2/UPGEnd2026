import { GraduationCap, BookOpen, FlaskConical } from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const levels = [
  {
    icon: GraduationCap,
    title: "Licence",
    duration: "3 Ans (Bac +3)",
    desc: "Acquisition des fondamentaux et spécialisation initiale.",
  },
  {
    icon: BookOpen,
    title: "Master",
    duration: "2 Ans (Bac +5)",
    desc: "Expertise approfondie et initiation à la recherche.",
  },
  {
    icon: FlaskConical,
    title: "Doctorat",
    duration: "3 Ans (Bac +8)",
    desc: "Recherche originale et contribution scientifique majeure.",
  },
];

const LMDSection = () => {
  return (
    <section id="lmd" className="py-16 bg-background">
      <div className="container mx-auto px-4 text-center">
        <AnimatedSection>
          <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-3">Système LMD</h2>
          <p className="text-muted-foreground mb-10 max-w-2xl mx-auto">
            Aligné sur les standards internationaux pour une mobilité et une reconnaissance mondiale
            de nos diplômes.
          </p>
        </AnimatedSection>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((l, i) => (
            <AnimatedSection key={l.title} delay={i * 0.15}>
              <div className="bg-card border border-border rounded-lg p-8 hover:shadow-lg hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-upg-sky-light flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                  <l.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-bold text-foreground text-xl mb-1">{l.title}</h3>
                <p className="text-upg-orange font-semibold text-sm mb-3">{l.duration}</p>
                <p className="text-muted-foreground text-sm">{l.desc}</p>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LMDSection;
