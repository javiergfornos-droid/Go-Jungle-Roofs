import { useState } from 'react';
import { ArrowLeft, Leaf, Droplets, Wind, Loader2, CheckCircle } from 'lucide-react';

/* ── Gantt phases (1-indexed weeks) ── */
const PHASES = [
  { label: 'Tratamiento y caracterización estructural', start: 1, end: 2, color: '#7FA068' },
  { label: 'Limpieza y saneado',                        start: 3, end: 3, color: '#9AB888' },
  { label: 'Adecuación y Ordenamiento',                 start: 3, end: 5, color: '#6B8A56' },
  { label: 'Impermeabilización y Vegetación',            start: 4, end: 8, color: '#7FA068' },
  { label: 'Sistema de Riego',                           start: 8, end: 8, color: '#9AB888' },
  { label: 'Instalaciones y Agua',                       start: 9, end: 11, color: '#6B8A56' },
  { label: 'Acabados e Inmobiliario',                    start: 12, end: 12, color: '#7FA068' },
];

const TOTAL_WEEKS = 12;

const ROLE_LABELS = { pioneer: 'Pioneer', sponsor: 'Sponsor', host: 'Host' };

export default function ResultsDashboard({ area, form, role, assetCategory, energyBill, onBack }) {
  const [sendStatus, setSendStatus] = useState('idle'); // idle | sending | success | error

  const budgetRaw = area * 180;
  const budget = budgetRaw.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const publicAidRaw = budgetRaw * 0.25;
  const publicAid = publicAidRaw.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const energySavings = (area * 4.5).toFixed(0);
  const waterRetention = (area * 400).toLocaleString('es-ES');
  const co2Capture = (area * 2.0).toFixed(0);

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
          address: form.address,
          role: ROLE_LABELS[role] || role,
          assetType: form.assetType,
          assetCategory,
          buildingRole: form.buildingRole,
          timeLinked: form.timeLinked,
          objective: form.objective,
          timeline: form.timeline,
          energyBill,
          surfaceArea: area.toFixed(1),
          totalBudget: budget,
          publicAid,
        }),
      });
      if (!res.ok) throw new Error('Send failed');
      setSendStatus('success');
    } catch {
      setSendStatus('error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col text-white overflow-hidden">
      {/* ── Background image (same as Hero) ── */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/60" />

      {/* ── Top bar ── */}
      <div className="relative z-10 flex items-center gap-3 px-6 py-4 border-b border-white/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-md bg-white/10
            border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <h1 className="text-lg font-bold tracking-wide">Your Personal Budget</h1>
        <span className="ml-auto text-sm text-white/50">{area.toFixed(1)} m² rooftop</span>
      </div>

      {/* ── Three-column dashboard ── */}
      <div className="relative z-10 flex-1 flex flex-col lg:flex-row gap-5 p-5 overflow-auto min-h-0">

        {/* ── LEFT: Financial Estimate ── */}
        <div className="lg:w-[22%] flex flex-col items-center justify-center rounded-2xl
          border border-fern/20 bg-black/40 backdrop-blur-md p-8 text-center shrink-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-fern-light mb-2">
            Total Estimated Budget
          </p>
          <p className="text-5xl font-extrabold text-fern leading-tight">
            {budget}€
          </p>
          <p className="text-sm text-white/40 mt-2">
            Based on {area.toFixed(1)} m² × 180 €/m²
          </p>

          <div className="w-full border-t border-white/10 mt-5 pt-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-fern-light mb-1">
              Public Aid Estimate
            </p>
            <p className="text-3xl font-extrabold text-fern leading-tight">
              {publicAid}€
            </p>
            <p className="text-xs text-white/40 mt-1">25% subsidy</p>
          </div>
        </div>

        {/* ── CENTER: Gantt Timeline ── */}
        <div className="lg:flex-1 flex flex-col rounded-2xl border border-fern/20 bg-black/40 backdrop-blur-md p-6 min-w-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-fern-light mb-5">
            Cronograma — 12 Weeks
          </p>

          {/* Week labels */}
          <div className="flex mb-2 pl-[200px]">
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
              <div key={i} className="flex-1 text-center text-[10px] text-white/40 font-medium">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Gantt rows */}
          <div className="flex flex-col gap-2">
            {PHASES.map((phase) => {
              const leftPct = ((phase.start - 1) / TOTAL_WEEKS) * 100;
              const widthPct = ((phase.end - phase.start + 1) / TOTAL_WEEKS) * 100;
              return (
                <div key={phase.label} className="flex items-center gap-3 h-9">
                  {/* Phase label */}
                  <div className="w-[200px] shrink-0 text-xs text-white/70 text-right pr-2 truncate" title={phase.label}>
                    {phase.label}
                  </div>
                  {/* Bar track */}
                  <div className="flex-1 relative h-full rounded-lg bg-white/[0.04]">
                    {/* Grid lines */}
                    {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
                      <div
                        key={i}
                        className="absolute top-0 bottom-0 border-l border-white/[0.06]"
                        style={{ left: `${((i) / TOTAL_WEEKS) * 100}%` }}
                      />
                    ))}
                    {/* Bar */}
                    <div
                      className="absolute top-1 bottom-1 rounded-md transition-all"
                      style={{
                        left: `${leftPct}%`,
                        width: `${widthPct}%`,
                        backgroundColor: phase.color,
                        boxShadow: `0 0 12px ${phase.color}44`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Week axis */}
          <div className="flex mt-3 pl-[200px]">
            {Array.from({ length: TOTAL_WEEKS }, (_, i) => (
              <div key={i} className="flex-1 border-t border-white/[0.08]" />
            ))}
          </div>
        </div>

        {/* ── RIGHT: Environmental Impact ── */}
        <div className="lg:w-[22%] flex flex-col justify-center gap-6 rounded-2xl
          border border-fern/20 bg-black/40 backdrop-blur-md p-8 shrink-0">
          <p className="text-sm font-semibold uppercase tracking-wider text-fern-light mb-1 text-center">
            Environmental Impact
          </p>

          <MetricCard
            icon={<Wind size={28} className="text-[#7FA068]" />}
            title="Ahorro Climatización"
            value={`${energySavings} €`}
            unit="/ year"
          />

          <MetricCard
            icon={<Droplets size={28} className="text-[#5BA4CF]" />}
            title="Retención Pluvial"
            value={`${waterRetention} L`}
            unit="/ year"
          />

          <MetricCard
            icon={<Leaf size={28} className="text-[#9AB888]" />}
            title="Captura CO₂"
            value={`${co2Capture} Kg`}
            unit="/ year"
          />
        </div>
      </div>

      {/* ── Footer CTA ── */}
      <div className="relative z-10 px-6 py-5 border-t border-white/10 flex flex-col items-center gap-3">
        {sendStatus === 'success' ? (
          <div className="flex items-center gap-3 px-10 py-4 rounded-xl bg-fern/20 border border-fern/30 text-fern-light text-sm font-semibold">
            <CheckCircle size={20} />
            Your request has been sent! Our team will contact you shortly to schedule the meeting.
          </div>
        ) : (
          <>
            <button
              onClick={handleSchedule}
              disabled={sendStatus === 'sending'}
              className={`flex items-center justify-center gap-2 px-10 py-4 rounded-xl text-white text-sm font-bold uppercase tracking-wider
                transition-all shadow-lg shadow-[#7FA068]/20
                ${sendStatus === 'sending'
                  ? 'bg-[#7FA068]/60 cursor-wait'
                  : 'bg-[#7FA068] hover:brightness-110 cursor-pointer'}`}
            >
              {sendStatus === 'sending' && <Loader2 size={18} className="animate-spin" />}
              {sendStatus === 'sending' ? 'Sending...' : 'I want to schedule a meeting with Jungle Roofs'}
            </button>
            {sendStatus === 'error' && (
              <p className="text-red-400 text-sm">
                Something went wrong. Please try again or contact us directly.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

/* ── Metric card sub-component ── */
function MetricCard({ icon, title, value, unit }) {
  return (
    <div className="flex flex-col items-center text-center gap-2 p-4 rounded-xl bg-fern/5 border border-fern/15">
      {icon}
      <p className="text-xs font-semibold uppercase tracking-wider text-fern-light">{title}</p>
      <p className="text-2xl font-extrabold text-white leading-tight">
        {value} <span className="text-sm font-medium text-white/40">{unit}</span>
      </p>
    </div>
  );
}
