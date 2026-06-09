import Layout from "@/components/Layout";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { ReactNode } from "react";

const faqItems: { q: string; a: ReactNode }[] = [
  {
    q: "Comment s'inscrire à l'UPG ?",
    a: (
      <div className="space-y-3">
        <p>
          <span className="font-semibold text-foreground">Étape 1 — Formulaire en ligne</span>
          <br />
          Remplissez le formulaire sur la page{" "}
          <a
            href="https://www.upgoma.org/admission"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90 break-all sm:break-normal"
          >
            https://www.upgoma.org/admission
          </a>
          .
        </p>
        <p>
          <span className="font-semibold text-foreground">Étape 2 — Finalisation au bureau</span>
          <br />
          Après avoir complété et envoyé le formulaire en ligne, rendez-vous au{" "}
          <strong>bureau des inscriptions</strong> sur le campus pour <strong>confirmer votre inscription</strong>,{" "}
          recevoir votre <strong>numéro matricule</strong> et <strong>compléter la fiche d&apos;inscription</strong>{" "}
          officielle.
        </p>
        <p>
          <span className="font-semibold text-foreground">Alternative — Dossier sur place</span>
          <br />
          Vous pouvez aussi vous présenter directement au campus de Goma avec les pièces requises : diplôme
          d&apos;État, bulletins des 5<sup>e</sup> et 6<sup>e</sup> années, acte ou attestation de naissance, 4 photos
          passeport et certificat d&apos;aptitude physique.
        </p>
      </div>
    ),
  },
  {
    q: "Quels sont les frais académiques ?",
    a: (
      <div className="space-y-3">
        <p>
          À l&apos;UPG, les <strong>frais académiques sont abordables</strong> afin de rendre une formation
          de qualité accessible au plus grand nombre, sans compromis sur l&apos;exigence pédagogique.
        </p>
        <p>
          Les montants varient selon la <strong>faculté</strong> et le <strong>cycle</strong> (Licence, Master, etc.).
          Pour consulter les barèmes publiés, les précisions par programme et les documents utiles, ouvrez la page
          dédiée :
        </p>
        <p>
          <a
            href="https://www.upgoma.org/frais"
            className="font-medium text-primary underline underline-offset-2 hover:text-primary/90 break-all sm:break-normal"
          >
            https://www.upgoma.org/frais
          </a>
        </p>
        <p className="text-xs text-muted-foreground">
          Si aucun barème n&apos;est encore affiché en ligne, le service des finances finalise la publication : vous
          pouvez nous contacter pour toute question.
        </p>
      </div>
    ),
  },
  {
    q: "Qu'est-ce que le système LMD ?",
    a: "Le système LMD (Licence-Master-Doctorat) est un standard international qui structure les études en 3 niveaux : Licence (3 ans), Master (2 ans) et Doctorat (3 ans). Il facilite la mobilité étudiante et la reconnaissance des diplômes à l'international.",
  },
  {
    q: "Y a-t-il des bourses disponibles ?",
    a: "Oui, l'UPG offre des bourses d'entrepreneuriat aux étudiants pour soutenir les Activités Génératrices de Revenus (AGR) ainsi que des bourses d'excellence académique.",
  },
  {
     q: "L'UPG dispose-t-elle d'un accès Internet ?",
     a: "Oui, l'UPG offre une connexion Starlink haut débit gratuite sur tout le campus pour faciliter la recherche et l'apprentissage en ligne.",
  },
  {
    q: "Quelles facultés sont disponibles ?",
    a: "L'UPG propose 7 facultés : Polytechnique, Sciences Économiques, Santé Publique, Management, Sciences de Développement, Sciences Agronomiques & Environnement.",
  },
  {
    q: "Comment contacter l'administration ?",
    a: (
      <>
        Par téléphone :{" "}
        <a href="tel:+243977831973" className="font-medium text-primary underline underline-offset-2">
          +243 977 831 973
        </a>
        {" · "}
        <a href="tel:+16132612229" className="font-medium text-primary underline underline-offset-2">
          +1 613-261-2229
        </a>
        . Par courriel :{" "}
        <a href="mailto:info@upgoma.org" className="font-medium text-primary underline underline-offset-2">
          info@upgoma.org
        </a>
        . Sur place : campus de Goma, Quartier Lac Vert, Avenue Nyarutsiru.
      </>
    ),
  },
  {
    q: "Comment savoir si un document avec mention UPG est original ?",
    a: (
      <div className="space-y-3">
        <p>
          Pour vérifier un document UPG (carte d&apos;étudiant, relevé de cotes ou reçu de paiement), ouvrez
          l&apos;outil de vérification étudiant.
        </p>
        <p>
          <span className="font-semibold text-foreground">Méthode 1 (la plus rapide)</span>
          <br />
          Cliquez sur <strong>Scanner via caméra</strong>, pointez la caméra vers le QR code du document, puis cliquez sur{" "}
          <strong>Vérifier le document</strong>.
        </p>
        <p>
          <span className="font-semibold text-foreground">Méthode 2 (avec téléphone)</span>
          <br />
          Scannez le QR code avec votre téléphone, copiez les identifiants affichés, collez-les dans le champ de
          saisie, puis cliquez sur <strong>Vérifier le document</strong>.
        </p>
        <p>
          Si le document est valide, le système affiche <strong>Authenticité confirmée</strong> avec les informations
          de l&apos;étudiant.
        </p>
      </div>
    ),
  },
];

const FAQ = () => {
  return (
    <Layout>
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-3xl font-bold text-primary mb-2 text-center">
            Questions Fréquentes
          </h1>
          <p className="text-muted-foreground text-center mb-10">
            Trouvez les réponses aux questions les plus courantes sur l'UPG.
          </p>
          <Accordion type="single" collapsible className="space-y-3">
            {faqItems.map((item, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="bg-card border border-border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:text-primary">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </Layout>
  );
};

export default FAQ;
// Force rebuild Fri May  1 17:54:30     2026
