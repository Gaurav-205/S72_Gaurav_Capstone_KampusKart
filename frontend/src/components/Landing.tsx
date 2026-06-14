import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiSearch, FiCalendar, FiFileText, FiAlertCircle, FiHome, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { ShuffleHero } from './ui/shuffle-grid';
import { Footer } from './ui/footer';
import { socialLinks } from '../utils/socialLinks';

const features = [
  { name: 'Campus Map',        description: 'Explore the campus and find locations easily.',          icon: <FiMap className="w-6 h-6 sm:w-7 sm:h-7" />,           iconBg: 'bg-[#181818]' },
  { name: 'Lost & Found',      description: 'Report or find lost items on campus.',                   icon: <FiSearch className="w-6 h-6 sm:w-7 sm:h-7" />,        iconBg: 'bg-[#F05A25]' },
  { name: 'Events',            description: 'Stay updated with campus events.',                       icon: <FiCalendar className="w-6 h-6 sm:w-7 sm:h-7" />,      iconBg: 'bg-[#00C6A7]' },
  { name: 'News',              description: 'Read the latest campus news.',                           icon: <FiFileText className="w-6 h-6 sm:w-7 sm:h-7" />,      iconBg: 'bg-[#181818]' },
  { name: 'Complaints',        description: 'Raise and track campus complaints.',                     icon: <FiAlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />,   iconBg: 'bg-[#F05A25]' },
  { name: 'Facilities',        description: 'Discover campus facilities and services.',               icon: <FiHome className="w-6 h-6 sm:w-7 sm:h-7" />,          iconBg: 'bg-[#00C6A7]' },
  { name: 'Global Chat',       description: 'Chat with other campus members in real-time.',           icon: <FiMessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />, iconBg: 'bg-[#181818]' },
  { name: 'Clubs Recruitment', description: 'Apply to join campus clubs and societies.',              icon: <FiUsers className="w-6 h-6 sm:w-7 sm:h-7" />,         iconBg: 'bg-[#F05A25]' },
];

const steps = [
  { iconBg: 'bg-[#181818]', number: '1', title: 'Explore Features', desc: 'Browse all the smart tools KampusKart offers for your campus life.' },
  { iconBg: 'bg-[#00C6A7]', number: '2', title: 'Sign Up Instantly', desc: 'Create your account in seconds and personalize your experience.' },
  { iconBg: 'bg-[#F05A25]', number: '3', title: 'Enjoy Campus Life', desc: 'Access everything you need, stay updated, and connect with your campus.' },
];

const Landing: React.FC = () => {
  const [selectedFeature, setSelectedFeature] = useState<(typeof features)[number] | null>(null);

  return (
    <div className="bg-white dark:bg-gray-950 font-sans pt-[72px]">

      {/* Hero Section */}
        <div className="w-full py-16 sm:py-20 md:h-[calc(100vh-72px)] md:py-0 md:flex md:items-center">
          <ShuffleHero />
        </div>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="border-t-2 border-gray-200 dark:border-gray-800" />
        </div>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8 md:mb-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-lg bg-gray-50 border-2 border-gray-200 dark:border-gray-800 text-xs font-semibold text-teal-700 uppercase tracking-widest">
              Everything you need
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black dark:text-white mb-2 sm:mb-3" style={{ letterSpacing: '-0.01em' }}>
              Features
            </h2>
            <p className="text-sm sm:text-base text-gray-500">All your campus tools in one place.</p>
          </div>

          <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
            {features.map((feature) => (
              <button
                type="button"
                key={feature.name}
                aria-label={`Learn more about ${feature.name}`}
                className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6 flex flex-col items-start transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:ring-offset-2 group min-h-touch"
                onClick={() => setSelectedFeature(feature)}
              >
                <div className={`mb-3 md:mb-4 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-white ${feature.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                  {feature.icon}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-black dark:text-white mb-1 group-hover:text-[#00C6A7] transition-colors duration-200">
                  {feature.name}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{feature.description}</p>
              </button>
            ))}
          </div>

          {selectedFeature && (
            <div className="mt-5 rounded-lg border-2 border-[#00C6A7] bg-[#E6FFFA] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-xs font-semibold text-[#00856F] uppercase tracking-wider mb-1">Preview selected</p>
                <h3 className="text-base sm:text-lg font-extrabold text-[#005F52]">{selectedFeature.name}</h3>
                <p className="text-sm text-[#00685A]">{selectedFeature.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg font-semibold text-white bg-[#181818] hover:bg-[#00C6A7] transition-colors duration-200"
                >
                  Sign in to use
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex items-center justify-center min-h-[44px] px-4 rounded-lg font-semibold text-[#005F52] bg-white dark:bg-gray-900 border-2 border-[#00C6A7] hover:bg-[#F3FFFC] transition-colors duration-200"
                >
                  Create account
                </Link>
              </div>
            </div>
          )}
        </section>

        {/* Divider */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="border-t-2 border-gray-200 dark:border-gray-800" />
        </div>

        {/* How it works */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-10 md:py-12 lg:py-16">
          <div className="mb-6 sm:mb-8 md:mb-10 text-center md:text-left">
            <span className="inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 rounded-lg bg-gray-50 border-2 border-gray-200 dark:border-gray-800 text-xs font-semibold text-teal-700 uppercase tracking-widest">
              Simple by design
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-black dark:text-white mb-2 sm:mb-3" style={{ letterSpacing: '-0.01em' }}>
              Here's how it works
            </h2>
            <p className="text-sm sm:text-base text-gray-500">More living, less searching.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className="p-4 sm:p-5 md:p-6 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-lg hover:shadow-md hover:border-gray-300 transition-all duration-200 group"
              >
                <div className={`mb-3 md:mb-4 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-lg font-extrabold text-lg sm:text-xl text-white ${step.iconBg}`}>
                  {step.number}
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-black dark:text-white mb-1 sm:mb-2">{step.title}</h3>
                <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 sm:mt-8 md:mt-10 text-center md:text-left">
            <Link
              to="/signup"
              aria-label="Sign up for free account"
              className="inline-block min-h-[48px] px-6 sm:px-8 py-3 rounded-lg font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:ring-offset-2 transition-colors duration-200 text-sm sm:text-base"
            >
              Sign up free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <Footer
          logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
          brandName="KampusKart"
          socialLinks={socialLinks}
          mainLinks={[
            { href: '/', label: 'Home' },
            { href: '/login', label: 'Sign In' },
            { href: '/signup', label: 'Sign Up' },
          ]}
          legalLinks={[
            { href: '/privacy', label: 'Privacy' },
            { href: '/terms', label: 'Terms' },
          ]}
          copyright={{
            text: `© ${new Date().getFullYear()} KampusKart`,
            license: 'All rights reserved.',
          }}
        />

      </div>
  );
};

export default Landing;
