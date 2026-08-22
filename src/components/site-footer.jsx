import React from "react";
import { Link } from "react-router-dom";
import { MessageCircle } from "lucide-react";
import { CONFIG } from "../data/config";
import { DonateButton } from "./ui";

export default function SiteFooter({ onDonate }) {
  return (
    <footer className="border-t border-[#e8dbc9] bg-[#3d1d12] text-amber-50">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_.7fr_.7fr] lg:px-8">
        <div>
          <div className="font-serif text-2xl font-semibold">
            {CONFIG.shortName}
          </div>
          <p className="mt-3 max-w-md text-sm leading-7 text-amber-50/65">
            A digital front door for temple seva — designed to make giving
            clear, calm and easy for devotees everywhere.
          </p>
          <div className="mt-5 flex gap-3">
            <a
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10"
              href="#"
              aria-label="Instagram"
            >
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle
                  cx="17.5"
                  cy="6.5"
                  r="1"
                  fill="currentColor"
                  stroke="none"
                />
              </svg>
            </a>
            <a
              className="grid h-10 w-10 place-items-center rounded-full border border-white/10"
              href={`mailto:${CONFIG.email}`}
              aria-label="Email"
            >
              <MessageCircle size={17} />
            </a>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/60">
            Explore
          </div>
          <div className="mt-4 space-y-3 text-sm text-amber-50/75">
            <Link className="block hover:text-white" to="/about">
              Our Temple
            </Link>
            <Link className="block hover:text-white" to="/seva">
              Seva
            </Link>
            <Link className="block hover:text-white" to="/gallery">
              Gallery
            </Link>
            <Link className="block hover:text-white" to="/stories">
              Stories
            </Link>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-amber-200/60">
            Support
          </div>
          <div className="mt-4 space-y-3 text-sm text-amber-50/75">
            <Link className="block hover:text-white" to="/contact">
              Contact
            </Link>
            <Link className="block hover:text-white" to="/donate">
              Donate page
            </Link>
            <button
              onClick={onDonate}
              className="block text-left hover:text-white cursor-pointer"
            >
              Quick donate
            </button>
            <div>{CONFIG.phone}</div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-5 text-center text-xs text-amber-50/45">
        © {new Date().getFullYear()} {CONFIG.templeName}.
      </div>
    </footer>
  );
}
