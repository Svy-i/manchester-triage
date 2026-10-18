import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { COLORS, COLOR_INFO, type ManchesterColor } from "@/lib/triage";
import { COLOR_CLASSES } from "@/components/ColorBadge";

export const Route = createFileRoute("/_authenticated/cadastro")({
  head: () => ({
    meta: [
      { title: "Cadastro de paciente — Triagem Manchester" },
      { name: "description", content: "Registre a chegada de um paciente e classifique sua prioridade." },
      { property: "og:title", content: "Cadastro de paciente — Triagem Manchester" },
      { property: "og:description", content: "Registre a chegada de um paciente e classifique sua prioridade." },
    ],
  }),
  component: Cadastro,
});

function Cadastro() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");
  const [doc, setDoc] = useState("");
  const [color, setColor] = useState<ManchesterColor | null>(null);
  const [details, setDetails] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!color) { toast.error("Selecione a classificação de risco"); return; }
    setSaving(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from("patients")
      .insert({
        full_name: name.trim(),
        birth_date: birth || null,
        document: doc.trim() || null,
        color,
        details: color === "amarelo" ? details.trim() || null : null,
        created_by: u.user?.id ?? null,
      })
      .select("code")
      .single();
    setSaving(false);
    if (error) { toast.error("Não foi possível cadastrar: " + error.message); return; }
    toast.success(`Paciente #${data.code} cadastrado`);
    qc.invalidateQueries({ queryKey: ["patients"] });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-semibold">Cadastro de paciente</h1>
      <p className="mb-6 text-sm text-muted-foreground">
        O ID único e o horário de chegada são gerados automaticamente ao salvar.
      </p>
      <form onSubmit={submit} className="space-y-6 rounded-xl border bg-card p-6">
        <div className="space-y-2">
          <Label htmlFor="name">Nome completo</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="birth">Data de nascimento</Label>
            <Input id="birth" type="date" value={birth} onChange={(e) => setBirth(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="doc">Documento (CPF / SUS)</Label>
            <Input id="doc" value={doc} onChange={(e) => setDoc(e.target.value)} />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Classificação de risco (Manchester)</Label>
          <div className="grid gap-2 sm:grid-cols-5">
            {COLORS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setColor(c)}
                className={cn(
                  "rounded-lg p-3 text-left transition-all",
                  COLOR_CLASSES[c],
                  color === c ? "ring-4 ring-ring ring-offset-2" : "opacity-70 hover:opacity-100",
                )}
              >
                <div className="text-sm font-semibold">{COLOR_INFO[c].label}</div>
                <div className="text-xs">{COLOR_INFO[c].meaning}</div>
                <div className="mt-1 font-mono text-xs">
                  {COLOR_INFO[c].limitMin === 0 ? "Imediato" : `até ${COLOR_INFO[c].limitMin} min`}
                </div>
              </button>
            ))}
          </div>
        </div>
        {color === "amarelo" && (
          <div className="space-y-2">
            <Label htmlFor="details">Detalhes do quadro do paciente</Label>
            <Textarea
              id="details"
              rows={4}
              required
              placeholder="Descreva sintomas, queixas e observações..."
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
          </div>
        )}
        <Button type="submit" disabled={saving} className="w-full">
          {saving ? "Salvando..." : "Registrar chegada"}
        </Button>
      </form>
    </div>
  );
}
