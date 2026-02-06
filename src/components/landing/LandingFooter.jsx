import { Link } from 'react-router-dom';
import { landingCopy } from './landingCopy';

export default function LandingFooter() {
  return (
    <footer className="bg-[var(--mk-bg)] border-t mk-hairline py-16 px-6 lg:px-10" style={{ borderTopWidth: '1px' }}>
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-9 h-9 rounded-xl bg-[var(--mk-ink)] flex items-center justify-center">
                <span className="font-display text-[var(--mk-bg)] text-lg leading-none font-semibold">W</span>
              </div>
            </div>
            <p className="text-sm text-[var(--mk-ink-2)]">
              {landingCopy.footer.tagline}
            </p>
          </div>
          
          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--mk-ink)] mb-4">Product</h4>
            <ul className="space-y-3">
              {landingCopy.footer.links.product.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--mk-ink)] mb-4">Company</h4>
            <ul className="space-y-3">
              {landingCopy.footer.links.company.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--mk-ink)] mb-4">Contact</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href={`mailto:${landingCopy.footer.links.contact.email}`}
                  className="text-sm text-[var(--mk-ink-2)] hover:text-[var(--mk-ink)] transition-colors"
                >
                  {landingCopy.footer.links.contact.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t mk-hairline" style={{ borderTopWidth: '1px' }}>
          <p className="text-sm text-[var(--mk-ink-2)] text-center">
            {landingCopy.footer.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
