import React from 'react';
import { Instagram, Linkedin, Globe, Github } from 'lucide-react';

// Centralised social links for the footer — update here to reflect everywhere
export const socialLinks = [
  {
    href: 'https://www.instagram.com/gaurav_khandelwal_/',
    label: 'Instagram',
    icon: <Instagram className="h-4 w-4" />,
  },
  {
    href: 'https://www.linkedin.com/in/gaurav-khandelwal-17a127358/',
    label: 'LinkedIn',
    icon: <Linkedin className="h-4 w-4" />,
  },
  {
    href: 'https://gauravkhandelwal.codes',
    label: 'Portfolio',
    icon: <Globe className="h-4 w-4" />,
  },
  { href: 'https://github.com/Gaurav-205', label: 'GitHub', icon: <Github className="h-4 w-4" /> },
];
