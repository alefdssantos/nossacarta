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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      capsulas: {
        Row: {
          aberta_em: string | null
          carta_id: string
          criada_em: string
          id: string
          mensagem: string
          unlock_em: string
        }
        Insert: {
          aberta_em?: string | null
          carta_id: string
          criada_em?: string
          id?: string
          mensagem: string
          unlock_em: string
        }
        Update: {
          aberta_em?: string | null
          carta_id?: string
          criada_em?: string
          id?: string
          mensagem?: string
          unlock_em?: string
        }
        Relationships: [
          {
            foreignKeyName: "capsulas_carta_id_fkey"
            columns: ["carta_id"]
            isOneToOne: false
            referencedRelation: "cartas"
            referencedColumns: ["id"]
          },
        ]
      }
      cartas: {
        Row: {
          acesso_token: string
          atualizada_em: string
          conteudo: Json
          criada_em: string
          data_inicio_relacionamento: string | null
          destinatario_email: string | null
          expira_em: string | null
          id: string
          owner_id: string
          plano: Database["public"]["Enums"]["plano_carta"]
          publicada_em: string | null
          slug: string
          spotify_track_id: string | null
          status: Database["public"]["Enums"]["status_carta"]
        }
        Insert: {
          acesso_token?: string
          atualizada_em?: string
          conteudo?: Json
          criada_em?: string
          data_inicio_relacionamento?: string | null
          destinatario_email?: string | null
          expira_em?: string | null
          id?: string
          owner_id: string
          plano: Database["public"]["Enums"]["plano_carta"]
          publicada_em?: string | null
          slug: string
          spotify_track_id?: string | null
          status?: Database["public"]["Enums"]["status_carta"]
        }
        Update: {
          acesso_token?: string
          atualizada_em?: string
          conteudo?: Json
          criada_em?: string
          data_inicio_relacionamento?: string | null
          destinatario_email?: string | null
          expira_em?: string | null
          id?: string
          owner_id?: string
          plano?: Database["public"]["Enums"]["plano_carta"]
          publicada_em?: string | null
          slug?: string
          spotify_track_id?: string | null
          status?: Database["public"]["Enums"]["status_carta"]
        }
        Relationships: []
      }
      marcos: {
        Row: {
          carta_id: string
          criado_em: string
          data: string
          descricao: string | null
          foto_path: string | null
          id: string
          ordem: number
          titulo: string
        }
        Insert: {
          carta_id: string
          criado_em?: string
          data: string
          descricao?: string | null
          foto_path?: string | null
          id?: string
          ordem?: number
          titulo: string
        }
        Update: {
          carta_id?: string
          criado_em?: string
          data?: string
          descricao?: string | null
          foto_path?: string | null
          id?: string
          ordem?: number
          titulo?: string
        }
        Relationships: [
          {
            foreignKeyName: "marcos_carta_id_fkey"
            columns: ["carta_id"]
            isOneToOne: false
            referencedRelation: "cartas"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          altura: number | null
          bytes: number | null
          caption: string | null
          carta_id: string
          criada_em: string
          id: string
          largura: number | null
          ordem: number
          storage_path: string
        }
        Insert: {
          altura?: number | null
          bytes?: number | null
          caption?: string | null
          carta_id: string
          criada_em?: string
          id?: string
          largura?: number | null
          ordem?: number
          storage_path: string
        }
        Update: {
          altura?: number | null
          bytes?: number | null
          caption?: string | null
          carta_id?: string
          criada_em?: string
          id?: string
          largura?: number | null
          ordem?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_carta_id_fkey"
            columns: ["carta_id"]
            isOneToOne: false
            referencedRelation: "cartas"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          atualizado_em: string
          carta_id: string
          criado_em: string
          gateway_checkout_id: string | null
          gateway_meta: Json | null
          gateway_payment_id: string | null
          id: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          owner_id: string
          pago_em: string | null
          payload_webhook: Json | null
          plano: Database["public"]["Enums"]["plano_carta"]
          status: Database["public"]["Enums"]["status_pagamento"]
          valor_centavos: number
        }
        Insert: {
          atualizado_em?: string
          carta_id: string
          criado_em?: string
          gateway_checkout_id?: string | null
          gateway_meta?: Json | null
          gateway_payment_id?: string | null
          id?: string
          metodo: Database["public"]["Enums"]["metodo_pagamento"]
          owner_id: string
          pago_em?: string | null
          payload_webhook?: Json | null
          plano: Database["public"]["Enums"]["plano_carta"]
          status?: Database["public"]["Enums"]["status_pagamento"]
          valor_centavos: number
        }
        Update: {
          atualizado_em?: string
          carta_id?: string
          criado_em?: string
          gateway_checkout_id?: string | null
          gateway_meta?: Json | null
          gateway_payment_id?: string | null
          id?: string
          metodo?: Database["public"]["Enums"]["metodo_pagamento"]
          owner_id?: string
          pago_em?: string | null
          payload_webhook?: Json | null
          plano?: Database["public"]["Enums"]["plano_carta"]
          status?: Database["public"]["Enums"]["status_pagamento"]
          valor_centavos?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_carta_id_fkey"
            columns: ["carta_id"]
            isOneToOne: false
            referencedRelation: "cartas"
            referencedColumns: ["id"]
          },
        ]
      }
      perfis: {
        Row: {
          atualizado_em: string
          criado_em: string
          email: string
          id: string
          nome: string | null
        }
        Insert: {
          atualizado_em?: string
          criado_em?: string
          email: string
          id: string
          nome?: string | null
        }
        Update: {
          atualizado_em?: string
          criado_em?: string
          email?: string
          id?: string
          nome?: string | null
        }
        Relationships: []
      }
      slugs_reservados: {
        Row: {
          motivo: string
          slug: string
        }
        Insert: {
          motivo: string
          slug: string
        }
        Update: {
          motivo?: string
          slug?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      carta_capsulas_publicas: {
        Args: { p_carta_id: string }
        Returns: {
          aberta_em: string
          criada_em: string
          id: string
          mensagem: string
          unlock_em: string
        }[]
      }
      carta_publica_ativa: { Args: { p_carta_id: string }; Returns: boolean }
    }
    Enums: {
      metodo_pagamento: "pix" | "credit_card"
      plano_carta: "bilhete" | "eterno"
      status_carta:
        | "rascunho"
        | "aguardando_pagamento"
        | "publicada"
        | "expirada"
      status_pagamento:
        | "pending"
        | "approved"
        | "rejected"
        | "refunded"
        | "cancelled"
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
      metodo_pagamento: ["pix", "credit_card"],
      plano_carta: ["bilhete", "eterno"],
      status_carta: [
        "rascunho",
        "aguardando_pagamento",
        "publicada",
        "expirada",
      ],
      status_pagamento: [
        "pending",
        "approved",
        "rejected",
        "refunded",
        "cancelled",
      ],
    },
  },
} as const
