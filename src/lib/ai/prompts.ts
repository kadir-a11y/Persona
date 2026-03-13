interface PersonaContext {
  name: string;
  bio?: string;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: {
    writing_style?: string;
    tone?: string;
    emoji_usage?: string;
    hashtag_style?: string;
  };
  language: string;
}

interface AdvancedPersonaContext extends PersonaContext {
  gender?: string;
  country?: string;
  city?: string;
}

interface DiscoveredItemContext {
  title?: string;
  summary?: string;
  url?: string;
  aiMetadata?: {
    suggested_angle?: string;
    [key: string]: unknown;
  };
}

const LANGUAGE_NAMES: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  ar: "العربية",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  pt: "Português",
  it: "Italiano",
  ru: "Русский",
  ja: "日本語",
  ko: "한국어",
  zh: "中文",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  no: "Norsk",
  da: "Dansk",
  fi: "Suomi",
  el: "Ελληνικά",
  cs: "Čeština",
  hu: "Magyar",
  ro: "Română",
  bg: "Български",
  hr: "Hrvatski",
  sk: "Slovenčina",
  sl: "Slovenščina",
  uk: "Українська",
  he: "עברית",
  hi: "हिन्दी",
  th: "ไทย",
  vi: "Tiếng Việt",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  fa: "فارسی",
  ur: "اردو",
};

function getLanguageName(code: string): string {
  return LANGUAGE_NAMES[code] || code;
}

const PLATFORM_GUIDELINES: Record<string, string> = {
  twitter: "Twitter/X: 280 character limit. Be concise and impactful. Threads are acceptable for longer content.",
  instagram: "Instagram: Up to 2200 characters. Visual-centric platform. Use relevant hashtags. Engaging captions.",
  facebook: "Facebook: Longer format allowed. Storytelling works well. Encourage engagement and sharing.",
  linkedin: "LinkedIn: Professional tone. Industry-focused. Thought leadership and career-related content.",
  tiktok: "TikTok: Short, fun, trend-driven. Casual and energetic. Hook the audience in the first line.",
};

export function buildAdvancedContentPrompt(
  persona: AdvancedPersonaContext,
  platform: string,
  contentType: string,
  options: {
    language?: string;
    topic?: string;
    additionalInstructions?: string;
    discoveredItem?: DiscoveredItemContext;
    toneOverride?: string;
  } = {}
): string {
  const outputLang = options.language || persona.language || "en";
  const langName = getLanguageName(outputLang);
  const traits = persona.personalityTraits.join(", ") || "general";
  const interests = persona.interests.join(", ") || "various topics";
  const style = persona.behavioralPatterns.writing_style || "natural";
  const tone = options.toneOverride || persona.behavioralPatterns.tone || "friendly";
  const emoji = persona.behavioralPatterns.emoji_usage || "minimal";
  const hashtag = persona.behavioralPatterns.hashtag_style || "minimal";

  const locationParts: string[] = [];
  if (persona.city) locationParts.push(persona.city);
  if (persona.country) locationParts.push(persona.country);
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : null;

  let discoveredItemSection = "";
  if (options.discoveredItem) {
    const item = options.discoveredItem;
    discoveredItemSection = `
SOURCE MATERIAL / DISCOVERED ITEM:
${item.title ? `- Title: ${item.title}` : ""}
${item.summary ? `- Summary: ${item.summary}` : ""}
${item.url ? `- Source URL: ${item.url}` : ""}
${item.aiMetadata?.suggested_angle ? `- Suggested angle: ${item.aiMetadata.suggested_angle}` : ""}

Use this source material as inspiration or reference for the content. Incorporate it naturally into the post, reflecting the persona's perspective and voice. Do not copy verbatim; rewrite and adapt it.`;
  }

  return `You are "${persona.name}", a social media persona.

PERSONA PROFILE:
- Personality traits: ${traits}
- Interests: ${interests}
- Writing style: ${style}
- Tone: ${tone}
- Emoji usage: ${emoji}
- Hashtag style: ${hashtag}
${persona.bio ? `- Bio: ${persona.bio}` : ""}
${persona.gender ? `- Gender: ${persona.gender}` : ""}
${locationStr ? `- Location: ${locationStr}` : ""}

PLATFORM: ${platform}
${PLATFORM_GUIDELINES[platform] || ""}

CONTENT TYPE: ${contentType}
${options.topic ? `TOPIC: ${options.topic}` : ""}
${discoveredItemSection}
${options.additionalInstructions ? `ADDITIONAL INSTRUCTIONS: ${options.additionalInstructions}` : ""}

LANGUAGE: Write entirely in ${langName} (${outputLang}). All output must be in this language.

RULES:
1. Stay fully in character as "${persona.name}".
2. The content must feel authentic and organic, as if a real person wrote it.
3. Follow the persona's writing style, tone, and emoji/hashtag preferences exactly.
4. Respect the platform's conventions and character limits.
5. Output ONLY the content itself. No explanations, labels, or meta-commentary.
6. Write in ${langName}.`;
}

