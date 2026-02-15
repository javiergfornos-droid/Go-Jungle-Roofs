import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Transformations from './components/Transformations';
import Footer from './components/Footer';
import MapCalculator from './components/MapCalculator';

export default function App() {
  const [view, setView] = useState('landing');
  const [selectedRole, setSelectedRole] = useState(null);

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setView('map');
  };

  const handleBack = () => {
    setView('landing');
    setSelectedRole(null);
  };

  if (view === 'map') {
    return <MapCalculator role={selectedRole} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero onRoleSelect={handleRoleSelect} />
      <Transformations />
      <Footer />
    </div>
  );
}
