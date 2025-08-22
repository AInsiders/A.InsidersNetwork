import { z } from 'zod';

// Discord embed field schema
export const embedFieldSchema = z.object({
  name: z.string().max(256, "Field name must be 256 characters or less"),
  value: z.string().max(1024, "Field value must be 1024 characters or less"),
  inline: z.boolean().optional().default(false),
});

// Discord embed author schema
export const embedAuthorSchema = z.object({
  name: z.string().max(256, "Author name must be 256 characters or less"),
  url: z.string().url().optional(),
  icon_url: z.string().url().optional(),
});

// Discord embed footer schema
export const embedFooterSchema = z.object({
  text: z.string().max(2048, "Footer text must be 2048 characters or less"),
  icon_url: z.string().url().optional(),
});

// Discord embed image schema
export const embedImageSchema = z.object({
  url: z.string().url(),
});

// Discord embed thumbnail schema
export const embedThumbnailSchema = z.object({
  url: z.string().url(),
});

// Main Discord embed schema
export const embedSchema = z.object({
  title: z.string().max(256, "Title must be 256 characters or less").optional(),
  description: z.string().max(4096, "Description must be 4096 characters or less").optional(),
  url: z.string().url().optional(),
  color: z.number().int().min(0).max(0xFFFFFF).optional(),
  author: embedAuthorSchema.optional(),
  footer: embedFooterSchema.optional(),
  thumbnail: embedThumbnailSchema.optional(),
  image: embedImageSchema.optional(),
  timestamp: z.string().datetime().optional(),
  fields: z.array(embedFieldSchema).max(25, "Maximum 25 fields allowed").optional(),
});

// Webhook payload schema
export const webhookPayloadSchema = z.object({
  username: z.string().max(80, "Username must be 80 characters or less").optional(),
  avatar_url: z.string().url().optional(),
  embeds: z.array(embedSchema).max(10, "Maximum 10 embeds allowed"),
});

// Export types
export type EmbedField = z.infer<typeof embedFieldSchema>;
export type EmbedAuthor = z.infer<typeof embedAuthorSchema>;
export type EmbedFooter = z.infer<typeof embedFooterSchema>;
export type EmbedImage = z.infer<typeof embedImageSchema>;
export type EmbedThumbnail = z.infer<typeof embedThumbnailSchema>;
export type DiscordEmbed = z.infer<typeof embedSchema>;
export type WebhookPayload = z.infer<typeof webhookPayloadSchema>;

// Validation helpers
export const validateEmbed = (embed: DiscordEmbed) => {
  return embedSchema.safeParse(embed);
};

export const validateWebhookPayload = (payload: WebhookPayload) => {
  return webhookPayloadSchema.safeParse(payload);
};

// Character limit constants
export const EMBED_LIMITS = {
  TITLE_MAX: 256,
  DESCRIPTION_MAX: 4096,
  FIELD_NAME_MAX: 256,
  FIELD_VALUE_MAX: 1024,
  FOOTER_TEXT_MAX: 2048,
  AUTHOR_NAME_MAX: 256,
  USERNAME_MAX: 80,
  FIELDS_MAX: 25,
  EMBEDS_MAX: 10,
} as const;
