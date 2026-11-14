<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep patient edit/delete operations in `src/lib/patient-mutations.ts` and their dialogs in a dedicated component, so identity/arrival fields remain untouched and successful writes refresh the shared patient query.
- Firebase replacement guidance belongs in `docs/firebase-auth.md`; retain current authentication until a complete identity and data-access migration is requested, because Firebase sessions do not authorize the current database policies.
