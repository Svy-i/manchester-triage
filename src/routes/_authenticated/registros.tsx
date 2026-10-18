import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ColorBadge } from "@/components/ColorBadge";
import { COLORS, COLOR_INFO, effectiveColor } from "@/lib/triage";
import { fmtTime, patientsQuery, STATUS_LABEL, useNow, type PatientStatus } from "@/lib/patients";

export const Route = createFileRoute("/_authenticated/registros")({
  head: () => ({
    meta: [
      { title: "Registro de pacientes — Triagem Manchester" },
      { name: "description", content: "Busque e filtre pacientes por nome, ID, documento, cor, status e data." },
      { property: "og:title", content: "Registro de pacientes — Triagem Manchester" },
      { property: "og:description", content: "Busque e filtre pacientes por nome, ID, documento, cor, status e data." },
    ],
  }),
  component: Registros,
});

function Registros() {
  const now = useNow(30000);
  const { data = [], isLoading } = useQuery(patientsQuery);
  const [q, setQ] = useState("");
  const [color, setColor] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [date, setDate] = useState("");

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    return data.filter((p) => {
      if (term) {
        const hay = `${p.full_name} ${p.code} ${p.id} ${p.document ?? ""} ${p.details ?? ""}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (color !== "todas" && p.color !== color) return false;
      if (status !== "todos" && p.status !== status) return false;
      if (date) {
        const d = new Date(p.arrival_at);
        const local = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        if (local !== date) return false;
      }
      return true;
    });
  }, [data, q, color, status, date]);

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Registro de pacientes</h1>
        <p className="text-sm text-muted-foreground">Busque por nome, ID, documento ou sintomas.</p>
      </div>
      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4">
        <Input placeholder="Buscar..." value={q} onChange={(e) => setQ(e.target.value)} className="sm:col-span-1" />
        <Select value={color} onValueChange={setColor}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cores</SelectItem>
            {COLORS.map((c) => <SelectItem key={c} value={c}>{COLOR_INFO[c].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABEL) as PatientStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{STATUS_LABEL[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="overflow-x-auto rounded-xl border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Paciente</TableHead>
              <TableHead>Documento</TableHead>
              <TableHead>Classificação</TableHead>
              <TableHead>Chegada</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Detalhes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && <TableRow><TableCell colSpan={7}>Carregando...</TableCell></TableRow>}
            {!isLoading && rows.length === 0 && (
              <TableRow><TableCell colSpan={7} className="text-muted-foreground">Nenhum paciente encontrado.</TableCell></TableRow>
            )}
            {rows.map((p) => {
              const eff = p.status === "aguardando" ? effectiveColor(p.color, p.arrival_at, now) : p.color;
              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-mono font-medium">#{p.code}</div>
                    <div className="font-mono text-[10px] text-muted-foreground" title={p.id}>{p.id.slice(0, 8)}</div>
                  </TableCell>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell className="font-mono text-sm">{p.document ?? "—"}</TableCell>
                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <ColorBadge color={eff} />
                      {eff !== p.color && <span className="text-xs text-muted-foreground">inicial: {COLOR_INFO[p.color].label}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{fmtTime(p.arrival_at)}</TableCell>
                  <TableCell>{STATUS_LABEL[p.status]}</TableCell>
                  <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={p.details ?? ""}>{p.details ?? "—"}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
