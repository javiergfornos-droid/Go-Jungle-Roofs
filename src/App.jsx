import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Transformations from './components/Transformations';
import Footer from './components/Footer';
import MapCalculator from './components/MapCalculator';

export default function App() {
  const [view, setView] = useState('landing');

  if (view === 'map') {
    return <MapCalculator onBack={() => setView('landing')} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero onStart={() => setView('map')} />
      <Transformations />
      <Footer />
    </div>
  );
}
