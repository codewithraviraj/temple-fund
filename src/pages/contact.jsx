import React from 'react'
import { Landmark, MessageCircle, Phone } from 'lucide-react'
import { CONFIG } from '../data/config'
import { ContactCard, PageShell } from '../components/ui'

export default function Contact() {
  return <PageShell title="Visit & connect" subtitle="Come for darshan, volunteer during seva, or get in touch with the temple trust."><div className="grid gap-6 md:grid-cols-3"><ContactCard icon={<Landmark/>} title="Temple address">{CONFIG.address}<br/>{CONFIG.location}</ContactCard><ContactCard icon={<Phone/>} title="Phone">{CONFIG.phone}<br/><span className="text-xs text-[#796759]">9:00 AM – 7:00 PM</span></ContactCard><ContactCard icon={<MessageCircle/>} title="Email">{CONFIG.email}<br/><span className="text-xs text-[#796759]">For donations, receipts & seva queries</span></ContactCard></div><div className="mt-8 rounded-[2rem] bg-[#4b1b0d] p-8 text-white"><div className="text-xs font-bold uppercase tracking-[0.2em] text-amber-200/70">Temple timings</div><div className="mt-3 grid gap-3 sm:grid-cols-3"><div><div className="font-semibold">Morning Darshan</div><div className="text-sm text-amber-50/65">6:00 AM – 11:00 AM</div></div><div><div className="font-semibold">Evening Darshan</div><div className="text-sm text-amber-50/65">4:30 PM – 8:30 PM</div></div><div><div className="font-semibold">Annadanam</div><div className="text-sm text-amber-50/65">12:30 PM – 2:00 PM</div></div></div></div></PageShell>
}
