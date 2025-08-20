import React from 'react';

const MetricCard = ({ title, value, detail, icon, gradient, colorText }) => (
  <div className={`
      bg-gradient-to-r ${gradient}
      rounded-2xl p-6 text-white
      shadow-md hover:shadow-lg
      transform hover:scale-105
      transition-all duration-300
  `}>
    <div className="flex items-center justify-between">
      <div>
        <p className={`${colorText} text-sm`}>{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {detail && <p className={`${colorText} text-xs mt-1`}>{detail}</p>}
      </div>
      {icon}
    </div>
  </div>
);

export default MetricCard;