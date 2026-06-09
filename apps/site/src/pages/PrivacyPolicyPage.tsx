import Layout from "@/components/Layout";
import { Shield, Lock, Eye, Database, UserCheck, Globe, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const PrivacyPolicyPage = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Shield className="w-8 h-8" />
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">Politique de Confidentialité</h1>
          <p className="text-primary-foreground/70 max-w-2xl mx-auto">
            Université Polytechnique de Goma — Protection de vos données personnelles
          </p>
          <p className="text-primary-foreground/50 text-sm mt-2">Dernière mise à jour : Mars 2026</p>
        </div>
      </section>

      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="space-y-12">

            {/* Introduction */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Introduction
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                L'Université Polytechnique de Goma (UPG), établissement d'enseignement supérieur et universitaire situé à Goma, République Démocratique du Congo, s'engage à protéger la vie privée et les données personnelles de ses étudiants, personnels, visiteurs et utilisateurs de son site web. La présente politique de confidentialité décrit la manière dont nous collectons, utilisons, stockons et protégeons vos informations personnelles, conformément à la législation congolaise en vigueur et aux bonnes pratiques internationales en matière de protection des données.
              </p>
            </div>

            {/* Données collectées */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> 1. Données Personnelles Collectées
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Dans le cadre de nos activités académiques et de l'utilisation de notre site web, nous pouvons collecter les informations suivantes :
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { title: "Données d'identification", items: ["Nom et prénom", "Date et lieu de naissance", "Nationalité", "Photo d'identité"] },
                  { title: "Coordonnées", items: ["Adresse email", "Numéro de téléphone", "Adresse postale"] },
                  { title: "Données académiques", items: ["Parcours scolaire antérieur", "Faculté et département", "Résultats académiques", "Numéro matricule"] },
                  { title: "Données techniques", items: ["Adresse IP", "Type de navigateur", "Pages consultées", "Données de cookies"] },
                ].map((cat) => (
                  <div key={cat.title} className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground mb-2 text-sm">{cat.title}</h3>
                    <ul className="text-muted-foreground text-sm space-y-1">
                      {cat.items.map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Finalités */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> 2. Finalités du Traitement
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Vos données personnelles sont collectées et traitées pour les finalités suivantes :
              </p>
              <ul className="space-y-3">
                {[
                  "Gestion des inscriptions et de la scolarité des étudiants",
                  "Administration des examens, délibérations et délivrance des diplômes",
                  "Communication d'informations académiques et administratives",
                  "Gestion de la newsletter et des actualités de l'université",
                  "Amélioration de nos services en ligne et de l'expérience utilisateur",
                  "Réponse aux demandes de contact et d'information",
                  "Conformité aux obligations légales et réglementaires de la RDC",
                  "Statistiques anonymisées à des fins d'amélioration de l'enseignement",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground">
                    <span className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Base légale */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> 3. Base Légale du Traitement
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-3">
                Le traitement de vos données repose sur les bases légales suivantes, conformément au droit congolais :
              </p>
              <ul className="space-y-3">
                {[
                  "Votre consentement explicite, notamment lors de l'inscription à la newsletter ou la soumission d'un formulaire de contact",
                  "L'exécution du contrat d'inscription académique entre l'étudiant et l'université",
                  "Le respect des obligations légales auxquelles l'UPG est soumise en tant qu'établissement d'enseignement supérieur agréé par le Ministère de l'Enseignement Supérieur et Universitaire (ESU) de la RDC",
                  "L'intérêt légitime de l'université dans la gestion et l'amélioration de ses services",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-muted-foreground text-sm">
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Protection */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" /> 4. Sécurité et Protection des Données
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                L'UPG met en œuvre des mesures techniques et organisationnelles appropriées pour protéger vos données personnelles contre tout accès non autorisé, perte, altération ou divulgation :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  "Chiffrement des données sensibles lors de la transmission (SSL/TLS)",
                  "Accès restreint aux données selon le principe du besoin d'en connaître",
                  "Sauvegarde régulière et sécurisée des bases de données",
                  "Formation du personnel sur la protection des données",
                  "Politique de mots de passe robustes pour les systèmes internes",
                  "Surveillance et audit régulier des systèmes d'information",
                ].map((item) => (
                  <div key={item} className="bg-muted/50 rounded-lg p-3 border border-border text-sm text-muted-foreground flex items-start gap-2">
                    <Lock className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Durée de conservation */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Database className="w-5 h-5 text-primary" /> 5. Durée de Conservation
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Vos données personnelles sont conservées pendant la durée nécessaire aux finalités pour lesquelles elles ont été collectées. Les dossiers académiques des étudiants sont conservés conformément aux exigences du Ministère de l'ESU de la RDC. Les données liées à la navigation web et aux cookies sont conservées pour une durée maximale de 13 mois. Vous pouvez à tout moment demander la suppression de vos données non nécessaires au fonctionnement académique.
              </p>
            </div>

            {/* Droits */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary" /> 6. Vos Droits
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Conformément à la législation applicable, vous disposez des droits suivants concernant vos données personnelles :
              </p>
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { title: "Droit d'accès", desc: "Obtenir la confirmation du traitement de vos données et en recevoir une copie." },
                  { title: "Droit de rectification", desc: "Demander la correction de données inexactes ou incomplètes." },
                  { title: "Droit de suppression", desc: "Demander l'effacement de vos données dans les limites légales." },
                  { title: "Droit d'opposition", desc: "Vous opposer au traitement de vos données pour des raisons légitimes." },
                  { title: "Droit de portabilité", desc: "Recevoir vos données dans un format structuré et lisible." },
                  { title: "Droit de retrait du consentement", desc: "Retirer votre consentement à tout moment sans affecter la licéité du traitement antérieur." },
                ].map((right) => (
                  <div key={right.title} className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h3 className="font-semibold text-foreground text-sm mb-1">{right.title}</h3>
                    <p className="text-muted-foreground text-sm">{right.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Transfert international */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" /> 7. Transfert International de Données
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Certaines données peuvent être hébergées sur des serveurs situés en dehors de la RDC dans le cadre de l'utilisation de services cloud pour le fonctionnement de notre site web. Dans ce cas, l'UPG s'assure que des garanties appropriées sont mises en place pour protéger vos données conformément aux standards internationaux de sécurité. Aucune donnée personnelle n'est vendue ou partagée à des tiers à des fins commerciales.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" /> 8. Cookies et Technologies de Suivi
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Notre site web <strong className="text-foreground">n'utilise pas de cookies</strong> pour suivre ou analyser le comportement des utilisateurs. Seules les données de stockage local du navigateur (localStorage) sont utilisées pour mémoriser vos préférences de langue. Aucune donnée de navigation n'est collectée à des fins publicitaires ou de profilage.
              </p>
            </div>

            {/* Contact */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" /> 9. Contact
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Pour toute question relative à la présente politique de confidentialité ou pour exercer vos droits, vous pouvez nous contacter :
              </p>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p><strong className="text-foreground">Université Polytechnique de Goma (UPG)</strong></p>
                <p>Quartier Lac Vert, Avenue Nyarutsiru, Avant entrée Buhimba</p>
                <p>Goma, Nord-Kivu, République Démocratique du Congo</p>
                <p>Email : <a href="mailto:info@upgoma.org" className="text-primary hover:underline">info@upgoma.org</a></p>
                <p>Téléphone : +1 613-261-2229</p>
              </div>
            </div>

            {/* Modifications */}
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">10. Modifications de la Politique</h2>
              <p className="text-muted-foreground leading-relaxed">
                L'UPG se réserve le droit de modifier la présente politique de confidentialité à tout moment. Toute modification sera publiée sur cette page avec une date de mise à jour. Nous vous encourageons à consulter régulièrement cette page pour rester informé de nos pratiques en matière de protection des données.
              </p>
            </div>

          </div>
        </div>
      </section>
    </Layout>
  );
};

export default PrivacyPolicyPage;
