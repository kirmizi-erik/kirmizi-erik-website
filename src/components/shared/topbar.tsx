import { LogOut } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { logout } from "@/app/dashboard/actions";

type TopbarProps = {
  email: string;
};

export function Topbar({ email }: TopbarProps) {
  const initials = email.slice(0, 2).toUpperCase();

  return (
    <header className="bg-background/80 sticky top-0 z-10 flex h-14 items-center justify-end gap-3 border-b px-6 backdrop-blur">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-0.5">
              <span className="text-sm">Giriş yapan</span>
              <span className="text-muted-foreground text-xs">{email}</span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <form action={logout}>
            <DropdownMenuItem asChild>
              <button type="submit" className="w-full cursor-pointer">
                <LogOut className="mr-2 size-4" />
                Çıkış yap
              </button>
            </DropdownMenuItem>
          </form>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
