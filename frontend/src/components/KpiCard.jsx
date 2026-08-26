import React from 'react';

const KpiCard = ({ title, value, borderClass, subtext, subtextColor = "text-gray-400" }) => {
  return (
    <div className={`bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover-scale hover:shadow-md transition-all duration-200 border-l-4 ${borderClass}`}>
      <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
        {title}
      </div>
      <div className="text-2xl font-outfit font-bold text-navy-800">
        {value}
      </div>
      {subtext && (
        <div className={`text-xs mt-1 font-medium ${subtextColor}`}>
          {subtext}
        </div>
      )}
    </div>
  );
};

export default KpiCard;
