"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AlertOctagon, LayoutDashboard, Map, Menu, ShieldAlert, X } from "lucide-react";

const links = [
  { href: "/", label: "Home", icon: ShieldAlert },
  { href: "/map", label: "3D Map", icon: Map },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/response", label: "Response", icon: AlertOctagon },
];

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isMapRoute = pathname?.startsWith("/map");

  return (
    <>
      <header className={`navbar ${isMapRoute ? "navbar-dark" : ""}`}>
        <div className="navbar-inner">
          <Link href="/" className="navbar-brand" onClick={() => setOpen(false)}>
            <span className="navbar-brand-mark">
              <ShieldAlert size={17} aria-hidden />
            </span>
            IDMRES
          </Link>

          <nav className="navbar-links" aria-label="Primary">
            {links.map(({ href, label, icon: Icon }) => {
              const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
              return (
                <Link key={href} href={href} className={`navbar-link ${active ? "active" : ""}`}>
                  <Icon size={15} aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <button
            className="navbar-toggle"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </button>
        </div>
      </header>

      <nav
        className={`navbar-mobile-menu ${isMapRoute ? "dark" : ""} ${open ? "open" : ""}`}
        aria-label="Mobile"
      >
        {links.map(({ href, label, icon: Icon }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`navbar-link ${active ? "active" : ""}`}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} aria-hidden />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
