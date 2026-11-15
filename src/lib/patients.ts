
import { useEffect, useState } from "react";
import { queryOptions } from "@tanstack/react-query";
import {
  collection,
  getDocs,
  limit,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import type { ManchesterColor } from "@/lib/triage";

export type PatientStatus =
  | "aguardando"
  | "em_atendimento"
  | "atendido";

export type Patient = {
  id: string;
  code: number;
  full_name: string;
  birth_date: string | null;
  document: string | null;
  color: ManchesterColor;
  details: string | null;
  status: PatientStatus;
  created_by: string | null;
  created_at: string;
  arrival_at: string;
  attended_at: string | null;
};

export const STATUS_LABEL: Record<PatientStatus, string> = {
  aguardando: "Aguardando",
  em_atendimento: "Em atendimento",
  atendido: "Atendido",
};

function toDateString(value: unknown): string {
  if (value instanceof Timestamp) {
    return value.toDate().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return value;
  }

  return new Date().toISOString();
}

export const patientsQuery = queryOptions({
  queryKey: ["patients"],
  queryFn: async (): Promise<Patient[]> => {
    const patientsRef = collection(db, "patients");
    const patientsQuery = query(
      patientsRef,
      orderBy("arrival_at", "desc"),
      limit(1000),
    );

    const snapshot = await getDocs(patientsQuery);

    return snapshot.docs.map((document) => {
      const data = document.data();

    return {
      id: document.id,
      code: data["code"],
      full_name: data["full_name"],
      birth_date: data["birth_date"] ?? null,
      document: data["document"] ?? null,
      color: data["color"],
      details: data["details"] ?? null,
      status: data["status"],
      created_by: data["created_by"] ?? null,
      created_at: toDateString(data["created_at"]),
      arrival_at: toDateString(data["arrival_at"]),
      attended_at: data["attended_at"]
        ? toDateString(data["attended_at"])
        : null,
    };
    });
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
  return new Date(d).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
