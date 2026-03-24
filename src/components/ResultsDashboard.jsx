import { useState } from 'react';
import { ArrowLeft, Leaf, Droplets, Wind, Loader2, CheckCircle } from 'lucide-react';

export default function ResultsDashboard({ area, form, assetCategory, onBack }) {
  const [sendStatus, setSendStatus] = useState('idle');
  const [errorMsg, setErrorMsg] = useState('');

  /* ── Budget calculations (hidden from user, sent in email) ── */
  const budgetRaw = area * 180;
  const budget = budgetRaw.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  /* ── Public aid range (visible to user) ── */
  const minAid = budgetRaw * 0.25;
  const maxAid = budgetRaw * 0.60;
  const minAidFmt = minAid.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const maxAidFmt = maxAid.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  /* ── Environmental metrics ── */
  const energySavings = (area * 4.5).toFixed(0);
  const waterRetention = (area * 400).toLocaleString('es-ES');
  const co2Capture = (area * 2.0).toFixed(0);

  /* ── Combined address for email ── */
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
          surfaceArea: area.toFixed(1),
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100 overflow-auto p-4">
      {/* ── Back button ── */}
      <button
        onClick={onBack}
        className="fixed top-4 left-4 z-[60] flex items-center gap-2 px-4 py-2 rounded-xl
          bg-white border border-gray-200 text-gray-600 text-sm font-medium
          hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* ── Dashboard Card ── */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
        {/* ── Logo header ── */}
        <div className="flex items-center justify-center py-6 sm:py-8 border-b border-gray-100">
          <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-fern">jungle</span>
            <span className="text-gray-800">roofs</span>
          </span>
        </div>

        <div className="px-5 py-6 sm:px-8 sm:py-8 space-y-6 sm:space-y-8">
          {/* ── Area summary ── */}
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Your Rooftop
            </p>
            <p className="text-2xl sm:text-3xl font-extrabold text-fern">
              {area.toFixed(1)} <span className="text-sm sm:text-base font-medium text-gray-400">m²</span>
            </p>
          </div>

          {/* ── Public Aid Block ── */}
          <div className="rounded-2xl bg-fern/5 border border-fern/15 p-4 sm:p-6 text-center">
            <p className="text-xs sm:text-sm font-semibold text-gray-500 mb-2 sm:mb-3 leading-relaxed">
              Jungle Roofs can help you access a public aid amount of
            </p>
            <p className="text-2xl sm:text-4xl font-extrabold text-fern leading-tight">
              {minAidFmt}€ — {maxAidFmt}€
            </p>
          </div>

          {/* ── Environmental Impact KPIs ── */}
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-1 text-center">
              Environmental Impact
            </p>
            <p className="text-center text-sm text-gray-500 leading-snug mb-5">
              This is how your green roof will transform and improve your life
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              <MetricCard
                icon={<Wind size={24} className="text-fern" />}
                title="Energy Savings"
                value={`${energySavings}€`}
                unit="/ year"
              />
              <MetricCard
                icon={<Droplets size={24} className="text-fern" />}
                title="Water Retention"
                value={`${waterRetention}L`}
                unit="/ year"
              />
              <MetricCard
                icon={<Leaf size={24} className="text-fern" />}
                title="CO₂ Captured"
                value={`${co2Capture}Kg`}
                unit="/ year"
              />
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1">
              Disclaimer
            </p>
            <p className="text-[10px] leading-relaxed text-gray-400">
              The figures shown (including cost, timeline, and projected returns/savings) are preliminary estimates
              for information purposes only and are non-binding. They are based on the inputs provided and standard
              assumptions, and do not constitute an offer, quotation, contract, or guarantee of price, schedule,
              performance, or outcomes. Actual scope, timing, and costs may change materially following a technical
              site visit, measurements, condition assessment (e.g., structure/waterproofing/drainage), regulatory
              requirements, access constraints, and supplier availability/market pricing. Any returns/savings are
              projections subject to assumptions and uncertainty. The next step is to schedule a site visit to
              validate the project and confirm a final, binding proposal.
            </p>
          </div>

          {/* ── CTA ── */}
          <div className="flex flex-col items-center gap-3">
            {sendStatus === 'success' ? (
              <div className="flex items-center gap-3 px-5 sm:px-8 py-3 sm:py-4 rounded-xl bg-fern/10 border border-fern/20 text-fern text-xs sm:text-sm font-semibold">
                <CheckCircle size={20} />
                Your request has been sent! Our team will contact you shortly.
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
                  {sendStatus === 'sending' ? 'Sending...' : 'I want to schedule a meeting with Jungle Roofs'}
                </button>
                {sendStatus === 'error' && (
                  <p className="text-red-500 text-sm">
                    Something went wrong: {errorMsg || 'Unknown error'}. Please try again.
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

/* ── Metric card ── */
function MetricCard({ icon, title, value, unit }) {
  return (
    <div className="flex flex-col items-center text-center gap-1.5 p-4 rounded-xl bg-gray-50 border border-gray-100">
      {icon}
      <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">{title}</p>
      <p className="text-lg font-extrabold text-gray-800 leading-tight">
        {value}
      </p>
      <p className="text-[10px] text-gray-400">{unit}</p>
    </div>
  );
}
