import React from 'react';
import type { LucideProps } from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: string | number;
  icon: React.FC<LucideProps>;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

const StatsWidget: React.FC<StatsWidgetProps> = ({ 
  title, 
  value, 
  icon: Icon,
  change, 
  changeType = 'neutral' 
}) => {
  const changeColor = {
    positive: 'text-green-600',
    negative: 'text-red-600',
    neutral: 'text-gray-600'
  }[changeType];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 ${changeColor}`}>{change}</p>
          )}
        </div>

        <div className="p-3 bg-[#635bff] bg-opacity-10 rounded-lg">
          <Icon className="w-6 h-6 text-[#635bff]" />
        </div>
      </div>
    </div>
  );
};

export default StatsWidget;
