import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  accent?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'violet';
}

export default function StatCard({ label, value, hint, icon, trend, accent = 'indigo' }: StatCardProps) {
  return (
    <div className={`stat-card stat-card-${accent}`}>
      <div className="stat-card-top">
        {icon && <div className="stat-card-icon">{icon}</div>}
        {trend && trend !== 'neutral' && (
          <span className={`stat-trend stat-trend-${trend}`}>
            {trend === 'up' ? '↑' : '↓'}
          </span>
        )}
      </div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {hint && <p className="stat-hint">{hint}</p>}
    </div>
  );
}
