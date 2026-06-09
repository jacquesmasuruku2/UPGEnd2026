import { useState } from "react";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, Mail, Navigation } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/i18n/LanguageContext";

const Contact = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    toast.success("Votre message a été envoyé avec succès !");
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  /** Fiche Google Maps officielle UPG (itinéraire) */
  const mapsUrl =
    "https://www.google.com/maps/place/Université+Polytechnique+de+Goma+(UPG)/data=!4m2!3m1!1s0x0:0xed58d682e7a592a3";
  /** Carte embarquée : même lieu (CID) */
  const mapsEmbedUrl =
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3987.5!2d29.2167!3d-1.6833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0xed58d682e7a592a3!2sUniversit%C3%A9%20Polytechnique%20de%20Goma%20%28UPG%29!5e0!3m2!1sfr!2scd!4v1730000000000!5m2!1sfr!2scd";

  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-primary mb-10 text-center">{t("contact.title")}</h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl mx-auto">
            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Votre nom *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                type="email"
                placeholder="Votre email *"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <Input
                placeholder="Sujet"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              />
              <Textarea
                placeholder="Votre message *"
                rows={6}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
              />
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full">
                {t("contact.send")}
              </Button>
            </form>

            {/* Info + Map */}
            <div className="space-y-6">
              <div className="bg-card border border-border p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Adresse</h4>
                    <p className="text-muted-foreground text-sm">
                      Goma, Quartier Lac Vert, Avenue Nyarutsiru, Avant entrée Buhimba
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Téléphone</h4>
                    <p className="text-muted-foreground text-sm">+243 977 831 973</p>
                    <p className="text-muted-foreground text-sm">+1 613-261-2229</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-foreground">Email</h4>
                    <p className="text-muted-foreground text-sm">info@upgoma.org</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <p className="text-sm font-semibold text-foreground mb-3">Nous suivre</p>
                  <div className="flex items-center gap-3">
                    <a href="https://www.facebook.com/upgoma" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#1877F2] hover:opacity-90 transition-opacity">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                    <a href="https://www.linkedin.com/company/universite-polytechnique-de-goma" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#0A66C2] hover:opacity-90 transition-opacity">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                      </svg>
                    </a>
                    <a href="https://x.com/UP_Goma" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-black hover:opacity-90 transition-opacity">
                      <svg viewBox="0 0 1200 1227" className="w-4 h-4" fill="currentColor">
                        <path d="M714.163 519.284L1160.89 0H1055.03L667.137 450.887L357.328 0H0L468.492 681.821L0 1226.37H105.866L515.491 750.218L842.672 1226.37H1200L714.137 519.284H714.163ZM569.165 687.828L521.697 619.934L144.011 79.6944H306.615L611.412 515.685L658.88 583.579L1055.08 1150.3H892.476L569.165 687.854V687.828Z"/>
                      </svg>
                    </a>
                    <a href="https://www.youtube.com/@Universit%C3%A9PolytechniquedeGoma" target="_blank" rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white bg-[#FF0000] hover:opacity-90 transition-opacity">
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
                        <path d="M23.5 6.2a3.03 3.03 0 0 0-2.13-2.14C19.48 3.5 12 3.5 12 3.5s-7.48 0-9.37.56A3.03 3.03 0 0 0 .5 6.2 31.8 31.8 0 0 0 0 12a31.8 31.8 0 0 0 .5 5.8 3.03 3.03 0 0 0 2.13 2.14c1.89.56 9.37.56 9.37.56s7.48 0 9.37-.56a3.03 3.03 0 0 0 2.13-2.14A31.8 31.8 0 0 0 24 12a31.8 31.8 0 0 0-.5-5.8ZM9.6 15.58V8.42L15.84 12 9.6 15.58Z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>

              {/* Google Maps - Real UPG location */}
              <div className="overflow-hidden border border-border">
                <iframe
                  src={mapsEmbedUrl}
                  width="100%"
                  height="250"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="UPG Goma - Google Maps"
                />
              </div>
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 w-full"
              >
                <Button variant="outline" className="w-full gap-2 border-primary text-primary hover:bg-primary/5">
                  <Navigation className="w-4 h-4" />
                  Suivre l'itinéraire sur Google Maps
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
