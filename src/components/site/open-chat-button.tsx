"use client";

import type { ComponentPropsWithoutRef, MouseEvent } from "react";

import { Button } from "@/components/ui/button";

export const OPEN_CHAT_EVENT = "kirmizierik:open-chat";

export function OpenChatButton(
  props: ComponentPropsWithoutRef<typeof Button>,
) {
  const { onClick, ...rest } = props;
  return (
    <Button
      {...rest}
      onClick={(e: MouseEvent<HTMLButtonElement>) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT));
      }}
    />
  );
}
