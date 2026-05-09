import Link from "next/link";
import { ArrowUpRight, Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Sayfa bulunamadı",
};

export default function NotFound() {
  return (
    <article className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-start justify-center px-4 py-16 sm:px-6 lg:px-10">
      <div className="text-muted-foreground inline-flex items-center gap-3 text-xs tracking-widest uppercase">
        <span className="bg-brand size-1.5 rounded-full" />
        404
      </div>

      <h1 className="font-heading mt-6 text-6xl leading-[0.95] font-black tracking-tight sm:text-7xl lg:text-8xl">
        Aradığın sayfa
        <br />
        <span className="text-brand">tarlada değil.</span>
      </h1>

      <p className="text-muted-foreground mt-8 max-w-xl text-base leading-relaxed sm:text-lg">
        Linkin yanlış olabilir, sayfa kaldırılmış olabilir, ya da adres
        değişmiştir. Anasayfaya dön veya bize bir brief paylaş — hızlıca
        ilgilenelim.
      </p>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg" className="h-12 px-7">
          <Link href="/">
            <Home className="mr-1 size-4" />
            Anasayfaya dön
          </Link>
        </Button>
        <Button asChild size="lg" variant="ghost" className="h-12 px-5">
          <Link href="/iletisim">
            Brief paylaş
            <ArrowUpRight className="ml-1 size-4" />
          </Link>
        </Button>
      </div>
    </article>
  );
}
