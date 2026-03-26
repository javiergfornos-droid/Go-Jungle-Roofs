import { useTranslation } from 'react-i18next';
import { ArrowLeft } from 'lucide-react';

export default function AboutUs({ onBack }) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-black transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            {t('map.back')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-16 md:py-24">
        {/* Title */}
        <p className="text-fern text-sm font-semibold tracking-[0.2em] uppercase text-center">
          <span className="text-fern">jungle</span>
          <span className="text-black">roofs</span>
        </p>
        <h1 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-black text-center tracking-tight">
          {t('aboutUs.title')}
        </h1>

        {/* Two-column layout: text + image */}
        <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          {/* Text */}
          <div className="flex-1">
            <p className="text-lg sm:text-xl leading-relaxed text-body">
              {t('aboutUs.text')}
            </p>
          </div>

          {/* Photo */}
          <div className="flex-1 max-w-md w-full">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-100">
              <img
                src="/images/image_0.png"
                alt="Marco and Lorenzo — Jungle Roofs founders"
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
