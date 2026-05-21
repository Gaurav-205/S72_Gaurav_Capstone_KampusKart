import React from 'react';
import { Link } from 'react-router-dom';
import { FiMap, FiSearch, FiCalendar, FiFileText, FiAlertCircle, FiHome } from 'react-icons/fi';

const features = [
  {
    name: 'Campus Map',
    description: 'Explore the campus and find locations easily.',
    icon: <FiMap className="w-8 h-8 text-[#00C6A7]" />, 
    link: '/campus-map',
  },
  {
    name: 'Lost & Found',
    description: 'Report or find lost items on campus.',
    icon: <FiSearch className="w-8 h-8 text-[#F05A25]" />, 
    link: '/lostfound',
  },
  {
    name: 'Events',
    description: 'Stay updated with campus events.',
    icon: <FiCalendar className="w-8 h-8 text-blue-500" />, 
    link: '/events',
  },
  {
    name: 'News',
    description: 'Read the latest campus news.',
    icon: <FiFileText className="w-8 h-8 text-purple-500" />, 
    link: '/news',
  },
  {
    name: 'Complaints',
    description: 'Raise and track campus complaints.',
    icon: <FiAlertCircle className="w-8 h-8 text-red-500" />, 
    link: '/complaints',
  },
  {
    name: 'Facilities',
    description: 'Discover campus facilities and services.',
    icon: <FiHome className="w-8 h-8 text-green-500" />, 
    link: '/facilities',
  },
];

const Features: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-24">
        <h1 className="text-h2 font-extrabold text-black mb-8">Features</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {features.map((feature) => (
            <Link 
              to={feature.link} 
              key={feature.name} 
              className="bg-white rounded-lg border-2 border-gray-200 p-8 flex flex-col items-center text-center transition-colors duration-200 group hover:border-gray-300 active:bg-gray-50"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-[#00C6A7]">{feature.name}</h3>
              <p className="text-gray-600 text-sm">{feature.description}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Features; 
