import express from 'express';
import cors from 'cors';
import Database from './db';
import { createRoutes } from './routes';
import { getTodayUsage, verifyCcusage } from './ccusage';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database instance
const db = new Database();

// Initialize and start server
(async () => {
  try {
    // Initialize database
    console.log('🚀 Initializing database...');
    await db.init();

    // Verify ccusage is available
    const ccusageAvailable = await verifyCcusage();

    // Setup routes
    const routes = createRoutes(db);
    app.use('/api', routes);

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        name: 'Claude Token Dashboard API',
        version: '1.0.0',
        status: 'running',
        endpoints: {
          usage: '/api/usage',
          sync: 'POST /api/sync',
          limits: '/api/limits',
          health: '/api/health'
        },
        ccusageAvailable,
        database: 'SQLite'
      });
    });

    // Start periodic sync (every 5 minutes)
    if (ccusageAvailable) {
      console.log('⏱️  Starting token sync every 5 minutes...');
      setInterval(async () => {
        try {
          const today = new Date().toISOString().split('T')[0];
          const usage = await getTodayUsage();
          await db.upsertDay(today, usage.cost, usage.inputTokens, usage.outputTokens);
          if (usage.cost > 0) {
            console.log(`✅ Synced today: $${usage.cost.toFixed(2)}`);
          }
        } catch (error) {
          console.error('❌ Error in periodic sync:', error);
        }
      }, 5 * 60 * 1000);
    } else {
      console.log('⚠️  ccusage not available, periodic sync disabled');
      console.log('ℹ️  Install with: npm install -g ccusage@latest');
    }

    // Start server
    app.listen(PORT, () => {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ Claude Token Dashboard Server running`);
      console.log(`📡 Listening on http://localhost:${PORT}`);
      console.log(`${PORT === 5000 ? '🎯 Frontend will connect to this API' : ''}`);
      console.log(`${'='.repeat(60)}\n`);
    });

    // Graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down gracefully...');
      db.close();
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
})();

export default app;
