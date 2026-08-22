import React, { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './styles.css'
import SiteHeader from './components/site-header'
import SiteFooter from './components/site-footer'
import DonationModal from './components/donation-modal'
import Home from './pages/home'
import About from './pages/about'
import Seva from './pages/seva'
import Gallery from './pages/gallery'
import Stories from './pages/stories'
import Donate from './pages/donate'
import Contact from './pages/contact'

function App() {
  const [donationOpen, setDonationOpen] = useState(false)
  const onDonate = () => setDonationOpen(true)
  return <div className="min-h-screen bg-[#fbf7ef] text-[#2b2119]"><SiteHeader onDonate={onDonate}/><Routes><Route path="/" element={<Home onDonate={onDonate}/>}/><Route path="/about" element={<About/>}/><Route path="/seva" element={<Seva onDonate={onDonate}/>}/><Route path="/gallery" element={<Gallery/>}/><Route path="/stories" element={<Stories onDonate={onDonate}/>}/><Route path="/donate" element={<Donate/>}/><Route path="/contact" element={<Contact/>}/><Route path="*" element={<Home onDonate={onDonate}/>} /></Routes><SiteFooter onDonate={onDonate}/>{donationOpen && <DonationModal onClose={() => setDonationOpen(false)}/>}</div>
}

createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>)
