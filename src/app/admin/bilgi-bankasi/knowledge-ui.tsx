"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import {
  createKnowledgeAction,
  deleteKnowledgeAction,
  reingestAction,
  updateKnowledgeAction,
  type KbActionResult,
} from "./actions";

export type KnowledgeEntry = {
  id: string;
  question_tr: string;
  answer_tr: string;
  question_en: string | null;
  answer_en: string | null;
  source_url: string | null;
  updated_at: string;
};

const textareaClass =
  "border-input bg-transparent placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-xs focus-visible:ring-1 focus-visible:outline-none";

function KnowledgeFields({
  entry,
  prefillQuestion,
  prefillAnswer,
}: {
  entry?: KnowledgeEntry;
  prefillQuestion?: string;
  prefillAnswer?: string;
}) {
  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <Label>Soru (TR) *</Label>
        <textarea
          name="question_tr"
          required
          rows={2}
          defaultValue={entry?.question_tr ?? prefillQuestion ?? ""}
          placeholder="Ziyaretçinin sorabileceği soru"
          className={textareaClass}
        />
      </div>
      <div className="space-y-1.5">
        <Label>Cevap (TR) *</Label>
        <textarea
          name="answer_tr"
          required
          rows={4}
          defaultValue={entry?.answer_tr ?? prefillAnswer ?? ""}
          placeholder="Asistanın vermesini istediğin cevap"
          className={textareaClass}
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Soru (EN — opsiyonel)</Label>
          <textarea
            name="question_en"
            rows={2}
            defaultValue={entry?.question_en ?? ""}
            className={textareaClass}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Cevap (EN — opsiyonel)</Label>
          <textarea
            name="answer_en"
            rows={2}
            defaultValue={entry?.answer_en ?? ""}
            className={textareaClass}
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label>Kaynak link (opsiyonel)</Label>
        <Input
          name="source_url"
          defaultValue={entry?.source_url ?? ""}
          placeholder="/hizmetler/ai gibi site yolu veya tam URL"
        />
      </div>
    </div>
  );
}

function useKbSubmit() {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  const run = (action: () => Promise<KbActionResult>, onSuccess?: () => void) => {
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        toast.success(result.message);
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  };

  return { pending, run };
}

export function KnowledgeCreateForm({
  prefillQuestion,
  prefillAnswer,
}: {
  prefillQuestion?: string;
  prefillAnswer?: string;
}) {
  const { pending, run } = useKbSubmit();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form
      ref={formRef}
      action={(formData) =>
        run(
          () => createKnowledgeAction(formData),
          () => formRef.current?.reset(),
        )
      }
      className="space-y-4"
    >
      <KnowledgeFields prefillQuestion={prefillQuestion} prefillAnswer={prefillAnswer} />
      <Button type="submit" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Ekleniyor…" : "Ekle ve eğit"}
      </Button>
    </form>
  );
}

export function KnowledgeEditForm({ entry }: { entry: KnowledgeEntry }) {
  const { pending, run } = useKbSubmit();

  return (
    <form
      action={(formData) => run(() => updateKnowledgeAction(entry.id, formData))}
      className="space-y-4 pt-3"
    >
      <KnowledgeFields entry={entry} />
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending && <Loader2 className="size-4 animate-spin" />}
        {pending ? "Güncelleniyor…" : "Güncelle"}
      </Button>
    </form>
  );
}

export function KnowledgeDeleteButton({ entry }: { entry: KnowledgeEntry }) {
  const { pending, run } = useKbSubmit();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      className="text-destructive hover:text-destructive cursor-pointer"
      onClick={() => {
        if (
          window.confirm(
            `"${entry.question_tr.slice(0, 80)}" kaydını silmek üzeresin. Asistan bu bilgiyi artık kullanmayacak. Bu işlem geri alınamaz. Emin misin?`,
          )
        ) {
          run(() => deleteKnowledgeAction(entry.id));
        }
      }}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
      Sil
    </Button>
  );
}

export function ReingestButton() {
  const { pending, run } = useKbSubmit();

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => run(() => reingestAction())}
    >
      {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCcw className="size-4" />}
      {pending ? "İndeksleniyor…" : "Site içeriğini yeniden indeksle"}
    </Button>
  );
}
