CREATE TYPE public.manchester_color AS ENUM ('vermelho','laranja','amarelo','verde','azul');
CREATE TYPE public.patient_status AS ENUM ('aguardando','em_atendimento','atendido');

CREATE TABLE public.patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code bigint GENERATED ALWAYS AS IDENTITY UNIQUE,
  full_name text NOT NULL,
  birth_date date,
  document text,
  color public.manchester_color NOT NULL,
  details text,
  status public.patient_status NOT NULL DEFAULT 'aguardando',
  arrival_at timestamptz NOT NULL DEFAULT now(),
  attended_at timestamptz,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.patients TO authenticated;
GRANT ALL ON public.patients TO service_role;

ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read patients" ON public.patients FOR SELECT TO authenticated USING (true);
CREATE POLICY "Staff can insert patients" ON public.patients FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Staff can update patients" ON public.patients FOR UPDATE TO authenticated USING (true) WITH CHECK (true);