import React from 'react';
import './MetricCard.css';

function MetricCard({ title, children, icon }) {
  return (
    <div className="metric-card">
      <div className="metric-card-header">
        {icon && <span className="metric-card-icon">{icon}</span>}
        <h4>{title}</h4>
      </div>
      <div className="metric-card-content">
        {children}
      </div>
    </div>
  );
}

export default MetricCard;
