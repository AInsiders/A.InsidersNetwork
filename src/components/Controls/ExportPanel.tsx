import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Copy, Download, Check, AlertTriangle, Code, Webhook, FileText } from 'lucide-react';
import type { EmbedState } from '@/types';
import { hexToDiscordColor } from '@/lib/color';
import { validateEmbed, validateWebhookPayload } from '@/lib/schema';

interface ExportPanelProps {
  embed: EmbedState;
  onExport: (format: 'embed' | 'webhook' | 'markdown') => void;
}

export function ExportPanel({ embed, onExport }: ExportPanelProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'embed' | 'webhook' | 'markdown'>('embed');

  // Build Discord embed JSON
  const buildEmbedJSON = useCallback(() => {
    const discordEmbed: any = {};
    
    // Add color
    if (embed.colorHex) {
      discordEmbed.color = hexToDiscordColor(embed.colorHex);
    }
    
    // Process blocks
    embed.blocks.forEach(block => {
      switch (block.type) {
        case 'title':
          discordEmbed.title = block.text;
          break;
        case 'description':
          discordEmbed.description = block.markdown;
          break;
        case 'author':
          discordEmbed.author = {
            name: block.name,
            url: block.url,
            icon_url: block.iconUrl,
          };
          break;
        case 'footer':
          discordEmbed.footer = {
            text: block.text,
            icon_url: block.iconUrl,
          };
          break;
        case 'thumbnail':
          discordEmbed.thumbnail = { url: block.url };
          break;
        case 'image':
          discordEmbed.image = { url: block.url };
          break;
        case 'url':
          discordEmbed.url = block.href;
          break;
        case 'timestamp':
          if (block.enabled) {
            discordEmbed.timestamp = new Date().toISOString();
          }
          break;
        case 'field':
          if (!discordEmbed.fields) discordEmbed.fields = [];
          discordEmbed.fields.push({
            name: block.name,
            value: block.value,
            inline: block.inline,
          });
          break;
      }
    });
    
    return discordEmbed;
  }, [embed]);

  // Build webhook payload
  const buildWebhookPayload = useCallback(() => {
    const embed = buildEmbedJSON();
    return {
      embeds: [embed],
    };
  }, [buildEmbedJSON]);

  // Build markdown summary
  const buildMarkdownSummary = useCallback(() => {
    const lines: string[] = [];
    
    lines.push('# Discord Embed Summary');
    lines.push('');
    
    if (embed.colorHex) {
      lines.push(`**Color:** ${embed.colorHex}`);
      lines.push('');
    }
    
    lines.push('## Blocks');
    lines.push('');
    
    embed.blocks.forEach((block, index) => {
      lines.push(`### ${index + 1}. ${block.type.charAt(0).toUpperCase() + block.type.slice(1)}`);
      
      switch (block.type) {
        case 'title':
          lines.push(`- **Text:** ${block.text || '(empty)'}`);
          break;
        case 'description':
          lines.push(`- **Content:** ${block.markdown || '(empty)'}`);
          break;
        case 'author':
          lines.push(`- **Name:** ${block.name || '(empty)'}`);
          if (block.url) lines.push(`- **URL:** ${block.url}`);
          if (block.iconUrl) lines.push(`- **Icon:** ${block.iconUrl}`);
          break;
        case 'footer':
          lines.push(`- **Text:** ${block.text || '(empty)'}`);
          if (block.iconUrl) lines.push(`- **Icon:** ${block.iconUrl}`);
          break;
        case 'thumbnail':
        case 'image':
          lines.push(`- **URL:** ${block.url || '(empty)'}`);
          break;
        case 'url':
          lines.push(`- **URL:** ${block.href || '(empty)'}`);
          break;
        case 'timestamp':
          lines.push(`- **Enabled:** ${block.enabled ? 'Yes' : 'No'}`);
          break;
        case 'field':
          lines.push(`- **Name:** ${block.name || '(empty)'}`);
          lines.push(`- **Value:** ${block.value || '(empty)'}`);
          lines.push(`- **Inline:** ${block.inline ? 'Yes' : 'No'}`);
          break;
      }
      lines.push('');
    });
    
    return lines.join('\n');
  }, [embed]);

  // Get export data
  const getExportData = useCallback(() => {
    switch (exportFormat) {
      case 'embed':
        return {
          data: buildEmbedJSON(),
          validation: validateEmbed(buildEmbedJSON()),
        };
      case 'webhook':
        return {
          data: buildWebhookPayload(),
          validation: validateWebhookPayload(buildWebhookPayload()),
        };
      case 'markdown':
        return {
          data: buildMarkdownSummary(),
          validation: { success: true },
        };
      default:
        return { data: null, validation: { success: false } };
    }
  }, [exportFormat, buildEmbedJSON, buildWebhookPayload, buildMarkdownSummary]);

  // Copy to clipboard
  const copyToClipboard = useCallback(async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  }, []);

  // Download file
  const downloadFile = useCallback((content: string, filename: string) => {
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, []);

  const { data, validation } = getExportData();
  const isValid = validation.success;
  const errors = validation.success ? [] : validation.error?.issues || [];

  const getExportContent = () => {
    if (!data) return '';
    return typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  };

  const getFilename = () => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    switch (exportFormat) {
      case 'embed':
        return `discord-embed-${timestamp}.json`;
      case 'webhook':
        return `webhook-payload-${timestamp}.json`;
      case 'markdown':
        return `embed-summary-${timestamp}.md`;
      default:
        return `export-${timestamp}.json`;
    }
  };

  return (
    <div className="border-b bg-card p-4 space-y-4">
      <div>
        <h3 className="font-medium">Export</h3>
        <p className="text-xs text-muted-foreground">Generate Discord-compatible JSON</p>
      </div>

      {/* Format selector */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Format</div>
        <div className="flex gap-1">
          <button
            onClick={() => setExportFormat('embed')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
              exportFormat === 'embed'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Code className="w-3 h-3" />
            Embed
          </button>
          <button
            onClick={() => setExportFormat('webhook')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
              exportFormat === 'webhook'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <Webhook className="w-3 h-3" />
            Webhook
          </button>
          <button
            onClick={() => setExportFormat('markdown')}
            className={`flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded text-xs transition-colors ${
              exportFormat === 'markdown'
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            <FileText className="w-3 h-3" />
            Markdown
          </button>
        </div>
      </div>

      {/* Validation status */}
      <div className="flex items-center gap-2">
        {isValid ? (
          <Check className="w-4 h-4 text-green-500" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
        )}
        <span className="text-sm">
          {isValid ? 'Valid Discord embed' : `${errors.length} validation error${errors.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Validation errors */}
      {!isValid && errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((error, index) => (
            <div key={index} className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
              {error.message}
            </div>
          ))}
        </div>
      )}

      {/* Export actions */}
      <div className="flex gap-2">
        <button
          onClick={() => copyToClipboard(getExportContent(), exportFormat)}
          className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
        >
          {copied === exportFormat ? (
            <Check className="w-3 h-3" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          {copied === exportFormat ? 'Copied!' : 'Copy'}
        </button>
        <button
          onClick={() => downloadFile(getExportContent(), getFilename())}
          className="flex items-center justify-center gap-1 px-2 py-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
        >
          <Download className="w-3 h-3" />
          Download
        </button>
      </div>

      {/* Preview */}
      <div className="space-y-2">
        <div className="text-xs font-medium text-muted-foreground">Preview</div>
        <div className="bg-muted rounded p-2 max-h-32 overflow-y-auto">
          <pre className="text-xs text-muted-foreground whitespace-pre-wrap">
            {getExportContent()}
          </pre>
        </div>
      </div>
    </div>
  );
}
