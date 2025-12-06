import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { McpModule } from '@rekog/mcp-nest';
import { HealthController } from './health/health.controller';
import { McpServersModule } from './mcp-servers/mcp-servers.module';
import { WordpressModule } from './wordpress/wordpress.module';
import { McpServer } from './mcp-servers/entities/mcp-server.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('DATABASE_HOST', 'localhost'),
        port: configService.get<number>('DATABASE_PORT', 3306),
        username: configService.get<string>('DATABASE_USER', 'mcp_user'),
        password: configService.get<string>('DATABASE_PASSWORD', 'mcp_password'),
        database: configService.get<string>('DATABASE_NAME', 'mcp_generator'),
        entities: [McpServer],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),
    McpModule.forRoot({
      name: 'wordpress-mcp-server',
      version: '1.0.0',
    }),
    WordpressModule,
    McpServersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
