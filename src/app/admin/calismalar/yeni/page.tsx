import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CaseForm } from "../case-form";

export const metadata = {
  title: "Yeni çalışma",
};

export default function YeniCalismaPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Button asChild variant="ghost" size="sm">
        <Link href="/admin/calismalar">
          <ArrowLeft className="mr-1 size-4" />
          Çalışmalar
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Yeni çalışma</CardTitle>
        </CardHeader>
        <CardContent>
          <CaseForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
