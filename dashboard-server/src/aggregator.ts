import Database from './db';

export interface PeriodStats {
  used: number;       // USD
  limit: number;      // USD
  remaining: number;  // USD
  percentage: number;
  color: 'green' | 'yellow' | 'red';
  formatted: { used: string; remaining: string; limit: string };
}

export interface FullStats {
  daily: PeriodStats;
  weekly: PeriodStats;
  monthly: PeriodStats;
  todayTokens: { input: number; output: number };
  lastUpdated: string;
}

function formatUSD(n: number): string {
  if (n >= 1000) return `$${(n / 1000).toFixed(1)}k`;
  if (n >= 1)    return `$${n.toFixed(2)}`;
  return `${(n * 100).toFixed(1)}¢`;
}

function colorFor(pct: number): 'green' | 'yellow' | 'red' {
  if (pct < 50) return 'green';
  if (pct < 80) return 'yellow';
  return 'red';
}

function makePeriod(used: number, limit: number): PeriodStats {
  const remaining = Math.max(0, limit - used);
  const percentage = limit > 0 ? Math.min(Math.round((used / limit) * 100), 999) : 0;
  return {
    used, limit, remaining, percentage,
    color: colorFor(percentage),
    formatted: {
      used: formatUSD(used),
      remaining: formatUSD(remaining),
      limit: formatUSD(limit),
    },
  };
}

export async function calculateStats(db: Database): Promise<FullStats> {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const d7 = new Date(now.getTime() - 7 * 86400000).toISOString().split('T')[0];
  const d30 = new Date(now.getTime() - 30 * 86400000).toISOString().split('T')[0];

  const [todayRows, weekRows, monthRows, dailyLimit, weeklyLimit, monthlyLimit] = await Promise.all([
    db.getDayRange(today, today),
    db.getDayRange(d7, today),
    db.getDayRange(d30, today),
    db.getLimit('daily'),
    db.getLimit('weekly'),
    db.getLimit('monthly'),
  ]);

  const dailyCost   = todayRows.reduce((s, r) => s + r.cost_usd, 0);
  const weeklyCost  = weekRows.reduce((s, r) => s + r.cost_usd, 0);
  const monthlyCost = monthRows.reduce((s, r) => s + r.cost_usd, 0);

  const todayRow = todayRows[0];

  return {
    daily:   makePeriod(dailyCost,   dailyLimit),
    weekly:  makePeriod(weeklyCost,  weeklyLimit),
    monthly: makePeriod(monthlyCost, monthlyLimit),
    todayTokens: {
      input:  todayRow?.input_tokens  ?? 0,
      output: todayRow?.output_tokens ?? 0,
    },
    lastUpdated: new Date().toISOString(),
  };
}

export default { calculateStats };
