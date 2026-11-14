# Onde adaptar o login para Firebase Authentication

O login atual usa o Lovable Cloud. Nenhuma troca de autenticação foi feita nesta alteração.

## Pontos do código

| Arquivo | Responsabilidade |
| --- | --- |
| `src/routes/auth.tsx` | Formulários de login e criação de conta; funções `signIn` e `signUp`. Este é o ponto inicial para substituir as chamadas pelo Firebase Authentication. |
| `src/routes/__root.tsx` | Observa mudanças da sessão e atualiza as telas. |
| `src/routes/_authenticated/route.tsx` | Controla o acesso às páginas que exigem login. É gerenciado pela integração atual; uma migração deve revisar esse mecanismo, não apenas o formulário. |
| `src/components/AppShell.tsx` | Botão Sair. |
| `src/routes/_authenticated/cadastro.tsx` | Obtém a identidade do profissional que cadastra o paciente (`created_by`). |
| `src/lib/patients.ts` e `src/lib/patient-mutations.ts` | Consulta, edição e exclusão no banco atual. |
| `src/start.ts` | Envia a sessão atual em chamadas protegidas ao servidor. |

## Atenção: Firebase não é uma troca de uma linha

Um login Firebase, sozinho, **não autoriza acesso ao banco atual**: suas regras exigem a sessão do Lovable Cloud. Trocar apenas `signInWithPassword` deixaria os pacientes inacessíveis.

Para uma migração completa, configure o projeto Firebase e os métodos de entrada, inicialize seu cliente em um módulo próprio, substitua login/cadastro/saída e observação da sessão, e adapte o acesso aos pacientes. Isso exige uma integração segura da identidade Firebase com o acesso aos dados, ou migração dos dados para um serviço compatível (por exemplo, Firestore) com regras de segurança equivalentes. Preserve o ID dos pacientes, o horário de chegada e as regras Manchester. Nunca libere os dados hospitalares para acesso anônimo como solução.

No Firebase Authentication, email/senha usa `signInWithEmailAndPassword` e `createUserWithEmailAndPassword`; login por conta Google usa `GoogleAuthProvider`. Firebase Authentication e login Google são opções diferentes: se o objetivo for somente entrar com uma conta Google, o Lovable Cloud já suporta isso sem migrar o banco.

Use variáveis `VITE_FIREBASE_*` para a configuração pública do cliente. Chaves privadas de serviço devem permanecer somente no servidor. Não altere os arquivos gerados em `src/integrations/supabase/` para tentar efetuar a troca.