// Small supabase client wrapper and helper utilities used by admin UI pages.
// Exports:
// - `supabase`: initialized Supabase client
// - helper functions for quick admin queries used in the UI
import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !key) {
  console.warn('VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set');
}

// Initialized Supabase client (used for admin auth and CRUD helpers)
export const supabase: SupabaseClient = createClient(url ?? '', key ?? '');

// Debug: log masked env values in dev to help detect incorrect keys
try {
  if (import.meta.env.DEV) {
    console.debug('[supabaseClient] VITE_SUPABASE_URL=', url ? url : '<missing>');
    console.debug('[supabaseClient] VITE_SUPABASE_ANON_KEY=', key ? `${String(key).slice(0, 8)}...(${String(key).length} chars)` : '<missing>');
  }
} catch (e) {
  // ignore
}

// Return the currently authenticated user (or null)
export async function getCurrentUser() {
  const { data } = await supabase.auth.getUser();
  return data?.user ?? null;
}

// Export a small test helper attached to window so you can run it from the browser console.
// Test helper used in dev to sanity-check DB connectivity (attached to window)
export async function testConnection() {
  try {
    const res = await supabase.from('admins').select('username,role').limit(1);
    console.debug('[supabaseClient] testConnection result:', res);
    return res;
  } catch (err) {
    console.error('[supabaseClient] testConnection error:', err);
    throw err;
  }
}

// expose for quick manual testing in browser console during development
try {
  if (typeof window !== 'undefined') {
    (window as any).__supabase_test = testConnection;
  }
} catch (e) {
  // ignore
}

// CRUD convenience helpers for admin management used by the admin pages
export async function fetchAdmins() {
  return supabase.from('admins').select('email,role').order('email');
}

export async function addAdmin(email: string, role: 'admin' | 'super' = 'admin') {
  return supabase.from('admins').insert([{ email, role }]);
}

export async function deleteAdmin(email: string) {
  return supabase.from('admins').delete().eq('email', email);
}
