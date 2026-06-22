import { useState } from "react";
import { CheckIcon, XMarkIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import Layout from "@/components/Layout";
import { usePartners, useUpsertPartnershipRequest, uploadPdf, uploadImage } from "@/hooks/useSupabaseData";

const PartnersPage = () => {
  const { data: partners } = usePartners();
  const upsertRequest = useUpsertPartnershipRequest();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [formData, setFormData] = useState({
    // Section 1
    organizationName: "",
    organizationType: "",
    organizationTypeOther: "",
    headquarters: "",
    website: "",
    sector: "",
    logo: null as File | null,
    // Section 2
    contactName: "",
    position: "",
    email: "",
    phone: "",
    // Section 3
    interests: [] as string[],
    interestsOther: "",
    // Section 4
    objectives: "",
    duration: "",
    file: null as File | null,
  });
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const interestOptions = [
    "Recherche et Innovation",
    "Stages et Insertion professionnelle",
    "Échanges académiques",
    "Développement d'infrastructures",
    "Formation continue",
    "Projets de développement communautaire",
    "Autre",
  ];

  const objectives = [
    "Recherche académique",
    "Projets de développement communautaire",
    "Bourses pour les étudiants",
    "Programmes d'échanges",
    "Développement de l'infrastructure",
    "Innovation technologique",
    "Programmes de formation continue",
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
    // Reset organizationTypeOther when switching away from "Autre"
    if (field === "organizationType" && value !== "Autre") {
      setFormData((prev) => ({ ...prev, organizationTypeOther: "" }));
    }
  };

  const handleCheckboxChange = (field: "interests", value: string) => {
    const currentValues = formData[field];
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value];
    setFormData({ ...formData, [field]: newValues, ...(value === "Autre" && !newValues.includes("Autre") ? { interestsOther: "" } : {}) });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setFormData({ ...formData, file });
      if (errors.file) {
        setErrors({ ...errors, file: "" });
      }
    } else if (file) {
      setErrors({ ...errors, file: "Veuillez télécharger un fichier PDF uniquement" });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Ce champ est requis";
    }
    if (!formData.organizationType) {
      newErrors.organizationType = "Ce champ est requis";
    }
    if (formData.organizationType === "Autre" && !formData.organizationTypeOther.trim()) {
      newErrors.organizationTypeOther = "Ce champ est requis";
    }
    if (!formData.headquarters.trim()) {
      newErrors.headquarters = "Ce champ est requis";
    }
    if (formData.website.trim()) {
      const simpleUrlRegex = /^(https?:\/\/)?(www\.)?[a-zA-Z0-9][-a-zA-Z0-9]*(\.[a-zA-Z0-9][-a-zA-Z0-9]*)+.*$/;
      if (!simpleUrlRegex.test(formData.website.trim())) {
        newErrors.website = "Veuillez entrer une URL valide (ex: upgoma.org, www.upgoma.org, https://upgoma.org)";
      }
    }
    if (!formData.sector.trim()) {
      newErrors.sector = "Ce champ est requis";
    }
    if (!formData.logo) {
      newErrors.logo = "Ce champ est requis";
    }

    if (!formData.contactName.trim()) {
      newErrors.contactName = "Ce champ est requis";
    }
    if (!formData.position.trim()) {
      newErrors.position = "Ce champ est requis";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Ce champ est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Veuillez entrer une adresse email valide";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Ce champ est requis";
    }

    if (formData.interests.length === 0) {
      newErrors.interests = "Veuillez sélectionner au moins un domaine d'intérêt";
    }
    if (formData.interests.includes("Autre") && !formData.interestsOther.trim()) {
      newErrors.interestsOther = "Ce champ est requis";
    }

    if (!formData.objectives.trim()) {
      newErrors.objectives = "Ce champ est requis";
    } else if (formData.objectives.length < 100) {
      newErrors.objectives = "Minimum 100 caractères requis";
    }
    if (!formData.duration) {
      newErrors.duration = "Ce champ est requis";
    }
    if (!acceptTerms) {
      newErrors.acceptTerms = "Vous devez accepter que les informations renseignées sont valides";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizeUrl = (url: string): string => {
    if (!url) return "";
    const trimmed = url.trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        let letterUrl: string | undefined;
        let logoUrl: string | undefined;

        // Upload PDF file if provided
        if (formData.file) {
          try {
            letterUrl = await uploadPdf(formData.file, "letters");
          } catch (error) {
            console.error("File upload error:", error);
            setToast({ type: "error", message: "Erreur lors de l'upload du fichier PDF" });
            return;
          }
        }

        // Upload logo if provided
        if (formData.logo) {
          try {
            logoUrl = await uploadImage(formData.logo, "partnership-logos");
          } catch (error) {
            console.error("Logo upload error:", error);
            setToast({ type: "error", message: "Erreur lors de l'upload du logo" });
            return;
          }
        }

        // Submit partnership request to Supabase
        upsertRequest.mutate(
          {
            organization_name: formData.organizationName,
            organization_type: formData.organizationType,
            organization_type_other: formData.organizationTypeOther || undefined,
            headquarters: formData.headquarters || undefined,
            website_url: formData.website ? normalizeUrl(formData.website) : undefined,
            sector: formData.sector || undefined,
            contact_name: formData.contactName,
            contact_position: formData.position || undefined,
            contact_email: formData.email,
            contact_phone: formData.phone || undefined,
            interests: formData.interests.map(i => i === "Autre" && formData.interestsOther ? `Autre: ${formData.interestsOther}` : i),
            objectives: formData.objectives.trim() || undefined,
            resources: formData.resources.trim() || undefined,
            duration: formData.duration || undefined,
            letter_of_intent_url: letterUrl,
          },
          {
            onSuccess: () => {
              setToast({ type: "success", message: "Votre demande de partenariat a été envoyée avec succès ! Merci pour votre intérêt." });
              setFormData({
                organizationName: "",
                organizationType: "",
                organizationTypeOther: "",
                headquarters: "",
                website: "",
                sector: "",
                logo: null,
                contactName: "",
                position: "",
                email: "",
                phone: "",
                interests: [],
                interestsOther: "",
                objectives: "",
                duration: "",
                file: null,
              });
              setAcceptTerms(false);
              setIsModalOpen(false);
              setTimeout(() => setToast(null), 5000);
            },
          }
        );
      } catch (error) {
        console.error("Submission error:", error);
        setToast({ type: "error", message: "Erreur lors de l'envoi de la demande" });
        setTimeout(() => setToast(null), 5000);
      }
    } else {
      setToast({ type: "error", message: "Veuillez remplir les champs obligatoires" });
      setTimeout(() => setToast(null), 5000);
    }
  };

  return (
    <Layout>
      {/* Toast Notification */}
      {toast && (
        <div
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] p-4 rounded-lg shadow-lg flex items-center gap-3 animate-in slide-in-from-top ${
            toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
          }`}
        >
          {toast.type === "success" ? <CheckIcon className="w-5 h-5" /> : <XMarkIcon className="w-5 h-5" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Hero Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Nos Partenaires
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto">
            Des collaborations stratégiques pour l'excellence académique
          </p>
        </div>
      </section>

      <div className="border-b border-border mx-auto max-w-4xl" />

      {/* Partners Grid */}
      {partners && partners.filter(p => p.is_active !== false).length > 0 && (
        <section className="py-16 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-4">
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
                {[...partners, ...partners].map((partner, i) => (
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
              {partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.website_url || '#'}
                  target={partner.website_url ? "_blank" : undefined}
                  rel={partner.website_url ? "noopener noreferrer" : undefined}
                  className="flex flex-col items-center justify-center p-4 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors text-center"
                >
                  {partner.logo_url ? (
                    <img
                      src={partner.logo_url}
                      alt={partner.name}
                      className="max-h-24 max-w-full object-contain mb-2"
                    />
                  ) : (
                    <span className="text-primary font-medium text-sm text-center mb-2">{partner.name}</span>
                  )}
                  {partner.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{partner.description}</p>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}

      <div className="border-b border-border mx-auto max-w-4xl" />

      {/* CTA Button */}
      <section className="py-16 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4 text-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary/90 text-white px-8 py-6 text-lg"
          >
            Devenir Partenaire
          </Button>
        </div>
      </section>

      {/* Modal Form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-slate-900 rounded-lg max-w-full md:max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-slate-900 border-b border-border px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-semibold text-foreground">Demande de Partenariat</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsModalOpen(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-4 md:p-6 space-y-6">
              {/* Section 1: Organisation */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground">
                  Informations sur l'Organisation
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <TagIcon htmlFor="organizationName" className="text-sm">
                      Nom de l'organisation <span className="text-red-500">*</span>
                    </TagIcon>
                    <Input
                      id="organizationName"
                      value={formData.organizationName}
                      onChange={(e) => handleInputChange("organizationName", e.target.value)}
                      className={errors.organizationName ? "border-red-500" : ""}
                    />
                    {errors.organizationName && (
                      <p className="text-red-500 text-xs mt-1">{errors.organizationName}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon className="text-sm">
                      Type d'organisation <span className="text-red-500">*</span>
                    </TagIcon>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {["Entreprise", "Université", "ONG", "Institution Publique", "Autre"].map((type) => (
                        <label key={type} className="flex items-center gap-2 px-2 py-1.5 border border-border rounded text-xs cursor-pointer hover:bg-accent">
                          <input
                            type="radio"
                            name="organizationType"
                            value={type}
                            checked={formData.organizationType === type}
                            onChange={(e) => handleInputChange("organizationType", e.target.value)}
                            className="accent-blue-600"
                          />
                          <span>{type}</span>
                        </label>
                      ))}
                    </div>
                    {errors.organizationType && (
                      <p className="text-red-500 text-xs mt-1">{errors.organizationType}</p>
                    )}
                    {formData.organizationType === "Autre" && (
                      <div className="mt-2">
                        <TagIcon htmlFor="organizationTypeOther" className="text-xs">Précisez le type <span className="text-red-500">*</span></TagIcon>
                        <Input
                          id="organizationTypeOther"
                          value={formData.organizationTypeOther}
                          onChange={(e) => handleInputChange("organizationTypeOther", e.target.value)}
                          placeholder="Ex: Association"
                          className={`mt-1 ${errors.organizationTypeOther ? "border-red-500" : ""}`}
                        />
                        {errors.organizationTypeOther && (
                          <p className="text-red-500 text-xs mt-1">{errors.organizationTypeOther}</p>
                        )}
                      </div>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="headquarters" className="text-sm">Siège social / Pays-Ville <span className="text-red-500">*</span></TagIcon>
                    <Input
                      id="headquarters"
                      value={formData.headquarters}
                      onChange={(e) => handleInputChange("headquarters", e.target.value)}
                      className={errors.headquarters ? "border-red-500" : ""}
                    />
                    {errors.headquarters && (
                      <p className="text-red-500 text-xs mt-1">{errors.headquarters}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="website" className="text-sm">Site web</TagIcon>
                    <Input
                      id="website"
                      type="text"
                      value={formData.website}
                      onChange={(e) => handleInputChange("website", e.target.value)}
                      placeholder="ex: upgoma.org ou https://upgoma.org"
                      className={errors.website ? "border-red-500" : ""}
                    />
                    {errors.website && (
                      <p className="text-red-500 text-xs mt-1">{errors.website}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="sector" className="text-sm">Secteur d'activité <span className="text-red-500">*</span></TagIcon>
                    <Input
                      id="sector"
                      value={formData.sector}
                      onChange={(e) => handleInputChange("sector", e.target.value)}
                      className={errors.sector ? "border-red-500" : ""}
                    />
                    {errors.sector && (
                      <p className="text-red-500 text-xs mt-1">{errors.sector}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="logo" className="text-sm">Logo de l'organisation <span className="text-red-500">*</span></TagIcon>
                    <Input
                      id="logo"
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setFormData({ ...formData, logo: file });
                          if (errors.logo) {
                            setErrors({ ...errors, logo: "" });
                          }
                        }
                      }}
                      className={errors.logo ? "border-red-500 cursor-pointer" : "cursor-pointer"}
                    />
                    <p className="text-xs text-muted-foreground mt-1">Formats acceptés: PNG, JPEG, WebP, SVG</p>
                    {errors.logo && (
                      <p className="text-red-500 text-xs mt-1">{errors.logo}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Contact */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground">
                  Personne de Contact
                </h3>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <TagIcon htmlFor="contactName" className="text-sm">
                      Nom complet <span className="text-red-500">*</span>
                    </TagIcon>
                    <Input
                      id="contactName"
                      value={formData.contactName}
                      onChange={(e) => handleInputChange("contactName", e.target.value)}
                      className={errors.contactName ? "border-red-500" : ""}
                    />
                    {errors.contactName && (
                      <p className="text-red-500 text-xs mt-1">{errors.contactName}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="position" className="text-sm">Fonction <span className="text-red-500">*</span></TagIcon>
                    <Input
                      id="position"
                      value={formData.position}
                      onChange={(e) => handleInputChange("position", e.target.value)}
                      className={errors.position ? "border-red-500" : ""}
                    />
                    {errors.position && (
                      <p className="text-red-500 text-xs mt-1">{errors.position}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="email" className="text-sm">
                      E-mail professionnel <span className="text-red-500">*</span>
                    </TagIcon>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className={errors.email ? "border-red-500" : ""}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="phone" className="text-sm">Téléphone <span className="text-red-500">*</span></TagIcon>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className={errors.phone ? "border-red-500" : ""}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 3: Partnership Nature */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground">
                  Nature du Partenariat
                </h3>
                <div>
                  <TagIcon className="text-sm">
                    Domaine(s) d'intérêt <span className="text-red-500">*</span>
                  </TagIcon>
                  <div className="grid md:grid-cols-2 gap-1 mt-1">
                    {interestOptions.map((interest) => (
                      <label key={interest} className="flex items-center gap-2 px-2 py-1.5 border border-border rounded text-xs cursor-pointer hover:bg-accent">
                        <input
                          type="checkbox"
                          checked={formData.interests.includes(interest)}
                          onChange={() => handleCheckboxChange("interests", interest)}
                          className="accent-blue-600"
                        />
                        <span>{interest}</span>
                      </label>
                    ))}
                  </div>
                  {errors.interests && (
                    <p className="text-red-500 text-xs mt-1">{errors.interests}</p>
                  )}
                  {formData.interests.includes("Autre") && (
                    <div className="mt-2">
                      <TagIcon htmlFor="interestsOther" className="text-xs">Précisez le domaine d'intérêt <span className="text-red-500">*</span></TagIcon>
                      <Input
                        id="interestsOther"
                        value={formData.interestsOther}
                        onChange={(e) => handleInputChange("interestsOther", e.target.value)}
                        placeholder="Ex: Marketing digital"
                        className={`mt-1 ${errors.interestsOther ? "border-red-500" : ""}`}
                      />
                      {errors.interestsOther && (
                        <p className="text-red-500 text-xs mt-1">{errors.interestsOther}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Section 4: Proposal Details */}
              <div className="space-y-3">
                <h3 className="text-base font-medium text-foreground">
                  Détails de la Proposition
                </h3>
                <div>
                  <TagIcon htmlFor="objectives" className="text-sm">
                    Objectifs principaux <span className="text-red-500">*</span>
                  </TagIcon>
                  <Textarea
                    id="objectives"
                    value={formData.objectives}
                    onChange={(e) => handleInputChange("objectives", e.target.value)}
                    rows={3}
                    className={errors.objectives ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formData.objectives.length === 0 ? "Min. 100 caractères requis" : `${formData.objectives.length} caractères sur 100`}
                  </p>
                  {errors.objectives && (
                    <p className="text-red-500 text-xs mt-1">{errors.objectives}</p>
                  )}
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <TagIcon htmlFor="duration" className="text-sm">Durée envisagée <span className="text-red-500">*</span></TagIcon>
                    <select
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => handleInputChange("duration", e.target.value)}
                      className={errors.duration ? "border-red-500 w-full p-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm" : "w-full p-2 border border-border rounded bg-background focus:outline-none focus:ring-1 focus:ring-blue-600 text-sm"}
                    >
                      <option value="">Sélectionnez</option>
                      <option value="Ponctuelle">Ponctuelle</option>
                      <option value="1 an">1 an</option>
                      <option value="3-5 ans">3-5 ans</option>
                      <option value="Indéterminée">Indéterminée</option>
                    </select>
                    {errors.duration && (
                      <p className="text-red-500 text-xs mt-1">{errors.duration}</p>
                    )}
                  </div>
                  <div>
                    <TagIcon htmlFor="file" className="text-sm">
                      Lettre d'intention (PDF)
                    </TagIcon>
                    <Input
                      id="file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className={errors.file ? "border-red-500" : ""}
                    />
                    {formData.file && (
                      <p className="text-xs text-green-600 mt-1">
                        ✓ {formData.file.name}
                      </p>
                    )}
                    {errors.file && (
                      <p className="text-red-500 text-xs mt-1">{errors.file}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Terms Acceptance */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="acceptTerms"
                  checked={acceptTerms}
                  onChange={(e) => {
                    setAcceptTerms(e.target.checked);
                    if (errors.acceptTerms) {
                      setErrors({ ...errors, acceptTerms: "" });
                    }
                  }}
                  className="mt-1 accent-blue-600"
                />
                <label htmlFor="acceptTerms" className="text-sm text-foreground">
                  Je certifie que les informations renseignées ci-dessus sont exactes et valides
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-red-500 text-xs">{errors.acceptTerms}</p>
              )}

              {/* Submit Button */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={upsertRequest.isPending}
                >
                  {upsertRequest.isPending ? (
                    <>
                      <ArrowPathIcon className="w-4 h-4 mr-2 animate-spin" />
                      Veuillez patienter…
                    </>
                  ) : (
                    "Envoyer"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PartnersPage;
