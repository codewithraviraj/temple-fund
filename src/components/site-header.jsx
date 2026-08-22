import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { CONFIG } from "../data/config";
import { DonateButton } from "./ui";

const navItems = [
  ["Home", "/"],
  ["Our Temple", "/about"],
  ["Seva", "/seva"],
  ["Gallery", "/gallery"],
  ["Stories", "/stories"],
];

export default function SiteHeader({ onDonate }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  return (
    <>
      <div className="bg-[#4b1b0d] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-50/90">
        A sacred place deserves a lasting tomorrow · Campaign closes{" "}
        {CONFIG.campaign.endDate}
      </div>
      <header className="sticky top-0 z-30 border-b border-[#e8dbc9] bg-[#fbf7ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#8f2d0c] to-[#bb5c20] text-amber-50 shadow-lg">
              <span className="font-serif text-xl">ॐ</span>
            </div>
            <div>
              <div className="font-serif text-lg font-semibold leading-none text-[#4b1b0d]">
                {CONFIG.shortName}
              </div>
              <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8b7564]">
                {CONFIG.templeName}
              </div>
            </div>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className={`text-sm font-semibold transition ${location.pathname === href ? "text-[#8f2d0c]" : "text-[#624f40] hover:text-[#8f2d0c]"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:block cursor-pointer">
            <DonateButton onClick={onDonate} />
          </div>
          <button
            className="rounded-xl border border-[#e1d2c0] p-2 md:hidden"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
        {open && (
          <div className="border-t border-[#e8dbc9] bg-[#fffaf2] px-4 pb-4 md:hidden">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className="block border-b border-[#eadfcf] py-3 text-sm font-semibold"
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/donate"
              className="block border-b border-[#eadfcf] py-3 text-sm font-semibold"
              onClick={() => setOpen(false)}
            >
              Donate
            </Link>
            <div className="pt-4">
              <DonateButton onClick={onDonate} full />
            </div>
          </div>
        )}
      </header>
    </>
  );
}
