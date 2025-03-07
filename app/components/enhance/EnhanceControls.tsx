import React from 'react';
import { Sliders, Zap, Image, Sun, Droplet, Aperture, User, Package, Triangle, Circle, Coffee } from 'react-feather';

interface EnhanceSettings {
  brightness?: number;
  contrast?: number;
  saturation?: number;
  sharpness?: number;
  vibrance?: number;
  preset?: string;
}

interface EnhanceControlsProps {
  settings: EnhanceSettings;
  onSettingsChange: (settings: EnhanceSettings) => void;
  onPresetSelect: (preset: string) => void;
  onAutoEnhance: () => void;
  isProcessing: boolean;
}

const presets = [
  { id: 'auto', name: 'Auto Enhance', icon: Zap, transformations: ['e_improve', 'e_enhance'] },
  { id: 'professional', name: 'Professional', icon: Image, transformations: ['e_enhance:50', 'e_saturation:20', 'e_contrast:10'] },
  { id: 'hdr', name: 'HDR', icon: Sun, transformations: ['e_improve', 'e_contrast:30', 'e_vibrance:30'] },
  { id: 'dramatic', name: 'Dramatic', icon: Droplet, transformations: ['e_art:athena', 'e_contrast:40'] },
  { id: 'artistic', name: 'Artistic', icon: Aperture, transformations: ['e_art:zorro'] },
  { id: 'portrait', name: 'Portrait', icon: User, transformations: ['e_improve', 'e_redeye', 'e_skin_tone'] },
  { id: 'product', name: 'Product', icon: Package, transformations: ['e_gen_restore', 'e_enhance', 'e_improve'] },
  { id: 'landscape', name: 'Landscape', icon: Triangle, transformations: ['e_improve', 'e_vibrance:30', 'e_saturation:20'] },
  { id: 'blackAndWhite', name: 'B&W', icon: Circle, transformations: ['e_grayscale', 'e_contrast:30'] },
  { id: 'vintage', name: 'Vintage', icon: Coffee, transformations: ['e_sepia:50', 'e_vignette'] }
];

export default function EnhanceControls({
  settings,
  onSettingsChange,
  onPresetSelect,
  onAutoEnhance,
  isProcessing,
}: EnhanceControlsProps) {
  const handleSliderChange = (name: keyof EnhanceSettings, value: number) => {
    onSettingsChange({ ...settings, [name]: value });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-6">
      {/* Presets */}
      <div>
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Sliders className="w-5 h-5" />
          <span>Enhancement Presets</span>
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {presets.map(({ id, name, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onPresetSelect(id)}
              className={`flex flex-col items-center p-3 rounded-lg border transition-colors ${
                settings.preset === id
                  ? 'bg-blue-50 border-blue-500 text-blue-700'
                  : 'border-gray-200 hover:border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Icon className="w-6 h-6 mb-2" />
              <span className="text-sm">{name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual Controls */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manual Adjustments</h3>
        <div className="space-y-4">
          {/* Brightness */}
          <div>
            <label htmlFor="brightness" className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Brightness</span>
              <span>{settings.brightness || 0}%</span>
            </label>
            <input
              id="brightness"
              type="range"
              min="-50"
              max="50"
              value={settings.brightness || 0}
              onChange={(e) => handleSliderChange('brightness', parseInt(e.target.value))}
              className="w-full"
              aria-label="Adjust brightness"
              title="Adjust brightness"
            />
          </div>

          {/* Contrast */}
          <div>
            <label htmlFor="contrast" className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Contrast</span>
              <span>{settings.contrast || 0}%</span>
            </label>
            <input
              id="contrast"
              type="range"
              min="-50"
              max="50"
              value={settings.contrast || 0}
              onChange={(e) => handleSliderChange('contrast', parseInt(e.target.value))}
              className="w-full"
              aria-label="Adjust contrast"
              title="Adjust contrast"
            />
          </div>

          {/* Saturation */}
          <div>
            <label htmlFor="saturation" className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Saturation</span>
              <span>{settings.saturation || 0}%</span>
            </label>
            <input
              id="saturation"
              type="range"
              min="-50"
              max="50"
              value={settings.saturation || 0}
              onChange={(e) => handleSliderChange('saturation', parseInt(e.target.value))}
              className="w-full"
              aria-label="Adjust saturation"
              title="Adjust saturation"
            />
          </div>

          {/* Sharpness */}
          <div>
            <label htmlFor="sharpness" className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Sharpness</span>
              <span>{settings.sharpness || 0}%</span>
            </label>
            <input
              id="sharpness"
              type="range"
              min="0"
              max="100"
              value={settings.sharpness || 0}
              onChange={(e) => handleSliderChange('sharpness', parseInt(e.target.value))}
              className="w-full"
              aria-label="Adjust sharpness"
              title="Adjust sharpness"
            />
          </div>

          {/* Vibrance */}
          <div>
            <label htmlFor="vibrance" className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Vibrance</span>
              <span>{settings.vibrance || 0}%</span>
            </label>
            <input
              id="vibrance"
              type="range"
              min="-50"
              max="50"
              value={settings.vibrance || 0}
              onChange={(e) => handleSliderChange('vibrance', parseInt(e.target.value))}
              className="w-full"
              aria-label="Adjust vibrance"
              title="Adjust vibrance"
            />
          </div>
        </div>
      </div>

      {/* Auto Enhance Button */}
      <button
        onClick={onAutoEnhance}
        disabled={isProcessing}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium flex items-center justify-center gap-2 ${
          isProcessing
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 hover:bg-blue-600'
        }`}
      >
        <Zap className="w-5 h-5" />
        {isProcessing ? 'Processing...' : 'Auto Enhance'}
      </button>
    </div>
  );
} 