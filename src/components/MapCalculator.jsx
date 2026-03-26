import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Undo2, Pencil, Trash2, Info, ArrowLeft, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import ResultsDashboard from './ResultsDashboard';

/* -- Geodesic area (m2) from an array of {lat,lng} -- */
function calcArea(pts) {
  if (pts.length < 3) return 0;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371000;
  let sum = 0;
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length;
    sum +=
      (toRad(pts[j].lng) - toRad(pts[i].lng)) *
      (2 + Math.sin(toRad(pts[i].lat)) + Math.sin(toRad(pts[j].lat)));
  }
  return Math.abs((sum * R * R) / 2);
}

/* -- Leaflet vertex icon -- */
const VERTEX_ICON = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #7FA068;box-shadow:0 0 8px #7FA068"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/* -- Email validation -- */
const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

/* ================================================================== */
export default function MapCalculator({ onBack }) {
  const { t } = useTranslation();

  /* -- Refs -- */
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  /* -- Map state -- */
  const [vertices, setVertices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /* -- Geocoding search -- */
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  /* -- Manual area -- */
  const [manualMode, setManualMode] = useState(false);
  const [manualArea, setManualArea] = useState('');

  /* -- Calculator state -- */
  const [assetCategory, setAssetCategory] = useState('');

  /* -- Form state -- */
  const [form, setForm] = useState({
    name: '',
    surname: '',
    email: '',
    phone: '',
    street: '',
    postalCode: '',
    city: '',
    country: '',
    assetType: '',
    buildingRole: '',
    objective: '',
    timeline: '',
  });

  /* -- Translated option lists -- */
  const ASSET_TYPES = [
    { value: 'Residential', labelKey: 'map.residential' },
    { value: 'Office', labelKey: 'map.office' },
    { value: 'Hotel', labelKey: 'map.hotel' },
    { value: 'Industrial', labelKey: 'map.industrial' },
    { value: 'Commercial', labelKey: 'map.commercial' },
  ];
  const ROLE_OPTIONS = [
    { value: 'Owner', labelKey: 'map.owner' },
    { value: 'President', labelKey: 'map.president' },
    { value: 'Tenant', labelKey: 'map.tenant' },
    { value: 'Administrator', labelKey: 'map.administrator' },
  ];
  const OBJECTIVE_OPTIONS = [
    { value: 'Fix a problem', labelKey: 'map.fixProblem' },
    { value: 'Usable space', labelKey: 'map.usableSpace' },
    { value: 'Green project', labelKey: 'map.greenProject' },
  ];
  const TIMELINE_OPTIONS = [
    { value: 'Urgent', labelKey: 'map.urgent' },
    { value: '6 months', labelKey: 'map.sixMonths' },
    { value: 'No date', labelKey: 'map.noDate' },
  ];

  /* -- Derived values -- */
  const area = useMemo(() => {
    if (manualMode && manualArea) return parseFloat(manualArea);
    return calcArea(vertices);
  }, [vertices, manualMode, manualArea]);

  /* -- Required-field validation -- */
  const nameValid = form.name.trim().length > 0;
  const emailValid = isValidEmail(form.email);
  const addressValid = form.street.trim().length > 0;
  const areaValid = area > 0;
  const isComplete = nameValid && emailValid && addressValid && areaValid;

  /* ---------------------- GEOCODING ---------------------- */
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`,
      );
      const data = await res.json();
      if (data.length > 0) {
        const { lat, lon } = data[0];
        mapRef.current?.setView([parseFloat(lat), parseFloat(lon)], 20);
      }
    } catch {
      /* silently ignore */
    } finally {
      setSearching(false);
    }
  };

  /* ---------------------- MAP INIT ---------------------- */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const map = L.map(el, {
      center: [40.4168, -3.7038],
      zoom: 20,
      zoomControl: false,
    });

    L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      { attribution: 'Tiles &copy; Esri', maxZoom: 22 },
    ).addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    mapRef.current = map;
    layerGroupRef.current = L.layerGroup().addTo(map);

    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        if (mapRef.current) {
          mapRef.current.setView([pos.coords.latitude, pos.coords.longitude], 20);
        }
      },
      () => {},
    );

    return () => {
      map.remove();
      mapRef.current = null;
      layerGroupRef.current = null;
    };
  }, []);

  /* ---------------------- MAP CLICK -> ADD VERTEX ---------------------- */
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const handler = (e) => {
      if (editMode) return;
      setVertices((prev) => [...prev, { lat: e.latlng.lat, lng: e.latlng.lng }]);
    };
    map.on('click', handler);
    return () => map.off('click', handler);
  }, [editMode]);

  /* ---------------------- RENDER POLYGON + MARKERS ---------------------- */
  useEffect(() => {
    const group = layerGroupRef.current;
    if (!group) return;
    group.clearLayers();

    if (vertices.length >= 3) {
      L.polygon(vertices.map((v) => [v.lat, v.lng]), {
        color: '#9AB888',
        fillColor: '#7FA068',
        fillOpacity: 0.25,
        weight: 2,
      }).addTo(group);
    } else if (vertices.length === 2) {
      L.polyline(vertices.map((v) => [v.lat, v.lng]), {
        color: '#9AB888',
        weight: 2,
      }).addTo(group);
    }

    vertices.forEach((v, i) => {
      const marker = L.marker([v.lat, v.lng], {
        icon: VERTEX_ICON,
        draggable: editMode,
      }).addTo(group);

      if (editMode) {
        marker.on('dragend', (e) => {
          const p = e.target.getLatLng();
          setVertices((prev) => {
            const copy = [...prev];
            copy[i] = { lat: p.lat, lng: p.lng };
            return copy;
          });
        });
      }
    });
  }, [vertices, editMode]);

  /* -- Toolbar actions -- */
  const handleUndo = () => setVertices((prev) => prev.slice(0, -1));
  const handleTrash = () => {
    setVertices([]);
    setEditMode(false);
  };

  /* -- Form helpers -- */
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!isComplete) return;
    setShowResults(true);
  };

  /* -- Show results dashboard after submission -- */
  if (showResults) {
    return (
      <ResultsDashboard
        area={area}
        form={form}
        assetCategory={assetCategory}
        onBack={onBack}
      />
    );
  }

  /* ================================================================== */
  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-white overflow-y-auto lg:overflow-hidden">
      {/* --------- LEFT: MAP --------- */}
      <div className="relative w-full lg:w-1/2 h-72 sm:h-80 lg:h-full shrink-0">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Back */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2 rounded-xl
            bg-white border border-gray-200 text-gray-600 text-sm font-medium
            hover:bg-gray-50 transition-colors cursor-pointer shadow-sm"
        >
          <ArrowLeft size={16} />
          {t('map.back')}
        </button>

        {/* -- Address search bar -- */}
        <form
          onSubmit={handleSearch}
          className="absolute top-14 sm:top-4 left-1/2 -translate-x-1/2 z-[1000] flex w-[85%] sm:w-[90%] max-w-md"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('map.searchAddress')}
            className="flex-1 px-4 py-2.5 rounded-l-xl bg-white border border-gray-200
              text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:border-fern/50 shadow-sm"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-4 py-2.5 rounded-r-xl bg-fern text-white border border-fern hover:brightness-110
              transition-all cursor-pointer disabled:opacity-50"
          >
            <Search size={16} />
          </button>
        </form>

        {/* Floating toolbar */}
        <div className="absolute z-[1000] flex gap-3
          bottom-3 left-1/2 -translate-x-1/2 flex-row
          lg:flex-col lg:left-4 lg:bottom-auto lg:top-1/2 lg:-translate-y-1/2 lg:translate-x-0">
          {[
            { Icon: Undo2, action: handleUndo, label: t('map.undo'), disabled: vertices.length === 0 },
            { Icon: Pencil, action: () => setEditMode((p) => !p), label: t('map.edit'), active: editMode },
            { Icon: Trash2, action: handleTrash, label: t('map.trash'), disabled: vertices.length === 0 },
            { Icon: Info, action: () => setShowInfo((p) => !p), label: t('map.info'), active: showInfo },
          ].map(({ Icon, action, label, disabled, active }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer
                border transition-all shadow-sm
                ${active ? 'bg-fern/10 text-fern border-fern/50' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}
                ${disabled ? 'opacity-30 !cursor-not-allowed' : ''}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        {/* Info overlay */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] p-4 rounded-xl bg-white border border-gray-200 text-gray-700 text-sm shadow-sm">
            <p><strong>{t('map.vertices')}:</strong> {vertices.length}</p>
            <p><strong>{t('map.surfaceArea')}:</strong> {area.toFixed(1)} m²</p>
            <p className="text-gray-400 mt-1 text-xs">{t('map.drawHint')}</p>
          </div>
        )}

        {/* Live area badge */}
        {vertices.length >= 3 && !manualMode && (
          <div className="absolute top-4 right-16 z-[1000] px-4 py-2 rounded-xl bg-white border border-fern/30 text-fern text-sm font-semibold shadow-sm">
            {area.toFixed(1)} m²
          </div>
        )}
      </div>

      {/* --------- RIGHT: FORM & CALCULATOR --------- */}
      <div className="w-full lg:w-1/2 lg:h-full lg:overflow-y-auto bg-white text-gray-900">
        <div className="p-6 lg:p-10 max-w-lg mx-auto space-y-8">
          {/* Header */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{t('map.availableSurface')}</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-fern mt-1">
              {area.toFixed(1)} <span className="text-base sm:text-lg font-medium text-gray-400">m²</span>
            </p>
          </div>

          {/* -- Manual area toggle -- */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManualMode((p) => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
                ${manualMode ? 'bg-fern' : 'bg-gray-300'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                  ${manualMode ? 'translate-x-5' : ''}`}
              />
            </button>
            <span className="text-sm text-gray-500">{t('map.manualToggle')}</span>
          </div>

          {manualMode && (
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1.5">
                {t('map.surfaceAreaLabel')} <span className="text-red-400">*</span>
              </label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={manualArea}
                onChange={(e) => setManualArea(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm
                  placeholder-gray-400 focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors"
              />
            </div>
          )}

          {/* -- Calculator -- */}
          <section className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t('map.calculator')}</h3>

            {/* Asset category cards - thick dark green borders */}
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-3">{t('map.propertyType')}</label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: 'Unifamiliar', labelKey: 'map.unifamiliar' },
                  { value: 'Comunidad', labelKey: 'map.comunidad' },
                ].map(({ value, labelKey }) => (
                  <button
                    key={value}
                    onClick={() => setAssetCategory(value)}
                    className={`px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer
                      ${assetCategory === value
                        ? 'border-3 border-fern-dark bg-fern/10 text-fern'
                        : 'border-3 border-fern-dark/30 bg-white text-gray-600 hover:border-fern-dark/60'}`}
                  >
                    {t(labelKey)}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* -- Questionnaire -- */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">{t('map.projectDetails')}</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField label={t('map.name')} value={form.name} onChange={(v) => set('name', v)} required />
              <InputField label={t('map.surname')} value={form.surname} onChange={(v) => set('surname', v)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField
                label={t('map.email')}
                type="email"
                value={form.email}
                onChange={(v) => set('email', v)}
                required
                error={form.email.length > 0 && !emailValid ? t('map.invalidEmail') : ''}
              />
              <InputField label={t('map.phone')} type="tel" value={form.phone} onChange={(v) => set('phone', v)} />
            </div>

            {/* -- Address group -- */}
            <div className="space-y-3 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                {t('map.buildingAddress')} <span className="text-red-400">*</span>
              </p>
              <InputField label={t('map.streetAndNumber')} value={form.street} onChange={(v) => set('street', v)} required />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InputField label={t('map.postalCode')} value={form.postalCode} onChange={(v) => set('postalCode', v)} />
                <InputField label={t('map.city')} value={form.city} onChange={(v) => set('city', v)} />
              </div>
              <InputField label={t('map.country')} value={form.country} onChange={(v) => set('country', v)} />
            </div>

            <SelectField label={t('map.assetType')} value={form.assetType} onChange={(v) => set('assetType', v)} options={ASSET_TYPES} />
            <SelectField label={t('map.role')} value={form.buildingRole} onChange={(v) => set('buildingRole', v)} options={ROLE_OPTIONS} />

            <RadioGroup label={t('map.primaryObjective')} value={form.objective} onChange={(v) => set('objective', v)} options={OBJECTIVE_OPTIONS} />
            <RadioGroup label={t('map.timeline')} value={form.timeline} onChange={(v) => set('timeline', v)} options={TIMELINE_OPTIONS} />
          </section>

          {/* -- Required fields hint -- */}
          {!isComplete && (
            <p className="text-xs text-gray-400">
              {t('map.requiredHint')}
            </p>
          )}

          {/* -- Submit -- */}
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
              ${isComplete
                ? 'bg-fern text-white hover:brightness-110 cursor-pointer'
                : 'bg-gray-100 text-gray-300 cursor-not-allowed'}`}
          >
            {t('map.viewDashboard')}
          </button>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

/* -- tiny sub-components -- */

function InputField({ label, value, onChange, type = 'text', required, error }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1.5">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm
          placeholder-gray-400 focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors"
      />
      {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 text-sm
          focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors appearance-none"
      >
        <option value="" className="bg-white">{t('map.select')}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white">{t(o.labelKey)}</option>
        ))}
      </select>
    </div>
  );
}

function RadioGroup({ label, value, onChange, options }) {
  const { t } = useTranslation();
  return (
    <div>
      <label className="block text-sm font-medium text-gray-500 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer
              ${value === o.value
                ? 'border-3 border-fern-dark bg-fern/10 text-fern'
                : 'border-3 border-fern-dark/30 bg-white text-gray-500 hover:border-fern-dark/60'}`}
          >
            {t(o.labelKey)}
          </button>
        ))}
      </div>
    </div>
  );
}
