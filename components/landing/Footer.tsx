'use client';

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-[#7a9e1d] to-[#6a8919] text-white py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <span className="text-xl font-black text-white">Z</span>
              </div>
              <span className="text-xl font-black">Zariel</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              The global marketplace connecting creators with brands.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-4">Product</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              <li><a href="#" className="hover:text-white transition-colors">How it works</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Success stories</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Company</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">About us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-4">Legal</h4>
            <ul className="space-y-3 text-white/80">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/80 text-sm">© 2026 Zariel. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="text-white/80 hover:text-white transition-colors">Twitter</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Instagram</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="text-white/80 hover:text-white transition-colors">Facebook</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
