"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { bulkDeleteLeads, bulkUpdateLeadStatus } from "./actions";
import { DURUMLAR, DURUM_VARIANT, KANALLAR, type LeadKanal } from "./lead-meta";

export type LeadRow = {
  id: string;
  ad_soyad: string;
  eposta: string;
  telefon: string | null;
  sirket: string | null;
  hizmet_kategori: string[] | null;
  butce: string | null;
  durum: string;
  kanal: LeadKanal;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function LeadTable({ leads }: { leads: LeadRow[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [bulkDurum, setBulkDurum] = useState("");
  const [pending, startTransition] = useTransition();

  // Filtre değişince listede olmayan seçimler düşer
  const selected = leads.filter((l) => checked.has(l.id)).map((l) => l.id);
  const allChecked = leads.length > 0 && selected.length === leads.length;

  const toggle = (id: string) =>
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const toggleAll = () => setChecked(allChecked ? new Set() : new Set(leads.map((l) => l.id)));

  const applyStatus = () => {
    if (!bulkDurum) return;
    startTransition(async () => {
      const r = await bulkUpdateLeadStatus(selected, bulkDurum);
      if (r.ok) {
        toast.success(r.message ?? "Güncellendi");
        setChecked(new Set());
        setBulkDurum("");
      } else toast.error(r.error);
    });
  };

  const deleteSelected = () => {
    if (
      !window.confirm(
        `${selected.length} lead'i silmek üzeresiniz. Bu işlem geri alınamaz. Emin misiniz?`,
      )
    )
      return;
    startTransition(async () => {
      const r = await bulkDeleteLeads(selected);
      if (r.ok) {
        toast.success(r.message ?? "Silindi");
        setChecked(new Set());
      } else toast.error(r.error);
    });
  };

  return (
    <div className="space-y-2">
      <div className="border-border bg-card flex flex-wrap items-center gap-2 rounded-md border px-3 py-2">
        <label className="flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="accent-primary size-4 cursor-pointer"
            checked={allChecked}
            onChange={toggleAll}
            aria-label="Tümünü seç"
          />
          <span className="text-muted-foreground">
            {selected.length > 0 ? `${selected.length} seçili` : "Toplu işlem"}
          </span>
        </label>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <select
            value={bulkDurum}
            onChange={(e) => setBulkDurum(e.target.value)}
            disabled={pending || selected.length === 0}
            aria-label="Seçililerin durumu"
            className="border-input bg-background h-8 cursor-pointer rounded-md border px-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Durum değiştir…</option>
            {DURUMLAR.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
          <Button
            size="sm"
            variant="outline"
            className="cursor-pointer"
            disabled={pending || selected.length === 0 || !bulkDurum}
            onClick={applyStatus}
          >
            {pending ? "…" : "Uygula"}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="cursor-pointer"
            disabled={pending || selected.length === 0}
            onClick={deleteSelected}
          >
            <Trash2 className="size-3.5" />
            Sil
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead>Kişi / Şirket</TableHead>
              <TableHead>İletişim</TableHead>
              <TableHead>Kanal</TableHead>
              <TableHead>İlgilendiği</TableHead>
              <TableHead>Bütçe</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">Tarih</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.map((l) => (
              <TableRow
                key={l.id}
                data-state={checked.has(l.id) ? "selected" : undefined}
                className="hover:bg-muted/30"
              >
                <TableCell>
                  <input
                    type="checkbox"
                    className="accent-primary size-4 cursor-pointer"
                    checked={checked.has(l.id)}
                    onChange={() => toggle(l.id)}
                    aria-label={`${l.ad_soyad} seç`}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/leadler/${l.id}`}
                    className="block font-medium hover:underline"
                  >
                    {l.ad_soyad}
                  </Link>
                  {l.sirket ? (
                    <div className="text-muted-foreground text-xs">{l.sirket}</div>
                  ) : null}
                </TableCell>
                <TableCell className="text-sm">
                  <div>{l.eposta}</div>
                  {l.telefon ? (
                    <div className="text-muted-foreground text-xs">{l.telefon}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {KANALLAR.find((k) => k.value === l.kanal)?.label}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm">
                  {l.hizmet_kategori?.length ? l.hizmet_kategori.join(", ") : "—"}
                </TableCell>
                <TableCell className="text-sm">{l.butce ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={DURUM_VARIANT[l.durum] ?? "default"}>
                    {DURUMLAR.find((d) => d.value === l.durum)?.label ?? l.durum}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-right text-xs">
                  {formatDate(l.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
