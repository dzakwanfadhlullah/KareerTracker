"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { navLinks } from "@/content/landing-copy";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="navbar">
      <div className="nav-inner">
        <a href="#" className="brand" aria-label="KareerTrack home">
          <span className="brand-mark">K</span>
          <span>KareerTrack <small>by MagangKareer</small></span>
        </a>
        <nav className="nav-links" aria-label="Main navigation">
          {navLinks.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="button button-primary button-small" href="#pricing">Join Early Access</a>
          <button
            className="menu-button"
            type="button"
            aria-label={open ? "Tutup menu" : "Buka menu"}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="mobile-menu" aria-label="Mobile navigation">
          {navLinks.map((item) => (
            <a key={item.href} href={item.href} onClick={() => setOpen(false)}>{item.label}</a>
          ))}
        </nav>
      )}
    </header>
  );
}
