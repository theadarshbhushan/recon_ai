import React from 'react';

const StatusBadge = ({ action, status }) => {
  const value = action || status || '';
  const normalizedAction = value.toLowerCase().trim();

  let styles = "bg-gray-100 text-gray-800 border-gray-200";
  let label = value || "Unknown";

  if (normalizedAction === 'auto_approve') {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    label = "Auto Approve";
  } else if (normalizedAction === 'flag_for_review') {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
    label = "Flag for Review";
  } else if (normalizedAction === 'escalate') {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
    label = "Escalate";
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
