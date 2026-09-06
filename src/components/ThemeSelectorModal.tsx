import React from 'react';
import { Palette, Check, X, Sparkles } from 'lucide-react';
import { THEME_PALETTES, ThemePaletteId } from '../services/theme';

interface ThemeSelectorModalProps {
  isOpen: boolean;
  activePaletteId: ThemePaletteId;
  onSelectPalette: (id: ThemePaletteId) => void;
  onClose: () => void;
}

export const ThemeSelectorModal: React.FC<ThemeSelectorModalProps> = ({
  isOpen,
  activePaletteId,
  onSelectPalette,
  onClose
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-blue-600/10 text-blue-700 flex items-center justify-center">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-gray-900 leading-tight">
                Website Color Theme Palettes
              </h3>
              <p className="text-xs text-gray-500">
                Choose from 4 custom-crafted color palettes to personalize your learning environment.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60 transition-colors cursor-pointer"
            aria-label="Close theme modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 4 Palette Cards Grid */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[75vh] overflow-y-auto">
          {Object.values(THEME_PALETTES).map((palette, index) => {
            const isSelected = activePaletteId === palette.id;
            return (
              <div
                key={palette.id}
                onClick={() => onSelectPalette(palette.id)}
                className={`group relative p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/30 shadow-md ring-2 ring-blue-600/20'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50/50 bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-gray-400">
                      {index + 1}st Design Option
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        <span>Active</span>
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                    {palette.name}
                  </h4>
                  <p className="text-[11px] text-gray-500 mt-0.5 mb-3 line-clamp-1">
                    {palette.tagline}
                  </p>

                  {/* 5 Color Swatches */}
                  <div className="flex items-center gap-1.5 p-2 bg-gray-100/80 rounded-lg border border-gray-200/70 mb-3">
                    {palette.colors.map((color, cIdx) => (
                      <div
                        key={cIdx}
                        className="flex-1 h-7 rounded-md border border-black/10 shadow-2xs relative group/swatch transition-transform hover:scale-105"
                        style={{ backgroundColor: color }}
                        title={`${color}`}
                      />
                    ))}
                  </div>

                  {/* Hex Codes List */}
                  <div className="flex flex-wrap gap-1">
                    {palette.colors.map((hex, i) => (
                      <span
                        key={i}
                        className="text-[9px] font-mono font-semibold px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded"
                      >
                        {hex}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-gray-400 font-medium">
                    Click to apply palette
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
                        : 'bg-gray-200 text-gray-700 group-hover:bg-blue-600 group-hover:text-white'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Apply'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Changes apply immediately across all modules, quizzes, and games.</span>
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
