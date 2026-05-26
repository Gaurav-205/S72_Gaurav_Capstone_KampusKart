import React from 'react';
import { Link } from 'react-router-dom';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col pt-[72px]">
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-10 sm:py-16">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-[#00C6A7] mb-8 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </Link>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4" style={{ letterSpacing: '-0.01em' }}>Terms of Service</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

        <div className="space-y-8 text-gray-700 text-sm sm:text-base leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">1. Acceptance of Terms</h2>
            <p>By accessing or using KampusKart, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the platform.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">2. Use of the Platform</h2>
            <p>KampusKart is intended for use by students, faculty, and staff of the associated campus. You agree to use the platform only for lawful purposes and in a manner that does not infringe the rights of others.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">3. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorised use of your account.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">4. Content</h2>
            <p>You retain ownership of content you post on KampusKart. By posting content, you grant KampusKart a non-exclusive licence to display and distribute that content within the platform. You are solely responsible for the content you post.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">5. Prohibited Conduct</h2>
            <p>You may not use KampusKart to post harmful, offensive, or misleading content; harass other users; attempt to gain unauthorised access to the platform; or violate any applicable laws or regulations.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">6. Intellectual Property</h2>
            <p>All rights, title, and interest in and to KampusKart, including all software, design, and content created by us, are and remain the exclusive property of KampusKart. All rights reserved.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your account at any time for violation of these terms or for any other reason at our sole discretion.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">8. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Continued use of the platform after changes constitutes acceptance of the updated terms.</p>
          </section>
        </div>
      </main>

      <Footer
        logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
        brandName="KampusKart"
        socialLinks={socialLinks}
      />
    </div>
  );
};

export default TermsOfService;