export function buildContentPrompt(
  persona: PersonaContext,
  platform: string,
  contentType: string,
  topic?: string,
  additionalInstructions?: string
): string {
  const traits = persona.personalityTraits.join(", ") || "genel";
  const interests = persona.interests.join(", ") || "cesitli konular";
  const style = persona.behavioralPatterns.writing_style || "dogal";
  const tone = persona.behavioralPatterns.tone || "samimi";
  const emoji = persona.behavioralPatterns.emoji_usage || "minimal";
  const hashtag = persona.behavioralPatterns.hashtag_style || "minimal";

  const platformLimits: Record<string, string> = {
    twitter: "280 karakter limiti. Kisa ve oz ol.",
    instagram: "2200 karakter limiti. Gorsel odakli, hashtag kullan.",
    facebook: "Uzun format olabilir. Hikaye anlatimi.",
    linkedin: "Profesyonel ton. Is dunyasi odakli.",
    tiktok: "Kisa, eglenceli, trend odakli.",
  };

  return `Sen "${persona.name}" adinda bir sosyal medya kullanicisisin.

Karakter ozelliklerin:
- Kisilik: ${traits}
- Ilgi alanlari: ${interests}
- Yazim stili: ${style}
- Ton: ${tone}
- Emoji kullanimi: ${emoji}
- Hashtag stili: ${hashtag}
${persona.bio ? `- Bio: ${persona.bio}` : ""}

Platform: ${platform}
${platformLimits[platform] || ""}

Icerik tipi: ${contentType}
${topic ? `Konu: ${topic}` : ""}
${additionalInstructions ? `Ek talimatlar: ${additionalInstructions}` : ""}

Dil: ${persona.language === "tr" ? "Turkce" : persona.language}

Bu karaktere uygun, dogal gorunen bir ${contentType} yaz. Sadece icerigi yaz, baska aciklama ekleme.`;
}

export function buildCampaignPrompt(
  persona: PersonaContext,
  platform: string,
  contentTemplate: string
): string {
  return buildContentPrompt(
    persona,
    platform,
    "post",
    undefined,
    `Sablon/Talimat: ${contentTemplate}`
  );
}

interface SourceContentContext {
  content: string;
  author?: string;
  platform: string;
  url?: string;
}

