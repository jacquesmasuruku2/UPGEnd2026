export type UserRole = 'super_admin' | 'appariteur' | 'enseignant' | 'finance' | 'etudiant';

export interface Profile {
  id: string;
  email: string;
  nom: string;
  role: UserRole | null;
  created_at: string;
}

export interface Student {
  id: string;
  matricule: string | null;
  nom: string;
  postnom: string;
  prenom: string;
  sexe: string;
  date_naissance: string;
  lieu_naissance: string;
  nationalite: string;
  telephone: string;
  email: string;
  adresse: string;
  domaine: string;
  filiere: string;
  promotion: string;
  annee_academique: string;
  photo_url: string | null;
  diplome_url: string | null;
  bulletin_url: string | null;
  attestation_url: string | null;
  status: string;
  user_id: string | null;
  created_at: string;
}

export interface Payment {
  id: string;
  student_id: string;
  montant: number;
  motif: string;
  tranche: string;
  date: string;
  created_by: string | null;
  created_at: string;
}

export interface Course {
  id: string;
  code: string;
  nom: string;
  credits: number;
  enseignant_id: string | null;
  enseignant_nom: string | null;
  filiere: string;
  promotion: string;
  created_at: string;
}

export interface Grade {
  id: string;
  student_id: string;
  course_id: string;
  tp: number;
  interro: number;
  examen: number;
  total: number;
  published: boolean;
  created_by: string | null;
  created_at: string;
}

export interface StudentRequest {
  id: string;
  student_id: string;
  type: string;
  sujet: string;
  message: string;
  status: string;
  response: string | null;
  responded_by: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  titre: string;
  contenu: string;
  auteur: string;
  image_url: string | null;
  created_by: string | null;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  sender_id: string;
  sender_name: string;
  content: string;
  created_at: string;
}
