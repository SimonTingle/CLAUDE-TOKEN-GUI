import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

export interface DayUsage {
  cost: number;        // USD cost (primary metric)
  inputTokens: number;
  outputTokens: number;
}

/**
 * Parse one ccusage table data row.
 * Row format: │ 2026 │ model │ Input │ Output │ CacheCreate │ CacheRead │ Total │ $Cost │
 * The date (MM-DD) appears on the NEXT row.
 */
export function parseDataRow(line: string): DayUsage | null {
  if (!line.includes('│')) return null;

  // Cost: look for $X.XX before final │
  const costMatch = line.match(/\$\s*([\d.]+)\s*│/);
  const cost = costMatch ? parseFloat(costMatch[1]) : 0;

  // First two plain integers in the row are Input and Output tokens
  const nums = [...line.matchAll(/│\s*([\d,]+)\s*│/g)]
    .map(m => parseInt(m[1].replace(/,/g, ''), 10))
    .filter(n => !isNaN(n));

  const inputTokens = nums[0] ?? 0;
  const outputTokens = nums[1] ?? 0;

  if (cost === 0 && inputTokens === 0) return null;
  return { cost, inputTokens, outputTokens };
}

/**
 * Run ccusage and return a map of YYYY-MM-DD -> DayUsage.
 * Sums across all models per day.
 */
export async function fetchUsageByDate(): Promise<Map<string, DayUsage>> {
  const map = new Map<string, DayUsage>();
  try {
    const { stdout } = await execPromise('npx ccusage@latest 2>/dev/null || echo ""');
    const lines = stdout.split('\n');
    const year = new Date().getFullYear();

    for (let i = 0; i < lines.length - 1; i++) {
      const next = lines[i + 1];
      const mdMatch = next.match(/│\s*(\d{2}-\d{2})\s*│/);
      if (!mdMatch) continue;

      const parsed = parseDataRow(lines[i]);
      if (!parsed) continue;

      const iso = `${year}-${mdMatch[1]}`;
      const existing = map.get(iso) ?? { cost: 0, inputTokens: 0, outputTokens: 0 };
      map.set(iso, {
        cost: existing.cost + parsed.cost,
        inputTokens: existing.inputTokens + parsed.inputTokens,
        outputTokens: existing.outputTokens + parsed.outputTokens,
      });
    }
    console.log(`✅ ccusage: parsed ${map.size} days`);
  } catch (err) {
    console.error('❌ ccusage error:', err);
  }
  return map;
}

/**
 * Get today's usage (cost + real tokens only).
 */
export async function getTodayUsage(): Promise<DayUsage> {
  try {
    const { stdout } = await execPromise('npx ccusage@latest --today 2>/dev/null || echo ""');
    const now = new Date();
    const md = String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    const lines = stdout.split('\n');
    let cost = 0, inputTokens = 0, outputTokens = 0;

    for (let i = 0; i < lines.length - 1; i++) {
      if (lines[i + 1].includes(`│ ${md}`)) {
        const parsed = parseDataRow(lines[i]);
        if (parsed) {
          cost += parsed.cost;
          inputTokens += parsed.inputTokens;
          outputTokens += parsed.outputTokens;
        }
      }
    }

    console.log(`✅ Today (${md}): $${cost.toFixed(2)}, in=${inputTokens}, out=${outputTokens}`);
    return { cost, inputTokens, outputTokens };
  } catch (err) {
    console.error('❌ Error fetching today:', err);
    return { cost: 0, inputTokens: 0, outputTokens: 0 };
  }
}

/**
 * Verify ccusage is installed.
 */
export async function verifyCcusage(): Promise<boolean> {
  try {
    const { stdout } = await execPromise('npx ccusage@latest --version 2>/dev/null || echo "not installed"');
    const ok = !stdout.includes('not installed');
    console.log(ok ? '✅ ccusage available' : '⚠️  ccusage not installed');
    return ok;
  } catch {
    return false;
  }
}

export default { getTodayUsage, fetchUsageByDate, parseDataRow, verifyCcusage };
