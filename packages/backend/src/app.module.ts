import { Module, Global, DynamicModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { McpModule } from '@rekog/mcp-nest';
import { HealthController } from './health/health.controller';
import { McpServersModule } from './mcp-servers/mcp-servers.module';
import { WordpressModule } from './wordpress/wordpress.module';
import { McpAppsModule } from './mcp-apps/mcp-apps.module';
import { McpServer } from './mcp-servers/entities/mcp-server.entity';

// Create a global wrapper to re-export the McpModule exports
// McpServersModule is imported here so tools are discovered in GlobalMcpModule's subtree
// McpAppsModule is imported to provide UI resources for ext-apps support
@Global()
@Module({})
export class GlobalMcpModule {
  static forRoot(): DynamicModule {
    const mcpModule = McpModule.forRoot({
      name: 'wordpress-mcp-server',
      version: '1.0.0',
    });

    return {
      module: GlobalMcpModule,
      imports: [mcpModule, McpServersModule, McpAppsModule],
      exports: [mcpModule, McpServersModule, McpAppsModule],
    };
  }
}

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
    GlobalMcpModule.forRoot(),
    WordpressModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
