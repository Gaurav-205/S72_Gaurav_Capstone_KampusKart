import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{ icon: React.ReactNode; href: string; label: string }>;
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
    <footer className="border-t-2 border-gray-200 pb-6 pt-10 lg:pb-8 lg:pt-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        {/* Top row: brand + socials */}
        <div className="md:flex md:items-start md:justify-between">
          <Link to="/" className="flex items-center gap-x-2" aria-label={brandName}>
            {logo}
            <span className="font-extrabold text-xl text-black tracking-tight">{brandName}</span>
          </Link>
          <ul className="flex list-none mt-6 md:mt-0 space-x-2">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-lg border-2 border-gray-200 text-gray-600 hover:text-[#F05A25] hover:bg-gray-50 transition-colors duration-200"
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

        {/* Bottom row: nav links + copyright */}
        <div className="border-t-2 border-gray-200 mt-6 pt-6 md:mt-4 md:pt-8 lg:grid lg:grid-cols-10">
          <nav className="lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-2 lg:justify-end">
              {mainLinks.map((link, i) => (
                <li key={i} className="my-1 mx-2 shrink-0">
                  <Link
                    to={link.href}
                    className="text-sm font-semibold text-black hover:text-[#00C6A7] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="mt-4 lg:mt-0 lg:col-[4/11]">
            <ul className="list-none flex flex-wrap -my-1 -mx-3 lg:justify-end">
              {legalLinks.map((link, i) => (
                <li key={i} className="my-1 mx-3 shrink-0">
                  <Link
                    to={link.href}
                    className="text-sm text-gray-600 hover:text-[#00C6A7] transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 text-xs leading-6 text-gray-600 lg:mt-0 lg:row-[1/3] lg:col-[1/4]">
            <div>{copyright.text}</div>
            {copyright.license && <div>{copyright.license}</div>}
          </div>
        </div>
      </div>
    </footer>
  );
}
