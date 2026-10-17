import 'reflect-metadata';

import app from './app';
import { env } from './config/env';
import { AppDataSource } from './database/data-source';

async function bootstrap(): Promise<void> {
  await AppDataSource.initialize();

  app.listen(env.port, () => {
    console.log(`DevAcademy API running on http://localhost:${env.port}`);
    console.log(`Environment: ${env.nodeEnv}`);
  });
}

bootstrap().catch((error: unknown) => {
  console.error('Failed to start the DevAcademy API:', error);
  process.exit(1);
});
