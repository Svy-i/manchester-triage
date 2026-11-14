import { useState, type FormEvent } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { COLORS, COLOR_INFO, type ManchesterColor } from "@/lib/triage";
import { fmtTime, type Patient } from "@/lib/patients";
import { deletePatient, updatePatient, type PatientEdit } from "@/lib/patient-mutations";

export function PatientRecordDialogs({ patient, mode, onClose }: { patient: Patient; mode: "edit" | "delete"; onClose: () => void }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState<PatientEdit>({ full_name: patient.full_name, birth_date: patient.birth_date, document: patient.document, color: patient.color, details: patient.details });

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      if (mode === "edit") await updatePatient(patient.id, form);
      else await deletePatient(patient.id);
      await qc.invalidateQueries({ queryKey: ["patients"] });
      toast.success(mode === "edit" ? "Dados do paciente atualizados." : "Cadastro do paciente excluído.");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível concluir. Tente novamente.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => { if (!open && !busy) onClose(); }}>
      <DialogContent className="max-h-[90dvh] w-[calc(100%-2rem)] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Editar paciente" : "Excluir cadastro"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? `Paciente #${patient.code} · Chegada: ${fmtTime(patient.arrival_at)}` : `Excluir o cadastro de ${patient.full_name} (#${patient.code})? Esta ação é permanente e remove o paciente da fila e dos registros.`}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <fieldset disabled={busy} className="space-y-4">
            {mode === "edit" && <>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome completo</Label>
                <Input id="edit-name" required value={form.full_name} onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="edit-birth">Data de nascimento</Label>
                  <Input id="edit-birth" type="date" value={form.birth_date ?? ""} onChange={(e) => setForm({ ...form, birth_date: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-document">Documento (CPF / SUS)</Label>
                  <Input id="edit-document" value={form.document ?? ""} onChange={(e) => setForm({ ...form, document: e.target.value })} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-color">Classificação de risco</Label>
                <Select value={form.color} onValueChange={(color: ManchesterColor) => setForm({ ...form, color })}>
                  <SelectTrigger id="edit-color"><SelectValue /></SelectTrigger>
                  <SelectContent>{COLORS.map((c) => <SelectItem key={c} value={c}>{COLOR_INFO[c].label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-details">Detalhes do quadro do paciente{form.color === "amarelo" ? " (obrigatório)" : ""}</Label>
                <Textarea id="edit-details" rows={4} required={form.color === "amarelo"} value={form.details ?? ""} onChange={(e) => setForm({ ...form, details: e.target.value })} />
              </div>
            </>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" variant={mode === "delete" ? "destructive" : "default"}>
                {mode === "edit" ? <Save className="h-4 w-4" /> : <Trash2 className="h-4 w-4" />}
                {busy ? "Aguarde..." : mode === "edit" ? "Salvar alterações" : "Excluir permanentemente"}
              </Button>
            </div>
          </fieldset>
        </form>
      </DialogContent>
    </Dialog>
  );
}