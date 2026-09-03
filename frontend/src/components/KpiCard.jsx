import React from 'react';

const KpiCard = ({ title, value, borderClass = "border-l-indigo-600", subtext, subtextColor = "text-slate-400" }) => {
  return (
    <div className={`bg-white border border-slate-200/90 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-l-4 ${borderClass} flex flex-col justify-between`}>
      <div>
        <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          {title}
        </div>
        <div className="text-2xl sm:text-3xl font-outfit font-black text-slate-900 tracking-tight">
          {value}
        </div>
      </div>
      {subtext && (
        <div className={`text-xs mt-2 font-medium ${subtextColor} leading-tight`}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
