import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "@/config/seo";

interface SiteNavigationElement {
  "@type": string;
  name: string;
  url: string;
}

interface ListItem {
  "@type": string;
  position?: number;
  name: string;
  url?: string;
  acceptedAnswer?: {
    "@type": string;
    text: string;
  };
}

interface WebSiteStructuredData {
  "@context": string;
  "@type": string;
  "@id": string;
  url: string;
  name: string;
  description: string;
  inLanguage: string;
  publisher: {
    "@type": string;
    "@id": string;
    name: string;
    logo: {
      "@type": string;
      url: string;
    };
  };
  potentialAction: {
    "@type": string;
    target: string;
    "query-input": string;
  };
  mainEntity?: any;
}

const StructuredData = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // Nettoyer les scripts précédents
    const existingScripts = document.querySelectorAll('script[type="application/ld+json"]');
    existingScripts.forEach(script => script.remove());

    // Navigation principale pour les Sitelinks
    const navigationElements: SiteNavigationElement[] = [
      {
        "@type": "SiteNavigationElement",
        name: "Présentation",
        url: `${SITE_URL}/about`
      },
      {
        "@type": "SiteNavigationElement", 
        name: "Admissions",
        url: `${SITE_URL}/admission`
      },
      {
        "@type": "SiteNavigationElement",
        name: "Facultés",
        url: `${SITE_URL}/faculte/polytechnique`
      },
      {
        "@type": "SiteNavigationElement",
        name: "Contact",
        url: `${SITE_URL}/contact`
      },
      {
        "@type": "SiteNavigationElement",
        name: "Blog",
        url: `${SITE_URL}/blog`
      },
      {
        "@type": "SiteNavigationElement",
        name: "FAQ",
        url: `${SITE_URL}/faq`
      }
    ];

    // Données structurées de base WebSite
    const webSiteData: WebSiteStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}#website`,
      url: SITE_URL,
      name: "Université Polytechnique de Goma",
      description: "L'Université Polytechnique de Goma (UPG) - Institution d'élite dédiée à l'innovation technologique et au développement durable de la RD Congo.",
      inLanguage: "fr",
      publisher: {
        "@type": "Organization",
        "@id": `${SITE_URL}#organization`,
        name: "Université Polytechnique de Goma",
        logo: {
          "@type": "ImageObject",
          url: `${SITE_URL}/logo-upg.jpg?v=3`
        }
      },
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/blog?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    };

    // Ajouter les éléments de navigation pour les Sitelinks
    if (pathname === "/") {
      webSiteData.mainEntity = navigationElements;
    }

    // Données structurées spécifiques selon la page
    let structuredData = webSiteData;

    if (pathname === "/about") {
      structuredData = {
        ...webSiteData,
        "@type": "AboutPage",
        name: "Présentation de l'Université Polytechnique de Goma",
        description: "Découvrez l'UPG : mission, vision, histoire et engagement pour l'excellence technique au service du développement de la RD Congo."
      };
    } else if (pathname === "/admission") {
      structuredData = {
        ...webSiteData,
        "@type": "WebPage",
        name: "Admissions et Inscriptions - UPG",
        description: "Completez votre admission à l'Université Polytechnique de Goma. Formations d'excellence en ingénierie et sciences appliquées.",
        mainEntity: {
          "@type": "EducationalOrganization",
          name: "Université Polytechnique de Goma",
          url: SITE_URL,
          hasOfferCatalog: {
            "@type": "OfferCatalog",
            name: "Programmes d'études",
            itemListElement: [
              {
                "@type": "Course",
                name: "Ingénierie Polytechnique",
                description: "Formation d'ingénieurs en diverses spécialités"
              },
              {
                "@type": "Course", 
                name: "Sciences Économiques",
                description: "Programmes en économie et gestion"
              },
              {
                "@type": "Course",
                name: "Santé Publique",
                description: "Formation en santé publique et médecine"
              }
            ]
          }
        }
      };
    } else if (pathname === "/contact") {
      structuredData = {
        ...webSiteData,
        "@type": "ContactPage",
        name: "Contact - Université Polytechnique de Goma",
        description: "Contactez l'UPG : adresse, téléphone, email et formulaire de contact.",
        mainEntity: {
          "@type": "Organization",
          name: "Université Polytechnique de Goma",
          url: SITE_URL,
          contactPoint: {
            "@type": "ContactPoint",
            telephone: "+243 99 999 999 99",
            contactType: "customer service",
            areaServed: "Goma, RD Congo",
            availableLanguage: ["French"]
          },
          address: {
            "@type": "PostalAddress",
            addressCountry: "CD",
            addressLocality: "Goma",
            addressRegion: "Nord Kivu"
          }
        }
      };
    } else if (pathname === "/blog") {
      structuredData = {
        ...webSiteData,
        "@type": "Blog",
        name: "Blog - Université Polytechnique de Goma",
        description: "Actualités, nouvelles et articles de l'Université Polytechnique de Goma.",
        mainEntity: {
          "@type": "ItemList",
          name: "Articles récents",
          itemListElement: navigationElements.map((item, index) => ({
            "@type": "Article",
            position: index + 1,
            name: item.name,
            url: item.url
          }))
        }
      };
    } else if (pathname === "/faq") {
      structuredData = {
        ...webSiteData,
        "@type": "FAQPage",
        name: "FAQ - Université Polytechnique de Goma",
        description: "Questions fréquentes sur les programmes, admissions et vie étudiante à l'UPG.",
        mainEntity: [
          {
            "@type": "Question",
            name: "Comment s'inscrire à l'UPG ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "Vous pouvez vous inscrire en ligne via notre formulaire d'admission ou contacter le bureau des admissions."
            }
          },
          {
            "@type": "Question", 
            name: "Quelles sont les facultés disponibles ?",
            acceptedAnswer: {
              "@type": "Answer",
              text: "L'UPG propose 6 facultés : Polytechnique, Sciences Économiques, Santé Publique, Management, Sciences de Développement et Sciences Agronomiques."
            }
          }
        ]
      };
    }

    // Créer et injecter le script JSON-LD
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData, null, 2);
    document.head.appendChild(script);

    return () => {
      // Nettoyer lors du démontage
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [pathname]);

  return null;
};

export default StructuredData;
