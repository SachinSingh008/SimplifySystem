import Link from "next/link";
import { Zap, Mail, Github, Twitter } from "lucide-react";

const links = {
  Product: ["Features", "Templates", "Pricing", "Changelog"],
  Company: ["About", "Blog", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
};

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green-brand-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="font-poppins font-bold text-white">
                Simplify<span className="text-green-brand-400">Systems</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-6">
              GST-compliant invoicing for Indian freelancers and small businesses.
            </p>
            <div className="flex gap-3">
              <a href="mailto:hello@simplifysystems.in" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Mail size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Twitter size={16} />
              </a>
              <a href="#" className="p-2 rounded-lg hover:bg-slate-800 transition-colors">
                <Github size={16} />
              </a>
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-sm hover:text-green-brand-400 transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} SimplifySystems. Made with ♥ in India.
          </p>
          <p className="text-xs text-slate-600">
            GST Invoice Management · ₹ INR · Indian Business Platform
          </p>
        </div>
      </div>
    </footer>
  );
}
