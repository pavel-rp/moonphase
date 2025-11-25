"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import { cn } from "@/lib/utils/utils";

export type HeaderLink = { href: string; label: string };

interface HeaderProps {
  links?: HeaderLink[];
  logo?: ReactNode;
}

const defaultLinks: HeaderLink[] = [{ href: "/", label: "Dashboard" }];

export function Header({ links = defaultLinks, logo }: HeaderProps) {
  const pathname = usePathname();

  const Logo = (
    <div className="flex items-center gap-2 opacity-70">
      {logo ?? <span>N</span>}
      <span className="text-xl font-bold">MOONPHASE</span>
    </div>
  );

  return (
    <header className="fixed inset-x-0 top-0 z-50 pointer-events-none">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-zinc-900/20 to-transparent dark:from-zinc-900/35 backdrop-blur-md border-b border-white/10"
      />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative z-10 flex h-16 items-center justify-between">
          {Logo}
          <nav className="pointer-events-auto">
            <ul className="flex items-center gap-2">
              {links.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <li key={link.href}>
                    {isActive ? (
                      <span
                        className="rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md bg-white/10 ring-1 ring-white/20 text-zinc-400 cursor-default"
                        aria-current="page"
                      >
                        {link.label}
                      </span>
                    ) : (
                      <Link
                        href={link.href}
                        className={cn(
                          "rounded-full px-4 py-1.5 text-sm font-medium backdrop-blur-md",
                          "bg-white/5 ring-1 ring-white/10 text-zinc-100/90",
                          "hover:bg-white/8 hover:ring-white/20 transition",
                          "outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                        )}
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
