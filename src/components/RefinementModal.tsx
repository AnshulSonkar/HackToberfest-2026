import React, { useState } from 'react';
import { Sparkles, X, Wand2, ArrowRight } from 'lucide-react';

interface RefinementModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText?: string;
  onApplyRefinement: (instruction: string) => void;
  isLoading: boolean;
}

const PRESET_INSTRUCTIONS = [
  { label: 'Make More Concise', text: 'Trim any repetitive sentences and make it 30% shorter without losing key details.' },
  { label: 'Soften Tone & Sound Warmer', text: 'Make the email warmer, friendlier, and more empathetic while maintaining professional standards.' },
  { label: 'Make More Executive', text: 'Apply BLUF (Bottom Line Up Front), structure with crisp bullet points, and eliminate conversational filler.' },
  { label: 'Add Clear Action Item & Deadline', text: 'Emphasize a specific call to action and request a response by a clear deadline.' },
  { label: 'More Assertive / Confident', text: 'Remove weak qualifiers like "just wondering" or "I think maybe", replacing with assertive, confident phrasing.' },
  { label: 'Fix Flow & Polish Grammar', text: 'Elevate phrasing, enhance sentence cadence, and ensure flawless business grammar.' },
];

export const RefinementModal: React.FC<RefinementModalProps> = ({
  isOpen,
  onClose,
  selectedText,
  onApplyRefinement,
  isLoading,
}) => {
  const [customText, setCustomText] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (instruction: string) => {
    if (!instruction.trim()) return;
    onApplyRefinement(instruction);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              {selectedText ? 'Rewrite Highlighted Text' : 'AI Draft Refinement'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4">
          {selectedText && (
            <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg">
              <span className="text-[11px] font-semibold text-amber-900 uppercase tracking-wider block mb-1">
                Selected sentence / section:
              </span>
              <p className="text-xs text-amber-950 italic line-clamp-3">
                "{selectedText}"
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Quick One-Click Adjustments
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {PRESET_INSTRUCTIONS.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleSubmit(preset.text)}
                  className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all text-xs font-medium text-slate-800 flex items-center justify-between group disabled:opacity-50"
                >
                  <span>{preset.label}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Custom Instruction
            </label>
            <div className="relative">
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="e.g. Add a postscript mentioning I will be traveling next week, or emphasize that the budget is strictly capped at $15k."
                className="w-full p-2.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              />
            </div>
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                disabled={isLoading || !customText.trim()}
                onClick={() => handleSubmit(customText)}
                className="px-4 py-2 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                {isLoading ? 'Refining draft...' : 'Apply Custom Adjustment'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
