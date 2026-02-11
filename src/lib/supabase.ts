import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface MissingPerson {
  id: string;
  report_number: string;
  full_name: string;
  age_at_missing: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  description?: string;
  category: 'child' | 'woman' | 'man' | 'elderly';
  status: 'active' | 'found' | 'closed';
  police_station: string;
  contact_number?: string;
  created_at: string;
  updated_at: string;
}

export interface FaceEmbedding {
  id: string;
  missing_person_id: string;
  embedding_vector: number[];
  is_age_progressed: boolean;
  photo_taken_date?: string;
  quality_score?: number;
  created_at: string;
}

export interface MatchRecord {
  id: string;
  submission_id: string;
  missing_person_id: string;
  confidence_score: number;
  match_location?: { lat: number; lng: number };
  match_timestamp: string;
  verification_status: 'pending' | 'confirmed' | 'false_positive';
  alert_sent: boolean;
  missing_person?: MissingPerson;
}

export interface PublicSubmission {
  id: string;
  submission_code: string;
  match_found: boolean;
  status: string;
  created_at: string;
}
