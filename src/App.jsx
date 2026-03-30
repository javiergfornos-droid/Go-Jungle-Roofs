import { useState } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Transformations from './components/Transformations';
import Footer from './components/Footer';
import MapCalculator from './components/MapCalculator';
import AboutUs from './components/AboutUs';

export default function App() {
  const [view, setView] = useState('landing');

  if (view === 'map') {
    return (
      <>
        <MapCalculator onBack={() => setView('landing')} />
        <Analytics />
      </>
    );
  }

  if (view === 'about') {
    return (
      <>
        <AboutUs onBack={() => setView('landing')} />
        <Analytics />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen">
        <Navbar onNavigate={setView} />
        <Hero onStart={() => setView('map')} />
        <Transformations />
        <Footer />
      </div>
      <Analytics />
    </>
  );
}
