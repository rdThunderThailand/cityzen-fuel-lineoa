import { createClient } from "@supabase/supabase-js";

// CityZen Report (Separate DB - Write/Upload)
export const reportDb = createClient(
  process.env.NEXT_PUBLIC_REPORT_DB_URL!,
  process.env.NEXT_PUBLIC_REPORT_DB_ANON_KEY!,
);
