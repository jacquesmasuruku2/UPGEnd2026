import Layout from "@/components/Layout";
import { GraduationCap, Users, Lightbulb, Globe } from "lucide-react";
import formationImg from "@/assets/formation.jpg";
import AnimatedSection from "@/components/AnimatedSection";

const values = [
  { icon: GraduationCap, label: "Excellence académique", desc: "Un enseignement rigoureux aligné sur les standards internationaux." },
  { icon: Lightbulb, label: "Innovation", desc: "La technologie et la créativité au cœur de chaque programme." },
  { icon: Users, label: "Inclusivité", desc: "Un accès facilité à l'éducation de qualité pour tous." },
  { icon: Globe, label: "Impact local", desc: "Former des leaders qui transforment leur communauté." },
];

const AboutPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-gradient-to-r from-primary to-[hsl(210,70%,25%)] py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[hsl(var(--upg-orange))] rounded-full blur-[120px]" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <AnimatedSection>
            <div className="max-w-3xl">
              <span className="inline-block text-[hsl(var(--upg-orange))] text-sm font-semibold tracking-wider uppercase mb-3">
                À propos
              </span>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Une Histoire d'Excellence et de Vision Technologique
              </h1>
              <p className="text-white/70 text-base sm:text-lg max-w-2xl">
                L'Université Polytechnique de Goma façonne les bâtisseurs de demain en RD Congo.
              </p>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Presentation */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-10 items-start">
            {/* Text */}
            <div className="max-w-3xl space-y-5">
              <AnimatedSection>
                <p className="text-foreground leading-[1.8] text-justify">
                  Située à Goma, dans la province du Nord‑Kivu en République démocratique du Congo,
                  l'Université Polytechnique de Goma (UPG) est une institution d'enseignement supérieur
                  tournée vers l'excellence technique, scientifique et sociale. Née d'une vision ambitieuse
                  de formation des futurs bâtisseurs de la RD Congo, l'UPG allie rigueur académique,
                  innovation pratique et impact sur le développement local.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.1}>
                <p className="text-foreground leading-[1.8] text-justify">
                  L'UPG se distingue par une pédagogie dynamique : elle met l'accent sur des compétences
                  pratiques, l'innovation technologique et la capacité à apporter des solutions concrètes
                  aux défis socio‑économiques de la région. L'université forme des professionnels compétents
                  dans les domaines des sciences appliquées, de l'ingénierie, des technologies de
                  l'information et de la gestion des infrastructures.
                </p>
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <p className="text-foreground leading-[1.8] text-justify">
                  Forte d'un environnement d'apprentissage innovant et inclusif, l'UPG encourage les
                  étudiants à se réinventer, à penser de manière critique et à exploiter pleinement
                  les nouvelles technologies pour relever les défis actuels et futurs.
                </p>
              </AnimatedSection>
            </div>

            {/* Image */}
            <AnimatedSection delay={0.3}>
              <div className="overflow-hidden shadow-md">
                <img
                  src={formationImg}
                  alt="Équipe UPG - Université Polytechnique de Goma"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="text-center mb-10">
              <h2 className="text-2xl sm:text-3xl font-bold text-primary mb-2">Nos Valeurs</h2>
              <div className="w-16 h-1 bg-[hsl(var(--upg-orange))] mx-auto rounded-full" />
            </div>
          </AnimatedSection>
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v, i) => (
              <AnimatedSection key={v.label} delay={i * 0.1}>
                <div className="bg-card border border-border rounded-xl p-6 text-center hover:shadow-md hover:border-primary/20 transition-all duration-300">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <v.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-2">{v.label}</h3>
                  <p className="text-muted-foreground text-xs leading-relaxed">{v.desc}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

    </Layout>
  );
};

export default AboutPage;
