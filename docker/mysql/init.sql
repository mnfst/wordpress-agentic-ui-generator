-- WordPress MCP Generator Database Initialization

-- Ensure UTF8MB4 encoding for full Unicode support
ALTER DATABASE mcp_generator CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Grant privileges to the application user
GRANT ALL PRIVILEGES ON mcp_generator.* TO 'mcp_user'@'%';
FLUSH PRIVILEGES;

-- Note: Tables will be created by TypeORM migrations/sync
-- This file is for initial database setup only
