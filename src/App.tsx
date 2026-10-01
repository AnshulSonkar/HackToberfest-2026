/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ToneType,
  LengthType,
  EmailVariant,
  SavedEmail,
  TemplateStarter,
} from './types';
import { EmailInputPanel } from './components/EmailInputPanel';
import { EmailCanvas } from './components/EmailCanvas';
import { TemplateModal } from './components/TemplateModal';
import { SavedDraftsModal } from './components/SavedDraftsModal';
import {
  Mail,
  FolderArchive,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

const INITIAL_SAVED_DRAFTS: SavedEmail[] = [
  {
    id: 'demo-1',
    title: 'Q3 Financial Review Follow-up',
    subject: 'Action Required: Q3 Financial Review & Sign-off by Friday',
    body: `Hi David,\n\nI hope your week is going well.\n\nFollowing our review meeting yesterday, I have finalized the Q3 financial forecast model with the updated revenue allocations we discussed. All department line items have been validated.\n\nCould you please take 10 minutes to review the attached summary and give your formal sign-off by this Friday, October 3rd at 3:00 PM? This will ensure we stay on schedule for the board presentation next Tuesday.\n\nThank you for your guidance on this,\nAlex Miller`,
    tone: 'professional',
    recipientName: 'David',
    recipientRole: 'Manager',
    createdAt: new Date().toISOString(),
    isFavorite: true,
    tags: ['Financial', 'Review'],
  },
];

export default function App() {
  // Input form state
  const [description, setDescription] = useState(
    'Need approval on the revised Q3 budget deck by Friday 3pm so we can submit to board on Tuesday. John and Sarah already signed off on headcount numbers.'
  );
  const [originalEmail, setOriginalEmail] = useState('');
  const [isReplyMode, setIsReplyMode] = useState(false);
  const [tone, setTone] = useState<ToneType>('professional');
  const [customTone, setCustomTone] = useState('');
  const [recipientRole, setRecipientRole] = useState('Direct Manager / Boss');
  const [recipientName, setRecipientName] = useState('Marcus');
  const [senderName, setSenderName] = useState('Alex');
  const [goal, setGoal] = useState('Request Approval or Sign-off');
  const [length, setLength] = useState<LengthType>('balanced');
  const [keyPoints, setKeyPoints] = useState<string[]>([
    'Deadline: Friday 3:00 PM',
    'John and Sarah already approved headcount',
  ]);
  const [variantCount, setVariantCount] = useState<number>(1);

  // Generated email state
  const [variants, setVariants] = useState<EmailVariant[]>([
    {
      id: 'initial-1',
      variantLabel: 'Executive Business Draft',
      subject: 'Action Required: Approval for Revised Q3 Budget Deck (Deadline: Friday 3 PM)',
      alternateSubjects: [
        'Q3 Budget Deck Revisions – Ready for Final Sign-off',
        'Request for Approval: Q3 Budget Deck Ahead of Tuesday Board Meeting',
      ],
      body: `Hi Marcus,\n\nI hope you're having a productive week.\n\nI have finalized the revised Q3 budget deck. Both John and Sarah have reviewed and approved the headcount figures, and all remaining line items are aligned with our quarterly targets.\n\nCould you please review the attached slide deck and confirm your approval by Friday at 3:00 PM? This will allow our team to finalize materials in time for Tuesday's board meeting.\n\nPlease let me know if you would like to make any adjustments before we lock in the numbers.\n\nBest regards,\nAlex`,
      toneAnalysis: {
        perceivedTone: 'Professional & Action-Oriented',
        readingTimeSeconds: 28,
        wordCount: 88,
        formalityScore: 82,
        clarityNotes: 'States deadline explicitly in subject and body with clear stakeholder consensus noted.',
      },
      coachingNotes: [
        'Mentions peer approvals (John & Sarah) early to reduce decision friction for the manager.',
        'Clear deadline gives the recipient an unambiguous action window.',
      ],
    },
  ]);
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);

  // UI state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showSavedDraftsModal, setShowSavedDraftsModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local storage for saved drafts
  const [savedEmails, setSavedEmails] = useState<SavedEmail[]>(() => {
    try {
      const stored = localStorage.getItem('briefmail_saved_drafts');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed reading saved drafts from localStorage', e);
    }
    return INITIAL_SAVED_DRAFTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('briefmail_saved_drafts', JSON.stringify(savedEmails));
    } catch (e) {
      console.error('Failed saving drafts to localStorage', e);
    }
  }, [savedEmails]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Generate Email Handler
  const handleGenerate = async () => {
    if (!description.trim() && !originalEmail.trim()) {
      setErrorMessage('Please provide a short description or notes before generating.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: description.trim(),
          originalEmail: originalEmail.trim(),
          isReply: isReplyMode,
          tone,
          customTone,
          recipientRole,
          recipientName,
          senderName,
          goal,
          length,
          keyPoints,
          variantCount,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to generate email');
      }

      const data = await res.json();
      if (data.variants && data.variants.length > 0) {
        setVariants(data.variants);
        setActiveVariantIndex(0);
        showToast(
          data.variants.length > 1
            ? 'Generated 2 distinct email styles'
            : 'Draft generated successfully'
        );
      } else {
        throw new Error('No draft variants returned from server');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error communicating with generation service');
    } finally {
      setIsGenerating(false);
    }
  };

  // Refine Email Handler
  const handleRefine = async (instruction: string, selectedText?: string) => {
    const current = variants[activeVariantIndex];
    if (!current) return;

    setIsRefining(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/refine-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: current.subject,
          body: current.body,
          instruction,
          selectedText,
          tone,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to refine email');
      }

      const data = await res.json();
      if (data.body) {
        setVariants((prev) => {
          const next = [...prev];
          next[activeVariantIndex] = {
            ...next[activeVariantIndex],
            subject: data.subject || next[activeVariantIndex].subject,
            body: data.body,
          };
          return next;
        });
        showToast(data.explanation || 'Email draft refined');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to refine draft');
    } finally {
      setIsRefining(false);
    }
  };

  // Key point handlers
  const handleAddKeyPoint = (point: string) => {
    setKeyPoints((prev) => [...prev, point]);
  };

  const handleRemoveKeyPoint = (index: number) => {
    setKeyPoints((prev) => prev.filter((_, i) => i !== index));
  };

  // Direct editing handlers
  const handleUpdateSubject = (newSubject: string) => {
    setVariants((prev) => {
      const next = [...prev];
      if (next[activeVariantIndex]) {
        next[activeVariantIndex] = {
          ...next[activeVariantIndex],
          subject: newSubject,
        };
      }
      return next;
    });
  };

  const handleUpdateBody = (newBody: string) => {
    setVariants((prev) => {
      const next = [...prev];
      if (next[activeVariantIndex]) {
        next[activeVariantIndex] = {
          ...next[activeVariantIndex],
          body: newBody,
        };
      }
      return next;
    });
  };

  // Saved Draft Handlers
  const handleSaveDraft = (variant: EmailVariant) => {
    const newDraft: SavedEmail = {
      id: `draft-${Date.now()}`,
      title: variant.subject || 'Untitled Draft',
      subject: variant.subject,
      body: variant.body,
      tone,
      recipientName,
      recipientRole,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      tags: [tone, recipientRole].filter(Boolean),
    };
    setSavedEmails((prev) => [newDraft, ...prev]);
    showToast('Draft saved to history');
  };

  const handleToggleFavorite = (id: string) => {
    setSavedEmails((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item
      )
    );
  };

  const handleDeleteDraft = (id: string) => {
    setSavedEmails((prev) => prev.filter((item) => item.id !== id));
    showToast('Draft removed');
  };

  const handleLoadDraft = (draft: SavedEmail) => {
    setVariants([
      {
        id: draft.id,
        variantLabel: `Loaded: ${draft.title.slice(0, 24)}...`,
        subject: draft.subject,
        alternateSubjects: [],
        body: draft.body,
        toneAnalysis: {
          perceivedTone: draft.tone,
          readingTimeSeconds: Math.max(10, Math.round((draft.body.split(/\s+/).length / 200) * 60)),
          wordCount: draft.body.split(/\s+/).filter(Boolean).length,
          formalityScore: 80,
          clarityNotes: 'Restored from saved drafts library.',
        },
      },
    ]);
    setActiveVariantIndex(0);
    showToast('Loaded saved draft into editor');
  };

  // Template Starter Handler
  const handleSelectTemplate = (template: TemplateStarter) => {
    setDescription(template.samplePrompt);
    setTone(template.recommendedTone);
    setRecipientRole(template.recipientRole);
    setGoal(template.goal);
    if (template.recipientName) setRecipientName(template.recipientName);
    if (template.keyPoints) setKeyPoints(template.keyPoints);
    setIsReplyMode(false);
    showToast(`Loaded "${template.title}" scenario`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Top Global Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-slate-900">
                  BriefMail AI
                </span>
                <span className="text-[11px] font-medium text-slate-500 hidden sm:inline">
                  · Professional Email Writer & Tone Polisher
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Turn rough notes into executive-ready communication
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowTemplatesModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Scenario Templates</span>
            </button>

            <button
              type="button"
              onClick={() => setShowSavedDraftsModal(true)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg flex items-center gap-1.5 transition-colors relative"
            >
              <FolderArchive className="w-4 h-4 text-indigo-600" />
              <span>Saved Drafts</span>
              {savedEmails.length > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded-full">
                  {savedEmails.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-start justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Generation Alert:</strong>
                <span>{errorMessage}</span>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-500 hover:text-rose-700 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Two-Column Grid: Config on Left, Canvas on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Email Configuration & Input (5 cols on large) */}
          <div className="lg:col-span-5 space-y-4">
            <EmailInputPanel
              description={description}
              onChangeDescription={setDescription}
              originalEmail={originalEmail}
              onChangeOriginalEmail={setOriginalEmail}
              isReplyMode={isReplyMode}
              onToggleReplyMode={setIsReplyMode}
              tone={tone}
              onChangeTone={setTone}
              customTone={customTone}
              onChangeCustomTone={setCustomTone}
              recipientRole={recipientRole}
              onChangeRecipientRole={setRecipientRole}
              recipientName={recipientName}
              onChangeRecipientName={setRecipientName}
              senderName={senderName}
              onChangeSenderName={setSenderName}
              goal={goal}
              onChangeGoal={setGoal}
              length={length}
              onChangeLength={setLength}
              keyPoints={keyPoints}
              onAddKeyPoint={handleAddKeyPoint}
              onRemoveKeyPoint={handleRemoveKeyPoint}
              variantCount={variantCount}
              onChangeVariantCount={setVariantCount}
              onGenerate={handleGenerate}
              isGenerating={isGenerating}
              onOpenTemplates={() => setShowTemplatesModal(true)}
            />
          </div>

          {/* Right Column: Email Canvas & Editing Studio (7 cols on large) */}
          <div className="lg:col-span-7 sticky top-20">
            <EmailCanvas
              variants={variants}
              activeVariantIndex={activeVariantIndex}
              onSelectVariant={setActiveVariantIndex}
              onUpdateSubject={handleUpdateSubject}
              onUpdateBody={handleUpdateBody}
              recipientName={recipientName}
              senderName={senderName}
              tone={tone}
              onSaveDraft={handleSaveDraft}
              onRefine={handleRefine}
              isRefining={isRefining}
              onToast={showToast}
            />
          </div>
        </div>
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 bg-slate-900 text-white text-xs px-4 py-2.5 rounded-lg shadow-xl border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modals */}
      <TemplateModal
        isOpen={showTemplatesModal}
        onClose={() => setShowTemplatesModal(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <SavedDraftsModal
        isOpen={showSavedDraftsModal}
        onClose={() => setShowSavedDraftsModal(false)}
        savedEmails={savedEmails}
        onSelectDraft={handleLoadDraft}
        onToggleFavorite={handleToggleFavorite}
        onDeleteDraft={handleDeleteDraft}
      />
    </div>
  );
}
