export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      announcement_reads: {
        Row: {
          announcement_id: string
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          auteur: string
          contenu: string
          created_at: string | null
          created_by: string | null
          id: string
          image_url: string | null
          titre: string
        }
        Insert: {
          auteur: string
          contenu: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          titre: string
        }
        Update: {
          auteur?: string
          contenu?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          image_url?: string | null
          titre?: string
        }
        Relationships: []
      }
      assignment_submissions: {
        Row: {
          assignment_id: string
          description: string | null
          file_url: string | null
          id: string
          student_id: string
          submitted_at: string | null
        }
        Insert: {
          assignment_id: string
          description?: string | null
          file_url?: string | null
          id?: string
          student_id: string
          submitted_at?: string | null
        }
        Update: {
          assignment_id?: string
          description?: string | null
          file_url?: string | null
          id?: string
          student_id?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string
          deadline: string
          description: string | null
          file_url: string | null
          id: string
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by: string
          deadline: string
          description?: string | null
          file_url?: string | null
          id?: string
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string
          deadline?: string
          description?: string | null
          file_url?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          sender_id: string
          sender_name: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          sender_id: string
          sender_name: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          sender_id?: string
          sender_name?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          credits: number
          document_url: string | null
          enseignant_id: string | null
          enseignant_nom: string | null
          filiere: string
          filieres: string[] | null
          id: string
          nom: string
          promotion: string
        }
        Insert: {
          code: string
          created_at?: string | null
          credits?: number
          document_url?: string | null
          enseignant_id?: string | null
          enseignant_nom?: string | null
          filiere: string
          filieres?: string[] | null
          id?: string
          nom: string
          promotion: string
        }
        Update: {
          code?: string
          created_at?: string | null
          credits?: number
          document_url?: string | null
          enseignant_id?: string | null
          enseignant_nom?: string | null
          filiere?: string
          filieres?: string[] | null
          id?: string
          nom?: string
          promotion?: string
        }
        Relationships: []
      }
      document_verification_logs: {
        Row: {
          checks: Json
          created_at: string
          document_type: string
          id: string
          is_known: boolean
          message: string
          qr_raw: string
          student_id: string | null
          verifier_user_id: string
        }
        Insert: {
          checks?: Json
          created_at?: string
          document_type?: string
          id?: string
          is_known?: boolean
          message: string
          qr_raw: string
          student_id?: string | null
          verifier_user_id: string
        }
        Update: {
          checks?: Json
          created_at?: string
          document_type?: string
          id?: string
          is_known?: boolean
          message?: string
          qr_raw?: string
          student_id?: string | null
          verifier_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "document_verification_logs_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      grade_history: {
        Row: {
          course_id: string
          grade_id: string
          id: string
          modified_at: string
          modified_by: string | null
          new_note: number | null
          previous_note: number | null
          reason: string | null
          student_id: string
        }
        Insert: {
          course_id: string
          grade_id: string
          id?: string
          modified_at?: string
          modified_by?: string | null
          new_note?: number | null
          previous_note?: number | null
          reason?: string | null
          student_id: string
        }
        Update: {
          course_id?: string
          grade_id?: string
          id?: string
          modified_at?: string
          modified_by?: string | null
          new_note?: number | null
          previous_note?: number | null
          reason?: string | null
          student_id?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          course_id: string
          created_at: string | null
          created_by: string | null
          examen: number | null
          id: string
          interro: number | null
          note: number | null
          published: boolean
          student_id: string
          total: number | null
          tp: number | null
        }
        Insert: {
          course_id: string
          created_at?: string | null
          created_by?: string | null
          examen?: number | null
          id?: string
          interro?: number | null
          note?: number | null
          published?: boolean
          student_id: string
          total?: number | null
          tp?: number | null
        }
        Update: {
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          examen?: number | null
          id?: string
          interro?: number | null
          note?: number | null
          published?: boolean
          student_id?: string
          total?: number | null
          tp?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "grades_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "grades_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          created_at: string | null
          created_by: string | null
          date: string
          id: string
          montant: number
          motif: string
          student_id: string
          tranche: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          montant: number
          motif: string
          student_id: string
          tranche: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          date?: string
          id?: string
          montant?: number
          motif?: string
          student_id?: string
          tranche?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          id: string
          nom: string
          role: Database["public"]["Enums"]["app_role"] | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          nom: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          nom?: string
          role?: Database["public"]["Enums"]["app_role"] | null
        }
        Relationships: []
      }
      requests: {
        Row: {
          created_at: string | null
          id: string
          message: string
          responded_by: string | null
          response: string | null
          status: string
          student_id: string
          sujet: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          responded_by?: string | null
          response?: string | null
          status?: string
          student_id: string
          sujet: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          responded_by?: string | null
          response?: string | null
          status?: string
          student_id?: string
          sujet?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "requests_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "students"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          adresse: string
          annee_academique: string
          attestation_url: string | null
          bulletin_url: string | null
          created_at: string | null
          date_naissance: string
          diplome_url: string | null
          domaine: string
          email: string
          filiere: string
          id: string
          lieu_naissance: string
          matricule: string | null
          nationalite: string
          nom: string
          photo_url: string | null
          postnom: string
          prenom: string
          promotion: string
          sexe: string
          status: string
          telephone: string
          user_id: string | null
        }
        Insert: {
          adresse: string
          annee_academique?: string
          attestation_url?: string | null
          bulletin_url?: string | null
          created_at?: string | null
          date_naissance: string
          diplome_url?: string | null
          domaine: string
          email: string
          filiere: string
          id?: string
          lieu_naissance: string
          matricule?: string | null
          nationalite?: string
          nom: string
          photo_url?: string | null
          postnom: string
          prenom: string
          promotion: string
          sexe: string
          status?: string
          telephone: string
          user_id?: string | null
        }
        Update: {
          adresse?: string
          annee_academique?: string
          attestation_url?: string | null
          bulletin_url?: string | null
          created_at?: string | null
          date_naissance?: string
          diplome_url?: string | null
          domaine?: string
          email?: string
          filiere?: string
          id?: string
          lieu_naissance?: string
          matricule?: string | null
          nationalite?: string
          nom?: string
          photo_url?: string | null
          postnom?: string
          prenom?: string
          promotion?: string
          sexe?: string
          status?: string
          telephone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_matricule: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "super_admin" | "appariteur" | "enseignant" | "finance"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["super_admin", "appariteur", "enseignant", "finance"],
    },
  },
} as const
