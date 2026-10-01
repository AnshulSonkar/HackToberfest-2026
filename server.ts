import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Helper to get GoogleGenAI client
function getAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// POST /api/generate-email
app.post('/api/generate-email', async (req: Request, res: Response) => {
  try {
    const {
      description,
      tone = 'professional',
      customTone = '',
      recipientRole = '',
      recipientName = '',
      senderName = '',
      goal = '',
      length = 'balanced',
      keyPoints = [],
      isReply = false,
      originalEmail = '',
      variantCount = 1,
    } = req.body;

    if (!description && !originalEmail) {
      return res.status(400).json({ error: 'Description or original email is required' });
    }

    const ai = getAIClient();

    const toneDescriptions: Record<string, string> = {
      professional: 'Professional, courteous, balanced, and business-ready.',
      executive: 'Executive & crisp. BLUF (Bottom Line Up Front), high clarity, zero filler, highly structured.',
      friendly: 'Warm, personable, collaborative, and collegiate while retaining workplace respect.',
      direct: 'Clear, direct, and action-oriented. Gets straight to the point with explicit next steps.',
      persuasive: 'Persuasive and value-driven. Emphasizes benefits for the reader, overcomes friction, clear call-to-action.',
      apologetic: 'Empathetic, accountable, and tactful. Acknowledges issues without groveling and outlines concrete remedies.',
      diplomatic: 'Tactful and diplomatic. Handles sensitive matters, boundaries, or pushback with grace and composure.',
      formal: 'High formality, traditional etiquette, suitable for senior leadership, legal, or institutional outreach.',
      casual: 'Relaxed, informal, peer-to-peer conversation style.',
      custom: customTone ? `Custom tone: ${customTone}` : 'Professional and clear',
    };

    const targetTone = tone === 'custom' && customTone ? customTone : (toneDescriptions[tone] || 'Professional and polite');

    const promptText = `
You are an expert executive communications specialist and email writer.
The user wants to generate ${variantCount > 1 ? '2 distinct options' : '1 polished email'} based on their rough notes.

USER INPUT:
- User's Raw Description / Intent:
"${description || '(Drafting response to incoming email)'}"

${isReply && originalEmail ? `- This is a REPLY to an incoming email:\n"""\n${originalEmail}\n"""` : ''}
- Target Tone: ${targetTone}
- Intended Recipient Role: ${recipientRole || 'Professional Colleague / Business Contact'}
- Recipient Name: ${recipientName || '[Recipient Name]'}
- Sender Name: ${senderName || '[Your Name]'}
- Primary Email Goal: ${goal || 'Communicate clearly and prompt timely action'}
- Desired Length: ${length} (${length === 'concise' ? 'tight & brief (2-4 sentences or quick bullets)' : length === 'detailed' ? 'thorough, detailed explanation with full context' : 'balanced standard 2-3 paragraphs'})
${keyPoints && keyPoints.length > 0 ? `- Must-Include Key Points:\n${keyPoints.map((k: string) => `  * ${k}`).join('\n')}` : ''}

CRITICAL WRITING GUIDELINES:
1. Subject line must be high-impact, professional, and clear. Avoid vague subjects like "Quick question" unless intentional.
2. Tone must authentically reflect "${targetTone}". If executive, eliminate fluff like "I hope this email finds you well" and state the core update/request in the very first sentence.
3. Use clean formatting with natural paragraph breaks.
4. Provide 2-3 alternative subject line variations that explore different angles (e.g. direct, polite, action-required).
5. Provide a realistic word count, approximate read time, and 2 brief coaching bullet points on why this draft is effective.

Return ONLY a valid JSON object matching this exact structure:
{
  "variants": [
    {
      "id": "1",
      "variantLabel": "Recommended ${tone} draft",
      "subject": "Clear & compelling subject line",
      "alternateSubjects": [
        "Alternative subject 1",
        "Alternative subject 2"
      ],
      "body": "Hi [Recipient Name],\\n\\n[Email content]...\\n\\nBest regards,\\n[Your Name]",
      "toneAnalysis": {
        "perceivedTone": "Name of perceived tone",
        "readingTimeSeconds": 25,
        "wordCount": 95,
        "formalityScore": 85,
        "clarityNotes": "One sentence note on why this email works well"
      },
      "coachingNotes": [
        "Key reason why this draft is effective",
        "Actionable tip for sending"
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from AI');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating email:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate email. Please check your prompt and configuration.',
    });
  }
});

// POST /api/refine-email
app.post('/api/refine-email', async (req: Request, res: Response) => {
  try {
    const {
      subject,
      body,
      instruction,
      selectedText = '',
      tone = 'professional',
    } = req.body;

    if (!body || !instruction) {
      return res.status(400).json({ error: 'Body and instruction are required' });
    }

    const ai = getAIClient();

    const promptText = `
You are an expert executive email editor.
The user has an existing email draft and wants to refine it according to specific instructions.

CURRENT SUBJECT:
"${subject || ''}"

CURRENT EMAIL BODY:
"""
${body}
"""

${selectedText ? `USER HIGHLIGHTED THIS SPECIFIC SECTION TO REWRITE:\n"${selectedText}"` : ''}

USER EDIT INSTRUCTION:
"${instruction}"

TARGET OVERALL TONE:
${tone}

RULES:
1. Apply the instruction faithfully while preserving any crucial names, links, or facts unless told to change them.
2. If the user asked to change the subject, update it accordingly; otherwise keep or gently enhance it.
3. If specific text was highlighted, you can rewrite either the whole email with that section adjusted or preserve overall structure while perfecting the highlighted part.
4. Maintain high readability and natural cadence.

Return ONLY a valid JSON object matching this structure:
{
  "subject": "Updated or preserved subject line",
  "body": "Complete updated email body...",
  "explanation": "Brief 1-sentence summary of what was adjusted"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.6,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No content returned from AI');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error refining email:', error);
    return res.status(500).json({
      error: error.message || 'Failed to refine email.',
    });
  }
});

// POST /api/suggest-subjects
app.post('/api/suggest-subjects', async (req: Request, res: Response) => {
  try {
    const { body, currentSubject = '', tone = 'professional' } = req.body;

    if (!body) {
      return res.status(400).json({ error: 'Email body is required to suggest subjects' });
    }

    const ai = getAIClient();

    const promptText = `
Given this email body:
"""
${body}
"""
Current subject: "${currentSubject}"
Desired tone: ${tone}

Suggest 5 distinct, high-open-rate, professional email subject lines categorized by style.
Return ONLY a valid JSON object matching:
{
  "subjects": [
    { "subject": "Subject text", "style": "Direct & Action-Oriented" },
    { "subject": "Subject text", "style": "Courteous & Inquiring" },
    { "subject": "Subject text", "style": "Executive Brief" },
    { "subject": "Subject text", "style": "Urgent / Deadline" },
    { "subject": "Subject text", "style": "Short & Conversational" }
  ]
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('No subjects generated');
    }

    const parsed = JSON.parse(text);
    return res.json(parsed);
  } catch (error: any) {
    console.error('Error generating subjects:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate subjects.' });
  }
});

// Start Express server and connect Vite in development
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    // Serve production static assets from dist
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    // Mount Vite dev server in middleware mode
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BriefMail AI server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});
