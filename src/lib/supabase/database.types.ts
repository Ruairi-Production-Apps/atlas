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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      adventure_teams: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          long_description: string | null
          name: string
          slug: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_details_submitted: boolean | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          slug: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          slug?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      counties: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          long_description: string | null
          name: string
          province_id: string
          slug: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_details_submitted: boolean | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          province_id: string
          slug: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          province_id?: string
          slug?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "counties_province_id_fkey"
            columns: ["province_id"]
            isOneToOne: false
            referencedRelation: "provinces"
            referencedColumns: ["id"]
          },
        ]
      }
      event_forms: {
        Row: {
          button_text: string | null
          created_at: string
          description: string | null
          event_id: string
          id: string
          published: boolean
          title: string
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          event_id: string
          id?: string
          published?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          created_at?: string
          description?: string | null
          event_id?: string
          id?: string
          published?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_forms_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sections: {
        Row: {
          created_at: string
          event_id: string
          id: string
          section_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          section_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_sections_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          author_id: string
          body: string | null
          capacity_groups: number | null
          capacity_scouters: number | null
          capacity_youth: number | null
          created_at: string
          end_date: string | null
          featured_image_url: string | null
          id: string
          location: string | null
          price: number | null
          price_scouter: number | null
          price_youth: number | null
          pricing_mode: Database["public"]["Enums"]["event_pricing_mode"] | null
          published: boolean
          published_at: string | null
          require_participant_info: boolean
          require_payment: boolean
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          slug: string
          start_date: string
          tags: string[] | null
          title: string
          updated_at: string
          visibility: Database["public"]["Enums"]["event_visibility"]
        }
        Insert: {
          author_id: string
          body?: string | null
          capacity_groups?: number | null
          capacity_scouters?: number | null
          capacity_youth?: number | null
          created_at?: string
          end_date?: string | null
          featured_image_url?: string | null
          id?: string
          location?: string | null
          price?: number | null
          price_scouter?: number | null
          price_youth?: number | null
          pricing_mode?:
          | Database["public"]["Enums"]["event_pricing_mode"]
          | null
          published?: boolean
          published_at?: string | null
          require_participant_info?: boolean
          require_payment?: boolean
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          slug: string
          start_date: string
          tags?: string[] | null
          title: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Update: {
          author_id?: string
          body?: string | null
          capacity_groups?: number | null
          capacity_scouters?: number | null
          capacity_youth?: number | null
          created_at?: string
          end_date?: string | null
          featured_image_url?: string | null
          id?: string
          location?: string | null
          price?: number | null
          price_scouter?: number | null
          price_youth?: number | null
          pricing_mode?:
          | Database["public"]["Enums"]["event_pricing_mode"]
          | null
          published?: boolean
          published_at?: string | null
          require_participant_info?: boolean
          require_payment?: boolean
          scope_id?: string
          scope_type?: Database["public"]["Enums"]["scope_type"]
          slug?: string
          start_date?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["event_visibility"]
        }
        Relationships: []
      }
      form_fields: {
        Row: {
          created_at: string
          display_order: number
          field_type: string
          form_id: string
          id: string
          label: string
          options: string[] | null
          participants_config: Json | null
          required: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          field_type: string
          form_id: string
          id?: string
          label: string
          options?: string[] | null
          participants_config?: Json | null
          required?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          field_type?: string
          form_id?: string
          id?: string
          label?: string
          options?: string[] | null
          participants_config?: Json | null
          required?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "form_fields_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "event_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      form_submissions: {
        Row: {
          created_at: string
          form_id: string
          id: string
          payment_amount: number | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          submission_data: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          form_id: string
          id?: string
          payment_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          submission_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          form_id?: string
          id?: string
          payment_amount?: number | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          submission_data?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "form_submissions_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "event_forms"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          county_id: string
          created_at: string
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          long_description: string | null
          name: string
          slug: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_details_submitted: boolean | null
          updated_at: string
          website: string | null
        }
        Insert: {
          county_id: string
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          slug: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          county_id?: string
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          slug?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "groups_county_id_fkey"
            columns: ["county_id"]
            isOneToOne: false
            referencedRelation: "counties"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledgebase_article_sections: {
        Row: {
          article_id: string
          created_at: string
          id: string
          section_id: string
        }
        Insert: {
          article_id: string
          created_at?: string
          id?: string
          section_id: string
        }
        Update: {
          article_id?: string
          created_at?: string
          id?: string
          section_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledgebase_article_sections_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledgebase_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledgebase_article_sections_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "sections"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledgebase_articles: {
        Row: {
          author_id: string
          body: string | null
          created_at: string
          description: string | null
          id: string
          published: boolean
          published_at: string | null
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          section_types: string[] | null
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          section_types?: string[] | null
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string
          description?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          scope_id?: string
          scope_type?: Database["public"]["Enums"]["scope_type"]
          section_types?: string[] | null
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      knowledgebase_files: {
        Row: {
          article_id: string
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
        }
        Insert: {
          article_id: string
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
        }
        Update: {
          article_id?: string
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledgebase_files_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "knowledgebase_articles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_posts: {
        Row: {
          author_id: string
          body: string | null
          created_at: string
          featured_image_url: string | null
          id: string
          published: boolean
          published_at: string | null
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          slug: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          body?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          scope_id: string
          scope_type: Database["public"]["Enums"]["scope_type"]
          slug: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          body?: string | null
          created_at?: string
          featured_image_url?: string | null
          id?: string
          published?: boolean
          published_at?: string | null
          scope_id?: string
          scope_type?: Database["public"]["Enums"]["scope_type"]
          slug?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organization_contacts: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          phone: string | null
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          organization_id?: string
          organization_type?: Database["public"]["Enums"]["scope_type"]
          phone?: string | null
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      provinces: {
        Row: {
          created_at: string
          description: string | null
          email: string | null
          facebook_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          long_description: string | null
          name: string
          slug: string
          stripe_account_id: string | null
          stripe_charges_enabled: boolean | null
          stripe_details_submitted: boolean | null
          updated_at: string
          website: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name: string
          slug: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          email?: string | null
          facebook_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          long_description?: string | null
          name?: string
          slug?: string
          stripe_account_id?: string | null
          stripe_charges_enabled?: boolean | null
          stripe_details_submitted?: boolean | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      sections: {
        Row: {
          created_at: string
          description: string | null
          group_id: string
          id: string
          name: string
          section_type: Database["public"]["Enums"]["section_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          name: string
          section_type: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          name?: string
          section_type?: Database["public"]["Enums"]["section_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sections_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      store_orders: {
        Row: {
          created_at: string
          customer_email: string
          customer_name: string
          fulfillment_status:
          | Database["public"]["Enums"]["fulfillment_status"]
          | null
          id: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          payment_intent_id: string
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          shipping_address: Json | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          customer_email: string
          customer_name: string
          fulfillment_status?:
          | Database["public"]["Enums"]["fulfillment_status"]
          | null
          id?: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          payment_intent_id: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address?: Json | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          customer_email?: string
          customer_name?: string
          fulfillment_status?:
          | Database["public"]["Enums"]["fulfillment_status"]
          | null
          id?: string
          organization_id?: string
          organization_type?: Database["public"]["Enums"]["scope_type"]
          payment_intent_id?: string
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          shipping_address?: Json | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      store_products: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          price: number
          published: boolean
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          organization_id: string
          organization_type: Database["public"]["Enums"]["scope_type"]
          price: number
          published?: boolean
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          organization_id?: string
          organization_type?: Database["public"]["Enums"]["scope_type"]
          price?: number
          published?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      ticket_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          ticket_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          ticket_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_attachments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_replies: {
        Row: {
          body: string
          created_at: string
          id: string
          ticket_id: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          ticket_id: string
          user_id: string
          user_role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
          user_id?: string
          user_role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: [
          {
            foreignKeyName: "ticket_replies_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          status: Database["public"]["Enums"]["ticket_status"]
          subject: string
          type: Database["public"]["Enums"]["ticket_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject: string
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          status?: Database["public"]["Enums"]["ticket_status"]
          subject?: string
          type?: Database["public"]["Enums"]["ticket_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          permissions: Json
          role: Database["public"]["Enums"]["user_role"]
          scope_id: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: Json
          role: Database["public"]["Enums"]["user_role"]
          scope_id?: string | null
          scope_type: Database["public"]["Enums"]["scope_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: Json
          role?: Database["public"]["Enums"]["user_role"]
          scope_id?: string | null
          scope_type?: Database["public"]["Enums"]["scope_type"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_scope: {
        Args: {
          user_id: string
          check_scope_type: Database["public"]["Enums"]["scope_type"]
          check_scope_id: string
        }
        Returns: boolean
      }
      generate_slug: {
        Args: {
          text_input: string
        }
        Returns: string
      }
      has_role_for_scope: {
        Args: {
          user_id: string
          required_role: Database["public"]["Enums"]["user_role"]
          check_scope_type: Database["public"]["Enums"]["scope_type"]
          check_scope_id: string
        }
        Returns: boolean
      }
      is_sysadmin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      event_pricing_mode: "per_group" | "per_scout" | "per_person_type"
      event_visibility: "open_to_all" | "sections_only" | "scouters_only"
      fulfillment_status: "unfulfilled" | "shipped" | "returned"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      scope_type:
      | "system"
      | "province"
      | "county"
      | "group"
      | "section"
      | "adventure_team"
      section_type: "beavers" | "cubs" | "scouts" | "ventures" | "rovers"
      ticket_status: "open" | "completed"
      ticket_type: "question" | "feature_request" | "bug_report" | "other" | "add_edit_organisation"
      user_role:
      | "sysadmin"
      | "provincial_admin"
      | "county_admin"
      | "group_leader"
      | "section_leader"
      | "team_admin"
      | "scouter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? (
    (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
      ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
      : never)
    |
    (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
      ? keyof Database[PublicTableNameOrOptions["schema"]]["Views"]
      : never)
  )
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (
    (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
      ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
      : {})
    &
    (Database[PublicTableNameOrOptions["schema"]] extends { Views: any }
      ? Database[PublicTableNameOrOptions["schema"]]["Views"]
      : {})
  )[TableName] extends {
    Row: infer R
  }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
    Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
    Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : {})[TableName] extends {
      Insert: infer I
    }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof Database["public"]["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]] extends { Tables: any }
    ? Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : {})[TableName] extends {
      Update: infer U
    }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof Database["public"]["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicEnumNameOrOptions["schema"]] extends { Enums: any }
    ? Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : {})[EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof Database["public"]["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicCompositeTypeNameOrOptions["schema"]] extends { CompositeTypes: any }
    ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : {})[CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof Database["public"]["CompositeTypes"]
  ? Database["public"]["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  public: {
    Enums: {
      event_pricing_mode: ["per_group", "per_scout", "per_person_type"],
      event_visibility: ["open_to_all", "sections_only", "scouters_only"],
      fulfillment_status: ["unfulfilled", "shipped", "returned"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      scope_type: [
        "system",
        "province",
        "county",
        "group",
        "section",
        "adventure_team",
      ],
      section_type: ["beavers", "cubs", "scouts", "ventures", "rovers"],
      ticket_status: ["open", "completed"],
      ticket_type: ["question", "feature_request", "bug_report", "other"],
      user_role: [
        "sysadmin",
        "provincial_admin",
        "county_admin",
        "group_leader",
        "section_leader",
        "team_admin",
        "scouter",
      ],
    },
  },
} as const