export function buildWorkspaceResponsePrompt(
  persona: AdvancedPersonaContext,
  platform: string,
  contentType: string,
  options: {
    sourceContent?: SourceContentContext;
    aiCommand: string;
    sentimentDirection?: string;
  }
): string {
  const outputLang = persona.language || "tr";
  const langName = getLanguageName(outputLang);
  const traits = persona.personalityTraits.join(", ") || "general";
  const interests = persona.interests.join(", ") || "various topics";
  const style = persona.behavioralPatterns.writing_style || "natural";
  const tone = persona.behavioralPatterns.tone || "friendly";
  const emoji = persona.behavioralPatterns.emoji_usage || "minimal";
  const hashtag = persona.behavioralPatterns.hashtag_style || "minimal";

  const locationParts: string[] = [];
  if (persona.city) locationParts.push(persona.city);
  if (persona.country) locationParts.push(persona.country);
  const locationStr = locationParts.length > 0 ? locationParts.join(", ") : null;

  let sourceSection = "";
  if (options.sourceContent) {
    const src = options.sourceContent;
    sourceSection = `
SOURCE CONTENT (the content you are replying/responding to):
- Author: ${src.author || "unknown"}
- Platform: ${src.platform}
${src.url ? `- URL: ${src.url}` : ""}
- Content: "${src.content}"

You must respond to this content naturally, as if you organically encountered it on social media.`;
  }

  const sentimentSection = options.sentimentDirection
    ? `\nSENTIMENT DIRECTION: Your response should have a ${options.sentimentDirection} tone/sentiment.`
    : "";

  return `You are "${persona.name}", a social media persona.

PERSONA PROFILE:
- Personality traits: ${traits}
- Interests: ${interests}
- Writing style: ${style}
- Tone: ${tone}
- Emoji usage: ${emoji}
- Hashtag style: ${hashtag}
${persona.bio ? `- Bio: ${persona.bio}` : ""}
${persona.gender ? `- Gender: ${persona.gender}` : ""}
${locationStr ? `- Location: ${locationStr}` : ""}

PLATFORM: ${platform}
${PLATFORM_GUIDELINES[platform] || ""}

CONTENT TYPE: ${contentType}
${sourceSection}

USER COMMAND (may be in any language — follow the instruction regardless of its language): ${options.aiCommand}
${sentimentSection}

LANGUAGE: Write entirely in ${langName} (${outputLang}). All output must be in this language. The user command above may be written in a different language — that is normal. Always produce your response in ${langName}.

RULES:
1. Stay fully in character as "${persona.name}".
2. The response must feel authentic and organic, as if a real person wrote it.
3. Follow the persona's writing style, tone, and emoji/hashtag preferences exactly.
4. Respect the platform's conventions and character limits.
5. Output ONLY the response content itself. No explanations, labels, or meta-commentary.
6. Write in ${langName}.
7. Each persona's response should be unique — do not produce generic or template-like content.`;
}

export function buildOrganicActivityPrompt(
  persona: AdvancedPersonaContext,
  platform: string,
  activityType: string,
  targetContent?: string
): string {
  const outputLang = persona.language || "tr";
  const langName = getLanguageName(outputLang);
  const traits = persona.personalityTraits.join(", ") || "general";
  const tone = persona.behavioralPatterns.tone || "friendly";
  const emoji = persona.behavioralPatterns.emoji_usage || "minimal";

  if (activityType !== "positive_comment") {
    return ""; // like, retweet, share don't need generated content
  }

  return `You are "${persona.name}", a social media persona.

PERSONALITY: ${traits}
TONE: ${tone}
EMOJI USAGE: ${emoji}
${persona.bio ? `BIO: ${persona.bio}` : ""}

PLATFORM: ${platform}
${PLATFORM_GUIDELINES[platform] || ""}

TASK: Write a short, positive comment on this content:
"${targetContent || ""}"

LANGUAGE: Write in ${langName} (${outputLang}).

RULES:
1. Keep it brief (1-2 sentences max).
2. Be genuine and natural — avoid sounding like a bot.
3. Stay in character as "${persona.name}".
4. Be positive and supportive.
5. Output ONLY the comment. No explanations.`;
}

interface ProjectDefenseContext {
  projectName: string;
  projectDescription?: string;
  clientName?: string;
  keywords: string[];
  negativeMentionExamples?: string[];
}

export function buildDefenseContentPrompt(
  persona: PersonaContext,
  platform: string,
  project: ProjectDefenseContext,
  additionalInstructions?: string
): string {
  const mentionExamples = project.negativeMentionExamples?.length
    ? `\nNegatif bahsetme ornekleri (bunlara karsi savunma yap):\n${project.negativeMentionExamples.map((m, i) => `${i + 1}. "${m}"`).join("\n")}`
    : "";

  const defenseContext = `
PROJE BAGLAMI:
- Proje: ${project.projectName}
${project.projectDescription ? `- Aciklama: ${project.projectDescription}` : ""}
${project.clientName ? `- Musteri: ${project.clientName}` : ""}
- Anahtar kelimeler: ${project.keywords.join(", ") || "belirtilmemis"}
${mentionExamples}

GOREV: Bu proje kapsaminda savunma/destek icerigi uret. Icerik:
- Dogal ve organik gorunmeli
- Pozitif bir bakis acisi sunmali
- Dogrudan saldiriya yanit vermek yerine pozitif narratif kurmali
- Karakterine uygun olmali
${additionalInstructions ? `Ek talimatlar: ${additionalInstructions}` : ""}`;

  return buildContentPrompt(
    persona,
    platform,
    "post",
    undefined,
    defenseContext
  );
}
