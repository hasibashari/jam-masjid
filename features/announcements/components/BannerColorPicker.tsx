'use client';

import { BANNER_GRADIENT_COLORS, BANNER_SOLID_COLORS } from '@/shared/constants/banner-colors';

interface BannerColorPickerProps {
  value: string;
  onChange: (id: string) => void;
}

/**
 * Reusable colour picker for banner background selection.
 * Used in both the Add Banner form and the Edit Banner modal.
 */
export default function BannerColorPicker({ value, onChange }: BannerColorPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-black uppercase text-zinc-400 tracking-wider">
        Pilih Warna Background
      </label>

      {/* Gradients row */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5 font-bold">Gradasi</p>
        <div className="grid grid-cols-4 gap-2">
          {BANNER_GRADIENT_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`h-9 rounded-lg ${c.cls} border-2 transition-all cursor-pointer relative ${
                value === c.id
                  ? 'border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 scale-105'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
              title={c.name}
            >
              {value === c.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Solid colours row */}
      <div>
        <p className="text-[10px] text-zinc-600 uppercase tracking-widest mb-1.5 font-bold">Warna Solid</p>
        <div className="grid grid-cols-5 gap-2">
          {BANNER_SOLID_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onChange(c.id)}
              className={`h-9 rounded-lg ${c.cls} border-2 transition-all cursor-pointer relative ${
                value === c.id
                  ? 'border-[#D4AF37] shadow-md shadow-[#D4AF37]/20 scale-105'
                  : 'border-zinc-800 hover:border-zinc-600'
              }`}
              title={c.name}
            >
              {value === c.id && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
