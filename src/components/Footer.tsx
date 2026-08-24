import { Link } from "@tanstack/react-router";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRegion } from "@/hooks/use-region";
import { getEmergency } from "@/lib/emergency-numbers";

export function Footer() {
  const { lang } = useLanguage();
  const { country } = useRegion();
  const emergency = getEmergency(lang, country);
  return (
    <footer className="border-t border-ink-300 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <Link to="/" className="group flex flex-col items-center leading-none md:items-start">
            <div className="flex items-baseline gap-1">
              <span className="font-serif text-2xl tracking-tight text-ink-900">Mrs</span>
              <span className="font-serif text-2xl italic text-rose-500">ANONymous</span>
              <span className="font-serif text-xl text-ink-300">.org</span>
            </div>
          </Link>

          <nav className="flex flex-wrap justify-center gap-6 text-sm text-ink-500">
            <Link to="/about" className="hover:text-rose-500">About us</Link>
            <Link to="/women" className="hover:text-rose-500">Women</Link>
            <Link to="/girls" className="hover:text-rose-500">Girls</Link>
            <Link to="/resources" className="hover:text-rose-500">Resources</Link>
            <Link to="/contact" className="hover:text-rose-500">Contact</Link>
            <Link to="/privacy" className="hover:text-rose-500">Privacy</Link>
            <Link to="/terms" className="hover:text-rose-500">Terms</Link>
            <Link to="/settings" className="hover:text-rose-500">Settings</Link>
          </nav>

          <div className="text-xs text-ink-400">
            © {new Date().getFullYear()} MrsANONymous.org
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-3xl text-center text-xs text-ink-400">
          This site is not a substitute for professional help or emergency services. If you are in danger,
          please call {emergency.policeLabel} or a trusted crisis line. All shared stories are anonymous and no identifying
          information is stored.
        </p>
        <div className="mt-3 text-center">
          <a
            href={`tel:${emergency.police}`}
            className="btn-rose !px-4 !py-2 !text-xs"
          >
            Call {emergency.policeLabel}
          </a>
        </div>
      </div>
    </footer>
  );
}
