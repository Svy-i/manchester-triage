import { cn } from "@/lib/utils";
import { COLOR_INFO, type ManchesterColor } from "@/lib/triage";

export const COLOR_CLASSES: Record<ManchesterColor, string> = {
  vermelho: "bg-mt-vermelho text-primary-foreground",
  laranja: "bg-mt-laranja text-mt-ink",
  amarelo: "bg-mt-amarelo text-mt-ink",
  verde: "bg-mt-verde text-primary-foreground",
  azul: "bg-mt-azul text-primary-foreground",
};

export const COLOR_BORDER: Record<ManchesterColor, string> = {
  vermelho: "border-l-mt-vermelho",
  laranja: "border-l-mt-laranja",
  amarelo: "border-l-mt-amarelo",
  verde: "border-l-mt-verde",
  azul: "border-l-mt-azul",
};

export function ColorBadge({ color, className }: { color: ManchesterColor; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold uppercase tracking-wide",
        COLOR_CLASSES[color],
        className,
      )}
    >
      {COLOR_INFO[color].label}
    </span>
  );
}
