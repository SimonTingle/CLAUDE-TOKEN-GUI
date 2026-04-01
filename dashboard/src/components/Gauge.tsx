import React from 'react';
import { PeriodStats } from '../services/api';
import './Gauge.css';

interface GaugeProps {
  title: string;
  stats: PeriodStats;
  subtitle?: string;
}

export const Gauge: React.FC<GaugeProps> = ({ title, stats, subtitle }) => {
  const pct = Math.min(stats.percentage, 100);
  const COLOR = stats.color === 'green' ? '#22c55e' : stats.color === 'yellow' ? '#eab308' : '#ef4444';

  // Needle: -135° = 0%, +135° = 100%
  const needleDeg = -135 + (pct / 100) * 270;

  // Arc: stroke-dasharray on a circle r=85, circumference ≈ 534
  const CIRC = 2 * Math.PI * 85;
  const arcLen = (pct / 100) * CIRC * 0.75; // 75% of circle = 270°

  return (
    <div className="gauge-container">
      <h2 className="gauge-title">{title}</h2>
      {subtitle && <p className="gauge-subtitle">{subtitle}</p>}

      <div className="gauge-wrapper">
        <svg viewBox="0 0 240 240" className="gauge-svg">
          {/* Outer ring */}
          <circle cx="120" cy="120" r="110" fill="#1f2937" stroke="#374151" strokeWidth="2" />

          {/* Background track */}
          <circle
            cx="120" cy="120" r="85"
            fill="none" stroke="#374151" strokeWidth="8"
            strokeDasharray={`${CIRC * 0.75} ${CIRC}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-135deg)', transformOrigin: '120px 120px' }}
          />

          {/* Zone indicators */}
          <circle cx="120" cy="120" r="85" fill="none" stroke="#22c55e"
            strokeWidth="4" opacity="0.25"
            strokeDasharray={`${CIRC * 0.375} ${CIRC}`}
            style={{ transform: 'rotate(-135deg)', transformOrigin: '120px 120px' }} />
          <circle cx="120" cy="120" r="85" fill="none" stroke="#eab308"
            strokeWidth="4" opacity="0.25"
            strokeDasharray={`${CIRC * 0.225} ${CIRC * 0.375 + CIRC * 0.225}`}
            style={{ transform: 'rotate(0deg)', transformOrigin: '120px 120px' }} />
          <circle cx="120" cy="120" r="85" fill="none" stroke="#ef4444"
            strokeWidth="4" opacity="0.25"
            strokeDasharray={`${CIRC * 0.15} ${CIRC * 0.225 + CIRC * 0.225}`}
            style={{ transform: 'rotate(81deg)', transformOrigin: '120px 120px' }} />

          {/* Active fill arc */}
          {pct > 0 && (
            <circle
              cx="120" cy="120" r="85"
              fill="none" stroke={COLOR} strokeWidth="8"
              strokeDasharray={`${arcLen} ${CIRC}`}
              strokeLinecap="round"
              style={{
                transform: 'rotate(-135deg)',
                transformOrigin: '120px 120px',
                transition: 'stroke-dasharray 0.6s ease, stroke 0.4s ease',
                filter: `drop-shadow(0 0 6px ${COLOR})`,
              }}
            />
          )}

          {/* Needle */}
          <line x1="120" y1="120" x2="120" y2="48"
            stroke={COLOR} strokeWidth="4" strokeLinecap="round"
            style={{
              transform: `rotate(${needleDeg}deg)`,
              transformOrigin: '120px 120px',
              transition: 'transform 0.6s ease',
              filter: `drop-shadow(0 0 4px ${COLOR})`,
            }}
          />
          <circle cx="120" cy="120" r="7" fill={COLOR} />
          <circle cx="120" cy="120" r="3" fill="#0f172a" />

          {/* Cost display */}
          <text x="120" y="150" textAnchor="middle" fontSize="22" fontWeight="700"
            fill={COLOR} fontFamily="'Monaco','Courier New',monospace">
            {stats.formatted.used}
          </text>
          <text x="120" y="168" textAnchor="middle" fontSize="11" fill="#9ca3af">
            of {stats.formatted.limit}
          </text>

          {/* Min/Max labels */}
          <text x="42" y="175" fontSize="10" fill="#6b7280" textAnchor="middle">$0</text>
          <text x="198" y="175" fontSize="10" fill="#6b7280" textAnchor="middle">MAX</text>

          {/* Percentage */}
          <text x="120" y="195" textAnchor="middle" fontSize="13" fill="#d1d5db" fontWeight="600">
            {stats.percentage}%
          </text>
        </svg>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-container">
        <div className={`progress-bar progress-${stats.color}`}
          style={{ width: `${pct}%`, transition: 'width 0.6s ease' }} />
      </div>

      {/* Stats row */}
      <div className="gauge-stats">
        <div className="stat-row">
          <span className="stat-label">Used</span>
          <span className="stat-value" style={{ color: COLOR }}>{stats.formatted.used}</span>
        </div>
        <div className="stat-row">
          <span className="stat-label">Remaining</span>
          <span className="stat-value remaining">{stats.formatted.remaining}</span>
        </div>
      </div>

      {/* Status */}
      <div className="status-indicator">
        <span className={`status-dot status-${stats.color}`} />
        <span className="status-text">
          {stats.color === 'green' && 'Safe'}
          {stats.color === 'yellow' && 'Caution'}
          {stats.color === 'red' && 'Danger'}
        </span>
      </div>
    </div>
  );
};

export default Gauge;
