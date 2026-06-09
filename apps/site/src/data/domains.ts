/**
 * Facultés et filières pour le formulaire d’admission : alignés sur
 * `src/config/facultyDefaults.ts` (mêmes départements que le site).
 */

import { FACULTY_DEFAULT_DEPARTMENTS } from "@/config/facultyDefaults";

const FACULTY_ORDER = [
  "polytechnique",
  "sciences-economiques",
  "sante-publique",
  "management",
  "sciences-developpement",
  "sciences-agronomiques",
] as const;

const FACULTY_LABELS: Record<(typeof FACULTY_ORDER)[number], string> = {
  polytechnique: "Polytechnique",
  "sciences-economiques": "Sciences Économiques",
  "sante-publique": "Santé Publique",
  management: "Management",
  "sciences-developpement": "Sciences de Développement",
  "sciences-agronomiques": "Sciences Agronomiques",
};

export type AdmissionFaculty = {
  slug: (typeof FACULTY_ORDER)[number];
  label: string;
  filieres: string[];
};

/** Les 6 facultés UPG avec filières dépendantes (liste officielle du config). */
export const ADMISSION_FACULTIES: AdmissionFaculty[] = FACULTY_ORDER.map((slug) => ({
  slug,
  label: FACULTY_LABELS[slug],
  filieres: [...FACULTY_DEFAULT_DEPARTMENTS[slug]],
}));

export const PROMOTIONS = ["L1", "L2", "L3", "L4", "M1", "M2"] as const;
