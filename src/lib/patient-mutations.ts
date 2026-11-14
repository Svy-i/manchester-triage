import { supabase } from "@/integrations/supabase/client";
import type { Patient } from "@/lib/patients";

export type PatientEdit = Pick<Patient, "full_name" | "birth_date" | "document" | "color" | "details">;

export function validatePatientEdit(input: PatientEdit): PatientEdit {
  const full_name = input.full_name.trim();
  const details = input.details?.trim() || null;
  if (!full_name) throw new Error("Informe o nome completo do paciente.");
  if (input.color === "amarelo" && !details) throw new Error("Informe os detalhes do quadro para a classificação amarela.");
  return {
    full_name,
    birth_date: input.birth_date || null,
    document: input.document?.trim() || null,
    color: input.color,
    details,
  };
}

export async function updatePatient(id: string, input: PatientEdit) {
  const { data, error } = await supabase.from("patients")
    .update(validatePatientEdit(input)).eq("id", id).select("id").single();
  if (error) throw error;
  if (!data) throw new Error("O paciente não foi encontrado ou você não tem permissão para editar.");
}

export async function deletePatient(id: string) {
  const { data, error } = await supabase.from("patients").delete().eq("id", id).select("id").single();
  if (error) throw error;
  if (!data) throw new Error("O paciente não foi encontrado ou você não tem permissão para excluir.");
}