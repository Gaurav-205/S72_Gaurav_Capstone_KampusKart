import React, { useEffect, useState } from 'react';

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      const scrollTop =
        document.documentElement.scrollTop || document.body.scrollTop;

      setVisible(scrollTop > 300);
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    document.body.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!visible) return null;

  return (
    <button
      onClick={scrollToTop}
      aria-label="Back to top"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[9999] bg-[#00C6A7] text-white px-4 py-2 rounded-full shadow-lg hover:bg-[#00b095] hover:scale-105 transition"
    >
      ↑
    </button>
  );
};

export default BackToTop;