import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-[72px]">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#00C6A7] mb-8 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Link>

        <h1
          className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4"
          style={{ letterSpacing: '-0.01em' }}
        >
          Privacy Policy
        </h1>

        <p className="text-sm text-gray-400 mb-8">
          Last updated:{' '}
          {new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>

        <div className="space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              1. Information We Collect
            </h2>
            <p>
              We collect information you provide directly to us when you create
              an account, update your profile, or use our services. This
              includes your name, email address, and any other information you
              choose to provide.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              2. How We Use Your Information
            </h2>
            <p>
              We use the information we collect to operate and improve
              KampusKart, communicate with you, and provide a personalised
              campus experience. We do not sell your personal data to third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              3. Data Storage and Security
            </h2>
            <p>
              Your data is stored securely. We implement appropriate technical
              and organisational measures to protect your personal information
              against unauthorised access, alteration, disclosure, or
              destruction.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              4. Cookies
            </h2>
            <p>
              KampusKart uses cookies and similar technologies to maintain your
              session and improve your experience. You can control cookie
              settings through your browser preferences.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              5. Your Rights
            </h2>
            <p>
              You have the right to access, correct, or delete your personal
              data at any time through your profile settings. For further
              requests, contact us at the address below.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              6. Contact
            </h2>
            <p>
              If you have any questions about this Privacy Policy, please
              contact the KampusKart team through the platform.
            </p>
          </section>
        </div>
      </main>

      <Footer
        logo={
          <img
            src="/Logo.webp"
            alt="KampusKart Logo"
            className="h-7 w-7"
          />
        }
        brandName="KampusKart"
        socialLinks={socialLinks}
      />
    </div>
  );
};

export default PrivacyPolicy;