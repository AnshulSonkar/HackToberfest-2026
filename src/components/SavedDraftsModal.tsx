import React, { useState } from 'react';
import { SavedEmail } from '../types';
import {
  FolderArchive,
  X,
  Search,
  Star,
  Trash2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';

interface SavedDraftsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedEmails: SavedEmail[];
  onSelectDraft: (draft: SavedEmail) => void;
  onToggleFavorite: (id: string) => void;
  onDeleteDraft: (id: string) => void;
}

export const SavedDraftsModal: React.FC<SavedDraftsModalProps> = ({
  isOpen,
  onClose,
  savedEmails,
  onSelectDraft,
  onToggleFavorite,
  onDeleteDraft,
}) => {
  const [search, setSearch] = useState('');
  const [onlyFavorites, setOnlyFavorites] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = savedEmails.filter((item) => {
    if (onlyFavorites && !item.isFavorite) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.subject.toLowerCase().includes(q) ||
      item.body.toLowerCase().includes(q) ||
      item.tone.toLowerCase().includes(q)
    );
  });

  const handleCopy = (item: SavedEmail) => {
    navigator.clipboard.writeText(`Subject: ${item.subject}\n\n${item.body}`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <FolderArchive className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Saved Emails & History
              </h3>
              <p className="text-xs text-slate-500">
                {savedEmails.length} draft{savedEmails.length === 1 ? '' : 's'} stored locally in your browser
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyFavorites(false)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                !onlyFavorites
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              All Drafts ({savedEmails.length})
            </button>
            <button
              onClick={() => setOnlyFavorites(true)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors ${
                onlyFavorites
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>Starred</span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search drafts..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              {savedEmails.length === 0
                ? 'No saved drafts yet. Generate an email and click "Save Draft" to keep it here.'
                : 'No matching emails found.'}
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-sm">
                        {item.tone}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">
                      {item.subject}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onToggleFavorite(item.id)}
                      className="p-1.5 text-slate-400 hover:text-amber-500 transition-colors"
                      title={item.isFavorite ? 'Remove star' : 'Star draft'}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          item.isFavorite
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                    <button
                      onClick={() => handleCopy(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                      title="Copy to clipboard"
                    >
                      {copiedId === item.id ? (
                        <Check className="w-4 h-4 text-emerald-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => onDeleteDraft(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Delete draft"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-sans line-clamp-3 whitespace-pre-line bg-slate-50/60 p-2.5 rounded-lg border border-slate-100">
                  {item.body}
                </p>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => {
                      onSelectDraft(item);
                      onClose();
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-2.5 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    <span>Load in Editor</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
