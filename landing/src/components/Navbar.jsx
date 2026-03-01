import { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="flex items-baseline gap-0.5 select-none">
          <span className="text-2xl font-extrabold text-fern tracking-tight">jungle</span>
          <span className="text-2xl font-extrabold text-black tracking-tight">roofs</span>
        </a>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#projects" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Projects
          </a>
          <a href="#impact" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Impact
          </a>
          <a href="#technology" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            Technology
          </a>
          <a
            href="#hero"
            className="ml-2 px-6 py-2 rounded-full bg-fern text-white text-sm font-semibold hover:bg-fern-dark transition-colors"
          >
            Join
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-gray-600"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 pb-4 flex flex-col gap-3">
          <a href="#projects" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
            Projects
          </a>
          <a href="#impact" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
            Impact
          </a>
          <a href="#technology" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
            Technology
          </a>
          <a
            href="#hero"
            className="mt-1 px-6 py-2 rounded-full bg-fern text-white text-sm font-semibold text-center"
            onClick={() => setMobileOpen(false)}
          >
            Join
          </a>
        </div>
      )}
    </nav>
  );
}
