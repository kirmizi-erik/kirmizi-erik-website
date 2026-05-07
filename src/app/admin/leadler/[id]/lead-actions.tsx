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
import { Label } from "@/components/ui/label";

import { deleteLead, updateLeadNotes, updateLeadStatus } from "../actions";

const durumlar = [
  { value: "yeni", label: "Yeni" },
  { value: "iletisim", label: "İletişimde" },
  { value: "teklif", label: "Teklif gönderildi" },
  { value: "kazandi", label: "Kazandı" },
  { value: "kaybetti", label: "Kaybetti" },
] as const;

type Props = {
  id: string;
  ad_soyad: string;
  durum: string;
  notlar: string | null;
};

export function LeadActions({ id, ad_soyad, durum, notlar }: Props) {
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [deleting, startDelete] = useTransition();
  const [currentDurum, setCurrentDurum] = useState(durum);
  const [notes, setNotes] = useState(notlar ?? "");

  return (
    <div className="space-y-6">
      {/* Durum select */}
      <div className="space-y-2">
        <Label htmlFor="durum">Durum</Label>
        <select
          id="durum"
          value={currentDurum}
          onChange={(e) => {
            const v = e.target.value;
            setCurrentDurum(v);
            startTransition(async () => {
              const r = await updateLeadStatus(id, v);
              if (r.ok) toast.success(r.message ?? "Güncellendi");
              else {
                toast.error(r.error);
                setCurrentDurum(durum);
              }
            });
          }}
          disabled={pending}
          className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 py-1 text-sm focus-visible:ring-2 focus-visible:outline-none"
        >
          {durumlar.map((d) => (
            <option key={d.value} value={d.value}>
              {d.label}
            </option>
          ))}
        </select>
      </div>

      {/* Notlar */}
      <div className="space-y-2">
        <Label htmlFor="notlar">Dahili not</Label>
        <textarea
          id="notlar"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:outline-none"
          placeholder="Bu lead hakkında ekibe not düş..."
        />
        <Button
          size="sm"
          onClick={() =>
            startTransition(async () => {
              const r = await updateLeadNotes(id, notes);
              if (r.ok) toast.success(r.message ?? "Kaydedildi");
              else toast.error(r.error);
            })
          }
          disabled={pending}
        >
          Notu kaydet
        </Button>
      </div>

      {/* Sil */}
      <div className="border-destructive/30 rounded-md border p-4">
        <p className="text-sm font-medium">Tehlikeli alan</p>
        <p className="text-muted-foreground mt-1 text-xs">
          Lead silindikten sonra geri alınamaz.
        </p>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive" size="sm" className="mt-3">
              <Trash2 className="mr-2 size-4" />
              Lead&apos;i sil
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Lead&apos;i sil?</DialogTitle>
              <DialogDescription>
                <strong>{ad_soyad}</strong> adlı lead ve tüm bilgisi silinecek.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
                Vazgeç
              </Button>
              <Button
                variant="destructive"
                disabled={deleting}
                onClick={() =>
                  startDelete(async () => {
                    const r = await deleteLead(id);
                    if (r.ok) {
                      toast.success(r.message ?? "Silindi");
                      window.location.href = "/admin/leadler";
                    } else {
                      toast.error(r.error);
                      setOpen(false);
                    }
                  })
                }
              >
                {deleting ? "Siliniyor..." : "Evet, sil"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
