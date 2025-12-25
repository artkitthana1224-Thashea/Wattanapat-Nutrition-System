import { createClient } from '@supabase/supabase-js';

// Default / Fallback configuration
const DEFAULT_URL = 'https://frqalqtokogxtkeiwlaj.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycWFscXRva29neHRrZWl3bGFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0NjAxODksImV4cCI6MjA4MjAzNjE4OX0.6dFxyoqXYA5uRJpVAkdjETUF_13uEhdFA6i311h3Be0';

// Try to get config from LocalStorage (set by Settings page)
const storedUrl = localStorage.getItem('supabase_url');
const storedKey = localStorage.getItem('supabase_key');

const supabaseUrl = storedUrl || DEFAULT_URL;
const supabaseKey = storedKey || DEFAULT_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

export const getCurrentConfig = () => ({
  url: supabaseUrl,
  key: supabaseKey,
  isCustom: !!storedUrl
});