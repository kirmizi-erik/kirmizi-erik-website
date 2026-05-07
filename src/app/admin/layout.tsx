import { redirect } from "next/navigation";

import { Sidebar } from "@/components/shared/sidebar";
import { Topbar } from "@/components/shared/topbar";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-svh">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Topbar email={user.email ?? ""} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
