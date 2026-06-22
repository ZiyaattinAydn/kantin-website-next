/**
 * Kantin Website Supabase şeması.
 * Faz 2 migration dosyasıyla eşleşir.
 * Şema değiştiğinde bu dosya yeniden üretilmelidir.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          role: Database["public"]["Enums"]["app_role"];
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          role?: Database["public"]["Enums"]["app_role"];
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      branches: {
        Row: {
          id: string;
          slug: string;
          code: string;
          name: string;
          short_description: string | null;
          address_line: string;
          district: string;
          city: string;
          country_code: string;
          timezone: string;
          maps_url: string;
          phone: string | null;
          public_email: string | null;
          features: string[];
          opening_hours: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          code: string;
          name: string;
          short_description?: string | null;
          address_line: string;
          district: string;
          city: string;
          country_code?: string;
          timezone?: string;
          maps_url: string;
          phone?: string | null;
          public_email?: string | null;
          features?: string[];
          opening_hours?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          code?: string;
          name?: string;
          short_description?: string | null;
          address_line?: string;
          district?: string;
          city?: string;
          country_code?: string;
          timezone?: string;
          maps_url?: string;
          phone?: string | null;
          public_email?: string | null;
          features?: string[];
          opening_hours?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          source: Database["public"]["Enums"]["media_source"];
          kind: Database["public"]["Enums"]["media_kind"];
          bucket_name: string | null;
          object_path: string | null;
          external_url: string | null;
          local_path: string | null;
          title: string | null;
          alt_text: string | null;
          mime_type: string | null;
          size_bytes: number | null;
          width: number | null;
          height: number | null;
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source: Database["public"]["Enums"]["media_source"];
          kind: Database["public"]["Enums"]["media_kind"];
          bucket_name?: string | null;
          object_path?: string | null;
          external_url?: string | null;
          local_path?: string | null;
          title?: string | null;
          alt_text?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source?: Database["public"]["Enums"]["media_source"];
          kind?: Database["public"]["Enums"]["media_kind"];
          bucket_name?: string | null;
          object_path?: string | null;
          external_url?: string | null;
          local_path?: string | null;
          title?: string | null;
          alt_text?: string | null;
          mime_type?: string | null;
          size_bytes?: number | null;
          width?: number | null;
          height?: number | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_categories: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          display_type: Database["public"]["Enums"]["menu_category_display"];
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          display_type?: Database["public"]["Enums"]["menu_category_display"];
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          display_type?: Database["public"]["Enums"]["menu_category_display"];
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      menu_category_branches: {
        Row: {
          id: string;
          category_id: string;
          branch_id: string;
          display_name: string | null;
          description: string | null;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          branch_id: string;
          display_name?: string | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          branch_id?: string;
          display_name?: string | null;
          description?: string | null;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_category_branches_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_category_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_items: {
        Row: {
          id: string;
          category_id: string;
          slug: string;
          name: string;
          description: string | null;
          detail: string | null;
          highlight_text: string | null;
          allergen_text: string | null;
          allergens: string[];
          badges: string[];
          image_media_id: string | null;
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          slug: string;
          name: string;
          description?: string | null;
          detail?: string | null;
          highlight_text?: string | null;
          allergen_text?: string | null;
          allergens?: string[];
          badges?: string[];
          image_media_id?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          slug?: string;
          name?: string;
          description?: string | null;
          detail?: string | null;
          highlight_text?: string | null;
          allergen_text?: string | null;
          allergens?: string[];
          badges?: string[];
          image_media_id?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "menu_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_items_image_media_id_fkey";
            columns: ["image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_item_branches: {
        Row: {
          id: string;
          menu_item_id: string;
          branch_id: string;
          price_cents: number | null;
          currency: string;
          price_label: string | null;
          price_note: string | null;
          availability_note: string | null;
          metadata: Json;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_item_id: string;
          branch_id: string;
          price_cents?: number | null;
          currency?: string;
          price_label?: string | null;
          price_note?: string | null;
          availability_note?: string | null;
          metadata?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_item_id?: string;
          branch_id?: string;
          price_cents?: number | null;
          currency?: string;
          price_label?: string | null;
          price_note?: string | null;
          availability_note?: string | null;
          metadata?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_item_branches_menu_item_id_fkey";
            columns: ["menu_item_id"];
            isOneToOne: false;
            referencedRelation: "menu_items";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "menu_item_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      menu_item_variants: {
        Row: {
          id: string;
          menu_item_branch_id: string;
          slug: string;
          label: string;
          detail: string | null;
          price_cents: number;
          currency: string;
          price_note: string | null;
          metadata: Json;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          menu_item_branch_id: string;
          slug: string;
          label: string;
          detail?: string | null;
          price_cents: number;
          currency?: string;
          price_note?: string | null;
          metadata?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          menu_item_branch_id?: string;
          slug?: string;
          label?: string;
          detail?: string | null;
          price_cents?: number;
          currency?: string;
          price_note?: string | null;
          metadata?: Json;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "menu_item_variants_menu_item_branch_id_fkey";
            columns: ["menu_item_branch_id"];
            isOneToOne: false;
            referencedRelation: "menu_item_branches";
            referencedColumns: ["id"];
          },
        ];
      };
      events: {
        Row: {
          id: string;
          slug: string;
          title: string;
          summary: string | null;
          description: string;
          start_at: string;
          end_at: string | null;
          timezone: string;
          venue_name: string | null;
          location_text: string | null;
          external_url: string | null;
          image_media_id: string | null;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          is_featured: boolean;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          summary?: string | null;
          description: string;
          start_at: string;
          end_at?: string | null;
          timezone?: string;
          venue_name?: string | null;
          location_text?: string | null;
          external_url?: string | null;
          image_media_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          summary?: string | null;
          description?: string;
          start_at?: string;
          end_at?: string | null;
          timezone?: string;
          venue_name?: string | null;
          location_text?: string | null;
          external_url?: string | null;
          image_media_id?: string | null;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          is_featured?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "events_image_media_id_fkey";
            columns: ["image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      event_branches: {
        Row: {
          id: string;
          event_id: string;
          branch_id: string;
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          event_id: string;
          branch_id: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          event_id?: string;
          branch_id?: string;
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "event_branches_event_id_fkey";
            columns: ["event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "event_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      merch_products: {
        Row: {
          id: string;
          slug: string;
          product_type: string;
          name: string;
          description: string;
          detail: string | null;
          sku: string | null;
          price_cents: number;
          currency: string;
          inventory_status: Database["public"]["Enums"]["inventory_status"];
          stock_quantity: number | null;
          image_media_id: string | null;
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          product_type?: string;
          name: string;
          description: string;
          detail?: string | null;
          sku?: string | null;
          price_cents: number;
          currency?: string;
          inventory_status?: Database["public"]["Enums"]["inventory_status"];
          stock_quantity?: number | null;
          image_media_id?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          product_type?: string;
          name?: string;
          description?: string;
          detail?: string | null;
          sku?: string | null;
          price_cents?: number;
          currency?: string;
          inventory_status?: Database["public"]["Enums"]["inventory_status"];
          stock_quantity?: number | null;
          image_media_id?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "merch_products_image_media_id_fkey";
            columns: ["image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      merch_product_branches: {
        Row: {
          id: string;
          merch_product_id: string;
          branch_id: string;
          is_available: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          merch_product_id: string;
          branch_id: string;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          merch_product_id?: string;
          branch_id?: string;
          is_available?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "merch_product_branches_merch_product_id_fkey";
            columns: ["merch_product_id"];
            isOneToOne: false;
            referencedRelation: "merch_products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "merch_product_branches_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      instagram_posts: {
        Row: {
          id: string;
          external_id: string | null;
          permalink: string;
          caption: string;
          image_alt: string;
          branch_id: string | null;
          image_media_id: string | null;
          published_at: string;
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          external_id?: string | null;
          permalink: string;
          caption: string;
          image_alt: string;
          branch_id?: string | null;
          image_media_id?: string | null;
          published_at: string;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          external_id?: string | null;
          permalink?: string;
          caption?: string;
          image_alt?: string;
          branch_id?: string | null;
          image_media_id?: string | null;
          published_at?: string;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "instagram_posts_branch_id_fkey";
            columns: ["branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "instagram_posts_image_media_id_fkey";
            columns: ["image_media_id"];
            isOneToOne: false;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      job_applications: {
        Row: {
          id: string;
          full_name: string;
          phone: string;
          email: string;
          preferred_branch_id: string | null;
          is_branch_flexible: boolean;
          department: Database["public"]["Enums"]["job_department"];
          employment_type: Database["public"]["Enums"]["employment_type"];
          shift_preference: Database["public"]["Enums"]["shift_preference"];
          availability_days: string[];
          experience: string | null;
          introduction: string;
          cv_media_id: string | null;
          consent_given: boolean;
          consented_at: string;
          consent_version: string;
          status: Database["public"]["Enums"]["job_application_status"];
          admin_notes: string | null;
          privacy_status: Database["public"]["Enums"]["job_application_privacy_status"];
          retention_until: string;
          archived_at: string | null;
          anonymization_started_at: string | null;
          anonymized_at: string | null;
          anonymized_by: string | null;
          cv_deleted_at: string | null;
          anonymization_error: string | null;
          submission_token: string;
          submission_fingerprint: string | null;
          source_ip_hash: string | null;
          user_agent_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          phone: string;
          email: string;
          preferred_branch_id?: string | null;
          is_branch_flexible?: boolean;
          department: Database["public"]["Enums"]["job_department"];
          employment_type: Database["public"]["Enums"]["employment_type"];
          shift_preference: Database["public"]["Enums"]["shift_preference"];
          availability_days: string[];
          experience?: string | null;
          introduction: string;
          cv_media_id?: string | null;
          consent_given: boolean;
          consented_at: string;
          consent_version: string;
          status?: Database["public"]["Enums"]["job_application_status"];
          admin_notes?: string | null;
          privacy_status?: Database["public"]["Enums"]["job_application_privacy_status"];
          retention_until?: string;
          archived_at?: string | null;
          anonymization_started_at?: string | null;
          anonymized_at?: string | null;
          anonymized_by?: string | null;
          cv_deleted_at?: string | null;
          anonymization_error?: string | null;
          submission_token?: string;
          submission_fingerprint?: string | null;
          source_ip_hash?: string | null;
          user_agent_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          preferred_branch_id?: string | null;
          is_branch_flexible?: boolean;
          department?: Database["public"]["Enums"]["job_department"];
          employment_type?: Database["public"]["Enums"]["employment_type"];
          shift_preference?: Database["public"]["Enums"]["shift_preference"];
          availability_days?: string[];
          experience?: string | null;
          introduction?: string;
          cv_media_id?: string | null;
          consent_given?: boolean;
          consented_at?: string;
          consent_version?: string;
          status?: Database["public"]["Enums"]["job_application_status"];
          admin_notes?: string | null;
          privacy_status?: Database["public"]["Enums"]["job_application_privacy_status"];
          retention_until?: string;
          archived_at?: string | null;
          anonymization_started_at?: string | null;
          anonymized_at?: string | null;
          anonymized_by?: string | null;
          cv_deleted_at?: string | null;
          anonymization_error?: string | null;
          submission_token?: string;
          submission_fingerprint?: string | null;
          source_ip_hash?: string | null;
          user_agent_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_anonymized_by_fkey";
            columns: ["anonymized_by"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_preferred_branch_id_fkey";
            columns: ["preferred_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "job_applications_cv_media_id_fkey";
            columns: ["cv_media_id"];
            isOneToOne: true;
            referencedRelation: "media";
            referencedColumns: ["id"];
          },
        ];
      };
      career_upload_sessions: {
        Row: {
          id: string;
          upload_token_hash: string;
          object_path: string;
          full_name: string;
          phone: string;
          email: string;
          preferred_branch_id: string | null;
          is_branch_flexible: boolean;
          department: Database["public"]["Enums"]["job_department"];
          employment_type: Database["public"]["Enums"]["employment_type"];
          shift_preference: Database["public"]["Enums"]["shift_preference"];
          availability_days: string[];
          experience: string | null;
          introduction: string;
          consented_at: string;
          consent_version: string;
          cv_mime_type: string;
          cv_size_bytes: number;
          cv_extension: string;
          submission_fingerprint: string;
          source_ip_hash: string | null;
          user_agent_hash: string | null;
          expires_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          upload_token_hash: string;
          object_path: string;
          full_name: string;
          phone: string;
          email: string;
          preferred_branch_id?: string | null;
          is_branch_flexible?: boolean;
          department: Database["public"]["Enums"]["job_department"];
          employment_type: Database["public"]["Enums"]["employment_type"];
          shift_preference: Database["public"]["Enums"]["shift_preference"];
          availability_days: string[];
          experience?: string | null;
          introduction: string;
          consented_at?: string;
          consent_version: string;
          cv_mime_type: string;
          cv_size_bytes: number;
          cv_extension: string;
          submission_fingerprint: string;
          source_ip_hash?: string | null;
          user_agent_hash?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          upload_token_hash?: string;
          object_path?: string;
          full_name?: string;
          phone?: string;
          email?: string;
          preferred_branch_id?: string | null;
          is_branch_flexible?: boolean;
          department?: Database["public"]["Enums"]["job_department"];
          employment_type?: Database["public"]["Enums"]["employment_type"];
          shift_preference?: Database["public"]["Enums"]["shift_preference"];
          availability_days?: string[];
          experience?: string | null;
          introduction?: string;
          consented_at?: string;
          consent_version?: string;
          cv_mime_type?: string;
          cv_size_bytes?: number;
          cv_extension?: string;
          submission_fingerprint?: string;
          source_ip_hash?: string | null;
          user_agent_hash?: string | null;
          expires_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "career_upload_sessions_preferred_branch_id_fkey";
            columns: ["preferred_branch_id"];
            isOneToOne: false;
            referencedRelation: "branches";
            referencedColumns: ["id"];
          },
        ];
      };
      site_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          is_public: boolean;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          is_public?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          is_public?: boolean;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_pages: {
        Row: {
          id: string;
          slug: string;
          title: string;
          seo_title: string | null;
          seo_description: string | null;
          metadata: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          published_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          title: string;
          seo_title?: string | null;
          seo_description?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          title?: string;
          seo_title?: string | null;
          seo_description?: string | null;
          metadata?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          published_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      content_blocks: {
        Row: {
          id: string;
          page_id: string;
          key: string;
          block_type: string;
          content: Json;
          status: Database["public"]["Enums"]["content_status"];
          is_active: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          page_id: string;
          key: string;
          block_type: string;
          content?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          page_id?: string;
          key?: string;
          block_type?: string;
          content?: Json;
          status?: Database["public"]["Enums"]["content_status"];
          is_active?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_blocks_page_id_fkey";
            columns: ["page_id"];
            isOneToOne: false;
            referencedRelation: "site_pages";
            referencedColumns: ["id"];
          },
        ];
      };
      admin_activity_logs: {
        Row: {
          id: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          entity_label: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          actor_id: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          entity_label?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          actor_id?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          entity_label?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "admin_activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      begin_job_application: {
        Args: {
          p_full_name: string;
          p_phone: string;
          p_email: string;
          p_branch_slug: string;
          p_department: string;
          p_employment_type: string;
          p_shift_preference: string;
          p_availability_days: string[];
          p_experience: string;
          p_introduction: string;
          p_consent_given: boolean;
          p_cv_mime_type: string;
          p_cv_size_bytes: number;
          p_cv_extension: string;
          p_source_ip_hash?: string | null;
          p_user_agent_hash?: string | null;
        };
        Returns: {
          session_id: string;
          upload_token: string;
          object_path: string;
          expires_at: string;
        }[];
      };
      can_upload_career_cv: {
        Args: { p_object_path: string };
        Returns: boolean;
      };
      complete_job_application: {
        Args: { p_session_id: string; p_upload_token: string };
        Returns: { application_id: string; receipt_token: string }[];
      };
      cancel_job_application: {
        Args: { p_session_id: string; p_upload_token: string };
        Returns: boolean;
      };
      begin_job_application_anonymization: {
        Args: { p_application_id: string };
        Returns: {
          application_id: string;
          media_id: string | null;
          bucket_name: string | null;
          object_path: string | null;
        }[];
      };
      cancel_job_application_anonymization: {
        Args: { p_application_id: string; p_reason: string };
        Returns: boolean;
      };
      complete_job_application_anonymization: {
        Args: { p_application_id: string };
        Returns: boolean;
      };
      is_admin: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_content_manager: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
      is_valid_theme_settings: {
        Args: { p_value: Json };
        Returns: boolean;
      };
      is_valid_section_visibility: {
        Args: { p_value: Json };
        Returns: boolean;
      };
    };
    Enums: {
      app_role: "viewer" | "editor" | "admin";
      content_status: "draft" | "published" | "archived";
      media_source: "local" | "storage" | "external";
      media_kind: "image" | "document" | "video";
      menu_category_display: "price_table" | "compact" | "cards" | "editorial" | "feature" | "coffee" | "custom";
      inventory_status: "available" | "limited" | "out_of_stock" | "discontinued";
      job_application_status: "new" | "reviewing" | "contacted" | "rejected" | "hired" | "archived";
      job_application_privacy_status: "active" | "anonymization_pending" | "anonymized";
      employment_type: "full_time" | "part_time";
      job_department: "service" | "kitchen" | "bar" | "cashier";
      shift_preference: "morning" | "evening" | "flexible";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type Tables<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof Database["public"]["Tables"],
> = Database["public"]["Tables"][TableName]["Update"];

export type Enums<
  EnumName extends keyof Database["public"]["Enums"],
> = Database["public"]["Enums"][EnumName];
