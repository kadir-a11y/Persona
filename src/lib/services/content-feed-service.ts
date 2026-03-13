import { db } from "@/lib/db";
import { projectMentions } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function getFeed(
  projectId: string,
  filters?: {
    platform?: string;
    limit?: number;
    offset?: number;
  }
) {
  const conditions = [eq(projectMentions.projectId, projectId)];
  if (filters?.platform) {
    conditions.push(eq(projectMentions.platform, filters.platform));
  }

  const items = await db
    .select()
    .from(projectMentions)
    .where(and(...conditions))
    .orderBy(desc(projectMentions.detectedAt))
    .limit(filters?.limit ?? 30)
    .offset(filters?.offset ?? 0);

  const [countResult] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(projectMentions)
    .where(and(...conditions));

  return {
    items,
    total: countResult?.count ?? 0,
    hasMore: (filters?.offset ?? 0) + items.length < (countResult?.count ?? 0),
  };
}

export async function getPlatformCounts(projectId: string) {
  const counts = await db
    .select({
      platform: projectMentions.platform,
      count: sql<number>`count(*)::int`,
    })
    .from(projectMentions)
    .where(eq(projectMentions.projectId, projectId))
    .groupBy(projectMentions.platform);

  const total = counts.reduce((sum, c) => sum + c.count, 0);
  return { platforms: counts, total };
}

export async function addManualContent(
  projectId: string,
  data: {
    platform: string;
    content: string;
    sourceUrl?: string;
    sourceAuthor?: string;
    sentiment?: string;
  }
) {
  const [item] = await db
    .insert(projectMentions)
    .values({
      projectId,
      platform: data.platform,
      content: data.content,
      sourceUrl: data.sourceUrl || null,
      sourceAuthor: data.sourceAuthor || null,
      sentiment: data.sentiment || "neutral",
      reachEstimate: 0,
      engagementCount: 0,
      requiresResponse: data.sentiment === "negative",
      responseStatus: data.sentiment === "negative" ? "pending" as const : "not_needed" as const,
    })
    .returning();
  return item;
}

export async function addMockFeedData(projectId: string) {
  const platforms = ["twitter", "instagram", "facebook", "linkedin"];
  const sentiments = ["positive", "negative", "neutral"];
  const authors = [
    "social_user_42", "news_bot", "influencer_x", "critic_99",
    "happy_customer", "tech_reviewer", "random_user_7", "media_outlet",
    "blogger_pro", "forum_member_3",
  ];
  const contents = [
    "Bu ürün gerçekten harika, çok memnunum! Herkese tavsiye ederim.",
    "Kalite düşmüş, eskisi gibi değil artık. Çok hayal kırıklığına uğradım.",
    "Yeni güncelleme hakkında ne düşünüyorsunuz? Ben henüz denemedim.",
    "Müşteri hizmetleri berbat, 3 gündür cevap alamıyorum!",
    "Rakiplerine göre fiyat/performans oranı çok iyi.",
    "Kampanya fırsatlarını kaçırmayın, gerçekten değer.",
    "Bu konuda daha şeffaf olmalılar, bilgi eksikliği var.",
    "Tam bir dolandırıcılık, paramı geri istiyorum!",
    "Uzun süredir kullanıyorum, hiç sorun yaşamadım.",
    "Yeni özellikleri çok başarılı, ekip iyi iş çıkarmış.",
    "Sosyal medya yönetimleri çok profesyonel, tebrikler.",
    "Fiyatlar çok yüksek, alternatif arıyorum.",
    "Hızlı teslimat ve güzel paketleme, teşekkürler!",
    "Bu markaya güvenim kalmadı, bir daha almam.",
    "Sektörde en iyi hizmeti veren firma, şüphesiz.",
  ];

  const mockData = [];
  for (let i = 0; i < 20; i++) {
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
    const author = authors[Math.floor(Math.random() * authors.length)];
    const content = contents[Math.floor(Math.random() * contents.length)];
    const daysAgo = Math.floor(Math.random() * 14);
    const detectedAt = new Date(Date.now() - daysAgo * 86400000);

    mockData.push({
      projectId,
      platform,
      sourceUrl: `https://${platform}.com/post/${Date.now()}-${i}`,
      sourceAuthor: author,
      content,
      sentiment,
      reachEstimate: Math.floor(Math.random() * 50000),
      engagementCount: Math.floor(Math.random() * 500),
      requiresResponse: sentiment === "negative",
      responseStatus: sentiment === "negative" ? "pending" as const : "not_needed" as const,
      detectedAt,
    });
  }

  const inserted = await db.insert(projectMentions).values(mockData).returning();
  return inserted;
}
