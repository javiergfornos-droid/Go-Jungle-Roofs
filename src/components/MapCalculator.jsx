import { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Undo2, Pencil, Trash2, Info, ArrowLeft, Search } from 'lucide-react';
import ResultsDashboard from './ResultsDashboard';

/* ── Geodesic area (m²) from an array of {lat,lng} ── */
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

/* ── Form option lists ── */
const ASSET_TYPES = ['Residential', 'Office', 'Hotel', 'Industrial', 'Commercial'];
const ROLE_OPTIONS = ['Owner', 'President', 'Tenant', 'Administrator'];
const TIME_OPTIONS = ['< 6 months', '6 months - 2 years', '+ 2 years'];
const OBJECTIVE_OPTIONS = ['Fix a problem', 'Usable space', 'Green project'];
const TIMELINE_OPTIONS = ['Urgent', '6 months', 'No date'];

const ROLE_LABELS = { pioneer: 'Pioneer', sponsor: 'Sponsor', host: 'Host' };

/* ── Leaflet vertex icon ── */
const VERTEX_ICON = L.divIcon({
  className: '',
  html: '<div style="width:14px;height:14px;border-radius:50%;background:#fff;border:2px solid #7FA068;box-shadow:0 0 8px #7FA068"></div>',
  iconSize: [14, 14],
  iconAnchor: [7, 7],
});

