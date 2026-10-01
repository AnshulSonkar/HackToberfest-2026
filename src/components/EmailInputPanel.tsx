import React, { useState } from 'react';
import { ToneType, LengthType } from '../types';
import { ToneSelector } from './ToneSelector';
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Plus,
  X,
  FileText,
  Reply,
  HelpCircle,
} from 'lucide-react';

interface EmailInputPanelProps {
  description: string;
  onChangeDescription: (val: string) => void;
  originalEmail: string;
  onChangeOriginalEmail: (val: string) => void;
  isReplyMode: boolean;
  onToggleReplyMode: (val: boolean) => void;
  tone: ToneType;
  onChangeTone: (tone: ToneType) => void;
  customTone: string;
  onChangeCustomTone: (val: string) => void;
  recipientRole: string;
  onChangeRecipientRole: (val: string) => void;
  recipientName: string;
  onChangeRecipientName: (val: string) => void;
  senderName: string;
  onChangeSenderName: (val: string) => void;
  goal: string;
  onChangeGoal: (val: string) => void;
  length: LengthType;
  onChangeLength: (len: LengthType) => void;
  keyPoints: string[];
  onAddKeyPoint: (pt: string) => void;
  onRemoveKeyPoint: (index: number) => void;
  variantCount: number;
  onChangeVariantCount: (count: number) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  onOpenTemplates: () => void;
}

const SAMPLE_NOTES = [
  {
    title: 'Ask for Friday off',
    note: 'Need Friday off next week for family event. John will cover urgent Slack pings, will finish sprint tasks by Thursday evening.',
  },
  {
    title: 'Follow-up on proposal',
    note: 'Sent revised scope and pricing deck 5 days ago, check in if they have any questions or blockers before signing.',
  },
  {
    title: 'Running 15m late',
    note: 'Stuck in unexpected traffic after client visit, will join the 2pm sync approximately 15 mins late. Please start without me.',
  },
];

const RECIPIENT_ROLES = [
  'Direct Manager / Boss',
  'Client / Customer',
  'Team Colleague',
  'Executive / VP',
  'External Vendor / Partner',
  'Recruiter / HR',
  'Professor / Academic',
];

const EMAIL_GOALS = [
  'Request Approval or Sign-off',
  'Provide Status Update',
  'Schedule a Meeting / Call',
  'Follow-up on Previous Email',
  'Apologize & Offer Resolution',
  'Submit Proposal / Pitch',
  'Respectfully Decline Request',
  'Express Appreciation / Thanks',
];

