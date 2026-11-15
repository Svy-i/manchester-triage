
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/integrations/firebase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ColorBadge } from "@/components/ColorBadge";
import { COLORS, COLOR_INFO, effectiveColor } from "@/lib/triage";
import {
  fmtTime,
  patientsQuery,
  STATUS_LABEL,
  useNow,
  type Patient,
  type PatientStatus,
} from "@/lib/patients";

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
  const qc = useQueryClient();

  const { data = [], isLoading } = useQuery(patientsQuery);
  const { staffRole } = Route.useRouteContext();

  const [q, setQ] = useState("");
  const [color, setColor] = useState("todas");
  const [status, setStatus] = useState("todos");
  const [date, setDate] = useState("");

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [deletingPatient, setDeletingPatient] = useState<Patient | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [editForm, setEditForm] = useState({
    full_name: "",
    birth_date: "",
    document: "",
    color: "verde",
    details: "",
    status: "aguardando",
  });

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

  const openEdit = (patient: Patient) => {
    setEditingPatient(patient);

    setEditForm({
      full_name: patient.full_name,
      birth_date: patient.birth_date ?? "",
      document: patient.document ?? "",
      color: patient.color,
      details: patient.details ?? "",
      status: patient.status,
    });
  };

  const saveEdit = async () => {
    if (!editingPatient) return;

    if (!editForm.full_name.trim()) {
      toast.error("Informe o nome do paciente.");
      return;
    }

    setSaving(true);

    try {
      const updatedStatus = editForm.status as PatientStatus;

      await updateDoc(doc(db, "patients", editingPatient.id), {
        full_name: editForm.full_name.trim(),
        birth_date: editForm.birth_date || null,
        document: editForm.document.trim() || null,
        color: editForm.color,
        details: editForm.details.trim() || null,
        status: updatedStatus,
        attended_at:
          updatedStatus === "aguardando"
            ? null
            : editingPatient.status === "aguardando"
              ? serverTimestamp()
              : editingPatient.attended_at,
      });

      await qc.invalidateQueries({ queryKey: ["patients"] });

      toast.success("Paciente atualizado com sucesso.");
      setEditingPatient(null);
    } catch (error) {
      console.error("Erro ao editar paciente:", error);
      toast.error("Não foi possível atualizar o paciente.");
    } finally {
      setSaving(false);
    }
  };

  const deletePatient = async () => {
    if (!deletingPatient) return;

    setDeleting(true);

    try {
      await deleteDoc(doc(db, "patients", deletingPatient.id));

      await qc.invalidateQueries({ queryKey: ["patients"] });

      toast.success("Paciente excluído com sucesso.");
      setDeletingPatient(null);
    } catch (error) {
      console.error("Erro ao excluir paciente:", error);
      toast.error("Não foi possível excluir o paciente. Verifique suas permissões.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Registro de pacientes</h1>
        <p className="text-sm text-muted-foreground">
          Busque por nome, ID, documento ou sintomas.
        </p>
      </div>

      <div className="grid gap-3 rounded-xl border bg-card p-4 sm:grid-cols-4">
        <Input
          placeholder="Buscar..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="sm:col-span-1"
        />

        <Select value={color} onValueChange={setColor}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as cores</SelectItem>
            {COLORS.map((c) => (
              <SelectItem key={c} value={c}>
                {COLOR_INFO[c].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {(Object.keys(STATUS_LABEL) as PatientStatus[]).map((s) => (
              <SelectItem key={s} value={s}>
                {STATUS_LABEL[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
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
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={8}>Carregando...</TableCell>
              </TableRow>
            )}

            {!isLoading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-muted-foreground">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}

            {rows.map((p) => {
              const eff =
                p.status === "aguardando"
                  ? effectiveColor(p.color, p.arrival_at, now)
                  : p.color;

              return (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-mono font-medium">#{p.code}</div>
                    <div
                      className="font-mono text-[10px] text-muted-foreground"
                      title={p.id}
                    >
                      {p.id.slice(0, 8)}
                    </div>
                  </TableCell>

                  <TableCell className="font-medium">
                    {p.full_name}
                  </TableCell>

                  <TableCell className="font-mono text-sm">
                    {p.document ?? "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex flex-col items-start gap-1">
                      <ColorBadge color={eff} />
                      {eff !== p.color && (
                        <span className="text-xs text-muted-foreground">
                          inicial: {COLOR_INFO[p.color].label}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-sm">
                    {fmtTime(p.arrival_at)}
                  </TableCell>

                  <TableCell>{STATUS_LABEL[p.status]}</TableCell>

                  <TableCell
                    className="max-w-xs truncate text-sm text-muted-foreground"
                    title={p.details ?? ""}
                  >
                    {p.details ?? "—"}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEdit(p)}
                      >
                        <Pencil className="mr-1 h-4 w-4" />
                        Editar
                      </Button>

                      {staffRole === "admin" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => setDeletingPatient(p)}
                        >
                          <Trash2 className="mr-1 h-4 w-4" />
                          Excluir
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Janela de edição */}
      {editingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl bg-card p-6 shadow-xl">
            <div>
              <h2 className="text-xl font-semibold">Editar paciente</h2>
              <p className="text-sm text-muted-foreground">
                Paciente #{editingPatient.code}
              </p>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome completo</label>
                <Input
                  value={editForm.full_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, full_name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Data de nascimento</label>
                <Input
                  type="date"
                  value={editForm.birth_date}
                  onChange={(e) =>
                    setEditForm({ ...editForm, birth_date: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Documento</label>
                <Input
                  value={editForm.document}
                  onChange={(e) =>
                    setEditForm({ ...editForm, document: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Classificação Manchester
                </label>
                <Select
                  value={editForm.color}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, color: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c} value={c}>
                        {COLOR_INFO[c].label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Detalhes e sintomas
                </label>
                <textarea
                  className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={editForm.details}
                  onChange={(e) =>
                    setEditForm({ ...editForm, details: e.target.value })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium">Status</label>
                <Select
                  value={editForm.status}
                  onValueChange={(value) =>
                    setEditForm({ ...editForm, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(STATUS_LABEL) as PatientStatus[]).map((s) => (
                      <SelectItem key={s} value={s}>
                        {STATUS_LABEL[s]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={saving}
                onClick={() => setEditingPatient(null)}
              >
                Cancelar
              </Button>

              <Button onClick={saveEdit} disabled={saving}>
                {saving ? "Salvando..." : "Salvar alterações"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de exclusão */}
      {deletingPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md space-y-4 rounded-xl bg-card p-6 shadow-xl">
            <h2 className="text-xl font-semibold">Excluir paciente?</h2>

            <p className="text-sm text-muted-foreground">
              Tem certeza de que deseja excluir permanentemente o registro de{" "}
              <strong>{deletingPatient.full_name}</strong> (#
              {deletingPatient.code})? Essa operação não poderá ser desfeita.
            </p>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                disabled={deleting}
                onClick={() => setDeletingPatient(null)}
              >
                Cancelar
              </Button>

              <Button
                variant="destructive"
                onClick={deletePatient}
                disabled={deleting}
              >
                {deleting ? "Excluindo..." : "Excluir paciente"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
