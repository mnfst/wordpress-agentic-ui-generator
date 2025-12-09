import { Module } from '@nestjs/common';
import { McpAppsController } from './mcp-apps.controller';
import { McpAppsResource } from './mcp-apps.resource';

@Module({
  controllers: [McpAppsController],
  providers: [McpAppsResource],
  exports: [McpAppsResource],
})
export class McpAppsModule {}
