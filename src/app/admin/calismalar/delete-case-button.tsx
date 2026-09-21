"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { deleteCaseStudy } from "./actions";

type Props = {
  id: string;
  baslik: string;
  /** Liste satırında yalnızca ikon göster; edit ekranında etiketli buton. */
  compact?: boolean;
};

export function DeleteCaseButton({ id, baslik, compact = false }: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            aria-label={`${baslik} çalışmasını sil`}
          >
            <Trash2 className="size-4" />
          </Button>
        ) : (
          <Button variant="destructive" size="sm" className="cursor-pointer">
            <Trash2 className="mr-2 size-4" />
            Sil
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Çalışmayı sil?</DialogTitle>
          <DialogDescription>
            <strong>{baslik}</strong> çalışması ve tüm verisi silinecek. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={isPending}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            disabled={isPending}
            onClick={() => {
              startTransition(async () => {
                const r = await deleteCaseStudy(id);
                if (!r.ok) {
                  toast.error(r.error);
                  setOpen(false);
                }
              });
            }}
          >
            {isPending ? "Siliniyor..." : "Evet, sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
