import React, { useState, useEffect, useCallback } from 'react';
import { getUsage, syncTokens, UsageResponse } from '../services/api';
import Gauge from './Gauge';
import './Dashboard.css';

export const Dashboard: React.FC = () => {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);

  const fetchUsage = useCallback(async () => {
    try {
      setError(null);
      const data = await getUsage();
      setUsage(data);
    } catch {
      setError('Backend offline — is the server running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    await syncTokens().catch(() => null);
    await fetchUsage();
    setSyncing(false);
  };

  useEffect(() => {
    fetchUsage();
    const id = setInterval(fetchUsage, 10000);
    return () => clearInterval(id);
  }, [fetchUsage]);

  const timeSince = (iso: string) => {
    const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
    if (sec < 5)  return 'just now';
    if (sec < 60) return `${sec}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    return `${Math.floor(sec / 3600)}h ago`;
  };

  if (loading) return (
    <div className="dashboard">
      <div className="loading-container">
        <div className="loading-spinner" />
        <p>Loading token dashboard…</p>
      </div>
    </div>
  );

  if (error || !usage) return (
    <div className="dashboard">
      <div className="error-container">
        <p className="error-message">⚠️ {error}</p>
        <p className="error-hint">Run: <code>./scripts/start-dashboard.sh</code></p>
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>🚂 Claude Token Dashboard</h1>
        <p className="subtitle">Real-time Claude Code compute cost monitor · Claude Pro</p>
      </div>

      {/* Status bar */}
      <div className="status-bar">
        <div className="status-item">
          <span className="status-label">Backend</span>
          <span className="status-value online">🟢 Connected</span>
        </div>
        <div className="status-item">
          <span className="status-label">Updated</span>
          <span className="status-value">{timeSince(usage.lastUpdated)}</span>
        </div>
        <div className="status-item">
          <span className="status-label">Today I/O</span>
          <span className="status-value">
            {usage.todayTokens.input.toLocaleString()} in · {usage.todayTokens.output.toLocaleString()} out
          </span>
        </div>
        <button
          className={`sync-btn ${syncing ? 'syncing' : ''}`}
          onClick={handleSync}
          disabled={syncing}
        >
          {syncing ? '↻ Syncing…' : '↻ Sync Now'}
        </button>
      </div>

      {/* Gauges */}
      <div className="gauges-grid">
        <Gauge title="📅 Daily" subtitle="vs $15 ceiling" stats={usage.daily} />
        <Gauge title="🗓 Weekly" subtitle="resets Friday 17:00" stats={usage.weekly} />
        <Gauge title="📊 Monthly" subtitle="rolling 30 days" stats={usage.monthly} />
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <div className="footer-section">
          <h3>🎚 Gauge Zones</h3>
          <ul>
            <li>🟢 <strong>Green (0–50%)</strong> Safe, plenty of budget left</li>
            <li>🟡 <strong>Yellow (50–80%)</strong> Caution, getting close</li>
            <li>🔴 <strong>Red (80%+)</strong> Danger — approaching or over limit</li>
            <li>⚡ Auto-refreshes every 10 seconds</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>💡 Save Compute</h3>
          <ul>
            <li>Switch to Haiku for simple tasks</li>
            <li>Use low effort mode</li>
            <li>Run <code>/compact</code> often</li>
            <li>Enable prompt caching</li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>⚙️ System</h3>
          <ul>
            <li>Metric: USD compute cost</li>
            <li>Source: ccusage (official)</li>
            <li>Backend: http://localhost:5000</li>
            <li>Syncs every 5 min automatically</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
