import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";

import { SettingsForm } from "./settings-form";

export const metadata = {
  title: "Site ayarları",
};

export default async function AdminAyarlarPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  const social = (data?.social ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Site ayarları</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          SEO meta, iletişim, sosyal medya, yasal metinler.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Genel ayarlar</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            initial={{
              meta_title: data?.meta_title ?? "",
              meta_description: data?.meta_description ?? "",
              contact_email: data?.contact_email ?? "",
              contact_phone: data?.contact_phone ?? "",
              contact_address: data?.contact_address ?? "",
              social,
              kvkk_text: data?.kvkk_text ?? "",
              cookie_text: data?.cookie_text ?? "",
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
