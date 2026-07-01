export type Json = string | number | boolean | null | { [key: string]: Json } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          dob: string
          gender: string
          seeking: string[]
          bio: string | null
          location_suburb: string | null
          location_state: string | null
          latitude: number | null
          longitude: number | null
          photos: string[]
          verified: boolean
          is_active: boolean
          last_active_at: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at' | 'updated_at' | 'last_active_at' | 'verified' | 'is_active' | 'photos'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      swipes: {
        Row: { id: string; swiper_id: string; swiped_id: string; direction: 'like' | 'pass' | 'superlike'; created_at: string }
        Insert: Omit<Database['public']['Tables']['swipes']['Row'], 'id' | 'created_at'>
        Update: never
      }
      matches: {
        Row: { id: string; user_a: string; user_b: string; matched_at: string; is_active: boolean }
        Insert: Omit<Database['public']['Tables']['matches']['Row'], 'id' | 'matched_at'>
        Update: Pick<Database['public']['Tables']['matches']['Row'], 'is_active'>
      }
      messages: {
        Row: { id: string; match_id: string; sender_id: string; content: string; created_at: string; read_at: string | null }
        Insert: Omit<Database['public']['Tables']['messages']['Row'], 'id' | 'created_at' | 'read_at'>
        Update: Pick<Database['public']['Tables']['messages']['Row'], 'read_at'>
      }
      reports: {
        Row: { id: string; reporter_id: string; reported_id: string; reason: string; details: string | null; status: string; created_at: string; resolved_at: string | null }
        Insert: Omit<Database['public']['Tables']['reports']['Row'], 'id' | 'status' | 'created_at' | 'resolved_at'>
        Update: Pick<Database['public']['Tables']['reports']['Row'], 'status' | 'resolved_at'>
      }
      blocks: {
        Row: { id: string; blocker_id: string; blocked_id: string; created_at: string }
        Insert: Omit<Database['public']['Tables']['blocks']['Row'], 'id' | 'created_at'>
        Update: never
      }
      subscriptions: {
        Row: { id: string; user_id: string; tier: string; stripe_subscription_id: string | null; status: string; current_period_end: string | null; created_at: string }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at'>
        Update: Partial<Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'user_id' | 'created_at'>>
      }
    }
    Functions: {
      get_discovery_feed: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: Array<{ id: string; display_name: string; dob: string; bio: string | null; photos: string[]; verified: boolean; location_suburb: string | null; location_state: string | null }>
      }
    }
  }
}
