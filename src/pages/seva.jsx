import React from 'react'
import { BookOpen, Flame, Landmark, Utensils } from 'lucide-react'
import { PageShell, SectionIntro, ImpactCard, CampaignCallout } from '../components/ui'

export default function Seva({ onDonate }) {
  const items = [
    { icon:<Landmark/>, title:'Temple restoration', amount:'₹5.4L', description:'Support roof repairs, stonework, rain protection and the renewal of sacred spaces.' },
    { icon:<Utensils/>, title:'Annadanam', amount:'₹1.8L', description:'Help serve nourishing meals during daily worship days, special seva and festival gatherings.' },
    { icon:<BookOpen/>, title:'Veda Pathashala', amount:'₹1.1L', description:'Fund learning materials, teacher support and basic student essentials.' },
    { icon:<Flame/>, title:'Nitya Deepa Seva', amount:'₹51K', description:'Keep the daily lamp, oil and related ritual needs prepared throughout the year.' },
  ]
  return <><PageShell title="Seva priorities" subtitle="Choose a purpose that speaks to you. Your contribution can be directed toward the campaign need you care about most."><SectionIntro eyebrow="Where the seva goes" title="Four simple ways to participate." copy="The interface keeps the donation purpose visible so devotees can understand what they are supporting before leaving the site for payment."/><div className="mt-10 grid gap-6 md:grid-cols-2">{items.map(item => <ImpactCard key={item.title} {...item}/>)}</div></PageShell><CampaignCallout onDonate={onDonate}/></>
}
