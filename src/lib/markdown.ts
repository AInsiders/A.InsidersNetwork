// Safe markdown renderer for Discord embeds
// Only supports Discord's allowed markdown syntax

// Discord markdown patterns
const MARKDOWN_PATTERNS = {
  // Bold: **text** or __text__
  bold: /\*\*(.*?)\*\*|__(.*?)__/g,
  
  // Italic: *text* or _text_
  italic: /\*(.*?)\*|_(.*?)_/g,
  
  // Underline: __text__
  underline: /__(.*?)__/g,
  
  // Strikethrough: ~~text~~
  strikethrough: /~~(.*?)~~/g,
  
  // Code: `code`
  inlineCode: /`(.*?)`/g,
  
  // Code block: ```code```
  codeBlock: /```(.*?)```/gs,
  
  // URL: [text](url)
  url: /\[([^\]]+)\]\(([^)]+)\)/g,
  
  // Line breaks
  lineBreak: /\n/g,
} as const;

// Convert markdown to HTML (safe for Discord)
export function markdownToHtml(text: string): string {
  if (!text) return '';
  
  let html = text;
  
  // Handle code blocks first (to avoid processing markdown inside them)
  html = html.replace(MARKDOWN_PATTERNS.codeBlock, (match, code) => {
    return `<pre><code>${escapeHtml(code.trim())}</code></pre>`;
  });
  
  // Handle URLs
  html = html.replace(MARKDOWN_PATTERNS.url, (match, text, url) => {
    return `<a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(text)}</a>`;
  });
  
  // Handle inline code
  html = html.replace(MARKDOWN_PATTERNS.inlineCode, (match, code) => {
    return `<code>${escapeHtml(code)}</code>`;
  });
  
  // Handle bold
  html = html.replace(MARKDOWN_PATTERNS.bold, (match, text1, text2) => {
    return `<strong>${escapeHtml(text1 || text2)}</strong>`;
  });
  
  // Handle italic
  html = html.replace(MARKDOWN_PATTERNS.italic, (match, text1, text2) => {
    return `<em>${escapeHtml(text1 || text2)}</em>`;
  });
  
  // Handle strikethrough
  html = html.replace(MARKDOWN_PATTERNS.strikethrough, (match, text) => {
    return `<del>${escapeHtml(text)}</del>`;
  });
  
  // Handle line breaks
  html = html.replace(MARKDOWN_PATTERNS.lineBreak, '<br>');
  
  return html;
}

// Escape HTML to prevent XSS
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Convert HTML back to markdown (for editing)
export function htmlToMarkdown(html: string): string {
  if (!html) return '';
  
  let markdown = html;
  
  // Convert HTML tags back to markdown
  markdown = markdown
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<em>(.*?)<\/em>/g, '*$1*')
    .replace(/<del>(.*?)<\/del>/g, '~~$1~~')
    .replace(/<code>(.*?)<\/code>/g, '`$1`')
    .replace(/<pre><code>(.*?)<\/code><\/pre>/gs, '```$1```')
    .replace(/<a href="([^"]+)"[^>]*>(.*?)<\/a>/g, '[$2]($1)')
    .replace(/<br\s*\/?>/g, '\n')
    .replace(/<[^>]*>/g, ''); // Remove any other HTML tags
  
  return markdown;
}

// Validate markdown (check for unsupported syntax)
export function validateMarkdown(text: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check for unsupported markdown
  const unsupportedPatterns = [
    { pattern: /^#{1,6}\s/, message: 'Headers (# ## ### etc.) are not supported in Discord embeds' },
    { pattern: /^\s*[-*+]\s/, message: 'Unordered lists are not supported in Discord embeds' },
    { pattern: /^\s*\d+\.\s/, message: 'Ordered lists are not supported in Discord embeds' },
    { pattern: /^\s*>\s/, message: 'Blockquotes are not supported in Discord embeds' },
    { pattern: /^\s*\|.*\|.*\|/, message: 'Tables are not supported in Discord embeds' },
  ];
  
  const lines = text.split('\n');
  lines.forEach((line, index) => {
    unsupportedPatterns.forEach(({ pattern, message }) => {
      if (pattern.test(line)) {
        errors.push(`Line ${index + 1}: ${message}`);
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Get character count for markdown text
export function getMarkdownLength(text: string): number {
  // Remove markdown syntax for accurate character count
  let plainText = text;
  
  // Remove markdown patterns
  Object.values(MARKDOWN_PATTERNS).forEach(pattern => {
    if (pattern === MARKDOWN_PATTERNS.url) {
      // For URLs, count the display text, not the URL
      plainText = plainText.replace(pattern, '$1');
    } else {
      plainText = plainText.replace(pattern, '$1$2');
    }
  });
  
  return plainText.length;
}

// Preview markdown (returns HTML for display)
export function previewMarkdown(text: string): string {
  const validation = validateMarkdown(text);
  if (!validation.isValid) {
    return `<div class="text-red-500 text-sm">${validation.errors.join('<br>')}</div>`;
  }
  
  return markdownToHtml(text);
}
