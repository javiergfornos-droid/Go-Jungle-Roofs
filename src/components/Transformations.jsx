import { useState } from 'react';

const projects = [
  {
    id: 1,
    label: 'Residential',
    title: 'Urban Home Rooftop',
    location: 'Madrid, Spain',
    area: '120 m²',
    images: {
      before: '/images/project1-before.jpg',
      during: '/images/project1-during.jpg',
      after: '/images/project1-after.jpg',
    },
  },
  {
    id: 2,
    label: 'Corporate',
    title: 'Office Complex Green Deck',
    location: 'Barcelona, Spain',
    area: '850 m²',
    images: {
      before: '/images/project2-before.jpg',
      during: '/images/project2-during.jpg',
      after: '/images/project2-after.jpg',
    },
  },
  {
    id: 3,
    label: 'Public',
    title: 'Municipal Library Rooftop',
    location: 'Lisbon, Portugal',
    area: '400 m²',
    images: {
      before: '/images/project3-before.jpg',
      during: '/images/project3-during.jpg',
      after: '/images/project3-after.jpg',
    },
  },
];

const phases = [
  { key: 'before', label: 'Before' },
  { key: 'during', label: 'During' },
  { key: 'after', label: 'After' },
];

export default function Transformations() {
  const [activeProject, setActiveProject] = useState(0);
  const [activePhase, setActivePhase] = useState('before');

  const project = projects[activeProject];
  const imageSrc = project.images[activePhase];

  return (
    <section id="projects" className="py-20 md:py-28 bg-beige">
      <div className="max-w-6xl mx-auto px-6">
        {/* Section header */}
        <p className="text-fern text-sm font-semibold tracking-[0.2em] uppercase text-center">
          Proven Results
        </p>
        <h2 className="mt-3 text-3xl sm:text-4xl md:text-5xl font-extrabold text-black text-center tracking-tight">
          Real Transformations
        </h2>
        <p className="mt-4 text-body text-center max-w-xl mx-auto">
          Explore our case studies — from bare concrete to thriving ecosystems.
        </p>

        {/* Project Selector Tabs */}
        <div className="mt-12 flex justify-center gap-2">
          {projects.map((p, idx) => (
            <button
              key={p.id}
              onClick={() => {
                setActiveProject(idx);
                setActivePhase('before');
              }}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                activeProject === idx
                  ? 'bg-fern text-white shadow-lg shadow-fern/25'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Image viewer */}
        <div className="mt-8 relative rounded-2xl overflow-hidden bg-gray-200 aspect-[16/9] max-w-4xl mx-auto shadow-xl">
          {/* Cross-fade images — render all, show active via opacity */}
          {projects.map((p, pIdx) =>
            phases.map((ph) => (
              <img
                key={`${p.id}-${ph.key}`}
                src={p.images[ph.key]}
                alt={`${p.label} — ${ph.label}`}
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
                  pIdx === activeProject && ph.key === activePhase
                    ? 'opacity-100'
                    : 'opacity-0'
                }`}
              />
            ))
          )}

          {/* Fallback placeholder when no image */}
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm pointer-events-none">
            <span className="bg-white/80 px-4 py-2 rounded-lg">
              {project.label} — {activePhase.charAt(0).toUpperCase() + activePhase.slice(1)}
            </span>
          </div>

          {/* Project info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent">
            <h3 className="text-white font-bold text-lg">{project.title}</h3>
            <p className="text-white/70 text-sm">
              {project.location} · {project.area}
            </p>
          </div>
        </div>

        {/* Phase Toggle */}
        <div className="mt-6 flex justify-center">
          <div className="inline-flex bg-white rounded-full p-1 shadow-sm border border-gray-200">
            {phases.map((ph) => (
              <button
                key={ph.key}
                onClick={() => setActivePhase(ph.key)}
                className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer ${
                  activePhase === ph.key
                    ? 'bg-fern text-white shadow-md'
                    : 'text-gray-500 hover:text-gray-800'
                }`}
              >
                {ph.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
