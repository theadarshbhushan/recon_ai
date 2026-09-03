import React from 'react';

/**
 * Recon AI Brand Logo
 * Geometric reconciliation convergence mark: Charcoal base (#0F172A) with
 * Electric Blue (#2563EB / #3B82F6) reconciliation convergence nexus.
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
      {/* Background Rounded Squircle in Charcoal / Slate-900 */}
      <rect width="48" height="48" rx="12" fill="#0F172A" />
      
      {/* Left Data Stream / Gateway Arc (Slate Blue Translucent) */}
      <path
        d="M14 18C14 14.6863 16.6863 12 20 12H24C27.3137 12 30 14.6863 30 18V22H20C16.6863 22 14 19.3137 14 16V18Z"
        fill="#38BDF8"
        fillOpacity="0.25"
      />
      
      {/* Interlocking Convergence Flow Arcs */}
      <path
        d="M13 24C13 17.9249 17.9249 13 24 13C27.5255 13 30.6558 14.6565 32.6841 17.2273"
        stroke="#94A3B8"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M35 24C35 30.0751 30.0751 35 24 35C20.4745 35 17.3442 33.3435 15.3159 30.7727"
        stroke="#2563EB"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      
      {/* Central Electric Blue Reconciliation Nexus Node */}
      <circle cx="24" cy="24" r="5.5" fill="#2563EB" />
      
      {/* Verification Checkmark inside Nexus Node */}
      <path
        d="M21.5 24L23.5 26L26.5 22"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      
      {/* Precision Micro-Accents */}
      <circle cx="34" cy="17" r="2.2" fill="#60A5FA" />
      <circle cx="14" cy="31" r="2.2" fill="#38BDF8" />
    </svg>
  );
};

export default BrandLogo;
