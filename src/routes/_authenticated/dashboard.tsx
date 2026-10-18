import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUp, Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ColorBadge, COLOR_BORDER, COLOR_CLASSES } from "@/components/ColorBadge";
import { COLORS, COLOR_INFO, effectiveColor, minutesSince, sortQueue } from "@/lib/triage";
import { patientsQuery, useNow, type PatientStatus } from "@/lib/patients";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel de triagem — Triagem Manchester" },
      { name: "description", content: "Fila de atendimento ordenada por prioridade Manchester e chegada." },
      { property: "og:title", content: "Painel de triagem — Triagem Manchester" },
      { property: "og:description", content: "Fila de atendimento ordenada por prioridade Manchester e chegada." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const qc = useQueryClient();
  const now = useNow();
  const { data = [], isLoading } = useQuery(patientsQuery);

  const waiting = sortQueue(data.filter((p) => p.status === "aguardando"), now);
  const inCare = data.filter((p) => p.status === "em_atendimento");

  const setStatus = async (id: string, status: PatientStatus) => {
    await supabase
      .from("patients")
      .update({ status, attended_at: status === "aguardando" ? null : new Date().toISOString() })
      .eq("id", id);
    qc.invalidateQueries({ queryKey: ["patients"] });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Painel de triagem</h1>
          <p className="text-sm text-muted-foreground">
            Ordem: prioridade efetiva, depois horário de chegada. Atualiza automaticamente.
          </p>
        </div>
        <Button asChild>
          <Link to="/cadastro"><Plus className="h-4 w-4" /> Novo paciente</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {COLORS.map((c) => {
          const n = waiting.filter((p) => effectiveColor(p.color, p.arrival_at, now) === c).length;
          return (
            <div key={c} className={cn("rounded-xl p-4", COLOR_CLASSES[c])}>
              <div className="text-xs font-semibold uppercase">{COLOR_INFO[c].label}</div>
              <div className="font-mono text-3xl font-semibold">{n}</div>
              <div className="text-xs opacity-80">{COLOR_INFO[c].meaning}</div>
            </div>
          );
        })}
      </div>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Fila de espera ({waiting.length})</h2>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Carregando...</p>
        ) : waiting.length === 0 ? (
          <p className="rounded-xl border bg-card p-6 text-sm text-muted-foreground">Nenhum paciente aguardando.</p>
        ) : (
          <ol className="space-y-2">
            {waiting.map((p, i) => {
              const eff = effectiveColor(p.color, p.arrival_at, now);
              const escalated = eff !== p.color;
              return (
                <li
                  key={p.id}
                  className={cn(
                    "flex flex-wrap items-center gap-4 rounded-lg border border-l-8 bg-card p-4",
                    COLOR_BORDER[eff],
                    eff === "vermelho" && "animate-alert",
                  )}
                >
                  <span className="w-6 font-mono text-lg text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{p.full_name}</span>
                      <span className="font-mono text-xs text-muted-foreground">#{p.code}</span>
                      <ColorBadge color={eff} />
                      {escalated && (
                        <span className="inline-flex items-center gap-1 text-xs text-destructive">
                          <ArrowUp className="h-3 w-3" /> elevado de {COLOR_INFO[p.color].label.toLowerCase()} (tempo excedido)
                        </span>
                      )}
                    </div>
                    {p.details && <p className="mt-1 text-sm text-muted-foreground">{p.details}</p>}
                  </div>
                  <div className="text-right font-mono text-sm">
                    <div>{minutesSince(p.arrival_at, now)} min</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(p.arrival_at).toLocaleTimeString("pt-BR", { timeStyle: "short" })}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => setStatus(p.id, "em_atendimento")}>Chamar</Button>
                </li>
              );
            })}
          </ol>
        )}
      </section>

      {inCare.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Em atendimento ({inCare.length})</h2>
          <ul className="space-y-2">
            {inCare.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-lg border bg-card p-4">
                <ColorBadge color={p.color} />
                <span className="flex-1 font-medium">{p.full_name} <span className="font-mono text-xs text-muted-foreground">#{p.code}</span></span>
                <Button size="sm" variant="outline" onClick={() => setStatus(p.id, "atendido")}>Finalizar</Button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
