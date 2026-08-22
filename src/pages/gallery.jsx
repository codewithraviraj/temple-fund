import React, { useState } from 'react'
import { CONFIG } from '../data/config'
import { PageShell } from '../components/ui'

export default function Gallery() {
  const [filter, setFilter] = useState('All')
  const categories = ['All', ...new Set(CONFIG.gallery.map(item => item.category))]
  const items = filter === 'All' ? CONFIG.gallery : CONFIG.gallery.filter(item => item.category === filter)
  return <PageShell title="Gallery" subtitle="A visual glimpse of the spaces, rhythms and community moments around the temple."><div className="flex flex-wrap gap-2">{categories.map(c => <button key={c} onClick={() => setFilter(c)} className={`rounded-full px-4 py-2 text-sm font-bold ${filter === c ? 'bg-[#4b1b0d] text-white' : 'border border-[#e2d5c4] bg-white text-[#654f40]'}`}>{c}</button>)}</div><div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map(item => <figure key={item.title} className="group overflow-hidden rounded-[1.5rem] bg-white shadow-[0_12px_35px_rgba(75,36,22,.08)]"><div className="overflow-hidden"><img src={item.image} alt={item.title} className="h-80 w-full object-cover transition duration-500 group-hover:scale-105" loading="lazy"/></div><figcaption className="p-5"><div className="text-xs font-bold uppercase tracking-[0.16em] text-[#9b5d25]">{item.category}</div><div className="mt-2 font-serif text-2xl font-semibold">{item.title}</div></figcaption></figure>)}</div></PageShell>
}
