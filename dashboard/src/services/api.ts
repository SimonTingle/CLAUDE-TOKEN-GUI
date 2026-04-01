import axios from 'axios';

const BASE = '/api';

export interface PeriodStats {
  used: number;
  limit: number;
  remaining: number;
  percentage: number;
  color: 'green' | 'yellow' | 'red';
  formatted: { used: string; remaining: string; limit: string };
}

export interface UsageResponse {
  daily: PeriodStats;
  weekly: PeriodStats;
  monthly: PeriodStats;
  todayTokens: { input: number; output: number };
  lastUpdated: string;
}

export async function getUsage(): Promise<UsageResponse> {
  try {
    const r = await axios.get<UsageResponse>(`${BASE}/usage`);
    return r.data;
  } catch {
    // Fallback mock while backend starts up
    return {
      daily:   { used: 0, limit: 15, remaining: 15, percentage: 0, color: 'green', formatted: { used: '$0.00', remaining: '$15.00', limit: '$15.00' } },
      weekly:  { used: 0, limit: 22, remaining: 22, percentage: 0, color: 'green', formatted: { used: '$0.00', remaining: '$22.00', limit: '$22.00' } },
      monthly: { used: 0, limit: 88, remaining: 88, percentage: 0, color: 'green', formatted: { used: '$0.00', remaining: '$88.00', limit: '$88.00' } },
      todayTokens: { input: 0, output: 0 },
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function syncTokens(): Promise<void> {
  await axios.post(`${BASE}/sync`);
}

export default { getUsage, syncTokens };
