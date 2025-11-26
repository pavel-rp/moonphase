"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
}

export function NavLink({ href, children }: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  if (isActive) {
    return (
      <span
        className="rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md bg-white/10 ring-1 ring-white/20 text-zinc-400 cursor-default"
        aria-current="page"
      >
        {children}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={cn(
        "rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md",
        "bg-white/5 ring-1 ring-white/10 text-zinc-100/90",
        "hover:bg-white/8 hover:ring-white/20 transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
      )}
    >
      {children}
    </Link>
  );
}


