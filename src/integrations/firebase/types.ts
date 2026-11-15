export type ManchesterColor =
  | "vermelho"
  | "laranja"
  | "amarelo"
  | "verde"
  | "azul";

export type PatientStatus =
  | "aguardando"
  | "em_atendimento"
  | "atendido";

export interface Patient {
  id: string;
  code: number;
  full_name: string;
  birth_date: string | null;
  document: string | null;
  color: ManchesterColor;
  details: string | null;
  status: PatientStatus;
  created_by: string | null;
  created_at: Date | null;
  arrival_at: Date | null;
  attended_at: Date | null;
}