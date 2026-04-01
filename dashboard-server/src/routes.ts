import { Router, Request, Response } from 'express';
import Database from './db';
import { calculateStats } from './aggregator';
import { getTodayUsage, fetchUsageByDate } from './ccusage';

export function createRoutes(db: Database): Router {
  const router = Router();

  // GET /api/usage
  router.get('/usage', async (_req: Request, res: Response) => {
    try {
      const stats = await calculateStats(db);
      res.json(stats);
    } catch (err) {
      console.error('/api/usage error:', err);
      res.status(500).json({ error: 'Failed to get usage stats' });
    }
  });

  // POST /api/sync  — fetch today from ccusage and upsert
  router.post('/sync', async (_req: Request, res: Response) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const usage = await getTodayUsage();
      await db.upsertDay(today, usage.cost, usage.inputTokens, usage.outputTokens);
      res.json({ success: true, cost: usage.cost, inputTokens: usage.inputTokens, outputTokens: usage.outputTokens });
    } catch (err) {
      console.error('/api/sync error:', err);
      res.status(500).json({ error: 'Sync failed' });
    }
  });

  // POST /api/sync/full  — backfill all historical days
  router.post('/sync/full', async (_req: Request, res: Response) => {
    try {
      const allDays = await fetchUsageByDate();
      for (const [date, u] of allDays) {
        await db.upsertDay(date, u.cost, u.inputTokens, u.outputTokens);
      }
      res.json({ success: true, days: allDays.size });
    } catch (err) {
      console.error('/api/sync/full error:', err);
      res.status(500).json({ error: 'Full sync failed' });
    }
  });

  // GET /api/limits
  router.get('/limits', async (_req: Request, res: Response) => {
    try {
      const [daily, weekly, monthly, session] = await Promise.all([
        db.getLimit('daily'), db.getLimit('weekly'),
        db.getLimit('monthly'), db.getLimit('session'),
      ]);
      res.json({ daily, weekly, monthly, session });
    } catch (err) {
      res.status(500).json({ error: 'Failed to get limits' });
    }
  });

  // PUT /api/limits/:period
  router.put('/limits/:period', async (req: Request, res: Response) => {
    const { period } = req.params;
    const { limit } = req.body;
    if (!['daily', 'weekly', 'monthly', 'session'].includes(period))
      return res.status(400).json({ error: 'Invalid period' });
    if (typeof limit !== 'number' || limit <= 0)
      return res.status(400).json({ error: 'Invalid limit' });
    await db.updateLimit(period, limit);
    res.json({ success: true, period, limit });
  });

  // GET /api/health
  router.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return router;
}

export default createRoutes;
