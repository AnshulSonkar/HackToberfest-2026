import React, { useState } from 'react';
import { TemplateStarter, ToneType } from '../types';
import { TEMPLATE_STARTERS } from '../data/templates';
import { BookOpen, X, Search, ArrowRight } from 'lucide-react';

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (template: TemplateStarter) => void;
}

export const TemplateModal: React.FC<TemplateModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const categories = ['All', 'Workplace & Boss', 'Client & Sales', 'Team & Colleagues', 'Career & Sensitive'];

  const filteredTemplates = TEMPLATE_STARTERS.filter((tpl) => {
    const matchesCat = selectedCategory === 'All' || tpl.category === selectedCategory;
    const matchesQuery =
      tpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tpl.samplePrompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Workplace Email Scenarios & Starters
              </h3>
              <p className="text-xs text-slate-500">
                Pre-configured scenario briefs with proven tone recommendations
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

        {/* Filter bar & Search */}
        <div className="px-6 py-3 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search scenarios..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900"
            />
          </div>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredTemplates.length === 0 ? (
            <div className="col-span-2 py-12 text-center text-slate-500 text-xs">
              No matching email templates found. Try searching for a different keyword.
            </div>
          ) : (
            filteredTemplates.map((tpl) => (
              <div
                key={tpl.id}
                className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 hover:shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-indigo-600 uppercase tracking-wider">
                      {tpl.category}
                    </span>
                    <span className="text-[11px] text-slate-500 capitalize">
                      Tone: <strong className="text-slate-700">{tpl.recommendedTone}</strong>
                    </span>
                  </div>

                  <h4 className="text-sm font-semibold text-slate-900">
                    {tpl.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tpl.description}
                  </p>

                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Raw notes brief:
                    </span>
                    <p className="italic line-clamp-2 text-slate-600">
                      "{tpl.samplePrompt}"
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">
                    To: {tpl.recipientRole}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTemplate(tpl);
                      onClose();
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded-lg flex items-center gap-1 transition-colors"
                  >
                    <span>Use Scenario</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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
