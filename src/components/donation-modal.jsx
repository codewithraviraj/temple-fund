import React from 'react'
import { X } from 'lucide-react'
import DonationExperience from './donation-experience'

export default function DonationModal({ onClose }) {
  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/45 p-0 sm:items-center sm:p-6"><div className="max-h-[92vh] w-full overflow-auto rounded-t-[2rem] bg-[#fbf7ef] p-5 shadow-2xl sm:max-w-2xl sm:rounded-[2rem] sm:p-7"><div className="mb-4 flex items-center justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.18em] text-[#9b5d25]">Mahaseva 2026</div><div className="mt-1 font-serif text-2xl font-semibold">Offer your seva</div></div><button onClick={onClose} className="rounded-full border border-[#dfd1bf] p-2" aria-label="Close donation dialog"><X size={18}/></button></div><DonationExperience/></div></div>
}