export const EmailInputPanel: React.FC<EmailInputPanelProps> = ({
  description,
  onChangeDescription,
  originalEmail,
  onChangeOriginalEmail,
  isReplyMode,
  onToggleReplyMode,
  tone,
  onChangeTone,
  customTone,
  onChangeCustomTone,
  recipientRole,
  onChangeRecipientRole,
  recipientName,
  onChangeRecipientName,
  senderName,
  onChangeSenderName,
  goal,
  onChangeGoal,
  length,
  onChangeLength,
  keyPoints,
  onAddKeyPoint,
  onRemoveKeyPoint,
  variantCount,
  onChangeVariantCount,
  onGenerate,
  isGenerating,
  onOpenTemplates,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newKeyPoint, setNewKeyPoint] = useState('');

  const handleAddPoint = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (newKeyPoint.trim()) {
      onAddKeyPoint(newKeyPoint.trim());
      setNewKeyPoint('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs p-5 space-y-6">
      {/* Top Header & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-lg">
          <button
            type="button"
            onClick={() => onToggleReplyMode(false)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              !isReplyMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>New Email</span>
          </button>
          <button
            type="button"
            onClick={() => onToggleReplyMode(true)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              isReplyMode
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Reply className="w-3.5 h-3.5" />
            <span>Reply to Thread</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenTemplates}
          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-indigo-50/70 transition-colors"
        >
          <span>Browse 10+ Scenario Templates</span>
          <span className="text-[10px] text-indigo-400">→</span>
        </button>
      </div>

      {/* Input Area */}
      {isReplyMode ? (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
              1. Incoming Email You Received
            </label>
            <textarea
              rows={4}
              value={originalEmail}
              onChange={(e) => onChangeOriginalEmail(e.target.value)}
              placeholder="Paste the email you received here (e.g. 'Can we reschedule our review meeting to Friday at 4pm? Also please bring the updated deck...')"
              className="w-full p-3 text-xs leading-relaxed text-slate-900 bg-slate-50/60 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                2. Your Rough Reply Notes / Intent
              </label>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="What do you want to say back? e.g. Friday 4pm works, deck will be attached, ask if Sarah should also join"
              className="w-full p-3 text-xs leading-relaxed text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
              Short Description / Rough Notes
            </label>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Quick samples:</span>
              {SAMPLE_NOTES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onChangeDescription(sample.note)}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:underline px-1 py-0.5 rounded-sm"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          <textarea
            rows={4}
            value={description}
            onChange={(e) => onChangeDescription(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your shorthand, messy thoughts, or bullet points here...&#10;e.g. 'Tell client our dev team pushed the update, fixing the mobile login glitch. Thank them for their patience and ask to test on their end.'"
            className="w-full p-3.5 text-sm leading-relaxed text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-y shadow-xs"
          />
        </div>
      )}

      {/* Tone Selection */}
      <ToneSelector
        selectedTone={tone}
        customTone={customTone}
        onSelectTone={onChangeTone}
        onChangeCustomTone={onChangeCustomTone}
      />

      {/* Advanced Audience & Context Accordion */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full px-4 py-2.5 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-800 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span>Audience, Length & Constraints</span>
            {(recipientRole || goal || keyPoints.length > 0 || recipientName || senderName) && (
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
            )}
          </div>
          <div className="flex items-center gap-1 text-slate-500">
            <span className="text-[11px]">
              {showAdvanced ? 'Hide options' : 'Customize recipient, names & bullets'}
            </span>
            {showAdvanced ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {showAdvanced && (
          <div className="p-4 bg-white space-y-4 border-t border-slate-200">
            {/* Recipient & Sender Names */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Recipient Name (Optional)
                </label>
                <input
                  type="text"
                  value={recipientName}
                  onChange={(e) => onChangeRecipientName(e.target.value)}
                  placeholder="e.g. Sarah / Dr. Chen"
                  className="w-full px-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Your Name (Sign-off)
                </label>
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => onChangeSenderName(e.target.value)}
                  placeholder="e.g. Alex Miller"
                  className="w-full px-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Recipient Role & Goal */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Recipient Role / Relationship
                </label>
                <select
                  value={recipientRole}
                  onChange={(e) => onChangeRecipientRole(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">General Professional Contact</option>
                  {RECIPIENT_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                  Primary Email Goal
                </label>
                <select
                  value={goal}
                  onChange={(e) => onChangeGoal(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Clear communication & timely reply</option>
                  {EMAIL_GOALS.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Desired Length */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Target Length
              </label>
              <div className="flex items-center gap-2">
                {[
                  { id: 'concise', label: 'Concise (2-3 sentences)' },
                  { id: 'balanced', label: 'Balanced (Standard)' },
                  { id: 'detailed', label: 'Detailed (Comprehensive)' },
                ].map((l) => (
                  <button
                    key={l.id}
                    type="button"
                    onClick={() => onChangeLength(l.id as LengthType)}
                    className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border transition-all text-center ${
                      length === l.id
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-900 font-semibold'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Must-Include Key Points / Bullets */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 uppercase tracking-wider mb-1">
                Must-Include Points or Deadlines
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={newKeyPoint}
                  onChange={(e) => setNewKeyPoint(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddPoint();
                    }
                  }}
                  placeholder="e.g. Deadline: Thursday 3 PM, link to dashboard in signature"
                  className="flex-1 px-3 py-1.5 text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => handleAddPoint()}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              {keyPoints.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  {keyPoints.map((pt, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between text-xs text-slate-700 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/80"
                    >
                      <span>• {pt}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveKeyPoint(idx)}
                        className="text-slate-400 hover:text-rose-600 p-0.5"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-3">
          <label className="text-xs text-slate-600 flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={variantCount > 1}
              onChange={(e) => onChangeVariantCount(e.target.checked ? 2 : 1)}
              className="rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />
            <span className="font-medium text-slate-700">Generate 2 draft styles to compare</span>
          </label>
        </div>

        <button
          type="button"
          disabled={isGenerating || (!description.trim() && !originalEmail.trim())}
          onClick={onGenerate}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{isGenerating ? 'Generating Email...' : 'Generate Email'}</span>
          <span className="hidden sm:inline text-[10px] bg-indigo-500/60 px-1.5 py-0.5 rounded-sm">
            ⌘↵
          </span>
        </button>
      </div>
    </div>
  );
};
