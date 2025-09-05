// supabase/supabase.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://dqvosxabkqtblfhxgjbm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxdm9zeGFia3F0YmxmaHhnamJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3MjQ0MzcsImV4cCI6MjA3MTMwMDQzN30.wz_UB_XqMQZc2y4YF4ox5N79dcuOhNikYSnA2ZVPB-g';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);