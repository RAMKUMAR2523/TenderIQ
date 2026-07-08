import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { startBackgroundWorker } from './engine/Scheduler';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Start the cron scheduler
    startBackgroundWorker();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
