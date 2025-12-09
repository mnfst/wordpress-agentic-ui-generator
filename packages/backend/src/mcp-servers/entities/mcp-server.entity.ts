import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { McpServerStatus } from '@wordpress-mcp/shared';

@Entity('mcp_servers')
export class McpServer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index()
  slug!: string;

  @Column({ type: 'varchar', length: 767, unique: true })
  wordpressUrl!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  siteName!: string | null;

  @Column({ type: 'text', nullable: true })
  siteDescription!: string | null;

  @Column({
    type: 'enum',
    enum: McpServerStatus,
    default: McpServerStatus.ACTIVE,
  })
  @Index()
  status!: McpServerStatus;

  @Column({ type: 'int', nullable: true })
  postCount!: number | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'datetime', nullable: true })
  lastSyncAt!: Date | null;

  @Column({ type: 'text', nullable: true })
  lastError!: string | null;

  @Column({ type: 'boolean', default: false })
  @Index()
  featured!: boolean;
}
