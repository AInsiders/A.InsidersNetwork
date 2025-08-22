import React from 'react';
import { motion } from 'framer-motion';
import { Palette, Megaphone, Wrench, Gift, AlertTriangle } from 'lucide-react';
import type { EmbedState } from '@/types';
import { COLOR_PRESETS } from '@/lib/color';
import { createPresetBlocks } from '@/lib/blocks';

interface PresetsProps {
  onLoadPreset: (preset: EmbedState) => void;
}

interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  type: 'announcement' | 'patch' | 'giveaway' | 'alert';
}

const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'announcement',
    name: 'Announcement',
    description: 'General server announcement with title, description, and footer',
    icon: <Megaphone className="w-4 h-4" />,
    color: COLOR_PRESETS.announcement,
    type: 'announcement',
  },
  {
    id: 'patch',
    name: 'Patch Notes',
    description: 'Update or patch notes with fields for changes',
    icon: <Wrench className="w-4 h-4" />,
    color: COLOR_PRESETS.patch,
    type: 'patch',
  },
  {
    id: 'giveaway',
    name: 'Giveaway',
    description: 'Giveaway announcement with multiple fields',
    icon: <Gift className="w-4 h-4" />,
    color: COLOR_PRESETS.giveaway,
    type: 'giveaway',
  },
  {
    id: 'alert',
    name: 'Alert',
    description: 'Important alert or warning message',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: COLOR_PRESETS.alert,
    type: 'alert',
  },
];

export function Presets({ onLoadPreset }: PresetsProps) {
  const handleLoadPreset = (template: PresetTemplate) => {
    const blocks = createPresetBlocks(template.type);
    const preset: EmbedState = {
      colorHex: template.color,
      blocks,
    };
    onLoadPreset(preset);
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3 className="font-medium">Templates</h3>
        <p className="text-xs text-muted-foreground">Quick start with predefined layouts</p>
      </div>

      <div className="space-y-2">
        {PRESET_TEMPLATES.map((template) => (
          <motion.button
            key={template.id}
            onClick={() => handleLoadPreset(template)}
            className="w-full p-3 text-left bg-card border rounded-lg hover:bg-accent hover:border-primary/50 transition-all duration-200 group"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-start gap-3">
              <div 
                className="p-2 rounded-md text-white"
                style={{ backgroundColor: template.color }}
              >
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">
                  {template.name}
                </h4>
                <p className="text-xs text-muted-foreground mt-1">
                  {template.description}
                </p>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      <div className="pt-4 border-t">
        <div className="text-xs font-medium text-muted-foreground mb-2">Color Presets</div>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(COLOR_PRESETS).map(([name, color]) => (
            <button
              key={name}
              className="w-full h-8 rounded border-2 border-transparent hover:border-primary transition-colors"
              style={{ backgroundColor: color }}
              title={name.charAt(0).toUpperCase() + name.slice(1)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
