import React from 'react';
import { ToneType } from '../types';
import {
  Briefcase,
  Zap,
  Smile,
  Target,
  Sparkles,
  HeartHandshake,
  ShieldCheck,
  Building,
  Sliders,
} from 'lucide-react';

interface ToneSelectorProps {
  selectedTone: ToneType;
  customTone: string;
  onSelectTone: (tone: ToneType) => void;
  onChangeCustomTone: (val: string) => void;
}

interface ToneOption {
  id: ToneType;
  label: string;
  subtitle: string;
  icon: React.ReactNode;
}

const TONE_OPTIONS: ToneOption[] = [
  {
    id: 'professional',
    label: 'Professional',
    subtitle: 'Balanced, respectful & workplace standard',
    icon: <Briefcase className="w-4 h-4" />,
  },
  {
    id: 'executive',
    label: 'Executive (BLUF)',
    subtitle: 'Bottom line up front, crisp & no filler',
    icon: <Zap className="w-4 h-4" />,
  },
  {
    id: 'friendly',
    label: 'Friendly & Warm',
    subtitle: 'Collegiate, approachable & pleasant',
    icon: <Smile className="w-4 h-4" />,
  },
  {
    id: 'direct',
    label: 'Direct & Urgent',
    subtitle: 'Action-oriented with explicit next steps',
    icon: <Target className="w-4 h-4" />,
  },
  {
    id: 'persuasive',
    label: 'Persuasive',
    subtitle: 'Benefits-focused, compelling & engaging',
    icon: <Sparkles className="w-4 h-4" />,
  },
  {
    id: 'diplomatic',
    label: 'Diplomatic',
    subtitle: 'Gracious boundaries & tactful pushback',
    icon: <ShieldCheck className="w-4 h-4" />,
  },
  {
    id: 'apologetic',
    label: 'Apologetic',
    subtitle: 'Empathetic accountability & remedy',
    icon: <HeartHandshake className="w-4 h-4" />,
  },
  {
    id: 'formal',
    label: 'Formal & Traditional',
    subtitle: 'Senior leadership, official & legal standard',
    icon: <Building className="w-4 h-4" />,
  },
  {
    id: 'custom',
    label: 'Custom Tone',
    subtitle: 'Define your own voice or persona',
    icon: <Sliders className="w-4 h-4" />,
  },
];

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  selectedTone,
  customTone,
  onSelectTone,
  onChangeCustomTone,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
          Desired Email Tone
        </label>
        <span className="text-xs text-slate-500">
          Adapts vocabulary, greeting, and structure
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {TONE_OPTIONS.map((opt) => {
          const isSelected = selectedTone === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onSelectTone(opt.id)}
              className={`text-left p-2.5 rounded-lg border transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-600 bg-indigo-50/70 text-indigo-950 shadow-xs ring-1 ring-indigo-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`${
                    isSelected ? 'text-indigo-600' : 'text-slate-500'
                  }`}
                >
                  {opt.icon}
                </span>
                <span className="text-xs font-semibold">{opt.label}</span>
              </div>
              <p
                className={`text-[11px] leading-tight ${
                  isSelected ? 'text-indigo-800/80' : 'text-slate-500'
                }`}
              >
                {opt.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {selectedTone === 'custom' && (
        <div className="pt-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Specify Custom Tone or Persona:
          </label>
          <input
            type="text"
            value={customTone}
            onChange={(e) => onChangeCustomTone(e.target.value)}
            placeholder="e.g. Enthusiastic mentor, firm customer support, humorous coworker"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
          />
        </div>
      )}
    </div>
  );
};
