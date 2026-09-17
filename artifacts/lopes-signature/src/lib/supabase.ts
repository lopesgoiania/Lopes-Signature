import { createClient } from '@supabase/supabase-js';

export const supabaseUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || 'https://kzarqqcazoxslamzyjqc.supabase.co').trim();
export const supabaseAnonKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6YXJxcWNhem94c2xhbXp5anFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk1ODk5NDIsImV4cCI6MjEwNTE2NTk0Mn0.wdPpsQsodtG10fgcSa26OrAR33wcMc3H51aLrrzvgVQ').trim();

export const isSupabaseConfigured = true;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
