import React from 'react';

const StatusBadge = ({ action, status }) => {
  const value = action || status || '';
  const normalizedAction = value.toLowerCase().trim();

  let styles = "bg-slate-100 text-slate-700 border-slate-200";
  let dotColor = "bg-slate-400";
  let label = value || "Unknown";

  if (normalizedAction === 'auto_approve' || normalizedAction === 'auto_resolved') {
    styles = "bg-emerald-50 text-emerald-700 border-emerald-200";
    dotColor = "bg-emerald-500";
    label = normalizedAction === 'auto_resolved' ? "Auto-Resolved" : "Auto Approve";
  } else if (normalizedAction === 'flag_for_review' || normalizedAction === 'pending') {
    styles = "bg-amber-50 text-amber-700 border-amber-200";
    dotColor = "bg-amber-500";
    label = normalizedAction === 'pending' ? "Pending Review" : "Flag for Review";
  } else if (normalizedAction === 'escalate' || normalizedAction === 'escalated') {
    styles = "bg-rose-50 text-rose-700 border-rose-200";
    dotColor = "bg-rose-500";
    label = "Escalate";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${styles} shadow-xs`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`}></span>
      {label}
    </span>
  );
};

export default StatusBadge;
