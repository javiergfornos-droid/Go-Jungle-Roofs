import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Transformations from './components/Transformations';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Hero />
      <Transformations />
      <Footer />
    </div>
  );
}
