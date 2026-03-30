import { useState } from 'react';
import { ArrowLeft, Leaf, Droplets, Wind, Loader2, CheckCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function ResultsDashboard({ area, form, assetCategory, onBack }) {
  const [sendStatus, setSendStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const { t } = useTranslation();

  /* -- Budget calculations (hidden from user, sent in email) -- */
  const budgetRaw = Math.ceil(area * 180);
  const budget = budgetRaw.toLocaleString('es-ES');

  /* -- Public aid range (visible to user) -- */
  const minAid = Math.ceil(budgetRaw * 0.25);
  const maxAid = Math.ceil(budgetRaw * 0.60);
  const minAidFmt = minAid.toLocaleString('es-ES');
  const maxAidFmt = maxAid.toLocaleString('es-ES');

  /* -- Environmental metrics -- */
  const energySavings = Math.ceil(area * 4.5).toLocaleString('es-ES');
  const waterRetention = Math.ceil(area * 400).toLocaleString('es-ES');
  const co2Capture = Math.ceil(area * 2.0).toLocaleString('es-ES');

  /* -- Combined address for email -- */
  const fullAddress = [form.street, form.postalCode, form.city, form.country].filter(Boolean).join(', ');

  const handleSchedule = async () => {
    setSendStatus('sending');
    try {
      const res = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          surname: form.surname,
          email: form.email,
          phone: form.phone,
          address: fullAddress,
          assetType: form.assetType,
          assetCategory,
          buildingRole: form.buildingRole,
          objective: form.objective,
          timeline: form.timeline,
          surfaceArea: Math.ceil(area),
          totalBudget: budget,
          publicAidMin: minAidFmt,
          publicAidMax: maxAidFmt,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setSendStatus('success');
    } catch (e) {
      setErrorMsg(e.message);
      setSendStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white overflow-auto p-4 pt-16 sm:pt-4">
      {/* -- Back button -- */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-xl
          bg-white border border-gray-200 text-gray-600 text-sm font-medium
          hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
      >
        <ArrowLeft size={16} />
        {t('map.back')}
      </button>

      {/* -- Dashboard Card -- */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* -- Logo header -- */}
        <div className="flex items-center justify-center py-6 sm:py-8 border-b border-gray-100">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-fern">jungle</span>
            <span className="text-gray-800">roofs</span>
          </span>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
          {/* -- Area summary -- */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {t('results.yourRooftop')}
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-fern">
              {Math.ceil(area)} <span className="text-sm sm:text-base font-medium text-gray-400">m²</span>
            </p>
          </div>

          {/* -- Public Aid Block -- */}
          <div className="rounded-2xl bg-fern/5 border border-fern/15 p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 leading-relaxed">
              {t('results.publicAidBefore')}{' '}
              <span className="text-fern font-extrabold uppercase">{t('results.publicAidHighlight')}</span>{' '}
              {t('results.publicAidAfter')}
            </p>
            <p className="text-2xl sm:text-4xl font-extrabold text-fern leading-tight">
              {minAidFmt}€ — {maxAidFmt}€
            </p>
          </div>

          {/* -- Environmental Impact KPIs -- */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1 text-center">
              {t('results.environmentalImpact')}
            </p>
            <p className="text-center text-sm text-gray-500 leading-snug mb-5">
              {t('results.impactSubtitle')}
            </p>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <MetricCard
                icon={<Wind size={20} className="text-fern" />}
                title={t('results.energySavings')}
                value={energySavings}
                suffix="€"
                unit={t('results.perYear')}
              />
              <MetricCard
                icon={<Droplets size={20} className="text-fern" />}
                title={t('results.waterRetention')}
                value={waterRetention}
                suffix=" L"
                unit={t('results.perYear')}
              />
              <MetricCard
                icon={<Leaf size={20} className="text-fern" />}
                title={t('results.co2Captured')}
                value={co2Capture}
                suffix=" Kg"
                unit={t('results.perYear')}
              />
            </div>
          </div>

          {/* -- Disclaimer -- */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              {t('results.disclaimer')}
            </p>
            <p className="text-[10px] leading-relaxed text-gray-400">
              {t('results.disclaimerText')}
            </p>
          </div>

          {/* -- CTA -- */}
          <div className="flex flex-col items-center gap-3">
            {sendStatus === 'success' ? (
              <div className="flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-fern/10 border border-fern/20 text-fern text-xs sm:text-sm font-semibold">
                <CheckCircle size={20} />
                {t('results.successMessage')}
              </div>
            ) : (
              <>
                <button
                  onClick={handleSchedule}
                  disabled={sendStatus === 'sending'}
                  className={`w-full flex items-center justify-center gap-2 py-3 sm:py-4 rounded-xl text-white text-xs sm:text-sm font-bold uppercase tracking-wider
                    transition-all shadow-lg shadow-fern/20
                    ${sendStatus === 'sending'
                      ? 'bg-fern/60 cursor-wait'
                      : 'bg-fern hover:brightness-110 cursor-pointer'}`}
                >
                  {sendStatus === 'sending' && <Loader2 size={18} className="animate-spin" />}
                  {sendStatus === 'sending' ? t('results.sending') : t('results.scheduleMeeting')}
                </button>
                {sendStatus === 'error' && (
                  <p className="text-red-500 text-sm">
                    {t('results.errorMessage', { error: errorMsg || 'Unknown error' })}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* -- Metric card -- */
function MetricCard({ icon, title, value, suffix, unit }) {
  return (
    <div className="flex flex-col items-center text-center gap-1 p-2 sm:p-4 rounded-xl bg-gray-50 border border-gray-100 min-w-0">
      {icon}
      <p className="text-[8px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <p className="text-sm sm:text-lg font-extrabold text-gray-800 leading-tight">
        {value}<span className="text-xs sm:text-sm font-medium text-gray-500">{suffix}</span>
      </p>
      <p className="text-[9px] sm:text-[10px] text-gray-400">{unit}</p>
    </div>
  );
}
