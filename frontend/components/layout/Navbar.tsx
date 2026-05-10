"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Heart, LogIn, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";

const navLinks = [
  { href: "/books", label: "Browse", icon: BookOpen },
  { href: "/wishlist", label: "Wishlist", icon: Heart },
];

export default function Navbar() {
  const pathname = usePathname();
  const { isAuthenticated, user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary">
          <BookOpen size={28} />
          <span className="hidden sm:inline">Shelf To Tales</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-1.5 text-sm font-medium transition-colors ${
                pathname === href
                  ? "text-primary"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <span className="text-sm text-muted">Hi, {user?.name}</span>
              <button
                onClick={logout}
                className="flex items-center gap-1.5 text-sm text-muted hover:text-danger transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors"
            >
              <LogIn size={18} />
              Sign In
            </Link>
          )}
        </div>

        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-muted hover:text-foreground"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 pb-4">
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 py-3 text-sm font-medium ${
                pathname === href ? "text-primary" : "text-muted"
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          ))}
          <div className="border-t border-border pt-3 mt-1">
            {isAuthenticated ? (
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="flex items-center gap-2 text-sm text-danger"
              >
                <LogOut size={18} />
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 text-sm text-primary font-medium"
              >
                <LogIn size={18} />
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
