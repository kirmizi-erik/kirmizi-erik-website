import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Genel bakış",
};

export default function DashboardHomePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Genel bakış</h1>
        <p className="text-muted-foreground">Bu boş bir dashboard. Brief sonrası içerik gelir.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Boilerplate başlangıç noktası</CardTitle>
          <CardDescription>
            Bu klasör <code>boilerplates/nextjs-supabase-admin</code>&apos;in çıktısıdır.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-muted-foreground space-y-2 text-sm">
          <p>
            Hazır olan: Next.js 16 + Supabase Auth (magic link) + shadcn/ui + Tailwind v4 +
            security headers + protected /dashboard layout.
          </p>
          <p>
            Buradan sonrası proje brief&apos;ine bağlı: hangi sayfalar, hangi tablolar, hangi
            feature&apos;lar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
