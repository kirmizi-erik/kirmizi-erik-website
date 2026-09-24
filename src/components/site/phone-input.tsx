"use client";

import type { ComponentProps } from "react";

import { Input } from "@/components/ui/input";

// type="tel" harfleri engellemez; yazılan/yapıştırılan harf anında silinir.
const NOT_PHONE_CHARS = /[^\d\s+()-]/g;

export function PhoneInput({ onInput, ...props }: ComponentProps<typeof Input>) {
  return (
    <Input
      type="tel"
      inputMode="tel"
      autoComplete="tel"
      {...props}
      onInput={(e) => {
        const el = e.currentTarget;
        const cleaned = el.value.replace(NOT_PHONE_CHARS, "");
        if (cleaned !== el.value) el.value = cleaned;
        onInput?.(e);
      }}
    />
  );
}
