import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { McpServersService } from './mcp-servers.service';
import { McpServersController } from './mcp-servers.controller';
import { McpServer } from './entities/mcp-server.entity';
import { WordpressModule } from '../wordpress/wordpress.module';
import { McpUiModule } from '../mcp-ui/mcp-ui.module';
import { PostsListTool } from './tools/posts-list.tool';
import { PostDetailTool } from './tools/post-detail.tool';

@Module({
  imports: [TypeOrmModule.forFeature([McpServer]), WordpressModule, McpUiModule],
  providers: [McpServersService, PostsListTool, PostDetailTool],
  controllers: [McpServersController],
  exports: [McpServersService],
})
export class McpServersModule {}
