import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface FooterProps {
  logo: React.ReactNode;
  brandName: string;
  socialLinks: Array<{ icon: React.ReactNode; href: string; label: string }>;
}

export function Footer({
  logo,
  brandName,
  socialLinks,
}: FooterProps) {
  const description = "All-in-one campus portal for MIT ADT University";

  return (
    <footer className="border-t-2 border-gray-200 bg-white py-8 sm:py-10 md:py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TOP SECTION: Logo + Tagline + Social Icons (Centered)          */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-col items-center gap-4 sm:gap-5 md:gap-6">
          {/* Logo & Brand Name */}
          <Link to="/" className="inline-flex items-center gap-2" aria-label={brandName}>
            {logo}
            <span className="font-extrabold text-2xl sm:text-3xl text-gray-900 tracking-tight">
              {brandName}
            </span>
          </Link>

          {/* Tagline */}
          <p className="text-xs sm:text-sm text-gray-600 text-center max-w-md">
            {description}
          </p>

          {/* Social Icons - Centered Horizontal Row */}
          <ul className="flex list-none gap-4 sm:gap-5">
            {socialLinks.map((link, i) => (
              <li key={i}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-lg border-2 border-gray-200 text-gray-600 hover:text-[#00C6A7] hover:border-[#00C6A7] hover:bg-gray-50 active:bg-white transition-all duration-200"
                  asChild
                >
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                  >
                    {link.icon}
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 my-6 sm:my-8 md:my-10" />

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* BOTTOM SECTION: Centered Links Row                             */}
        {/* Home | Sign In | Sign Up | Privacy | Terms                     */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
          <Link
            to="/"
            className="text-sm text-gray-600 font-medium hover:text-[#00C6A7] transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/login"
            className="text-sm text-gray-600 font-medium hover:text-[#00C6A7] transition-colors duration-200"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="text-sm text-gray-600 font-medium hover:text-[#00C6A7] transition-colors duration-200"
          >
            Sign Up
          </Link>
          <Link
            to="/privacy"
            className="text-sm text-gray-600 font-medium hover:text-[#00C6A7] transition-colors duration-200"
          >
            Privacy
          </Link>
          <Link
            to="/terms"
            className="text-sm text-gray-600 font-medium hover:text-[#00C6A7] transition-colors duration-200"
          >
            Terms
          </Link>
        </div>

        {/* Copyright */}
        <div className="mt-6 sm:mt-8">
          <p className="text-xs text-gray-500 text-center">
            © 2026 {brandName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
