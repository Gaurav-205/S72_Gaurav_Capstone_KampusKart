import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Navbar1 } from '../components/ui/shadcnblocks-com-navbar1';

const KampusKartNavbar: React.FC = () => {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const isLoggedIn = Boolean(token && user);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/login');
  }, [logout, navigate]);

  const menuItems = [
    {
      title: 'Home',
      url: isLoggedIn ? '/home' : '/',
    },
    {
      title: 'Features',
      url: '#',
      items: [
        {
          title: 'Lost & Found',
          description: 'Report or find lost items on campus',
          url: isLoggedIn ? '/lostfound' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'Complaints',
          description: 'Submit and track campus complaints',
          url: isLoggedIn ? '/complaints' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'Events',
          description: 'Discover and join campus events',
          url: isLoggedIn ? '/events' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'Clubs Recruitment',
          description: 'Join student clubs and organizations',
          url: isLoggedIn ? '/clubs-recruitment' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'News',
          description: 'Stay updated with campus news',
          url: isLoggedIn ? '/news' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'Facilities',
          description: 'Explore campus facilities',
          url: isLoggedIn ? '/facilities' : '/login',
          locked: !isLoggedIn,
        },
      ],
    },
    {
      title: 'Campus',
      url: '#',
      items: [
        {
          title: 'Campus Map',
          description: 'Navigate the campus with interactive map',
          url: isLoggedIn ? '/campus-map' : '/login',
          locked: !isLoggedIn,
        },
        {
          title: 'Chat',
          description: 'Connect with students and staff',
          url: isLoggedIn ? '/chat' : '/login',
          locked: !isLoggedIn,
        },
      ],
    },
  ];

  if (isLoggedIn && user?.isAdmin) {
    menuItems.push({
      title: 'Admin',
      url: '/admin/users',
    });
  }

  const mobileExtraLinks = isLoggedIn ? [{ name: 'Chat', url: '/chat' }] : [];

  const authConfig = isLoggedIn
    ? {
        login: { text: 'Profile', url: '/profile' },
        signup: { text: 'Logout', url: '#', onClick: handleLogout },
      }
    : {
        login: { text: 'Log in', url: '/login' },
        signup: { text: 'Sign up', url: '/signup' },
      };
  return (
    <Navbar1
      logo={{
        url: isLoggedIn ? '/home' : '/',
        src: '/Logo.webp',
        alt: 'KampusKart Logo',
        title: 'KampusKart',
      }}
      menu={menuItems}
      mobileExtraLinks={mobileExtraLinks}
      auth={authConfig}
    />
  );
};

export default KampusKartNavbar;
