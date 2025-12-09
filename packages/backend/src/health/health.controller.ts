import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';

interface HealthResponse {
  status: 'healthy' | 'degraded';
  timestamp: string;
  database: 'connected' | 'disconnected';
}

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Get()
  async check(): Promise<HealthResponse> {
    let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

    try {
      if (this.dataSource.isInitialized) {
        await this.dataSource.query('SELECT 1');
        databaseStatus = 'connected';
      }
    } catch {
      databaseStatus = 'disconnected';
    }

    return {
      status: databaseStatus === 'connected' ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      database: databaseStatus,
    };
  }
}
