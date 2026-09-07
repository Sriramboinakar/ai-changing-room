import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

const globalForSupabase = globalThis as unknown as {
  browserClient?: SupabaseClient;
  adminClient?: SupabaseClient;
};

/**
 * Singleton Supabase client for the browser / client components.
 * Uses the ANON key (safe to expose) and respects Row Level Security.
 * This is where Supabase auth slots in later.
 */
export function getSupabaseBrowserClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
    );
  }
  if (!globalForSupabase.browserClient) {
    globalForSupabase.browserClient = createClient(supabaseUrl, supabaseAnonKey);
  }
  return globalForSupabase.browserClient;
}

/**
 * Singleton admin client for the server. Uses the SERVICE-ROLE key and
 * bypasses RLS. NEVER import this into a client component.
 */
export function getSupabaseAdminClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  if (!globalForSupabase.adminClient) {
    globalForSupabase.adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return globalForSupabase.adminClient;
}

/** Storage buckets used by the app. Create these in the Supabase dashboard. */
export const STORAGE_BUCKETS = {
  /** User-uploaded photos — should be PRIVATE (use signed URLs to read). */
  userUploads: "user-uploads",
  /** Catalog garment images — should be PUBLIC (loaded directly by browsers). */
  catalogItems: "catalog-items",
} as const;

/**
 * Uploads a file to Supabase Storage (via the service role) and returns its
 * public URL. For private buckets, swap `getPublicUrl` for a signed URL.
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: Buffer | ArrayBuffer | Blob | Uint8Array,
  contentType: string
): Promise<string> {
  const { error } = await getSupabaseAdminClient()
    .storage.from(bucket)
    .upload(path, file, { contentType, upsert: true });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  const { data } = getSupabaseAdminClient().storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}