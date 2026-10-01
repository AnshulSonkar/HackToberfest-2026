import React, { useState } from 'react';
import { SubjectSuggestion } from '../types';
import { Sparkles, X, Check, RefreshCw } from 'lucide-react';

interface SubjectSuggestionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailBody: string;
  currentSubject: string;
  tone: string;
  onSelectSubject: (subject: string) => void;
}

export const SubjectSuggestionsModal: React.FC<SubjectSuggestionsModalProps> = ({
  isOpen,
  onClose,
  emailBody,
  currentSubject,
  tone,
  onSelectSubject,
}) => {
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SubjectSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      fetchSuggestions();
    }
  }, [isOpen]);

  const fetchSuggestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/suggest-subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: emailBody, currentSubject, tone }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to fetch suggestions');
      }
      const data = await res.json();
      setSuggestions(data.subjects || []);
    } catch (e: any) {
      setError(e.message || 'Error generating suggestions');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-semibold text-slate-900">
              Alternative Subject Lines
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3">
          <div className="text-xs text-slate-500 mb-2">
            Select a subject line optimized for open rates and tone clarity:
          </div>

          {loading ? (
            <div className="py-8 flex flex-col items-center justify-center text-slate-500 gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-indigo-600" />
              <span className="text-xs">Crafting strategic subject lines...</span>
            </div>
          ) : error ? (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-xs">
              {error}
              <button
                onClick={fetchSuggestions}
                className="mt-2 block font-medium underline"
              >
                Try again
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onSelectSubject(item.subject);
                    onClose();
                  }}
                  className="w-full text-left p-3 rounded-lg border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40 transition-all flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-900 group-hover:text-indigo-950 block">
                      {item.subject}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Style: {item.style}
                    </span>
                  </div>
                  <span className="shrink-0 p-1 text-slate-300 group-hover:text-indigo-600">
                    <Check className="w-4 h-4" />
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={fetchSuggestions}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs text-indigo-600 font-medium hover:text-indigo-800 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Regenerate suggestions
          </button>
          <button
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200/60 rounded-md transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
