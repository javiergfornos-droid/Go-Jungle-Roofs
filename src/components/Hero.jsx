const roles = [
  {
    emoji: '🏡',
    name: 'The Pioneer',
    ctaLine1: 'I WISH TO BUILD A JUNGLE',
    ctaLine2: 'GO TO THE SIMULATOR',
    role: 'pioneer',
  },
  {
    emoji: '🏢',
    name: 'The Sponsor',
    ctaLine1: 'I WISH TO FINANCE A JUNGLE',
    ctaLine2: 'GO TO THE SIMULATOR',
    role: 'sponsor',
  },
  {
    emoji: '🏙️',
    name: 'The Host',
    ctaLine1: 'I WISH TO DONATE A JUNGLE',
    ctaLine2: 'GO TO THE SIMULATOR',
    role: 'host',
  },
];

export default function Hero({ onRoleSelect }) {
  return (
    <section id="hero" className="relative w-full min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background image with overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero-bg.jpeg')" }}
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-5xl w-full py-24 md:py-32">
        {/* Tagline */}
        <p className="text-fern-light text-sm font-semibold tracking-[0.3em] uppercase mb-4">
          Making Cities Cooler
        </p>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-tight tracking-tight">
          JOIN THE<br />JUNGLE
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-white/80 max-w-xl mx-auto leading-relaxed">
          Transforming grey cities into living, breathing ecosystems — one rooftop at a time.
        </p>

        {/* Role Selector Grid */}
        <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-4xl mx-auto">
          {roles.map((r) => (
            <div
              key={r.role}
              className="flex flex-col items-center gap-3"
            >
              {/* Large Emoji */}
              <span className="text-6xl leading-none" role="img">
                {r.emoji}
              </span>

              {/* Role Name */}
              <h3 className="text-lg font-semibold text-white uppercase tracking-wider">
                {r.name}
              </h3>

              {/* CTA Button */}
              <button
                onClick={() => onRoleSelect(r.role)}
                className="mt-1 px-6 py-3 rounded-full bg-fern text-white font-semibold hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col items-center leading-tight"
              >
                <span className="text-sm">{r.ctaLine1}</span>
                <span className="text-xs font-medium text-white/70">{r.ctaLine2}</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 rounded-full border-2 border-white/50 flex items-start justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white/70" />
        </div>
      </div>
    </section>
  );
}
