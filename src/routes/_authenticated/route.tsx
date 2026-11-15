import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { auth, db } from "@/integrations/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    await auth.authStateReady();

    const user = auth.currentUser;

    if (!user || !user.emailVerified) {
      throw redirect({ to: "/auth" });
    }

    const staffRef = doc(db, "staff", user.uid);
    const staffSnapshot = await getDoc(staffRef);

    if (
      !staffSnapshot.exists() ||
      staffSnapshot.data()["active"] !== true
    ) {
      throw redirect({ to: "/auth" });
    }

    return {
      staffRole: staffSnapshot.data()["role"],
    };
  },
  component: () => (
    <AppShell>
      <Outlet />
    </AppShell>
  ),
});
