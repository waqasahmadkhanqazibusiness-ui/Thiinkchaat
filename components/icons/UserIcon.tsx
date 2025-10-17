
import React from 'react';

export const UserIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M12 2a5 5 0 1 0 5 5 5 5 0 0 0-5-5zm0 8a3 3 0 1 1 3-3 3 3 0 0 1-3 3z" />
    <path d="M12 14c-4.411 0-8 1.794-8 4v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2c0-2.206-3.589-4-8-4zm-6 4v-.553c.57-.811 2.503-2.447 6-2.447s5.43.1636 6 2.447V18z" />
  </svg>
);
