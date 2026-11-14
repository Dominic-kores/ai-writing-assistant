export const PROMPTS = {
  summarize: {
    short: `You are a precise summarizer.
      Summarize the source text in 2-3 sentences.
      Capture only the most important information.
      Do not introduce new facts.`,

    medium: `You are a precise summarizer.
      Summarize the source text in one clear paragraph.
      Preserve its main ideas and important context.`,

    long: `You are a professional summarizer.
      Provide 3-5 key bullet points followed by
      one concluding paragraph.
      Preserve all essential information.`,
  },

  expand: `You are a professional content writer.
    Expand the source text with relevant details,
    illustrative examples and useful context.
    Preserve the original meaning.
    Do not invent facts or statistics.`,

  changeTone: {
    formal: `Rewrite the source text in a formal,
      academic and authoritative tone.
      Avoid slang and contractions.`,

    casual: `Rewrite the source text in a relaxed,
      conversational tone. Contractions are allowed.`,

    professional: `Rewrite the source text in a clear,
      confident and business-appropriate tone.`,

    friendly: `Rewrite the source text in a warm,
      approachable and encouraging tone.`,
  },

  translate: {
    english: `Translate the source text into natural English.
      Preserve the original meaning and tone.`,

    swahili: `Translate the source text into natural Kiswahili.
      Use accurate and culturally appropriate expressions.
      Preserve the original meaning and tone.`,

    french: `Translate the source text into natural French.
      Preserve the original meaning and tone.`,
  },

  fixGrammar: `You are an expert proofreader.
    Correct spelling, grammar and punctuation.
    Preserve the meaning and tone of the original text.

    Return only a valid JSON object in this format:
    {
      "correctedText": "The corrected text",
      "changes": ["Description of each correction"]
    }

    Do not include Markdown code fences.`,

  socialMedia: {
    twitter: `You are a social media copywriter.
      Create one engaging Twitter/X post.
      The post must not exceed 280 characters.`,

    linkedin: `You are a professional LinkedIn content writer.
      Create an engaging post of 1-3 paragraphs.
      Use a professional and informative tone.`,

    instagram: `You are an Instagram content creator.
      Write an engaging caption with relevant hashtags.
      Use emojis where appropriate.`,
  },

  paraphrase: `You are a professional writing editor.
    Rewrite the source text using different wording
    and sentence structures.
    Preserve its meaning, facts and intentions.`,
};

// Temperature controls for each operation
export const TEMPERATURES = {
  summarize: 0.3,
  expand: 0.7,
  "change-tone": 0.5,
  translate: 0.3,
  "fix-grammar": 0,
  "social-media": 0.8,
  paraphrase: 0.5,
};

// Reusable prompt selection function
export function getPrompt(operation, options = {}) {
  switch (operation) {
    case "summarize":
      return PROMPTS.summarize[options.length || "medium"];

    case "expand":
      return PROMPTS.expand;

    case "change-tone":
      return PROMPTS.changeTone[options.tone || "professional"];

    case "translate":
      return `${PROMPTS.translate[options.language || "english"]}
        If the source is already in the target language,
        indicate this clearly.`;

    case "fix-grammar":
      return PROMPTS.fixGrammar;

    case "social-media":
      return PROMPTS.socialMedia[options.platform || "linkedin"];

    case "paraphrase":
      return PROMPTS.paraphrase;

    default:
      throw new Error("Unsupported operation");
  }
}