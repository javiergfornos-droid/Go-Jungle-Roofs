export default function Footer() {
  const year = new Date().getFullYear();

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
              Making cities cooler, one rooftop at a time. Transforming urban landscapes into living ecosystems.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-1">Company</h4>
            <a href="#projects" className="text-sm hover:text-white transition-colors">Projects</a>
            <a href="#impact" className="text-sm hover:text-white transition-colors">Impact</a>
            <a href="#technology" className="text-sm hover:text-white transition-colors">Technology</a>
            <a href="#join" className="text-sm hover:text-white transition-colors">Join</a>
          </div>

          {/* Legal */}
          <div className="flex flex-col gap-2">
            <h4 className="text-white font-semibold text-sm mb-1">Legal</h4>
            <a href="#" className="text-sm hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-sm hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-sm hover:text-white transition-colors">Cookie Policy</a>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            &copy; {year} Jungle Roofs S.L. All rights reserved.
          </p>
          <div className="flex gap-5">
            {/* Social links — placeholder hrefs */}
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
