export type ManchesterColor = "vermelho" | "laranja" | "amarelo" | "verde" | "azul";

export const COLORS: ManchesterColor[] = ["vermelho", "laranja", "amarelo", "verde", "azul"];

export const COLOR_INFO: Record<
  ManchesterColor,
  { label: string; meaning: string; limitMin: number }
> = {
  vermelho: { label: "Vermelho", meaning: "Emergência", limitMin: 0 },
  laranja: { label: "Laranja", meaning: "Muito urgente", limitMin: 10 },
  amarelo: { label: "Amarelo", meaning: "Urgente", limitMin: 60 },
  verde: { label: "Verde", meaning: "Pouco urgente", limitMin: 120 },
  azul: { label: "Azul", meaning: "Não urgente", limitMin: 240 },
};

/**
 * Cor efetiva após o tempo de espera: quando o paciente ultrapassa o tempo
 * limite da cor atual, sobe um nível (ex.: laranja > 10 min vira vermelho).
 */
export function effectiveColor(
  color: ManchesterColor,
  arrivalAt: Date | string,
  now: Date = new Date(),
): ManchesterColor {
  let elapsed = (now.getTime() - new Date(arrivalAt).getTime()) / 60000;
  let idx = COLORS.indexOf(color);
  while (idx > 0) {
    const limit = COLOR_INFO[COLORS[idx]].limitMin;
    if (elapsed < limit) break;
    elapsed -= limit;
    idx -= 1;
  }
  return COLORS[idx];
}

export function sortQueue<T extends { color: ManchesterColor; arrival_at: string }>(
  patients: T[],
  now: Date = new Date(),
): T[] {
  return [...patients].sort((a, b) => {
    const ra = COLORS.indexOf(effectiveColor(a.color, a.arrival_at, now));
    const rb = COLORS.indexOf(effectiveColor(b.color, b.arrival_at, now));
    if (ra !== rb) return ra - rb;
    return new Date(a.arrival_at).getTime() - new Date(b.arrival_at).getTime();
  });
}

export function minutesSince(d: string, now: Date = new Date()) {
  return Math.max(0, Math.floor((now.getTime() - new Date(d).getTime()) / 60000));
}
