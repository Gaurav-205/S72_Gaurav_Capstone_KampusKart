import React from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiSearch, FiCalendar, FiFileText, FiAlertCircle, FiHome, FiUsers, FiMessageSquare } from 'react-icons/fi';
import { Footer } from './ui/footer';
import { ShuffleGrid } from './ui/shuffle-grid';
import { socialLinks } from '../utils/socialLinks';

const features = [
  { name: 'Campus Map',        description: 'Explore the campus and find locations easily.',          icon: <FiMap className="w-6 h-6 sm:w-7 sm:h-7" />,           link: '/campus-map',        iconBg: 'bg-[#181818]' },
  { name: 'Lost & Found',      description: 'Report or find lost items on campus.',                   icon: <FiSearch className="w-6 h-6 sm:w-7 sm:h-7" />,        link: '/lostfound',         iconBg: 'bg-[#F05A25]' },
  { name: 'Events',            description: 'Stay updated with campus events.',                       icon: <FiCalendar className="w-6 h-6 sm:w-7 sm:h-7" />,      link: '/events',            iconBg: 'bg-[#00C6A7]' },
  { name: 'News',              description: 'Read the latest campus news.',                           icon: <FiFileText className="w-6 h-6 sm:w-7 sm:h-7" />,      link: '/news',              iconBg: 'bg-[#181818]' },
  { name: 'Complaints',        description: 'Raise and track campus complaints.',                     icon: <FiAlertCircle className="w-6 h-6 sm:w-7 sm:h-7" />,   link: '/complaints',        iconBg: 'bg-[#F05A25]' },
  { name: 'Facilities',        description: 'Discover campus facilities and services.',               icon: <FiHome className="w-6 h-6 sm:w-7 sm:h-7" />,          link: '/facilities',        iconBg: 'bg-[#00C6A7]' },
  { name: 'Global Chat',       description: 'Chat with other campus members in real-time.',           icon: <FiMessageSquare className="w-6 h-6 sm:w-7 sm:h-7" />, link: '/chat',              iconBg: 'bg-[#181818]' },
  { name: 'Clubs Recruitment', description: 'Apply to join campus clubs and societies.',              icon: <FiUsers className="w-6 h-6 sm:w-7 sm:h-7" />,         link: '/clubs-recruitment', iconBg: 'bg-[#F05A25]' },
];

const Home = () => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="bg-white dark:bg-gray-950 font-sans pt-[72px]">

      {/* Hero with Map */}
      <div className="w-full py-16 sm:py-20 md:h-[calc(100vh-72px)] md:py-0 md:flex md:items-center">
        <section className="w-full px-4 sm:px-6 md:px-8 grid grid-cols-1 md:grid-cols-2 items-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 max-w-6xl mx-auto">
          {/* Left: text */}
          <div className="text-center md:text-left space-y-3 sm:space-y-4 md:space-y-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-xs font-semibold text-teal-700 uppercase tracking-widest">
              Your campus, simplified
            </span>
            <h1
              className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-black dark:text-white leading-tight"
              style={{ letterSpacing: "-0.02em" }}
            >
              Welcome to KampusKart
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-500 max-w-md mx-auto md:mx-0 leading-relaxed">
              Your all-in-one campus companion for navigation, events, news, lost &amp; found, complaints, and more.
            </p>
            <div className="flex flex-col xs:flex-row gap-2 sm:gap-3 justify-center md:justify-start pt-1 sm:pt-2">
              <Link
                to="/campus-map"
                className="min-h-[48px] px-6 sm:px-8 py-3 rounded-lg font-bold text-white bg-[#181818] hover:bg-[#00C6A7] active:bg-[#181818] transition-colors duration-200 text-sm sm:text-base text-center"
              >
                Explore Full Map
              </Link>
              <button
                onClick={scrollToFeatures}
                className="min-h-[48px] px-6 sm:px-8 py-3 rounded-lg font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-50 active:bg-gray-100 transition-colors duration-200 text-sm sm:text-base"
              >
                View Features
              </button>
            </div>
          </div>

          {/* Right: shuffle grid — hidden on mobile */}
          <div className="hidden md:block w-full">
            <div className="w-full aspect-square max-w-[420px] lg:max-w-[520px] mx-auto">
              <ShuffleGrid />
            </div>
          </div>
        </section>
      </div>

      {/* Divider */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8">
        <div className="border-t-2 border-gray-200 dark:border-gray-800" />
      </div>

      {/* Features */}
      <section id="features-section" className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 py-12 md:py-16">
        <div className="mb-8 md:mb-10 text-center md:text-left">
          <span className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 text-xs font-semibold text-teal-700 uppercase tracking-widest">
            Everything you need
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-black dark:text-white mb-3" style={{ letterSpacing: '-0.01em' }}>
            Features
          </h2>
          <p className="text-sm sm:text-base text-gray-500">All your campus tools in one place.</p>
        </div>

        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
          {features.map((feature) => (
            <Link
              to={feature.link}
              key={feature.name}
              aria-label={`Go to ${feature.name}`}
              className="bg-white dark:bg-gray-900 rounded-lg border-2 border-gray-200 dark:border-gray-800 p-4 sm:p-5 md:p-6 flex flex-col items-start transition-all duration-200 hover:border-gray-300 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#00C6A7] focus:ring-offset-2 group min-h-touch"
            >
              <div className={`mb-3 md:mb-4 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 flex items-center justify-center rounded-lg text-white ${feature.iconBg} transition-transform duration-200 group-hover:scale-110`}>
                {feature.icon}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-black dark:text-white mb-1 group-hover:text-[#00C6A7] transition-colors duration-200">
                {feature.name}
              </h3>
              <p className="text-xs sm:text-sm text-gray-500 leading-relaxed">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer */}
      <Footer
        logo={<img src="/Logo.webp" alt="KampusKart Logo" className="h-7 w-7" />}
        brandName="KampusKart"
        socialLinks={socialLinks}
        mainLinks={[
          { href: '/events', label: 'Events' },
          { href: '/facilities', label: 'Facilities' },
          { href: '/clubs-recruitment', label: 'Clubs' },
          { href: '/campus-map', label: 'Map' },
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

export default Home;
