"use client";

import { Input } from "@/components/ui/input";

const NOT_PHONE = /[^\d+\s()-]/g;

/**
 * Telefon alanı — harf girilemez. `type="tel"` yalnızca mobil klavye ipucudur,
 * harfi engellemez; bu bileşen rakam ve +, boşluk, (), - dışındakileri anında siler.
 */
export function PhoneInput(props: React.ComponentProps<typeof Input>) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      {...props}
      onInput={(e) => {
        const el = e.currentTarget;
        const cleaned = el.value.replace(NOT_PHONE, "");
        if (cleaned !== el.value) el.value = cleaned;
        props.onInput?.(e);
      }}
    />
  );
}
