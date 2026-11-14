import { beforeEach, describe, expect, it, vi } from "vitest";

const api = vi.hoisted(() => ({ from: vi.fn(), update: vi.fn(), delete: vi.fn(), eq: vi.fn(), select: vi.fn(), single: vi.fn() }));
vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: api.from } }));
import { deletePatient, updatePatient, validatePatientEdit, type PatientEdit } from "./patient-mutations";

const input: PatientEdit = { full_name: " Paciente Teste ", birth_date: "1990-01-02", document: " 123 ", color: "verde", details: " Observação " };

beforeEach(() => {
  vi.resetAllMocks();
  api.from.mockReturnValue(api);
  api.update.mockReturnValue(api);
  api.delete.mockReturnValue(api);
  api.eq.mockReturnValue(api);
  api.select.mockReturnValue(api);
  api.single.mockResolvedValue({ data: { id: "patient-id" }, error: null });
});

describe("Edição e exclusão de pacientes", () => {
  it("edita somente os dados pessoais e clínicos do paciente identificado", async () => {
    await updatePatient("patient-id", { ...input, id: "changed", arrival_at: "2026-01-01" } as PatientEdit);
    expect(api.from).toHaveBeenCalledWith("patients");
    expect(api.eq).toHaveBeenCalledWith("id", "patient-id");
    expect(api.update).toHaveBeenCalledWith({ full_name: "Paciente Teste", birth_date: "1990-01-02", document: "123", color: "verde", details: "Observação" });
  });
  it("exige detalhes para classificação amarela", () => {
    expect(() => validatePatientEdit({ ...input, color: "amarelo", details: " " })).toThrow("Informe os detalhes");
    expect(validatePatientEdit({ ...input, color: "amarelo", details: "Dor moderada" }).details).toBe("Dor moderada");
  });
  it("exclui somente o cadastro identificado", async () => {
    await deletePatient("patient-id");
    expect(api.from).toHaveBeenCalledWith("patients");
    expect(api.delete).toHaveBeenCalledOnce();
    expect(api.eq).toHaveBeenCalledWith("id", "patient-id");
  });
  it("não confirma exclusão sem uma linha retornada", async () => {
    api.single.mockResolvedValue({ data: null, error: null });
    await expect(deletePatient("missing-id")).rejects.toThrow("não foi encontrado");
  });
  it("propaga falhas ao salvar sem confirmar sucesso", async () => {
    api.single.mockResolvedValue({ data: null, error: new Error("Sem permissão") });
    await expect(updatePatient("patient-id", input)).rejects.toThrow("Sem permissão");
  });
});