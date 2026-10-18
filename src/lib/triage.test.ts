import { describe, expect, it } from "vitest";
import { effectiveColor, sortQueue } from "./triage";

const now = new Date("2026-01-01T12:00:00Z");
const ago = (min: number) => new Date(now.getTime() - min * 60000).toISOString();

describe("Protocolo Manchester", () => {
  it("laranja continua laranja antes de 10 minutos", () => {
    expect(effectiveColor("laranja", ago(9), now)).toBe("laranja");
  });
  it("laranja vira vermelho após 10 minutos", () => {
    expect(effectiveColor("laranja", ago(10), now)).toBe("vermelho");
  });
  it("vermelho sempre na frente de laranja recente", () => {
    const q = sortQueue(
      [
        { id: "a", color: "laranja" as const, arrival_at: ago(2) },
        { id: "b", color: "vermelho" as const, arrival_at: ago(1) },
      ],
      now,
    );
    expect(q[0].id).toBe("b");
  });
  it("mesma cor: quem chegou primeiro é atendido primeiro", () => {
    const q = sortQueue(
      [
        { id: "late", color: "amarelo" as const, arrival_at: ago(5) },
        { id: "early", color: "amarelo" as const, arrival_at: ago(20) },
      ],
      now,
    );
    expect(q[0].id).toBe("early");
  });
});
