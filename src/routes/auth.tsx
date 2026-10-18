import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Activity } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Triagem Manchester" },
      { name: "description", content: "Acesso da equipe de atendimento e médicos ao sistema de triagem." },
      { property: "og:title", content: "Entrar — Triagem Manchester" },
      { property: "og:description", content: "Acesso da equipe de atendimento e médicos ao sistema de triagem." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("E-mail ou senha inválidos"); return; }
    navigate({ to: "/dashboard" });
  };

  const signUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Conta criada! Confira seu e-mail para confirmar o acesso.");
  };

  const fields = (
    <>
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-sidebar px-4">
      <div className="w-full max-w-sm rounded-xl bg-card p-8 shadow-xl">
        <div className="mb-6 flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-xl font-semibold">Triagem Manchester</h1>
            <p className="text-sm text-muted-foreground">Acesso da equipe</p>
          </div>
        </div>
        <Tabs defaultValue="login">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="login">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Criar conta</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <form onSubmit={signIn} className="space-y-4">
              {fields}
              <Button type="submit" className="w-full" disabled={loading}>Entrar</Button>
            </form>
          </TabsContent>
          <TabsContent value="signup">
            <form onSubmit={signUp} className="space-y-4">
              {fields}
              <Button type="submit" className="w-full" disabled={loading}>Criar conta</Button>
            </form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
