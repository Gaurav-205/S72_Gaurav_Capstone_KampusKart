import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './button';

interface FooterProps {
  logo: ReactNode;
  brandName: string;
  socialLinks: Array<{ icon: ReactNode; href: string; label: string }>;
  mainLinks: Array<{ href: string; label: string }>;
  legalLinks: Array<{ href: string; label: string }>;
  copyright: { text: string; license?: string };
}

export function Footer({
  logo,
  brandName,
  socialLinks,
  mainLinks,
  legalLinks,
  copyright,
}: FooterProps) {
  return (
    <footer className="border-t-2 border-gray-100 bg-white pb-8 pt-12 lg:pb-12 lg:pt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand & Socials Column */}
          <div className="lg:col-span-4 flex flex-col items-start gap-6">
            <Link to="/" className="flex items-center gap-x-3 group" aria-label={brandName}>
              <div className="p-1 rounded-lg transition-transform duration-300 group-hover:scale-110">
                {logo}
              </div>
              <span className="font-black text-2xl text-black tracking-tight">{brandName}</span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Your all-in-one campus companion for a smarter, more connected student life.
            </p>
            <ul className="flex items-center gap-3 list-none p-0 m-0">
              {socialLinks.map((link, i) => (
                <li key={i}>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-xl border-2 border-gray-100 text-gray-500 hover:text-[#F05A25] hover:border-[#F05A25] hover:bg-gray-50 transition-all duration-300"
                    asChild
                  >
                    <a href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label}>
                      {link.icon}
                    </a>
                  </Button>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-black text-sm uppercase tracking-wider">Quick Links</h4>
              <nav>
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {mainLinks.map((link, i) => (
                    <li key={i}>
                      <Link
                        to={link.href}
                        className="text-sm font-medium text-gray-600 hover:text-[#00C6A7] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            <div className="flex flex-col gap-4">
              <h4 className="font-bold text-black text-sm uppercase tracking-wider">Legal</h4>
              <nav>
                <ul className="list-none p-0 m-0 flex flex-col gap-3">
                  {legalLinks.map((link, i) => (
                    <li key={i}>
                      <Link
                        to={link.href}
                        className="text-sm font-medium text-gray-600 hover:text-[#00C6A7] transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <div className="text-sm text-gray-500 font-medium text-center md:text-left">
            {copyright.text} • {copyright.license || "All rights reserved."}
          </div>
        </div>
      </div>
    </footer>
  );
}
