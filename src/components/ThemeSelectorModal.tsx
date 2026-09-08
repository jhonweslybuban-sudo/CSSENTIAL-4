import React, { useState } from 'react';
import { Palette, Check, X, Sparkles, Layers, Sliders, Sun, Moon } from 'lucide-react';
import {
  THEME_PALETTES,
  ThemePaletteId,
  CustomThemeSettings,
  getSavedCustomSettings,
  applyCustomTheme
} from '../services/theme';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activePaletteId: ThemePaletteId;
  onSelectPalette: (id: ThemePaletteId) => void;
  onClose: () => void;
}

type TabType = 'all' | 'academic' | 'solid' | 'gradient' | 'custom';

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  activePaletteId,
  onSelectPalette,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [customSettings, setCustomSettings] = useState<CustomThemeSettings>(getSavedCustomSettings());

  if (!isOpen) return null;

  const allPalettes = Object.values(THEME_PALETTES).filter(p => p.id !== 'custom');

  const filteredPalettes = allPalettes.filter(p => {
    if (activeTab === 'all') return true;
    return p.category === activeTab;
  });

  const handleApplyCustom = () => {
    applyCustomTheme(customSettings);
    onSelectPalette('custom');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-700 flex items-center justify-center border border-blue-200">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 leading-tight">
                Website Background & Theme Customizer
              </h3>
              <p className="text-xs text-gray-500">
                Choose normal solid colors, gradient backdrops, or design your own custom theme.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
            aria-label="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-6 py-2.5 bg-gray-100 border-b border-gray-200 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
            }`}
          >
            All Themes ({allPalettes.length})
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'academic'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
            }`}
          >
            🏛 Academic Palettes
          </button>
          <button
            onClick={() => setActiveTab('solid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'solid'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
            }`}
          >
            🎨 Normal Colors (Solid)
          </button>
          <button
            onClick={() => setActiveTab('gradient')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
              activeTab === 'gradient'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200/70'
            }`}
          >
            ✨ Gradient Designs
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'custom'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Custom Designer</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab !== 'custom' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPalettes.map((palette) => {
                const isSelected = activePaletteId === palette.id;
                return (
                  <div
                    key={palette.id}
                    onClick={() => onSelectPalette(palette.id)}
                    className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/40 shadow-md ring-2 ring-blue-600/20'
                        : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
                    }`}
                  >
                    <div>
                      {/* Top status bar */}
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          palette.category === 'gradient'
                            ? 'bg-purple-100 text-purple-700'
                            : palette.category === 'solid'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {palette.category === 'gradient' ? '✨ Gradient' : palette.category === 'solid' ? '🎨 Solid Color' : '🏛 Academic'}
                        </span>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      {/* Title & Tagline */}
                      <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                        {palette.name}
                      </h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 mb-3 line-clamp-1">
                        {palette.tagline}
                      </p>

                      {/* Backdrop Preview Box */}
                      <div
                        className="w-full h-14 rounded-lg border border-black/10 shadow-inner flex items-center justify-center mb-3 relative overflow-hidden"
                        style={{ background: palette.bgPreview }}
                      >
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-white/85 text-gray-900 backdrop-blur-xs shadow-2xs">
                          Live Backdrop
                        </span>
                      </div>

                      {/* Color Palette Swatches */}
                      <div className="flex items-center gap-1 p-1.5 bg-gray-100 rounded-lg border border-gray-200/70">
                        {palette.colors.map((color, cIdx) => (
                          <div
                            key={cIdx}
                            className="flex-1 h-5 rounded-sm border border-black/10 transition-transform hover:scale-110"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[10px] text-gray-400 font-medium">
                        Click to activate
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectPalette(palette.id);
                        }}
                        className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'
                        }`}
                      >
                        {isSelected ? 'Applied' : 'Apply'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Custom Theme Designer Panel */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-6 rounded-2xl border border-gray-200">
              {/* Controls Column */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                  <Sliders className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-sm font-black text-gray-900 uppercase tracking-wide">
                    Personalized Theme Generator
                  </h4>
                </div>

                {/* Mode Selector: Solid vs Gradient */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Background Style
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomSettings(prev => ({ ...prev, mode: 'solid' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        customSettings.mode === 'solid'
                          ? 'bg-white border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}
                    >
                      🎨 Solid Normal Color
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomSettings(prev => ({ ...prev, mode: 'gradient' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all ${
                        customSettings.mode === 'gradient'
                          ? 'bg-white border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}
                    >
                      ✨ Gradient Design
                    </button>
                  </div>
                </div>

                {/* Color Pickers */}
                {customSettings.mode === 'solid' ? (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">
                      Background Color
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={customSettings.solidColor}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, solidColor: e.target.value }))}
                        className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                      />
                      <input
                        type="text"
                        value={customSettings.solidColor}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, solidColor: e.target.value }))}
                        className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 w-32 uppercase"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Gradient Start Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customSettings.gradientStart}
                            onChange={(e) => setCustomSettings(prev => ({ ...prev, gradientStart: e.target.value }))}
                            className="w-10 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={customSettings.gradientStart}
                            onChange={(e) => setCustomSettings(prev => ({ ...prev, gradientStart: e.target.value }))}
                            className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 w-24 uppercase"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-gray-700 mb-1">
                          Gradient End Color
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={customSettings.gradientEnd}
                            onChange={(e) => setCustomSettings(prev => ({ ...prev, gradientEnd: e.target.value }))}
                            className="w-10 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                          />
                          <input
                            type="text"
                            value={customSettings.gradientEnd}
                            onChange={(e) => setCustomSettings(prev => ({ ...prev, gradientEnd: e.target.value }))}
                            className="px-2 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 w-24 uppercase"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Gradient Angle Slider */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold text-gray-700 mb-1">
                        <span>Gradient Angle</span>
                        <span className="font-mono text-blue-600">{customSettings.gradientAngle}°</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="360"
                        step="15"
                        value={customSettings.gradientAngle}
                        onChange={(e) => setCustomSettings(prev => ({ ...prev, gradientAngle: Number(e.target.value) }))}
                        className="w-full accent-blue-600 cursor-pointer"
                      />
                    </div>
                  </div>
                )}

                {/* Primary Accent Color */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Primary Brand / Button Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={customSettings.primaryColor}
                      onChange={(e) => setCustomSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="w-12 h-10 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                    />
                    <input
                      type="text"
                      value={customSettings.primaryColor}
                      onChange={(e) => setCustomSettings(prev => ({ ...prev, primaryColor: e.target.value }))}
                      className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-xs font-mono text-gray-800 w-32 uppercase"
                    />
                  </div>
                </div>

                {/* Light vs Dark Card Surfaces */}
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Cards & Surfaces Mode
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCustomSettings(prev => ({ ...prev, surfaceMode: 'light' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        customSettings.surfaceMode === 'light'
                          ? 'bg-white border-blue-600 text-blue-700 shadow-xs'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5 text-amber-500" />
                      <span>Crisp Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomSettings(prev => ({ ...prev, surfaceMode: 'dark' }))}
                      className={`py-2 px-3 rounded-lg text-xs font-bold border flex items-center justify-center gap-1.5 transition-all ${
                        customSettings.surfaceMode === 'dark'
                          ? 'bg-slate-900 border-blue-600 text-white shadow-xs'
                          : 'bg-gray-100 border-gray-200 text-gray-600'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5 text-blue-400" />
                      <span>Midnight Dark</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyCustom}
                  className="w-full py-3 bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all cursor-pointer"
                >
                  🚀 Apply Custom Theme Now
                </button>
              </div>

              {/* Live Preview Box */}
              <div className="flex flex-col">
                <span className="text-xs font-black uppercase text-gray-500 tracking-wider mb-2">
                  Live Backdrop Preview
                </span>
                <div
                  className="flex-1 min-h-[260px] rounded-2xl p-4 border border-gray-300 shadow-inner flex flex-col justify-between relative overflow-hidden"
                  style={{
                    background:
                      customSettings.mode === 'gradient'
                        ? `linear-gradient(${customSettings.gradientAngle}deg, ${customSettings.gradientStart} 0%, ${customSettings.gradientEnd} 100%)`
                        : customSettings.solidColor
                  }}
                >
                  {/* Mock Window Card */}
                  <div
                    className={`p-4 rounded-xl shadow-lg border ${
                      customSettings.surfaceMode === 'dark'
                        ? 'bg-slate-900 text-white border-slate-700'
                        : 'bg-white text-gray-900 border-gray-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-black">CSSENTIAL Preview Card</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: customSettings.primaryColor }}
                      >
                        Active Tag
                      </span>
                    </div>
                    <p className={`text-xs ${customSettings.surfaceMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
                      This simulates how cards, text, and buttons will look with your chosen background and surface mode.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-xs"
                        style={{ backgroundColor: customSettings.primaryColor }}
                      >
                        Interactive Button
                      </button>
                    </div>
                  </div>

                  <div className="text-center bg-white/75 backdrop-blur-xs py-1 rounded-md text-[10px] font-mono text-gray-800">
                    {customSettings.mode === 'gradient'
                      ? `${customSettings.gradientStart} ➔ ${customSettings.gradientEnd} (${customSettings.gradientAngle}°)`
                      : `Solid: ${customSettings.solidColor}`}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Theme preferences are saved automatically to your device.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-gray-900 text-white text-xs font-bold rounded-lg hover:bg-black transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
