import sqlite3 from 'sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../tokens.db');

export interface DayRecord {
  id?: number;
  date: string;
  cost_usd: number;
  input_tokens: number;
  output_tokens: number;
  created_at?: string;
}

// Claude Pro calibrated limits (USD)
export const LIMITS = {
  session: 3.70,    // ~5-hour billing window
  daily:   15.00,   // approximate daily ceiling
  weekly:  22.00,   // from real data: $13.45 = 61%
  monthly: 88.00,   // 4 × weekly
};

export class Database {
  private db: sqlite3.Database;

  constructor() {
    this.db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) console.error('DB connection error:', err);
      else console.log('✅ Connected to SQLite:', DB_PATH);
    });
  }

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        this.db.run(`CREATE TABLE IF NOT EXISTS usage_log (
          id          INTEGER PRIMARY KEY AUTOINCREMENT,
          date        TEXT NOT NULL UNIQUE,
          cost_usd    REAL NOT NULL DEFAULT 0,
          input_tokens  INTEGER NOT NULL DEFAULT 0,
          output_tokens INTEGER NOT NULL DEFAULT 0,
          updated_at  DATETIME DEFAULT CURRENT_TIMESTAMP
        )`, (err) => { if (err) reject(err); else console.log('✅ usage_log ready'); });

        this.db.run(`CREATE TABLE IF NOT EXISTS limits (
          period TEXT PRIMARY KEY,
          limit_usd REAL NOT NULL
        )`, (err) => {
          if (err) { reject(err); return; }
          console.log('✅ limits table ready');
        });

        this.db.run(`INSERT OR IGNORE INTO limits (period, limit_usd) VALUES
          ('session', ${LIMITS.session}),
          ('daily',   ${LIMITS.daily}),
          ('weekly',  ${LIMITS.weekly}),
          ('monthly', ${LIMITS.monthly})`,
          (err) => { if (err) reject(err); else { console.log('✅ Default limits set'); resolve(); } });
      });
    });
  }

  async upsertDay(date: string, cost: number, inputTokens: number, outputTokens: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO usage_log (date, cost_usd, input_tokens, output_tokens)
         VALUES (?, ?, ?, ?)
         ON CONFLICT(date) DO UPDATE SET
           cost_usd      = excluded.cost_usd,
           input_tokens  = excluded.input_tokens,
           output_tokens = excluded.output_tokens,
           updated_at    = CURRENT_TIMESTAMP`,
        [date, cost, inputTokens, outputTokens],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });
  }

  async getDayRange(startDate: string, endDate: string): Promise<DayRecord[]> {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM usage_log WHERE date >= ? AND date <= ? ORDER BY date DESC',
        [startDate, endDate],
        (err, rows: any[]) => { if (err) reject(err); else resolve(rows as DayRecord[]); }
      );
    });
  }

  async getLimit(period: string): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.get('SELECT limit_usd FROM limits WHERE period = ?', [period],
        (err, row: any) => {
          if (err) reject(err);
          else resolve(row?.limit_usd ?? (LIMITS as any)[period] ?? 22);
        }
      );
    });
  }

  async updateLimit(period: string, limitUsd: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run('UPDATE limits SET limit_usd = ? WHERE period = ?', [limitUsd, period],
        (err) => { if (err) reject(err); else resolve(); }
      );
    });
  }

  close(): void {
    this.db.close();
  }
}

export default Database;
