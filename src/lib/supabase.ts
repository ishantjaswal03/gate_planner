import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '⚠️ Missing Supabase environment variables!\n' +
    `NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl ? '✅ set' : '❌ MISSING'}\n` +
    `NEXT_PUBLIC_SUPABASE_ANON_KEY: ${supabaseKey ? '✅ set' : '❌ MISSING'}\n` +
    'Add these in Vercel → Settings → Environment Variables, then redeploy.'
  );
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);
