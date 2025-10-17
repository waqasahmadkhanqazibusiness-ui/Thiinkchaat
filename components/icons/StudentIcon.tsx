import React from 'react';

export const StudentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    stroke="none"
    {...props}
  >
    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.54v2.92c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5v-2.92l-7.5-3.54-7.5 3.54z"/>
  </svg>
);
