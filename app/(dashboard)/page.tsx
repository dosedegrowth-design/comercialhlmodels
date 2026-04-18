import { createClient } from "@/lib/supabase/server";
import { HomePageClient } from "@/components/home/home-client";

export const revalidate = 30;

export default async function HomePage() {
  const supabase = await createClient();

  const [kpisRes, porDiaRes, porCampanhaRes] = await Promise.all([
    supabase.from("v_kpis_overview").select("*").single(),
    supabase.from("v_leads_por_dia").select("*").limit(30),
    supabase.from("v_leads_por_campanha").select("*").limit(10),
  ]);

  return (
    <HomePageClient
      kpis={kpisRes.data ?? null}
      leadsPorDia={porDiaRes.data ?? []}
      topCampanhas={porCampanhaRes.data ?? []}
    />
  );
}
