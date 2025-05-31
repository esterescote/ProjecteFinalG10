import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wlaumweodxeqrwktfqlg.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsYXVtd2VvZHhlcXJ3a3RmcWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTMwMjksImV4cCI6MjA1ODk4OTAyOX0.4lzGcn8jbgUKHN6Wi0m9wHS3edK5MaL-bOVK-7_Gcuo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
