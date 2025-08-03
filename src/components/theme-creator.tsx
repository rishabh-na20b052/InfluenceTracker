'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Palette, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { CustomTheme } from '@/lib/theme-utils';
import { 
  hexToRgb, 
  rgbToHex, 
  isValidHex, 
  isValidRgb, 
  saveTheme, 
  getAllThemes, 
  deleteTheme, 
  applyTheme, 
  generateThemeId,
  resetToDefaultTheme
} from '@/lib/theme-utils';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  showPreview?: boolean;
}

function ColorInput({ label, value, onChange, showPreview = true }: ColorInputProps) {
  const [inputType, setInputType] = useState<'hex' | 'rgb'>('hex');
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });

  useEffect(() => {
    if (value && isValidHex(value)) {
      const rgb = hexToRgb(value);
      setRgbValues(rgb);
    }
  }, [value]);

  const handleHexChange = (hex: string) => {
    if (hex.startsWith('#')) {
      onChange(hex);
    } else {
      onChange(`#${hex}`);
    }
  };

  const handleRgbChange = (type: 'r' | 'g' | 'b', val: string) => {
    const num = parseInt(val) || 0;
    const newRgb = { ...rgbValues, [type]: Math.max(0, Math.min(255, num)) };
    setRgbValues(newRgb);
    onChange(rgbToHex(newRgb.r, newRgb.g, newRgb.b));
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-2">
        <div className="flex-1">
          {inputType === 'hex' ? (
            <Input
              value={value}
              onChange={(e) => handleHexChange(e.target.value)}
              placeholder="#000000"
              className="font-mono"
            />
          ) : (
            <div className="flex gap-1">
              <Input
                value={rgbValues.r}
                onChange={(e) => handleRgbChange('r', e.target.value)}
                placeholder="R"
                type="number"
                min="0"
                max="255"
                className="w-16"
              />
              <Input
                value={rgbValues.g}
                onChange={(e) => handleRgbChange('g', e.target.value)}
                placeholder="G"
                type="number"
                min="0"
                max="255"
                className="w-16"
              />
              <Input
                value={rgbValues.b}
                onChange={(e) => handleRgbChange('b', e.target.value)}
                placeholder="B"
                type="number"
                min="0"
                max="255"
                className="w-16"
              />
            </div>
          )}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setInputType(inputType === 'hex' ? 'rgb' : 'hex')}
        >
          {inputType === 'hex' ? 'RGB' : 'HEX'}
        </Button>
        {showPreview && (
          <div
            className="w-8 h-8 rounded border"
            style={{ backgroundColor: value }}
          />
        )}
      </div>
    </div>
  );
}

