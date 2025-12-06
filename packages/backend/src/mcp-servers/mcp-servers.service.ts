import { Injectable, Logger, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { McpServer } from './entities/mcp-server.entity';
import { WordpressService } from '../wordpress/wordpress.service';
import { CreateMcpServerDto } from './dto/create-mcp-server.dto';
import type { McpServerInfo } from '@wordpress-mcp/shared';
import { McpServerStatus } from '@wordpress-mcp/shared';

@Injectable()
export class McpServersService {
  private readonly logger = new Logger(McpServersService.name);

  constructor(
    @InjectRepository(McpServer)
    private readonly mcpServerRepository: Repository<McpServer>,
    private readonly wordpressService: WordpressService,
    private readonly configService: ConfigService,
  ) {}

  async create(createDto: CreateMcpServerDto): Promise<McpServerInfo> {
    const normalizedUrl = this.wordpressService.normalizeUrl(createDto.wordpressUrl);

    const existingServer = await this.mcpServerRepository.findOne({
      where: { wordpressUrl: normalizedUrl },
    });

    if (existingServer) {
      throw new ConflictException('An MCP server for this WordPress URL already exists');
    }

    const validationResult = await this.wordpressService.validateWordPressUrl(normalizedUrl);

    if (!validationResult.isValid) {
      throw new BadRequestException(
        validationResult.errorMessage || 'Invalid WordPress URL',
      );
    }

    const mcpServer = this.mcpServerRepository.create({
      wordpressUrl: normalizedUrl,
      siteName: validationResult.siteName,
      siteDescription: validationResult.siteDescription,
      postCount: validationResult.postsCount,
      status: McpServerStatus.ACTIVE,
    });

    const savedServer = await this.mcpServerRepository.save(mcpServer);
    this.logger.log(`Created MCP server for: ${normalizedUrl} with ID: ${savedServer.id}`);

    return this.toServerInfo(savedServer);
  }

  async findAll(): Promise<McpServerInfo[]> {
    const servers = await this.mcpServerRepository.find({
      order: { createdAt: 'DESC' },
    });

    return servers.map((server) => this.toServerInfo(server));
  }

  async findOne(id: string): Promise<McpServerInfo> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    return this.toServerInfo(server);
  }

  async delete(id: string): Promise<void> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    await this.mcpServerRepository.remove(server);
    this.logger.log(`Deleted MCP server with ID: ${id}`);
  }

  async sync(id: string): Promise<McpServerInfo> {
    const server = await this.mcpServerRepository.findOne({ where: { id } });

    if (!server) {
      throw new NotFoundException(`MCP server with ID ${id} not found`);
    }

    const validationResult = await this.wordpressService.validateWordPressUrl(
      server.wordpressUrl,
    );

    if (!validationResult.isValid) {
      server.status = McpServerStatus.ERROR;
      server.lastError = validationResult.errorMessage;
    } else {
      server.siteName = validationResult.siteName;
      server.siteDescription = validationResult.siteDescription;
      server.postCount = validationResult.postsCount;
      server.status = McpServerStatus.ACTIVE;
      server.lastError = null;
    }

    server.lastSyncAt = new Date();
    const updatedServer = await this.mcpServerRepository.save(server);
    this.logger.log(`Synced MCP server with ID: ${id}`);

    return this.toServerInfo(updatedServer);
  }

  private toServerInfo(server: McpServer): McpServerInfo {
    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');

    return {
      id: server.id,
      wordpressUrl: server.wordpressUrl,
      siteName: server.siteName,
      status: server.status,
      postCount: server.postCount,
      createdAt: server.createdAt.toISOString(),
      connectionEndpoint: `${baseUrl}/mcp/${server.id}`,
    };
  }
}
