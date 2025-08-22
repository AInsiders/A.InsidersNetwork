import React from 'react';
import type { Block } from '@/types';
import { markdownToHtml } from '@/lib/markdown';

interface DiscordPreviewProps {
  blocks: Block[];
}

export function DiscordPreview({ blocks }: DiscordPreviewProps) {
  // Build Discord embed from blocks
  const buildEmbedPreview = () => {
    const embed: any = {};
    
    blocks.forEach(block => {
      switch (block.type) {
        case 'title':
          embed.title = block.text;
          break;
        case 'description':
          embed.description = block.markdown;
          break;
        case 'author':
          embed.author = {
            name: block.name,
            url: block.url,
            icon_url: block.iconUrl,
          };
          break;
        case 'footer':
          embed.footer = {
            text: block.text,
            icon_url: block.iconUrl,
          };
          break;
        case 'thumbnail':
          embed.thumbnail = { url: block.url };
          break;
        case 'image':
          embed.image = { url: block.url };
          break;
        case 'url':
          embed.url = block.href;
          break;
        case 'timestamp':
          if (block.enabled) {
            embed.timestamp = new Date().toISOString();
          }
          break;
        case 'field':
          if (!embed.fields) embed.fields = [];
          embed.fields.push({
            name: block.name,
            value: block.value,
            inline: block.inline,
          });
          break;
      }
    });
    
    return embed;
  };

  const embed = buildEmbedPreview();

  return (
    <div className="bg-discord-dark border border-discord-lighter rounded-lg p-4 shadow-lg">
      <div className="text-xs text-gray-400 mb-2 font-medium">Live Preview</div>
      
      <div className="discord-embed">
        {/* Author */}
        {embed.author && (
          <div className="discord-embed-author">
            {embed.author.icon_url && (
              <img src={embed.author.icon_url} alt="" className="discord-embed-author-icon" />
            )}
            <span>{embed.author.name}</span>
          </div>
        )}

        {/* Title */}
        {embed.title && (
          <div className="discord-embed-title">
            {embed.url ? (
              <a href={embed.url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                {embed.title}
              </a>
            ) : (
              embed.title
            )}
          </div>
        )}

        {/* Description */}
        {embed.description && (
          <div 
            className="discord-embed-description"
            dangerouslySetInnerHTML={{ __html: markdownToHtml(embed.description) }}
          />
        )}

        {/* Thumbnail */}
        {embed.thumbnail && (
          <div className="flex justify-end">
            <img src={embed.thumbnail.url} alt="" className="discord-embed-thumbnail" />
          </div>
        )}

        {/* Fields */}
        {embed.fields && embed.fields.length > 0 && (
          <div className="discord-embed-fields">
            {embed.fields.map((field: any, index: number) => (
              <div key={index} className="discord-embed-field">
                <div className="discord-embed-field-name">{field.name}</div>
                <div className="discord-embed-field-value">{field.value}</div>
              </div>
            ))}
          </div>
        )}

        {/* Image */}
        {embed.image && (
          <img src={embed.image.url} alt="" className="discord-embed-image" />
        )}

        {/* Footer */}
        {embed.footer && (
          <div className="discord-embed-footer">
            {embed.footer.icon_url && (
              <img src={embed.footer.icon_url} alt="" className="discord-embed-footer-icon" />
            )}
            <span>{embed.footer.text}</span>
            {embed.timestamp && (
              <>
                <span className="mx-1">•</span>
                <span>{new Date(embed.timestamp).toLocaleString()}</span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
