import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Layout from "@/components/Layout";
import RichContent from "@/components/RichContent";
import { ChevronRightIcon, EnvelopeIcon, DocumentIcon, ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

const useServices = () =>
  useQuery({
    queryKey: ["services-public"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services" as any)
        .select("*")
        .eq("published", true)
        .order("display_order");
      if (error) throw error;
      return data as any[];
    },
  });

const openingHours = [
  { day: "Lundi", hours: "08H00 - 16H00" },
  { day: "Mardi", hours: "08H00 - 16H00" },
  { day: "Mercredi", hours: "08H00 - 16H00" },
  { day: "Jeudi", hours: "08H00 - 16H00" },
  { day: "Vendredi", hours: "08H00 - 16H00" },
  { day: "Samedi", hours: "08H00 - 12H00" },
];

const ServicePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<"presentation" | "opportunities">("presentation");

  const { data: service, isLoading } = useQuery({
    queryKey: ["service", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services" as any)
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();
      if (error) throw error;
      return data as any;
    },
    enabled: !!slug,
  });

  const { data: allServices } = useServices();

  return (
    <Layout>
      <div className="min-h-screen bg-background">
        {/* Hero */}
        <div className="relative text-white py-16 overflow-hidden">
          {service?.image_url ? (
            <div className="absolute inset-0 bg-muted">
              <img src={service.image_url} alt="" className="w-full h-full object-cover opacity-40" />
            </div>
          ) : (
            <div className="absolute inset-0 bg-[hsl(210,70%,20%)]" />
          )}
          <div className="absolute inset-0 bg-black/50" />
          <div className="container mx-auto px-4 relative z-10 text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {isLoading ? "Chargement..." : service?.name || "Service introuvable"}
            </h1>
            {service?.description && (
              <p className="text-base text-white/80 max-w-2xl mx-auto">{service.description}</p>
            )}
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="container mx-auto px-4 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Main content */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="text-center text-muted-foreground py-12">Chargement...</div>
              ) : service ? (
                <div>
                  {/* Tabs */}
                  <div className="flex border-b border-gray-300 mb-6">
                    <button
                      onClick={() => setActiveTab("presentation")}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "presentation"
                          ? "text-gray-800 border-b-2 border-[#1a5276] -mb-[2px] font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <DocumentIcon className="w-3.5 h-3.5" />
                      Présentation service
                    </button>
                    <button
                      onClick={() => setActiveTab("opportunities")}
                      className={`flex items-center gap-1.5 px-4 py-2.5 text-sm transition-colors ${
                        activeTab === "opportunities"
                          ? "text-gray-800 border-b-2 border-[#1a5276] -mb-[2px] font-medium"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <ArrowTopRightOnSquareIcon className="w-3.5 h-3.5" />
                      Répertoires des opportunités
                    </button>
                  </div>

                  {activeTab === "presentation" ? (
                    <div>
                      {/* Image full width */}
                      {service.image_url && (
                        <div className="mb-6 border border-gray-300">
                          <img
                            src={service.image_url}
                            alt={service.name}
                            className="w-full h-auto max-h-[450px] object-cover"
                          />
                        </div>
                      )}

                      {/* Text below image */}
                      {service.long_description ? (
                        <RichContent content={service.long_description} defaultJustify={false} />
                      ) : (
                        <p className="text-muted-foreground">
                          Aucun détail disponible pour ce service.
                        </p>
                      )}

                      {/* Contact email */}
                      {service.contact_email && (
                        <div className="mt-8 p-4 bg-muted/50 border border-border rounded-lg flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <EnvelopeIcon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Contact</p>
                            <a href={`mailto:${service.contact_email}`} className="text-sm text-primary font-semibold hover:underline">
                              {service.contact_email}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p>Répertoires des opportunités à venir.</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-12">Service introuvable.</p>
              )}
            </div>

            {/* Sidebar */}
            <aside className="lg:w-[280px] shrink-0">
              <div className="sticky top-24 space-y-8">
                {/* Services list */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a5276] mb-2">
                    SERVICES
                  </h3>
                  <div className="w-full h-[1px] bg-[#1a5276] mb-3" />
                  <nav className="space-y-0">
                    {(allServices || []).map((s: any) => {
                      const isActive = s.slug === slug;
                      return (
                        <Link                           key={s.id}
                          to={`/service/${s.slug}`}
                          className={`flex items-center gap-1.5 py-2 text-xs border-b border-dashed border-gray-300 transition-colors ${
                            isActive
                              ? "text-red-600 font-medium"
                              : "text-gray-700 hover:text-[#1a5276]"
                          }`}
                        >
                          <span className="text-gray-400 text-[10px]">&gt;</span>
                          <span className="uppercase tracking-wide">{s.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>

                {/* Opening Hours */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#1a5276] mb-2">
                    HEURES D'OUVERTURE
                  </h3>
                  <div className="w-full h-[1px] bg-[#1a5276] mb-3" />
                  <div className="border border-gray-300">
                    {openingHours.map((row, i) => (
                      <div
                        key={row.day}
                        className={`flex justify-between items-center px-2 py-1.5 text-xs ${
                          i !== openingHours.length - 1 ? "border-b border-gray-300" : ""
                        }`}
                      >
                        <span className="text-gray-700">{row.day}</span>
                        <span className="text-gray-500">{row.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ServicePage;
