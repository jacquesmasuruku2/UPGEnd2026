import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { supabase } from "@/integrations/supabase/client";
import { WrenchScrewdriverIcon } from "@heroicons/react/24/outline";

const ServicesPage = () => {
  const [services, setServices] = useState<any[]>([]);

  useEffect(() => {
    supabase
      .from("services")
      .select("*")
      .eq("published", true)
      .order("display_order")
      .then(({ data }) => setServices(data || []));
  }, []);

  return (
    <Layout>
      <div className="relative text-white py-20" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary)/0.8))" }}>
        <div className="absolute inset-0 bg-black/40" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Nos Services</h1>
          <p className="text-white/80 max-w-2xl mx-auto">Découvrez les services offerts par l'Université Polytechnique de Goma</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s) => (
            <Link               key={s.id}
              to={`/service/${s.slug}`}
              className="group border border-border overflow-hidden bg-card hover:shadow-lg transition-shadow"
            >
              {s.image_url && (
                <img src={s.image_url} alt={s.name} className="w-full h-48 object-contain bg-muted" />
              )}
              <div className="p-5">
                <h2 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  <WrenchScrewdriverIcon className="w-4 h-4 text-primary" />
                  {s.name}
                </h2>
                {s.description && (
                  <p className="text-muted-foreground text-sm mt-2 line-clamp-3">{s.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
        {services.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Aucun service disponible pour le moment.</p>
        )}
      </div>
    </Layout>
  );
};

export default ServicesPage;
