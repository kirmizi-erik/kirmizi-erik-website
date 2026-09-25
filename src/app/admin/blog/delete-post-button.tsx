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

import { deleteBlogPost } from "./actions";

export function DeletePostButton({
  id,
  baslik,
  compact = false,
}: {
  id: string;
  baslik: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {compact ? (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-destructive cursor-pointer"
            aria-label={`${baslik} yazısını sil`}
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
          <DialogTitle>Yazıyı sil?</DialogTitle>
          <DialogDescription>
            <strong>{baslik}</strong> yazısı siteden kaldırılacak. Bu işlem geri alınamaz.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={pending}>
            Vazgeç
          </Button>
          <Button
            variant="destructive"
            disabled={pending}
            className="cursor-pointer"
            onClick={() =>
              startTransition(async () => {
                try {
                  await deleteBlogPost(id);
                } catch (e) {
                  // redirect() da throw eder; gerçek hata mesajı taşıyanları göster
                  if (e instanceof Error && !e.message.includes("NEXT_REDIRECT")) {
                    toast.error(e.message);
                    setOpen(false);
                  } else throw e;
                }
              })
            }
          >
            {pending ? "Siliniyor…" : "Evet, sil"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
