import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'es', label: 'ESP' },
  { code: 'ca', label: 'CAT' },
  { code: 'en', label: 'EN' },
];

export default function Navbar({ onNavigate }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, i18n } = useTranslation();

  const changeLang = (code) => {
    i18n.changeLanguage(code);
  };

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
            {t('nav.projects')}
          </a>
          <a href="#impact" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            {t('nav.impact')}
          </a>
          <a href="#technology" className="text-sm font-medium text-gray-600 hover:text-black transition-colors">
            {t('nav.technology')}
          </a>
          <button
            onClick={() => onNavigate('about')}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-pointer"
          >
            {t('nav.aboutUs')}
          </button>

          {/* Language selector */}
          <div className="flex items-center gap-1 ml-2">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide transition-all cursor-pointer
                  ${i18n.language === code
                    ? 'bg-fern text-white'
                    : 'text-gray-500 hover:text-black hover:bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <a
            href="#hero"
            className="ml-2 px-6 py-2 rounded-full bg-fern text-white text-sm font-semibold hover:bg-fern-dark transition-colors"
          >
            {t('nav.join')}
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
            {t('nav.projects')}
          </a>
          <a href="#impact" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
            {t('nav.impact')}
          </a>
          <a href="#technology" className="py-2 text-sm font-medium text-gray-600" onClick={() => setMobileOpen(false)}>
            {t('nav.technology')}
          </a>
          <button
            onClick={() => { onNavigate('about'); setMobileOpen(false); }}
            className="py-2 text-sm font-medium text-gray-600 text-left cursor-pointer"
          >
            {t('nav.aboutUs')}
          </button>

          {/* Mobile language selector */}
          <div className="flex items-center gap-2 py-2">
            {LANGUAGES.map(({ code, label }) => (
              <button
                key={code}
                onClick={() => changeLang(code)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-all cursor-pointer
                  ${i18n.language === code
                    ? 'bg-fern text-white'
                    : 'text-gray-500 hover:text-black bg-gray-100'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <a
            href="#hero"
            className="mt-1 px-6 py-2 rounded-full bg-fern text-white text-sm font-semibold text-center"
            onClick={() => setMobileOpen(false)}
          >
            {t('nav.join')}
          </a>
        </div>
      )}
    </nav>
  );
}
