"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserInfo } from "@/lib/user";

interface NavLink {
  name: string;
  href: string;
}

interface MainNavProps {
  navLinks: NavLink[];
  user: UserInfo | null;
}

export function MainNav({ navLinks, user }: MainNavProps) {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-6">
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary no-underline",
            pathname === link.href
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          {link.name}
        </Link>
      ))}

      {user && (
        <Link
          href="/console"
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary no-underline",
            pathname.startsWith("/console")
              ? "text-foreground"
              : "text-muted-foreground",
          )}
        >
          控制台
        </Link>
      )}
    </nav>
  );
}
