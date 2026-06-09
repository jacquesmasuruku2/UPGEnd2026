/** Départements / filières suggérés par faculté (slug) — utilisés en secours et comme modèles admin. */
export const FACULTY_DEFAULT_DEPARTMENTS: Record<string, string[]> = {
  polytechnique: [
    "Réseaux et Télécommunication",
    "Génie Civil",
    "Génie Informatique",
    "Génie Électrique",
  ],
  "sciences-economiques": [
    "Économie Mathématique",
    "Économie Publique",
    "Économie Monétaire",
    "Économie Rurale",
    "Économie de Développement",
  ],
  "sante-publique": [
    "Sciences Infirmières",
    "Laboratoire Nutrition",
    "Pédiatrie",
    "Gestion Sanitaire",
    "Épidémiologie",
  ],
  management: [
    "Management des Organisations Sociales",
    "Management des Ressources Humaines",
    "Communication et Développement",
    "Démographie",
    "Affaires",
  ],
  "sciences-developpement": ["Développement et Actions Humanitaires", "Gestion des Projets"],
  "sciences-agronomiques": [
    "Agronomie Techniques Rurales Environnement",
    "Développement Durable",
    "Phytotechnie",
    "Zootechnie",
  ],
};
