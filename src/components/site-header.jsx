import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Languages } from "lucide-react";

import { CONFIG } from "../data/config";
import { DonateButton } from "./ui";
import { useLanguage } from "../context/language-context";

export default function SiteHeader({ onDonate }) {
  const [open, setOpen] = useState(false);

  const location = useLocation();

  const { language, toggleLanguage, t } =
    useLanguage();

  const navItems = [
    [t.nav.home, "/"],
    [t.nav.about, "/about"],
    [t.nav.seva, "/seva"],
    [t.nav.gallery, "/gallery"],
    [t.nav.stories, "/stories"],
  ];

  return (
    <>
      {/* TOP CAMPAIGN BAR */}

      <div className="bg-[#4b1b0d] px-4 py-2 text-center text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-50/90">
        {language === "en"
          ? "A sacred place deserves a lasting tomorrow · Campaign closes"
          : "एक पवित्र स्थान का भविष्य सुरक्षित होना चाहिए · अभियान समाप्त होगा"}{" "}
        {CONFIG.campaign.endDate}
      </div>

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-[#e8dbc9] bg-[#fbf7ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          {/* LOGO */}

          <Link
            to="/"
            className="flex items-center gap-3"
            onClick={() => setOpen(false)}
          >
            <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-[#8f2d0c] to-[#bb5c20] text-amber-50 shadow-lg">
              <span className="font-serif text-xl">
                ॐ
              </span>
            </div>

            <div>
              <div className="font-serif text-lg font-semibold leading-none text-[#4b1b0d]">
                {CONFIG.shortName}
              </div>

              <div className="mt-1 max-w-[220px] text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8b7564] sm:tracking-[0.18em]">
                {CONFIG.templeName}
              </div>
            </div>
          </Link>

          {/* DESKTOP NAV */}

          <nav className="hidden items-center gap-6 md:flex lg:gap-7">
            {navItems.map(([label, href]) => (
              <Link
                key={href}
                to={href}
                className={`text-sm font-semibold transition ${
                  location.pathname === href
                    ? "text-[#8f2d0c]"
                    : "text-[#624f40] hover:text-[#8f2d0c]"
                }`}
              >
                {label}
              </Link>
            ))}

            {/* DONATE LINK */}

            <Link
              to="/donate"
              className={`text-sm font-semibold transition ${
                location.pathname === "/donate"
                  ? "text-[#8f2d0c]"
                  : "text-[#624f40] hover:text-[#8f2d0c]"
              }`}
            >
              {t.nav.donate}
            </Link>
          </nav>

          {/* DESKTOP ACTIONS */}

          <div className="hidden items-center gap-3 md:flex">
            {/* LANGUAGE SWITCH */}

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#dfd0be] bg-white px-4 py-2 text-sm font-bold text-[#7e300d] transition hover:border-[#b9743e] hover:bg-[#fff1da]"
              aria-label={
                language === "en"
                  ? "Switch to Hindi"
                  : "Switch to English"
              }
            >
              <Languages size={16} />

              {language === "en"
                ? "हिंदी"
                : "English"}
            </button>

            {/* DONATE BUTTON */}

            <div>
              <DonateButton
                onClick={onDonate}
              />
            </div>
          </div>

          {/* MOBILE ACTIONS */}

          <div className="flex items-center gap-2 md:hidden">
            {/* MOBILE LANGUAGE */}

            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-[#dfd0be] bg-white px-3 py-2 text-xs font-bold text-[#7e300d] transition hover:bg-[#fff1da]"
              aria-label={
                language === "en"
                  ? "Switch to Hindi"
                  : "Switch to English"
              }
            >
              <Languages size={14} />

              {language === "en"
                ? "हिंदी"
                : "EN"}
            </button>

            {/* MENU BUTTON */}

            <button
              type="button"
              className="cursor-pointer rounded-xl border border-[#e1d2c0] p-2 transition hover:bg-[#fff1da] md:hidden"
              onClick={() => setOpen(!open)}
              aria-label={
                open
                  ? "Close menu"
                  : "Open menu"
              }
              aria-expanded={open}
            >
              {open ? (
                <X size={20} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}

        {open && (
          <div className="border-t border-[#e8dbc9] bg-[#fffaf2] px-4 pb-5 md:hidden">
            <nav>
              {navItems.map(
                ([label, href]) => (
                  <Link
                    key={href}
                    to={href}
                    className={`block border-b border-[#eadfcf] py-3 text-sm font-semibold ${
                      location.pathname === href
                        ? "text-[#8f2d0c]"
                        : "text-[#624f40]"
                    }`}
                    onClick={() =>
                      setOpen(false)
                    }
                  >
                    {label}
                  </Link>
                )
              )}

              {/* MOBILE DONATE */}

              <Link
                to="/donate"
                className={`block border-b border-[#eadfcf] py-3 text-sm font-semibold ${
                  location.pathname ===
                  "/donate"
                    ? "text-[#8f2d0c]"
                    : "text-[#624f40]"
                }`}
                onClick={() =>
                  setOpen(false)
                }
              >
                {t.nav.donate}
              </Link>
            </nav>

            {/* MOBILE DONATE BUTTON */}

            <div className="pt-4">
              <DonateButton
                onClick={() => {
                  setOpen(false);
                  onDonate();
                }}
                full
              />
            </div>
          </div>
        )}
      </header>
    </>
  );
}