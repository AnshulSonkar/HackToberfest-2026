import React, { useState, useRef } from 'react';
import { EmailVariant, ToneType } from '../types';
import {
  Copy,
  Check,
  Mail,
  Send,
  Wand2,
  Bookmark,
  Download,
  Sparkles,
  ChevronDown,
  Info,
  Clock,
  Gauge,
  Edit3,
} from 'lucide-react';
import { SubjectSuggestionsModal } from './SubjectSuggestionsModal';
import { RefinementModal } from './RefinementModal';

interface EmailCanvasProps {
  variants: EmailVariant[];
  activeVariantIndex: number;
  onSelectVariant: (index: number) => void;
  onUpdateSubject: (newSubject: string) => void;
  onUpdateBody: (newBody: string) => void;
  recipientName: string;
  senderName: string;
  tone: ToneType;
  onSaveDraft: (variant: EmailVariant) => void;
  onRefine: (instruction: string, selectedText?: string) => Promise<void>;
  isRefining: boolean;
  onToast: (msg: string) => void;
}

export const EmailCanvas: React.FC<EmailCanvasProps> = ({
  variants,
  activeVariantIndex,
  onSelectVariant,
  onUpdateSubject,
  onUpdateBody,
  recipientName,
  senderName,
  tone,
  onSaveDraft,
  onRefine,
  isRefining,
  onToast,
}) => {
  const currentVariant = variants[activeVariantIndex] || variants[0];
  const [copiedType, setCopiedType] = useState<'subject' | 'body' | 'full' | null>(null);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showRefineModal, setShowRefineModal] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState('');
  const [showAlternateDropdown, setShowAlternateDropdown] = useState(false);
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);

  if (!currentVariant) {
    return (
      <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center flex flex-col items-center justify-center min-h-[420px]">
        <div className="w-12 h-12 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-3">
          <Mail className="w-6 h-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-800 mb-1">
          Your Polished Email Will Appear Here
        </h3>
        <p className="text-xs text-slate-500 max-w-sm">
          Enter your notes or brief on the left, pick your desired tone, and let BriefMail generate an executive-ready draft.
        </p>
      </div>
    );
  }

  const handleCopy = (type: 'subject' | 'body' | 'full') => {
    let textToCopy = '';
    if (type === 'subject') {
      textToCopy = currentVariant.subject;
      onToast('Subject line copied to clipboard');
    } else if (type === 'body') {
      textToCopy = currentVariant.body;
      onToast('Email body copied to clipboard');
    } else {
      textToCopy = `Subject: ${currentVariant.subject}\n\n${currentVariant.body}`;
      onToast('Full email copied to clipboard');
    }

    navigator.clipboard.writeText(textToCopy);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleOpenGmail = () => {
    const subject = encodeURIComponent(currentVariant.subject);
    const body = encodeURIComponent(currentVariant.body);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenMailto = () => {
    const subject = encodeURIComponent(currentVariant.subject);
    const body = encodeURIComponent(currentVariant.body);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleDownloadTxt = () => {
    const content = `Subject: ${currentVariant.subject}\n\n${currentVariant.body}`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentVariant.subject.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30)}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    onToast('Draft downloaded as .txt');
  };

  const handleTextSelect = () => {
    if (bodyTextareaRef.current) {
      const textarea = bodyTextareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start !== end && end - start > 4) {
        setSelectedHighlight(textarea.value.substring(start, end));
      } else {
        setSelectedHighlight('');
      }
    }
  };

  const handleQuickRefine = async (instruction: string) => {
    await onRefine(instruction);
  };

  const wordCount = currentVariant.body.trim().split(/\s+/).filter(Boolean).length;
  const readSeconds = Math.max(10, Math.round((wordCount / 200) * 60));

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      {/* Top Bar / Variant Switcher */}
      <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {variants.length > 1 ? (
            <div className="flex items-center p-1 bg-slate-200/70 rounded-lg">
              {variants.map((v, idx) => (
                <button
                  key={v.id || idx}
                  onClick={() => onSelectVariant(idx)}
                  className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                    activeVariantIndex === idx
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Option {idx + 1}: {v.variantLabel || `Draft ${idx + 1}`}
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-semibold text-slate-800">
                {currentVariant.variantLabel || 'Generated Draft'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Email Metrics */}
        <div className="flex items-center gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>~{readSeconds}s read</span>
          </div>
          <span className="text-slate-300">·</span>
          <span>{wordCount} words</span>
          {currentVariant.toneAnalysis?.perceivedTone && (
            <>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-600 font-medium">
                {currentVariant.toneAnalysis.perceivedTone}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Simulated Email Envelope Header */}
      <div className="p-5 border-b border-slate-100 bg-slate-50/30 space-y-3">
        {/* Simulated To / Cc row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 pb-2 border-b border-slate-200/60">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500 w-10">To:</span>
            <span className="text-slate-800 font-medium">
              {recipientName ? recipientName : '[Recipient Contact]'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">From:</span>
            <span className="text-slate-800 font-medium">
              {senderName ? senderName : 'You'}
            </span>
          </div>
        </div>

        {/* Subject Line Row */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Subject
              </label>
              {currentVariant.alternateSubjects?.length > 0 && (
                <div className="relative inline-block">
                  <button
                    type="button"
                    onClick={() => setShowAlternateDropdown(!showAlternateDropdown)}
                    className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  >
                    <span>View {currentVariant.alternateSubjects.length} alternative subjects</span>
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showAlternateDropdown && (
                    <div className="absolute left-0 top-6 z-20 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-2 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase px-2 block mb-1">
                        Click to apply alternative:
                      </span>
                      {currentVariant.alternateSubjects.map((sub, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            onUpdateSubject(sub);
                            setShowAlternateDropdown(false);
                            onToast('Subject updated');
                          }}
                          className="w-full text-left p-2 rounded-md hover:bg-indigo-50 text-xs text-slate-800 transition-colors"
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowSubjectModal(true)}
                className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Suggest More</span>
              </button>
              <button
                type="button"
                onClick={() => handleCopy('subject')}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 px-1.5 py-0.5 rounded-sm hover:bg-slate-100"
                title="Copy subject line"
              >
                {copiedType === 'subject' ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>Copy</span>
              </button>
            </div>
          </div>

          <input
            type="text"
            value={currentVariant.subject}
            onChange={(e) => onUpdateSubject(e.target.value)}
            placeholder="Email Subject Line"
            className="w-full px-3 py-2 text-sm font-semibold text-slate-900 bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Main Email Body Canvas */}
      <div className="p-5 flex-1 relative bg-white">
        {selectedHighlight && (
          <div className="mb-2 p-2 bg-indigo-50 border border-indigo-200 rounded-lg flex items-center justify-between gap-3 text-xs">
            <span className="text-indigo-900 font-medium truncate max-w-md">
              Selected: "{selectedHighlight}"
            </span>
            <button
              type="button"
              onClick={() => setShowRefineModal(true)}
              className="shrink-0 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-semibold text-[11px] flex items-center gap-1 shadow-xs"
            >
              <Wand2 className="w-3 h-3" />
              <span>Rewrite This Part</span>
            </button>
          </div>
        )}

        <textarea
          ref={bodyTextareaRef}
          rows={14}
          value={currentVariant.body}
          onChange={(e) => onUpdateBody(e.target.value)}
          onSelect={handleTextSelect}
          placeholder="Email body will appear here..."
          className="w-full text-sm leading-relaxed text-slate-800 font-sans border-0 focus:outline-hidden focus:ring-0 resize-y p-0 bg-transparent min-h-[260px]"
        />
      </div>

      {/* Coaching Notes / Rationale */}
      {currentVariant.coachingNotes && currentVariant.coachingNotes.length > 0 && (
        <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-slate-700 uppercase tracking-wider block">
              Communication Coaching Note
            </span>
            <div className="text-xs text-slate-600 space-y-0.5">
              {currentVariant.coachingNotes.map((note, idx) => (
                <div key={idx} className="flex items-start gap-1">
                  <span>•</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Polish Actions Bar */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-200/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>AI Quick Refinement</span>
          </span>
          <button
            type="button"
            onClick={() => {
              setSelectedHighlight('');
              setShowRefineModal(true);
            }}
            className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800"
          >
            Custom instructions...
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {[
            { label: 'Make Shorter', instruction: 'Make the email 30% more concise without losing any key message.' },
            { label: 'Make Warmer', instruction: 'Soften the tone to sound warmer, more empathetic and friendly.' },
            { label: 'More Executive', instruction: 'Format with BLUF (bottom line up front) and crisp executive bullet points.' },
            { label: 'Add Firm Deadline', instruction: 'Add a clear polite call to action requesting confirmation by a specific deadline.' },
            { label: 'Polish Grammar', instruction: 'Elevate sentence rhythm and polish grammar for executive delivery.' },
          ].map((action, idx) => (
            <button
              key={idx}
              type="button"
              disabled={isRefining}
              onClick={() => handleQuickRefine(action.instruction)}
              className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-indigo-50 hover:text-indigo-900 border border-slate-200 rounded-lg shadow-2xs transition-all disabled:opacity-50"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Export & Action Toolbar */}
      <div className="px-5 py-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleCopy('full')}
            className="px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedType === 'full' ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            <span>Copy Full Email</span>
          </button>

          <button
            type="button"
            onClick={() => handleCopy('body')}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
          >
            {copiedType === 'body' ? 'Copied Body!' : 'Copy Body Only'}
          </button>

          <button
            type="button"
            onClick={() => onSaveDraft(currentVariant)}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Save draft to local history"
          >
            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenGmail}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Open web compose with this draft"
          >
            <Send className="w-3.5 h-3.5 text-red-500" />
            <span>Open in Gmail</span>
          </button>

          <button
            type="button"
            onClick={handleOpenMailto}
            className="px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1.5 transition-colors"
            title="Open default desktop mail client"
          >
            <Mail className="w-3.5 h-3.5 text-blue-500" />
            <span>Mail Client</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTxt}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors"
            title="Download draft as text file"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Modals */}
      <SubjectSuggestionsModal
        isOpen={showSubjectModal}
        onClose={() => setShowSubjectModal(false)}
        emailBody={currentVariant.body}
        currentSubject={currentVariant.subject}
        tone={tone}
        onSelectSubject={(newSub) => {
          onUpdateSubject(newSub);
          onToast('Subject line updated');
        }}
      />

      <RefinementModal
        isOpen={showRefineModal}
        onClose={() => setShowRefineModal(false)}
        selectedText={selectedHighlight}
        onApplyRefinement={async (instruction) => {
          await onRefine(instruction, selectedHighlight);
          setShowRefineModal(false);
          setSelectedHighlight('');
        }}
        isLoading={isRefining}
      />
    </div>
  );
};
