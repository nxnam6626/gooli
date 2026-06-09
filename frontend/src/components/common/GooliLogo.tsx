import React from 'react';

interface GooliLogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export default function GooliLogo({ className = "", width = 36, height = 36 }: GooliLogoProps) {
  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Gold Base Arc (Left & Bottom) */}
      <path
        d="M 50 15 A 35 35 0 1 0 85 50"
        stroke="#B06518"
        strokeWidth="30"
        strokeLinecap="butt"
      />
      
      {/* Grey Outer Arc (Top Right) */}
      <path
        d="M 50 7.5 A 42.5 42.5 0 0 1 92.5 50"
        stroke="#A3A3A3"
        strokeWidth="15"
        strokeLinecap="butt"
      />
      
      {/* Grey Crossbar (G's horizontal line) */}
      <path
        d="M 50 42.5 L 92.5 42.5"
        stroke="#A3A3A3"
        strokeWidth="15"
        strokeLinecap="butt"
      />
    </svg>
  );
}
