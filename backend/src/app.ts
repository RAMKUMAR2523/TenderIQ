import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

import { scrapeCPPP } from './crawlers/cppp-crawler';
import { runScheduler } from './engine/Scheduler';

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/crawl/cppp', async (req, res) => {
  try {
    // Fire and forget, or await. We'll await for testing.
    await scrapeCPPP();
    res.status(200).json({ message: 'CPPP scrape completed.' });
  } catch (error) {
    res.status(500).json({ error: 'Scrape failed' });
  }
});

app.post('/api/crawl/sync', async (req, res) => {
  try {
    runScheduler().catch(console.error);
    res.status(200).json({ message: 'Global sync started in background.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start sync' });
  }
});

export default app;
