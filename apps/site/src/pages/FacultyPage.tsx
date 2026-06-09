import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useFacultyContent } from "@/hooks/useSupabaseData";
import { useLanguage } from "@/i18n/LanguageContext";
import { FACULTY_DEFAULT_DEPARTMENTS } from "@/config/facultyDefaults";

const fallbackData: Record<string, any> = {
  polytechnique: {
    name: "Polytechnique",
    full_name: "Faculté de Polytechnique",
    description: "Ingénierie civile, électricité, et technologies de pointe pour reconstruire la nation.",
    long_description: "La Faculté de Polytechnique forme des ingénieurs de haut niveau capables de concevoir, développer et gérer des infrastructures et des systèmes technologiques complexes. Nos programmes combinent une formation théorique rigoureuse avec une expérience pratique en laboratoire et sur le terrain, préparant nos diplômés à relever les défis technologiques du 21ème siècle en République Démocratique du Congo et au-delà.",
    departments: FACULTY_DEFAULT_DEPARTMENTS.polytechnique,
    objectives: ["Former des ingénieurs compétents et innovants", "Contribuer au développement technologique du pays", "Promouvoir la recherche appliquée"],
  },
  "sciences-economiques": {
    name: "Sciences Économiques",
    full_name: "Faculté de Sciences Économiques",
    description: "Analyse des marchés et gestion des ressources dans un contexte globalisé.",
    long_description: "La Faculté de Sciences Économiques prépare les étudiants à comprendre et analyser les dynamiques économiques nationales et internationales. Elle offre une formation approfondie en théorie économique, en méthodes quantitatives et en politique économique, permettant aux diplômés de contribuer efficacement au développement économique de la région.",
    departments: FACULTY_DEFAULT_DEPARTMENTS["sciences-economiques"],
    objectives: ["Maîtriser l'analyse économique", "Comprendre les politiques de développement", "Développer l'expertise en gestion des ressources"],
  },
  "sante-publique": {
    name: "Santé Publique",
    full_name: "École de Santé Publique",
    description: "Gestion de la santé communautaire et expertise en épidémiologie.",
    long_description: "L'École de Santé Publique forme des professionnels de la santé spécialisés dans la gestion des institutions de santé, les sciences infirmières, la nutrition et la pédiatrie. Notre approche pédagogique associe cours théoriques, stages cliniques et recherche communautaire pour former des acteurs de santé publique compétents et engagés.",
    departments: FACULTY_DEFAULT_DEPARTMENTS["sante-publique"],
    objectives: ["Former des cadres de santé publique", "Améliorer les soins communautaires", "Promouvoir la recherche en santé"],
  },
  management: {
    name: "Management",
    full_name: "Faculté de Management",
    description: "Leadership entrepreneurial et gestion organisationnelle moderne.",
    long_description: "La Faculté de Management développe les compétences en leadership, gestion des organisations et ressources humaines. Nos programmes préparent des managers capables de piloter des organisations dans un environnement complexe et en constante évolution, avec un accent sur l'entrepreneuriat et l'innovation sociale.",
    departments: FACULTY_DEFAULT_DEPARTMENTS.management,
    objectives: ["Développer le leadership entrepreneurial", "Former des gestionnaires polyvalents", "Encourager l'innovation organisationnelle"],
  },
  "sciences-developpement": {
    name: "Sciences de Développement",
    full_name: "Faculté de Sciences de Développement",
    description: "Planification stratégique pour le progrès social et durable.",
    long_description: "La Faculté de Sciences de Développement prépare les étudiants à concevoir et mettre en œuvre des stratégies de développement durable. Cette formation unique combine théorie du développement, action humanitaire et gestion de projets pour former des professionnels capables d'impulser un changement social positif.",
    departments: FACULTY_DEFAULT_DEPARTMENTS["sciences-developpement"],
    objectives: ["Concevoir des stratégies de développement", "Former des acteurs humanitaires", "Promouvoir le développement durable"],
  },
  "sciences-agronomiques": {
    name: "Sciences Agronomiques & Environnement",
    full_name: "Faculté de Sciences Agronomiques & Environnement",
    description: "Expertise en agriculture moderne et gestion environnementale.",
    long_description: "La Faculté de Sciences Agronomiques & Environnement forme des experts en agriculture durable et gestion de l'environnement. Nos programmes intègrent les techniques agricoles modernes, la préservation des écosystèmes et le développement rural pour répondre aux enjeux alimentaires et environnementaux de la région.",
    departments: FACULTY_DEFAULT_DEPARTMENTS["sciences-agronomiques"],
    objectives: ["Moderniser l'agriculture régionale", "Protéger l'environnement", "Assurer la sécurité alimentaire"],
  },
};

const FacultyPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: dbFaculty } = useFacultyContent(slug);
  const { t } = useLanguage();

  const faculty = dbFaculty || (slug ? fallbackData[slug] : null);

  if (!faculty) {
    return (
      <Layout>
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Faculté introuvable</h1>
            <Link to="/"><Button variant="outline">{t("admission.back")}</Button></Link>
          </div>
        </section>
      </Layout>
    );
  }

  const departments = faculty.departments || [];
  const objectives = faculty.objectives || ["Former des professionnels qualifiés", "Contribuer au développement local", "Promouvoir la recherche"];

  return (
    <Layout>
      {/* Breadcrumb bar */}
      <div className="bg-primary">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-primary-foreground/60 text-sm">
            <Link to="/" className="hover:text-primary-foreground transition-colors">Accueil</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/#facultes" className="hover:text-primary-foreground transition-colors">{t("nav.faculties")}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-primary-foreground">{faculty.name}</span>
          </div>
        </div>
      </div>

      {/* Main: Description + Image side by side */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
              {/* Text left */}
              <div>
                <h1 className="text-3xl sm:text-4xl font-black text-primary leading-tight mb-6">
                  {faculty.full_name}
                </h1>
                <div className="space-y-4 text-muted-foreground leading-relaxed text-[15px] text-justify">
                  {(faculty.long_description || faculty.description || "").split("\n").map((p: string, i: number) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </div>

              {/* Image droite : ratio naturel, pas de cadre fixe (évite bandes vides) */}
              <div className="w-full lg:max-w-none flex justify-center lg:justify-end lg:sticky lg:top-24 self-start">
                {faculty.image_url ? (
                  <div className="w-full max-w-xl overflow-hidden border border-border/60 bg-muted/30 shadow-lg">
                    <img
                      src={faculty.image_url}
                      alt={faculty.full_name}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-auto block align-middle"
                    />
                  </div>
                ) : (
                  <div className="w-full max-w-md min-h-[220px] bg-secondary border border-border/50" />
                )}
              </div>
            </div>
          </AnimatedSection>

          {/* Separator */}
          <Separator className="my-14" />

          {/* Sections below */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Left: 2/3 */}
            <div className="lg:col-span-2 space-y-12">
              {/* Objectifs */}
              <AnimatedSection delay={0.1}>
                <h2 className="text-2xl font-bold text-primary mb-6">
                  Objectifs de la formation
                </h2>
                <ul className="space-y-2 list-disc list-inside">
                  {objectives.map((obj: string, i: number) => (
                    <li key={i} className="text-muted-foreground text-sm pl-1">{obj}</li>
                  ))}
                </ul>
              </AnimatedSection>

              {/* Départements */}
              <AnimatedSection delay={0.2}>
                <h2 className="text-2xl font-bold text-primary mb-6">
                  {t("fac.departments")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {departments.map((dept: string) => (
                    <div key={dept} className="bg-card border border-border rounded-xl p-5 border-l-[3px] border-l-primary hover:shadow-md transition-all">
                      <h3 className="font-semibold text-foreground text-sm">{dept}</h3>
                      <p className="text-muted-foreground text-xs mt-1">Licence · Master · Doctorat</p>
                    </div>
                  ))}
                </div>
              </AnimatedSection>
            </div>

            {/* Sidebar right: 1/3 */}
            <div className="space-y-5">
              <AnimatedSection delay={0.15}>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold text-foreground mb-5">Points forts</h3>
                  <ul className="space-y-0">
                    {["Système LMD international", "Stages en entreprise", "WiFi gratuit sur le campus", "Bibliothèque numérique", "Encadrement personnalisé"].map((item, i, arr) => (
                      <li key={item}>
                        <div className="py-3 text-sm text-muted-foreground list-disc list-inside pl-1">
                          {item}
                        </div>
                        {i < arr.length - 1 && <Separator />}
                      </li>
                    ))}
                  </ul>
                </div>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <div className="rounded-xl p-6 text-center bg-primary text-primary-foreground">
                  <h3 className="font-bold text-lg mb-2">Intéressé par cette faculté ?</h3>
                  <p className="text-primary-foreground/80 text-sm mb-4">Rejoignez l'Université Polytechnique de Goma</p>
                  <div className="space-y-2">
                    <Link to="/admission" className="block">
                      <Button className="bg-upg-orange hover:bg-upg-orange/90 text-white w-full font-semibold">
                        {t("hero.cta1")}
                      </Button>
                    </Link>
                    <Link to="/frais" className="block">
                      <Button variant="outline" className="border-[hsl(var(--upg-orange))] text-[hsl(var(--upg-orange))] hover:bg-[hsl(var(--upg-orange))]/10 w-full font-semibold">
                        {t("topbar.fees")}
                      </Button>
                    </Link>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default FacultyPage;
