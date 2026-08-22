import React from 'react'
import { PageShell, CampaignCallout } from '../components/ui'
import { CONFIG } from '../data/config'

export default function Stories({ onDonate }) {
  return <><PageShell title="Devotee stories" subtitle="Small acts of seva often become the stories people remember for years."><div className="grid gap-6 md:grid-cols-3">{CONFIG.testimonials.map(t => <article key={t.name} className="rounded-[1.5rem] border border-[#eadfcf] bg-white p-7"><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b5d25]">{t.city}</div><h2 className="mt-3 font-serif text-2xl font-semibold">{t.name}</h2><p className="mt-4 text-sm leading-8 text-[#705e50]">“{t.quote}”</p></article>)}</div><div className="mt-12 rounded-[2rem] border border-[#e8dbc9] bg-[#fffaf2] p-8"><div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between"><div><div className="text-xs font-bold uppercase tracking-[0.2em] text-[#9b5d25]">Join the story</div><h2 className="mt-2 font-serif text-3xl font-semibold">Your next act of seva can become someone else’s memory.</h2></div></div></div></PageShell><CampaignCallout onDonate={onDonate}/></>
}
