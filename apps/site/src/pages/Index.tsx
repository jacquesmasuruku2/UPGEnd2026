import Layout from "@/components/Layout";
import HeroCarousel from "@/components/HeroCarousel";
import FeaturesSection from "@/components/FeaturesSection";
import AboutSection from "@/components/AboutSection";
import StatsSection from "@/components/StatsSection";
import FacultiesSection from "@/components/FacultiesSection";
import PersonnelSection from "@/components/PersonnelSection";
import NewsSection from "@/components/NewsSection";
import RecentVideosSection from "@/components/RecentVideosSection";
import AdmissionSection from "@/components/AdmissionSection";
import CalendarSection from "@/components/CalendarSection";
import { usePartners } from "@/hooks/useSupabaseData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const PartnersHomeSection = () => {
  const { data: partners } = usePartners();

  if (!partners || partners.filter(p => p.is_active !== false).length === 0) return null;

  const activePartners = partners.filter(p => p.is_active !== false);

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Nos Partenaires</h2>
          <p className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto">
            Des collaborations stratégiques pour l'excellence académique
          </p>
        </div>

        {/* Mobile: marquee single row */}
        <div className="md:hidden overflow-hidden">
          <style>{`
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
          `}</style>
          <div
            className="flex items-center gap-8"
            style={{
              animation: "marquee 25s linear infinite",
              width: "max-content",
            }}
          >
            {[...activePartners, ...activePartners].map((partner, i) => (
              <a
                key={`${partner.id}-${i}`}
                href={partner.website_url || '#'}
                target={partner.website_url ? "_blank" : undefined}
                rel={partner.website_url ? "noopener noreferrer" : undefined}
                className="flex-shrink-0 flex flex-col items-center justify-center text-center hover:opacity-80 transition-opacity"
                style={{ width: "140px" }}
              >
                {partner.logo_url ? (
                  <img
                    src={partner.logo_url}
                    alt={partner.name}
                    className="max-h-16 max-w-full object-contain mb-2"
                  />
                ) : (
                  <span className="text-foreground font-medium text-sm text-center mb-2">{partner.name}</span>
                )}
                {partner.description && (
                  <p className="text-xs text-muted-foreground line-clamp-1">{partner.description}</p>
                )}
              </a>
            ))}
          </div>
        </div>

        {/* Desktop: grid */}
        <div className="hidden md:grid md:grid-cols-4 lg:grid-cols-6 gap-8 items-start">
          {activePartners.map((partner) => (
            <a
              key={partner.id}
              href={partner.website_url || '#'}
              target={partner.website_url ? "_blank" : undefined}
              rel={partner.website_url ? "noopener noreferrer" : undefined}
              className="flex flex-col items-center justify-center p-4 hover:opacity-80 transition-opacity text-center"
            >
              {partner.logo_url ? (
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="max-h-20 max-w-full object-contain mb-2"
                />
              ) : (
                <span className="text-foreground font-medium text-sm text-center mb-2">{partner.name}</span>
              )}
              {partner.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">{partner.description}</p>
              )}
            </a>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/partenaires">
            <Button variant="outline" className="px-6">
              Devenir partenaire
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

const Index = () => {
  return (
    <Layout>
      <HeroCarousel />
      <FeaturesSection />
      <StatsSection />
      <AboutSection />
      
      {/* Content Grid: News and Courses */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <FacultiesSection />
            </div>
            <div>
              <NewsSection />
            </div>
          </div>
        </div>
      </section>

      <CalendarSection />
      <PersonnelSection />
      <RecentVideosSection />
      <AdmissionSection />
      <PartnersHomeSection />
    </Layout>
  );
};

export default Index;
