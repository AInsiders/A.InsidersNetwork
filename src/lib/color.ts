// Convert HEX color to Discord integer
export function hexToDiscordColor(hex: string): number {
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  
  // Parse hex to integer
  const color = parseInt(cleanHex, 16);
  
  // Ensure it's a valid color
  if (isNaN(color) || color < 0 || color > 0xFFFFFF) {
    return 0;
  }
  
  return color;
}

// Convert Discord integer to HEX color
export function discordColorToHex(color: number): string {
  // Ensure valid range
  const clampedColor = Math.max(0, Math.min(color, 0xFFFFFF));
  
  // Convert to hex and pad with zeros
  return '#' + clampedColor.toString(16).padStart(6, '0').toUpperCase();
}

// Validate HEX color
export function isValidHexColor(hex: string): boolean {
  const hexRegex = /^#?([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  return hexRegex.test(hex);
}

// Generate random Discord color
export function generateRandomColor(): string {
  const color = Math.floor(Math.random() * 0xFFFFFF);
  return discordColorToHex(color);
}

// Common Discord colors
export const DISCORD_COLORS = {
  DEFAULT: '#5865f2',
  SUCCESS: '#57f287',
  WARNING: '#fee75c',
  ERROR: '#ed4245',
  INFO: '#5865f2',
  PURPLE: '#9b59b6',
  ORANGE: '#e67e22',
  TEAL: '#1abc9c',
  PINK: '#e91e63',
  BROWN: '#795548',
} as const;

// Color presets for common embed types
export const COLOR_PRESETS = {
  announcement: DISCORD_COLORS.INFO,
  patch: DISCORD_COLORS.SUCCESS,
  giveaway: DISCORD_COLORS.WARNING,
  alert: DISCORD_COLORS.ERROR,
  update: DISCORD_COLORS.PURPLE,
  event: DISCORD_COLORS.TEAL,
  maintenance: DISCORD_COLORS.ORANGE,
} as const;
