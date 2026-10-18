import { useEffect, useState } from "react";
import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

export type Patient = Database["public"]["Tables"]["patients"]["Row"];
export type PatientStatus = Database["public"]["Enums"]["patient_status"];

export const STATUS_LABEL: Record<PatientStatus, string> = {
  aguardando: "Aguardando",
  em_atendimento: "Em atendimento",
  atendido: "Atendido",
};

export const patientsQuery = queryOptions({
  queryKey: ["patients"],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .order("arrival_at", { ascending: false })
      .limit(1000);
    if (error) throw error;
    return data;
  },
  refetchInterval: 30000,
});

export function useNow(intervalMs = 15000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(t);
  }, [intervalMs]);
  return now;
}

export function fmtTime(d: string) {
  return new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}