export default function ThemeCreator() {
  const [open, setOpen] = useState(false);
  const [themeName, setThemeName] = useState('');
  const [currentTheme, setCurrentTheme] = useState<CustomTheme>({
    id: '',
    name: '',
    colors: {
      primary: '#0f172a',
      secondary: '#f1f5f9',
      accent: '#3b82f6',
      background: '#ffffff',
      foreground: '#0f172a',
      muted: '#f8fafc',
      mutedForeground: '#64748b',
      border: '#e2e8f0',
      input: '#ffffff',
      ring: '#3b82f6',
      destructive: '#ef4444',
      destructiveForeground: '#ffffff',
      card: '#ffffff',
      cardForeground: '#0f172a',
      popover: '#ffffff',
      popoverForeground: '#0f172a',
      success: '#22c55e',
      successForeground: '#ffffff',
      warning: '#f59e0b',
      warningForeground: '#ffffff',
    },
    createdAt: Date.now(),
  });
  const [savedThemes, setSavedThemes] = useState<CustomTheme[]>([]);
  const [copiedTheme, setCopiedTheme] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setSavedThemes(getAllThemes());
  }, []);

  const handleSaveTheme = () => {
    if (!themeName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Theme Name Required',
        description: 'Please enter a name for your theme.',
      });
      return;
    }

    const newTheme: CustomTheme = {
      ...currentTheme,
      id: generateThemeId(),
      name: themeName,
      createdAt: Date.now(),
    };

    saveTheme(newTheme);
    setSavedThemes(getAllThemes());
    setOpen(false);
    setThemeName('');
    
    toast({
      title: 'Theme Saved!',
      description: `Theme "${themeName}" has been saved successfully.`,
    });
  };

  const handleApplyTheme = (theme: CustomTheme) => {
    applyTheme(theme);
    toast({
      title: 'Theme Applied!',
      description: `Theme "${theme.name}" has been applied.`,
    });
  };

  const handleResetTheme = () => {
    resetToDefaultTheme();
    toast({
      title: 'Theme Reset!',
      description: 'Theme has been reset to default.',
    });
  };

  const handleDeleteTheme = (themeId: string) => {
    deleteTheme(themeId);
    setSavedThemes(getAllThemes());
    toast({
      title: 'Theme Deleted',
      description: 'Theme has been deleted successfully.',
    });
  };

  const handleCopyTheme = async (theme: CustomTheme) => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(theme, null, 2));
      setCopiedTheme(theme.id);
      setTimeout(() => setCopiedTheme(null), 2000);
      toast({
        title: 'Theme Copied!',
        description: 'Theme configuration copied to clipboard.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Copy Failed',
        description: 'Failed to copy theme to clipboard.',
      });
    }
  };

  const colorGroups = [
    {
      title: 'Primary Colors',
      colors: [
        { key: 'primary', label: 'Primary' },
        { key: 'secondary', label: 'Secondary' },
        { key: 'accent', label: 'Accent' },
      ],
    },
    {
      title: 'Background Colors',
      colors: [
        { key: 'background', label: 'Background' },
        { key: 'foreground', label: 'Foreground' },
        { key: 'card', label: 'Card' },
        { key: 'cardForeground', label: 'Card Foreground' },
      ],
    },
    {
      title: 'Interactive Colors',
      colors: [
        { key: 'border', label: 'Border' },
        { key: 'input', label: 'Input' },
        { key: 'ring', label: 'Ring' },
        { key: 'popover', label: 'Popover' },
        { key: 'popoverForeground', label: 'Popover Foreground' },
      ],
    },
    {
      title: 'Status Colors',
      colors: [
        { key: 'destructive', label: 'Destructive' },
        { key: 'destructiveForeground', label: 'Destructive Foreground' },
        { key: 'success', label: 'Success' },
        { key: 'successForeground', label: 'Success Foreground' },
        { key: 'warning', label: 'Warning' },
        { key: 'warningForeground', label: 'Warning Foreground' },
      ],
    },
    {
      title: 'Text Colors',
      colors: [
        { key: 'muted', label: 'Muted' },
        { key: 'mutedForeground', label: 'Muted Foreground' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Custom Themes</h3>
          <p className="text-sm text-muted-foreground">
            Create and manage your custom color themes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetTheme}>
            Reset to Default
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Theme
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Custom Theme</DialogTitle>
                <DialogDescription>
                  Design your own color palette. You can input colors in HEX or RGB format.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="theme-name">Theme Name</Label>
                  <Input
                    id="theme-name"
                    value={themeName}
                    onChange={(e) => setThemeName(e.target.value)}
                    placeholder="Enter theme name..."
                  />
                </div>

                <div className="grid gap-6">
                  {colorGroups.map((group) => (
                    <Card key={group.title}>
                      <CardHeader>
                        <CardTitle className="text-base">{group.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          {group.colors.map((color) => (
                            <ColorInput
                              key={color.key}
                              label={color.label}
                              value={currentTheme.colors[color.key as keyof typeof currentTheme.colors]}
                              onChange={(value) =>
                                setCurrentTheme({
                                  ...currentTheme,
                                  colors: {
                                    ...currentTheme.colors,
                                    [color.key]: value,
                                  },
                                })
                              }
                            />
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveTheme}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Theme
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Separator />

      <div className="grid gap-4">
        <h4 className="text-md font-medium">Saved Themes</h4>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {savedThemes.map((theme) => (
            <Card key={theme.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">{theme.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleApplyTheme(theme)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopyTheme(theme)}
                    >
                      {copiedTheme === theme.id ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    {!theme.id.startsWith('default') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTheme(theme.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-1">
                  {Object.entries(theme.colors).slice(0, 8).map(([key, color]) => (
                    <div
                      key={key}
                      className="w-6 h-6 rounded border"
                      style={{ backgroundColor: color }}
                      title={`${key}: ${color}`}
                    />
                  ))}
                </div>
                <div className="mt-2 text-xs text-muted-foreground">
                  {new Date(theme.createdAt).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
} 