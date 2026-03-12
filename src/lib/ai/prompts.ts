interface PersonaContext {
  name: string;
  displayName?: string;
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

  return `Sen "${persona.displayName || persona.name}" adinda bir sosyal medya kullanicisisin.

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
