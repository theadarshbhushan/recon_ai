import React from 'react';

/**
 * Recon AI Brand Logo
 * Geometric reconciliation convergence mark: two intersecting financial streams
 * converging into a unified golden verification node.
 */
const BrandLogo = ({ size = 36, className = "" }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`flex-shrink-0 ${className}`}
    >
      {/* Background Rounded Shield / Container */}
      <rect width="48" height="48" rx="12" fill="#0A2540" />
      
      {/* Left Stream / Gateway Arc (Crisp Translucent Blue-White) */}
      <path
        d="M14 18C14 14.6863 16.6863 12 20 12H24C27.3137 12 30 14.6863 30 18V22H20C16.6863 22 14 19.3137 14 16V18Z"
        fill="#3B82F6"
        fillOpacity="0.4"
      />
      
      {/* Interlocking Convergence Flow */}
      <path
        d="M13 24C13 17.9249 17.9249 13 24 13C27.5255 13 30.6558 14.6565 32.6841 17.2273"
        stroke="#E2E8F0"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M35 24C35 30.0751 30.0751 35 24 35C20.4745 35 17.3442 33.3435 15.3159 30.7727"
        stroke="#C9A227"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      
      {/* Central Golden Reconciliation Nexus Node */}
      <circle cx="24" cy="24" r="5" fill="#C9A227" />
      
      {/* Verification Check inside Golden Node */}
      <path
        d="M22 24L23.5 25.5L26.5 22.5"
        stroke="#0A2540"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Precision Micro-Accents */}
      <circle cx="34" cy="18" r="2" fill="#C9A227" />
      <circle cx="14" cy="30" r="2" fill="#60A5FA" />
    </svg>
  );
};

export default BrandLogo;
