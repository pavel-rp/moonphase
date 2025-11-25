import React, { ReactNode } from "react";
import { NavLink } from "./nav-link";

export type HeaderLink = { href: string; label: string };

interface HeaderProps {
  links?: HeaderLink[];
  logo?: ReactNode;
}

const defaultLinks: HeaderLink[] = [{ href: "/", label: "Dashboard" }];

export function Header({ links = defaultLinks, logo }: HeaderProps) {
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
              {links.map((link) => (
                <li key={link.href}>
                  <NavLink href={link.href}>{link.label}</NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;
