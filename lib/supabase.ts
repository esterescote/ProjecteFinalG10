import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://wlaumweodxeqrwktfqlg.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndsYXVtd2VvZHhlcXJ3a3RmcWxnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM0MTMwMjksImV4cCI6MjA1ODk4OTAyOX0.4lzGcn8jbgUKHN6Wi0m9wHS3edK5MaL-bOVK-7_Gcuo'
);
