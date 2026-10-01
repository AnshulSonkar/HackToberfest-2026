export type ToneType =
  | 'professional'
  | 'executive'
  | 'friendly'
  | 'direct'
  | 'persuasive'
  | 'apologetic'
  | 'diplomatic'
  | 'formal'
  | 'casual'
  | 'custom';

export type LengthType = 'concise' | 'balanced' | 'detailed';

export interface ToneAnalysis {
  perceivedTone: string;
  readingTimeSeconds: number;
  wordCount: number;
  formalityScore: number; // 0 to 100
  clarityNotes: string;
}

export interface EmailVariant {
  id: string;
  variantLabel: string;
  subject: string;
  alternateSubjects: string[];
  body: string;
  toneAnalysis?: ToneAnalysis;
  coachingNotes?: string[];
}

export interface SavedEmail {
  id: string;
  title: string;
  subject: string;
  body: string;
  tone: string;
  recipientName?: string;
  recipientRole?: string;
  createdAt: string;
  isFavorite: boolean;
  tags: string[];
}

export interface TemplateStarter {
  id: string;
  category: 'Workplace & Boss' | 'Client & Sales' | 'Team & Colleagues' | 'Career & Sensitive';
  title: string;
  description: string;
  samplePrompt: string;
  recommendedTone: ToneType;
  recipientRole: string;
  goal: string;
  recipientName?: string;
  keyPoints?: string[];
}

export interface SubjectSuggestion {
  subject: string;
  style: string;
}
