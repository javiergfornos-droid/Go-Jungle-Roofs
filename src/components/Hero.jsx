export default function Hero({ onStart }) {
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

        {/* Single CTA */}
        <div className="mt-10 md:mt-16 flex justify-center">
          <button
            onClick={onStart}
            className="px-8 py-3 md:px-10 md:py-4 rounded-full bg-fern text-white text-base md:text-lg font-bold uppercase tracking-wider
              hover:brightness-110 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer
              shadow-lg shadow-fern/30"
          >
            Go to the simulator
          </button>
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
