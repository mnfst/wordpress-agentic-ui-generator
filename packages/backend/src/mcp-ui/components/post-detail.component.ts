import { Injectable } from '@nestjs/common';
import type { PostDetail } from '@wordpress-mcp/shared';

@Injectable()
export class PostDetailComponent {
  /**
   * Builds an HTML representation of a post detail for MCP UI
   * This will be used when ext-apps is stable
   */
  buildHtml(post: PostDetail): string {
    const featuredImageHtml = post.featuredImage
      ? `<img src="${post.featuredImage.url}" alt="${post.featuredImage.alt}" style="max-width: 100%; height: auto; border-radius: 8px; margin-bottom: 16px;" />`
      : '';

    const categoriesHtml =
      post.categories.length > 0
        ? `<span style="margin-right: 8px;">Categories: ${post.categories.map((c) => c.name).join(', ')}</span>`
        : '';

    const tagsHtml =
      post.tags.length > 0
        ? `<span>Tags: ${post.tags.map((t) => t.name).join(', ')}</span>`
        : '';

    return `
      <article style="padding: 16px; font-family: system-ui, sans-serif; max-width: 800px;">
        ${featuredImageHtml}

        <h1 style="margin: 0 0 8px 0; font-size: 24px; color: #333;">${post.title}</h1>

        <div style="margin-bottom: 16px; font-size: 14px; color: #666;">
          ${post.author ? `<span style="margin-right: 16px;">By ${post.author.name}</span>` : ''}
          <span style="margin-right: 16px;">${new Date(post.date).toLocaleDateString()}</span>
          <a href="${post.link}" style="color: #0066cc; text-decoration: none;">View Original</a>
        </div>

        <div style="margin-bottom: 16px; font-size: 13px; color: #888;">
          ${categoriesHtml}
          ${tagsHtml}
        </div>

        <div style="line-height: 1.6; color: #333;">
          ${post.content}
        </div>
      </article>
    `;
  }

  /**
   * Builds a plain text representation of a post detail
   * Used as fallback for MCP clients that don't support UI
   */
  buildText(post: PostDetail): string {
    const metaLines: string[] = [];

    if (post.author) {
      metaLines.push(`Author: ${post.author.name}`);
    }
    metaLines.push(`Date: ${new Date(post.date).toLocaleDateString()}`);
    metaLines.push(`Link: ${post.link}`);

    if (post.categories.length > 0) {
      metaLines.push(`Categories: ${post.categories.map((c) => c.name).join(', ')}`);
    }
    if (post.tags.length > 0) {
      metaLines.push(`Tags: ${post.tags.map((t) => t.name).join(', ')}`);
    }
    if (post.featuredImage) {
      metaLines.push(`Featured Image: ${post.featuredImage.url}`);
    }

    const contentText = this.stripHtml(post.content);

    return `# ${post.title}

${metaLines.join('\n')}

---

${contentText}`;
  }

  /**
   * Strips HTML tags from content for plain text output
   */
  private stripHtml(html: string): string {
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
}
