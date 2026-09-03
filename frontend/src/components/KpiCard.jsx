import React from 'react';

const KpiCard = ({ title, value, borderClass = "border-l-indigo-600", subtext, subtextColor = "text-slate-500" }) => {
  return (
    <div className={`bg-white border border-slate-200/90 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 border-l-4 ${borderClass} flex flex-col justify-between`}>
      <div>
        <div className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </div>
        <div className="text-3xl sm:text-4xl font-black text-slate-950 tracking-tight">
          {value}
        </div>
      </div>
      {subtext && (
        <div className={`text-xs mt-3 font-semibold ${subtextColor} leading-tight`}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
