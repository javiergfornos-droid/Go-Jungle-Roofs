import { useTranslation } from 'react-i18next';

export default function Footer() {
  const year = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer className="bg-black text-white/70">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-baseline gap-0.5 mb-3">
              <span className="text-xl font-extrabold text-fern">jungle</span>
              <span className="text-xl font-extrabold text-white">roofs</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              {t('footer.description')}
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-1">{t('footer.company')}</h4>
            <a href="#projects" className="text-sm hover:text-white transition-colors">{t('nav.projects')}</a>
            <a href="#impact" className="text-sm hover:text-white transition-colors">{t('nav.impact')}</a>
            <a href="#technology" className="text-sm hover:text-white transition-colors">{t('nav.technology')}</a>
            <a href="#join" className="text-sm hover:text-white transition-colors">{t('nav.join')}</a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-1">{t('footer.legal')}</h4>
            <a href="#" className="text-sm hover:text-white transition-colors">{t('footer.privacyPolicy')}</a>
            <a href="#" className="text-sm hover:text-white transition-colors">{t('footer.termsOfService')}</a>
            <a href="#" className="text-sm hover:text-white transition-colors">{t('footer.cookiePolicy')}</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            {t('footer.copyright', { year })}
          </p>
          <div className="flex gap-5">
            <a href="#" aria-label="LinkedIn" className="text-white/50 hover:text-white transition-colors text-sm">
              LinkedIn
            </a>
            <a href="#" aria-label="Instagram" className="text-white/50 hover:text-white transition-colors text-sm">
              Instagram
            </a>
            <a href="#" aria-label="Twitter" className="text-white/50 hover:text-white transition-colors text-sm">
              Twitter
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