/* ================================================================== */
export default function MapCalculator({ role, onBack }) {
  /* ── Refs ── */
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerGroupRef = useRef(null);

  /* ── Map state ── */
  const [vertices, setVertices] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showResults, setShowResults] = useState(false);

  /* ── Geocoding search ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);

  /* ── Manual area ── */
  const [manualMode, setManualMode] = useState(false);
  const [manualArea, setManualArea] = useState('');

  /* ── Calculator state ── */
  const [assetCategory, setAssetCategory] = useState('');
  const [energyBill, setEnergyBill] = useState(150);

  /* ── Form state ── */
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
    timeLinked: '',
    objective: '',
    timeline: '',
  });

  /* ── Derived values ── */
  const area = useMemo(() => {
    if (manualMode && manualArea) return parseFloat(manualArea);
    return calcArea(vertices);
  }, [vertices, manualMode, manualArea]);

  const FORM_KEYS = Object.keys(form);
  const filledCount = FORM_KEYS.filter((k) => form[k].trim() !== '').length;
  const totalChecks = FORM_KEYS.length + 1 + 1; // +category +area
  const polygonDone = manualMode ? !!manualArea : vertices.length >= 3;
  const doneChecks = filledCount + (assetCategory ? 1 : 0) + (polygonDone ? 1 : 0);
  const progress = Math.round((doneChecks / totalChecks) * 100);
  const isComplete = progress === 100;

  /* ────────────────────── GEOCODING ────────────────────── */
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

  /* ────────────────────── MAP INIT ────────────────────── */
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

    /* Try to centre on user location */
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

  /* ────────────────────── MAP CLICK → ADD VERTEX ────────────────────── */
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

  /* ────────────────────── RENDER POLYGON + MARKERS ────────────────────── */
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

  /* ── Toolbar actions ── */
  const handleUndo = () => setVertices((prev) => prev.slice(0, -1));
  const handleTrash = () => {
    setVertices([]);
    setEditMode(false);
  };

  /* ── Form helpers ── */
  const set = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = () => {
    if (!isComplete) return;
    console.log('Submit', { ...form, assetCategory, energyBill, area, role, vertices });
    setShowResults(true);
  };

  /* ── Show results dashboard after submission ── */
  if (showResults) {
    return (
      <ResultsDashboard
        area={area}
        form={form}
        role={role}
        assetCategory={assetCategory}
        energyBill={energyBill}
        onBack={onBack}
      />
    );
  }

  /* ================================================================== */
  return (
    <div className="fixed inset-0 z-50 flex flex-col lg:flex-row bg-[#0a0a0a]">
      {/* ───────── LEFT: MAP ───────── */}
      <div className="relative w-full lg:w-1/2 h-[50vh] lg:h-full">
        <div ref={containerRef} className="absolute inset-0" />

        {/* Back */}
        <button
          onClick={onBack}
          className="absolute top-4 left-4 z-[1000] flex items-center gap-2 px-4 py-2 rounded-xl
            backdrop-blur-md bg-white/10 border border-white/20 text-white text-sm font-medium
            hover:bg-white/20 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        {/* ── Address search bar ── */}
        <form
          onSubmit={handleSearch}
          className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] flex w-[90%] max-w-md"
        >
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search address..."
            className="flex-1 px-4 py-2.5 rounded-l-xl bg-black/60 backdrop-blur-md border border-white/20
              text-white text-sm placeholder-white/40 focus:outline-none focus:border-fern/50"
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
        <div className="absolute left-4 top-1/2 -translate-y-1/2 z-[1000] flex flex-col gap-3">
          {[
            { Icon: Undo2, action: handleUndo, label: 'Undo', disabled: vertices.length === 0 },
            { Icon: Pencil, action: () => setEditMode((p) => !p), label: 'Edit', active: editMode },
            { Icon: Trash2, action: handleTrash, label: 'Trash', disabled: vertices.length === 0 },
            { Icon: Info, action: () => setShowInfo((p) => !p), label: 'Info', active: showInfo },
          ].map(({ Icon, action, label, disabled, active }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              title={label}
              className={`w-10 h-10 flex items-center justify-center rounded-xl cursor-pointer
                backdrop-blur-md border transition-all
                ${active ? 'bg-fern/30 text-fern-light border-fern/50' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}
                ${disabled ? 'opacity-30 !cursor-not-allowed' : ''}`}
            >
              <Icon size={18} />
            </button>
          ))}
        </div>

        {/* Info overlay */}
        {showInfo && (
          <div className="absolute bottom-4 left-4 right-4 z-[1000] p-4 rounded-xl backdrop-blur-md bg-black/60 border border-white/20 text-white text-sm">
            <p><strong>Vertices:</strong> {vertices.length}</p>
            <p><strong>Surface area:</strong> {area.toFixed(1)} m²</p>
            <p className="text-white/60 mt-1 text-xs">Click on the map to draw your rooftop</p>
          </div>
        )}

        {/* Live area badge */}
        {vertices.length >= 3 && !manualMode && (
          <div className="absolute top-4 right-16 z-[1000] px-4 py-2 rounded-xl backdrop-blur-md bg-black/60 border border-fern/30 text-fern-light text-sm font-semibold">
            {area.toFixed(1)} m²
          </div>
        )}
      </div>

      {/* ───────── RIGHT: FORM & CALCULATOR ───────── */}
      <div className="w-full lg:w-1/2 h-[50vh] lg:h-full overflow-y-auto bg-[#111111] text-white">
        <div className="p-6 lg:p-10 max-w-lg mx-auto space-y-8">
          {/* Role badge */}
          <span className="inline-block px-3 py-1 rounded-full bg-fern/20 text-fern-light text-xs font-semibold uppercase tracking-wider">
            {ROLE_LABELS[role] || role}
          </span>

          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold">Available Surface</h2>
            <p className="text-4xl font-extrabold text-fern mt-1">
              {area.toFixed(1)} <span className="text-lg font-medium text-white/60">m²</span>
            </p>
          </div>

          {/* ── Manual area toggle ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setManualMode((p) => !p)}
              className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer
                ${manualMode ? 'bg-fern' : 'bg-white/20'}`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform
                  ${manualMode ? 'translate-x-5' : ''}`}
              />
            </button>
            <span className="text-sm text-white/70">I prefer to enter surface area manually</span>
          </div>

          {manualMode && (
            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Surface area (m²)</label>
              <input
                type="number"
                min="1"
                step="0.1"
                value={manualArea}
                onChange={(e) => setManualArea(e.target.value)}
                placeholder="e.g. 120"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm
                  placeholder-white/30 focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors"
              />
            </div>
          )}

          {/* ── Calculator ── */}
          <section className="space-y-6">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Calculator</h3>

            {/* Asset category cards */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">Property type</label>
              <div className="grid grid-cols-2 gap-3">
                {['Unifamiliar', 'Comunidad'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setAssetCategory(cat)}
                    className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all cursor-pointer
                      ${assetCategory === cat
                        ? 'border-fern bg-fern/10 text-fern-light'
                        : 'border-white/20 bg-white/5 text-white/70 hover:border-white/40'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Energy bill slider */}
            <div>
              <label className="block text-sm font-medium text-white/70 mb-3">
                Monthly energy bill: <span className="text-white font-bold">{energyBill}€</span>
              </label>
              <input
                type="range"
                min={0}
                max={300}
                value={energyBill}
                onChange={(e) => setEnergyBill(Number(e.target.value))}
                className="jr-slider w-full"
              />
              <div className="flex justify-between text-xs text-white/40 mt-1">
                <span>0€</span>
                <span>300€</span>
              </div>
            </div>
          </section>

          {/* ── Questionnaire ── */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/50">Project Details</h3>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="Name" value={form.name} onChange={(v) => set('name', v)} />
              <InputField label="Surname" value={form.surname} onChange={(v) => set('surname', v)} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <InputField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} />
              <InputField label="Phone" type="tel" value={form.phone} onChange={(v) => set('phone', v)} />
            </div>

            {/* ── Address group ── */}
            <div className="space-y-3 p-4 rounded-xl border border-white/10 bg-white/[0.02]">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40">Building Address</p>
              <InputField label="Street and Number" value={form.street} onChange={(v) => set('street', v)} />
              <div className="grid grid-cols-2 gap-3">
                <InputField label="Postal Code" value={form.postalCode} onChange={(v) => set('postalCode', v)} />
                <InputField label="City" value={form.city} onChange={(v) => set('city', v)} />
              </div>
              <InputField label="Country" value={form.country} onChange={(v) => set('country', v)} />
            </div>

            <SelectField label="Asset Type" value={form.assetType} onChange={(v) => set('assetType', v)} options={ASSET_TYPES} />
            <SelectField label="Role" value={form.buildingRole} onChange={(v) => set('buildingRole', v)} options={ROLE_OPTIONS} />

            <RadioGroup label="Time linked to building" value={form.timeLinked} onChange={(v) => set('timeLinked', v)} options={TIME_OPTIONS} />
            <RadioGroup label="Primary Objective" value={form.objective} onChange={(v) => set('objective', v)} options={OBJECTIVE_OPTIONS} />
            <RadioGroup label="Timeline" value={form.timeline} onChange={(v) => set('timeline', v)} options={TIMELINE_OPTIONS} />
          </section>

          {/* ── Progress tracker ── */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-white/70">Progress</span>
              <span className="text-sm font-bold text-fern">{progress}% Completed</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-fern to-fern-light transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* ── Submit ── */}
          <button
            onClick={handleSubmit}
            disabled={!isComplete}
            className={`w-full py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all
              ${isComplete
                ? 'bg-fern text-white hover:brightness-110 cursor-pointer'
                : 'bg-white/10 text-white/30 cursor-not-allowed'}`}
          >
            View Project Dashboard
          </button>

          <div className="h-8" />
        </div>
      </div>
    </div>
  );
}

/* ── tiny sub-components ── */

function InputField({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={label}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm
          placeholder-white/30 focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors"
      />
    </div>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white text-sm
          focus:outline-none focus:border-fern/50 focus:ring-1 focus:ring-fern/30 transition-colors appearance-none"
      >
        <option value="" className="bg-[#111]">Select...</option>
        {options.map((o) => (
          <option key={o} value={o} className="bg-[#111]">{o}</option>
        ))}
      </select>
    </div>
  );
}

function RadioGroup({ label, value, onChange, options }) {
  return (
    <div>
      <label className="block text-sm font-medium text-white/70 mb-2">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer
              ${value === o
                ? 'border-fern bg-fern/10 text-fern-light'
                : 'border-white/20 bg-white/5 text-white/60 hover:border-white/40'}`}
          >
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}
