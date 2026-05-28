import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, color, trend, onClick }) => {
  const colors = {
    primary: { bg: '#e0e7ff', color: '#4f46e5' },
    success: { bg: '#d1fae5', color: '#10b981' },
    warning: { bg: '#fed7aa', color: '#f59e0b' },
    danger: { bg: '#fee2e2', color: '#ef4444' },
    info: { bg: '#dbeafe', color: '#3b82f6' }
  };

  const currentColor = colors[color] || colors.primary;

  return (
    <div 
      className="stats-card-small" 
      onClick={onClick} 
      style={{ cursor: onClick ? 'pointer' : 'default' }}
    >
      <div className="stats-card-small-content">
        <div className="stats-card-small-left">
          <div className="stats-icon-small" style={{ background: currentColor.bg }}>
            <Icon size={20} color={currentColor.color} />
          </div>
          <div className="stats-info-small">
            <div className="stats-number-small">{value}</div>
            <div className="stats-label-small">{title}</div>
          </div>
        </div>
        {trend && (
          <div className={`stats-trend-small ${trend > 0 ? 'trend-up' : 'trend-down'}`}>
            {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;