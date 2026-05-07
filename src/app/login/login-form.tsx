"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { loginWithMagicLink } from "./actions";

export function LoginForm() {
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);

  return (
    <form
      action={(formData) =>
        startTransition(async () => {
          const result = await loginWithMagicLink(formData);
          if (result.ok) {
            toast.success(result.message);
            setSubmitted(true);
          } else {
            toast.error(result.error);
          }
        })
      }
      className="space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="email">E-posta adresi</Label>
        <Input
          id="email"
          name="email"
          type="email"
          placeholder="ornek@kirmizi-erik.com"
          required
          disabled={isPending || submitted}
          autoComplete="email"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending || submitted}>
        {isPending
          ? "Gönderiliyor..."
          : submitted
            ? "E-postayı kontrol edin"
            : "Giriş bağlantısı gönder"}
      </Button>

      {submitted ? (
        <p className="text-muted-foreground text-center text-sm">
          E-postanıza gelen bağlantıya tıklayarak giriş yapın.
        </p>
      ) : null}
    </form>
  );
}
