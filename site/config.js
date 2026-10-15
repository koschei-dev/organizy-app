// Public settings for the reviews section. Both values are safe to publish:
// the anon key can only do what the database rules in supabase/reviews.sql allow.
// Leave them empty and the review form shows as "opening soon".
window.ORGANIZY_CONFIG = {
  supabaseUrl: "",      // e.g. "https://abcdefghijkl.supabase.co"
  supabaseAnonKey: "",  // Project Settings → API → anon public key
};
