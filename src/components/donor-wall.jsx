import React, { useCallback, useEffect, useState } from "react";
import { AlertCircle, Heart, RefreshCw } from "lucide-react";
import { formatINR } from "../data/config";
import { SectionIntro } from "./ui";

export default function DonorWall() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadDonations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/donations/list");
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error(
          "The donor list is available on the deployed site or when running with Vercel CLI.",
        );
      }
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Could not load donations.");
      }
      setData(result);
    } catch (loadError) {
      console.error("Could not load donor wall:", loadError);
      setError(loadError.message || "Could not load the donor list.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  return (
    <section className="mt-10 rounded-4xl border border-[#eadfcf] bg-[#fffaf2] p-6 sm:p-8">
      <SectionIntro
        eyebrow="Verified donations"
        title="Seva shared by our donors"
        copy="This list includes verified payments only. Donor names appear only when they chose to make them public."
      />

      {error ? (
        <div
          role="alert"
          className="mt-6 flex flex-col gap-3 rounded-xl bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <AlertCircle size={17} />
            {error}
          </span>
          <button
            type="button"
            onClick={loadDonations}
            className="inline-flex items-center gap-2 font-bold underline"
          >
            <RefreshCw size={14} />
            Try again
          </button>
        </div>
      ) : loading ? (
        <p className="mt-6 text-sm text-[#705e50]" aria-live="polite">
          Loading verified donations...
        </p>
      ) : (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-white p-5">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#806c5c]">
                Verified total
              </div>
              <div className="mt-2 font-serif text-3xl font-semibold text-[#7b2d0a]">
                {formatINR(data.totalAmount)}
              </div>
            </div>
            <div className="rounded-2xl bg-white p-5">
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#806c5c]">
                Confirmed donations
              </div>
              <div className="mt-2 font-serif text-3xl font-semibold text-[#7b2d0a]">
                {Number(data.donorCount).toLocaleString("en-IN")}
              </div>
            </div>
          </div>

          <h3 className="mt-7 font-serif text-2xl font-semibold text-[#4b2416]">
            Recent public donors
          </h3>
          {data.donors.length ? (
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {data.donors.map((donor) => (
                <li
                  key={`${donor.name}-${donor.paidAt}-${donor.amount}`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-[#eadfcf] bg-white p-4"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Heart
                      size={16}
                      className="shrink-0 fill-current text-[#9c3b0d]"
                    />
                    <span className="truncate font-semibold text-[#35291f]">
                      {donor.name}
                    </span>
                  </span>
                  <span className="shrink-0 font-bold text-[#7b2d0a]">
                    {formatINR(donor.amount)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 rounded-xl bg-white p-4 text-sm text-[#705e50]">
              No donors have opted in to public recognition yet. Verified
              donations are still included in the totals above.
            </p>
          )}
        </>
      )}
    </section>
  );
}
