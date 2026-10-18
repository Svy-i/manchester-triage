import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard" });
  },
  head: () => ({
    meta: [
      { title: "Triagem Manchester — Painel hospitalar" },
      { name: "description", content: "Triagem hospitalar com protocolo Manchester e fila por prioridade." },
      { property: "og:title", content: "Triagem Manchester — Painel hospitalar" },
      { property: "og:description", content: "Triagem hospitalar com protocolo Manchester e fila por prioridade." },
    ],
  }),
});
