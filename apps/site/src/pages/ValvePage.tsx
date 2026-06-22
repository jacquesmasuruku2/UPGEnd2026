import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import AnimatedSection from "@/components/AnimatedSection";
import { BanknotesIcon, DocumentCheckIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

const tools = [
  {
    icon: BanknotesIcon,
    title: "Frais académiques",
    description: "Consultez les barèmes des frais de scolarité par faculté et par cycle.",
    href: "/frais",
  },
  {
    icon: DocumentCheckIcon,
    title: "Grille de délibération",
    description: "Accédez à la grille de délibération via votre compte étudiant.",
    href: "/grille-deliberation",
  },
];

const ValvePage = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative text-white py-16 overflow-hidden">
          <div className="absolute inset-0 bg-[hsl(210,70%,20%)]" />
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Valve</h1>
            <p className="text-base text-white/80 max-w-2xl mx-auto">
              Espace étudiant — accès aux outils académiques
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="container mx-auto px-4 py-12">
          <AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {tools.map((tool) => (
                <Link                   key={tool.href}
                  to={tool.href}
                  className="group border border-border p-8 flex flex-col justify-between hover:border-primary/50 transition-colors"
                >
                  <div>
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                      <tool.icon className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {tool.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {tool.description}
                    </p>
                  </div>
                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary group-hover:text-primary/80 transition-colors">
                    Accéder
                    <ArrowRightIcon className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </div>
                </Link>
              ))}
            </div>
          </AnimatedSection>
        </div>
      </div>
    </Layout>
  );
};

export default ValvePage;
