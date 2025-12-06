import { Injectable } from '@nestjs/common';
import type { ListPostsResponse } from '@wordpress-mcp/shared';

@Injectable()
export class PostsListComponent {
  /**
   * Builds an HTML representation of a posts list for MCP UI
   * This will be used when ext-apps is stable
   */
  buildHtml(response: ListPostsResponse): string {
    const { items, pagination } = response;

    if (items.length === 0) {
      return `
        <div style="padding: 16px; font-family: system-ui, sans-serif;">
          <p style="color: #666;">No posts found matching your criteria.</p>
        </div>
      `;
    }

    const postsHtml = items
      .map(
        (post) => `
        <article style="border-bottom: 1px solid #eee; padding: 12px 0;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px;">
            <a href="${post.link}" style="color: #0066cc; text-decoration: none;">${post.title}</a>
          </h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${post.excerpt}</p>
          <div style="font-size: 12px; color: #999;">
            <span>ID: ${post.id}</span> |
            <span>${new Date(post.date).toLocaleDateString()}</span>
          </div>
        </article>
      `,
      )
      .join('');

    const paginationHtml = `
      <div style="margin-top: 16px; padding: 12px 0; border-top: 1px solid #eee; font-size: 14px; color: #666;">
        Page ${pagination.page} of ${pagination.totalPages} (${pagination.total} total posts)
        ${pagination.hasPreviousPage ? ' | Previous' : ''}
        ${pagination.hasNextPage ? ' | Next' : ''}
      </div>
    `;

    return `
      <div style="padding: 16px; font-family: system-ui, sans-serif; max-width: 600px;">
        ${postsHtml}
        ${paginationHtml}
      </div>
    `;
  }

  /**
   * Builds a plain text representation of a posts list
   * Used as fallback for MCP clients that don't support UI
   */
  buildText(response: ListPostsResponse): string {
    const { items, pagination } = response;

    if (items.length === 0) {
      return 'No posts found matching your criteria.';
    }

    const postsText = items
      .map(
        (post, index) =>
          `${index + 1}. [ID: ${post.id}] ${post.title}\n   ${post.excerpt}\n   Date: ${new Date(post.date).toLocaleDateString()} | Link: ${post.link}`,
      )
      .join('\n\n');

    const paginationText = `\n\n---\nPage ${pagination.page} of ${pagination.totalPages} (${pagination.total} total posts)`;

    return postsText + paginationText;
  }
}
