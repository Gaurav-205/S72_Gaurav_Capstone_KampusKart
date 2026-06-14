import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

type FooterProps = {
  logo: ReactNode;
  brandName: string;
  socialLinks: {
    href: string;
    label: string;
    icon: ReactNode;
  }[];
  mainLinks: {
    href: string;
    label: string;
  }[];
  legalLinks: {
    href: string;
    label: string;
  }[];
  copyright: {
    text: string;
    license?: string;
  };
};

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  const [activeModal, setActiveModal] = useState<'privacy' | 'terms' | null>(null);

  return (
    <>
      <footer className="border-t border-gray-200 bg-white pt-14 pb-8 mt-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* TOP */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 pb-12">
            {/* BRAND */}
            <div>
              <Link to="/" className="flex items-center gap-3" aria-label={brandName}>
                {logo}

                <span className="text-2xl font-extrabold text-black tracking-tight">
                  {brandName}
                </span>
              </Link>

              <p className="mt-5 text-gray-600 leading-7 text-sm">
                Your all-in-one campus companion for events, clubs, facilities, navigation, and
                student life.
              </p>

              {/* SOCIALS */}
              <div className="flex items-center gap-3 mt-6">
                {socialLinks.map((link, i) => (
                  <a
                    key={i}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-[#00C6A7] hover:text-white hover:border-[#00C6A7] transition-all duration-300 hover:-translate-y-1"
                  >
                    {link.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* QUICK LINKS */}
            <div>
              <h3 className="text-lg font-bold text-black mb-5">Quick Links</h3>

              <ul className="space-y-4">
                {mainLinks.map((link, i) => (
                  <li key={i}>
                    <a
                      href={link.label.toLowerCase() === 'home' ? '/' : link.href}
                      className="text-gray-600 hover:text-[#00C6A7] transition-colors duration-300"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* LEGAL */}
            <div>
              <h3 className="text-lg font-bold text-black mb-5">Legal</h3>

              <ul className="space-y-4">
                {legalLinks.map((link, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() =>
                        setActiveModal(
                          link.label.toLowerCase().includes('privacy') ? 'privacy' : 'terms'
                        )
                      }
                      className="text-gray-600 hover:text-[#00C6A7] transition-colors duration-300"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* EXTRA */}
            <div>
              <h3 className="text-lg font-bold text-black mb-5">KampusKart</h3>

              <p className="text-gray-600 text-sm leading-7">
                Simplifying campus life for students through smart navigation, clubs, events, and
                community features.
              </p>

              <div className="mt-5">
                <span className="inline-flex items-center rounded-full bg-[#00C6A7]/10 px-4 py-2 text-sm font-medium text-[#00C6A7]">
                  🚀 Built for Students
                </span>
              </div>
            </div>
          </div>

          {/* BOTTOM */}
          <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              {copyright.text}
              {copyright.license && <span> {copyright.license}</span>}
            </div>

            <div className="text-sm text-gray-500">Made with ❤️ for students</div>
          </div>
        </div>
      </footer>

      {/* GLASSMORPHISM MODAL */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4">
          <div className="relative max-w-2xl w-full rounded-3xl border border-white/30 bg-white/80 backdrop-blur-xl shadow-2xl p-8">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-4 right-5 text-gray-500 hover:text-black text-2xl"
            >
              ×
            </button>

            {/* TITLE */}
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              {activeModal === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
            </h2>

            <p className="text-sm text-gray-500 mb-6">Last updated: May 24, 2026</p>

            {/* CONTENT */}
            {activeModal === 'privacy' ? (
              <div className="space-y-4 text-gray-700 leading-7">
                <p>
                  We collect basic information such as your name, email address, and profile details
                  to improve your KampusKart experience.
                </p>

                <p>
                  Your data is used only to provide campus-related features like events, clubs,
                  facilities, and navigation.
                </p>

                <p>We do not sell your personal information to third parties.</p>
              </div>
            ) : (
              <div className="space-y-4 text-gray-700 leading-7">
                <p>
                  By using KampusKart, you agree to use the platform responsibly and follow campus
                  community guidelines.
                </p>

                <p>
                  Users should not misuse the platform, post harmful content, or violate privacy of
                  other students.
                </p>

                <p>KampusKart may update these terms when needed.</p>
              </div>
            )}

            {/* BUTTON */}
            <button
              onClick={() => setActiveModal(null)}
              className="mt-8 rounded-xl bg-[#00C6A7] px-6 py-3 text-white font-semibold hover:bg-[#00b093] transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
