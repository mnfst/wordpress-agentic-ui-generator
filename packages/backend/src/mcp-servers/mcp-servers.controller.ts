import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { McpServersService } from './mcp-servers.service';
import { CreateMcpServerDto } from './dto/create-mcp-server.dto';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { API_PATHS } from '@wordpress-mcp/shared';

@Controller(API_PATHS.MCP_SERVERS.replace('/api/', ''))
export class McpServersController {
  constructor(private readonly mcpServersService: McpServersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateMcpServerDto): Promise<McpServerInfo> {
    return this.mcpServersService.create(createDto);
  }

  @Get()
  async findAll(@Query('featured') featured?: string): Promise<McpServerInfo[]> {
    const filter = featured === 'true' ? { featured: true } : undefined;
    return this.mcpServersService.findAll(filter);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<McpServerInfo> {
    return this.mcpServersService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.mcpServersService.delete(id);
  }

  @Post(':id/sync')
  async sync(@Param('id', ParseUUIDPipe) id: string): Promise<McpServerInfo> {
    return this.mcpServersService.sync(id);
  }
}
