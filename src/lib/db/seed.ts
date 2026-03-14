import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { hash } from "bcryptjs";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

async function seed() {
  console.log("Seeding database...");

  // Admin credentials from environment or secure defaults
  const adminEmail = process.env.ADMIN_EMAIL || "admin@hayalet.dev";
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD environment variable is required for seeding.");
    console.error("Set ADMIN_PASSWORD in your .env file and try again.");
    await client.end();
    process.exit(1);
  }

  const passwordHash = await hash(adminPassword, 12);
  const [user] = await db
    .insert(schema.users)
    .values({
      name: "Admin",
      email: adminEmail,
      passwordHash,
    })
    .onConflictDoNothing()
    .returning();

  if (!user) {
    console.log("Admin user already exists, skipping seed.");
    await client.end();
    return;
  }

  console.log("Created admin user:", user.email);

  // Create tags
  const tagData = [
    { name: "Teknoloji", color: "#3B82F6" },
    { name: "Spor", color: "#22C55E" },
    { name: "Müzik", color: "#8B5CF6" },
    { name: "Yemek", color: "#F97316" },
    { name: "Seyahat", color: "#EAB308" },
    { name: "Moda", color: "#EC4899" },
    { name: "Sanat", color: "#EF4444" },
    { name: "Bilim", color: "#06B6D4" },
  ];

  const createdTags = await db
    .insert(schema.tags)
    .values(tagData.map((t) => ({ ...t, userId: user.id })))
    .returning();

  console.log(`Created ${createdTags.length} tags`);

  // Create personas
  const personaData = [
    {
      name: "tech_ahmet",

      bio: "Yazılım geliştirici ve teknoloji meraklısı. AI, web3 ve startup dünyasını yakından takip ediyorum.",
      personalityTraits: ["meraklı", "analitik", "paylaşımcı"],
      interests: ["yapay zeka", "programlama", "startup", "kripto"],
      behavioralPatterns: {
        writing_style: "bilgilendirici",
        tone: "profesyonel ama samimi",
        emoji_usage: "minimal",
        hashtag_style: "moderate",
      },
      language: "tr",
      activeHoursStart: 8,
      activeHoursEnd: 23,
      maxPostsPerDay: 5,
    },
    {
      name: "foodie_zeynep",

      bio: "Gurme, ev aşçısı ve yemek fotoğrafçısı. Her tabakta bir hikaye var.",
      personalityTraits: ["yaratıcı", "tutkulu", "sosyal"],
      interests: ["yemek", "fotoğrafçılık", "seyahat", "kültür"],
      behavioralPatterns: {
        writing_style: "duygusal ve betimleyici",
        tone: "sıcak ve davetkar",
        emoji_usage: "heavy",
        hashtag_style: "heavy",
      },
      language: "tr",
      activeHoursStart: 10,
      activeHoursEnd: 22,
      maxPostsPerDay: 3,
    },
    {
      name: "sporcu_can",

      bio: "Fitness antrenörü ve sağlıklı yaşam savunucusu. Her gün biraz daha iyi ol!",
      personalityTraits: ["enerjik", "motive edici", "disiplinli"],
      interests: ["fitness", "beslenme", "koşu", "yoga"],
      behavioralPatterns: {
        writing_style: "motive edici",
        tone: "enerjik ve pozitif",
        emoji_usage: "moderate",
        hashtag_style: "heavy",
      },
      language: "tr",
      activeHoursStart: 6,
      activeHoursEnd: 21,
      maxPostsPerDay: 4,
    },
    {
      name: "artist_elif",

      bio: "Dijital sanatçı ve illüstratör. Renklerin ve formların diliyle konuşuyorum.",
      personalityTraits: ["yaratıcı", "düşünceli", "estetik"],
      interests: ["dijital sanat", "illüstrasyon", "müze", "sinema"],
      behavioralPatterns: {
        writing_style: "şiirsel ve görsel",
        tone: "sakin ve düşünceli",
        emoji_usage: "minimal",
        hashtag_style: "minimal",
      },
      language: "tr",
      activeHoursStart: 11,
      activeHoursEnd: 2,
      maxPostsPerDay: 2,
    },
    {
      name: "traveler_mehmet",

      bio: "Dünya gezgini, fotoğrafçı. 40+ ülke gezdim. Yolculuk bitmez.",
      personalityTraits: ["maceracı", "açık fikirli", "hikayeci"],
      interests: ["seyahat", "fotoğrafçılık", "kültür", "doğa"],
      behavioralPatterns: {
        writing_style: "hikaye anlatıcı",
        tone: "heyecanlı ve ilham verici",
        emoji_usage: "moderate",
        hashtag_style: "moderate",
      },
      language: "tr",
      activeHoursStart: 9,
      activeHoursEnd: 23,
      maxPostsPerDay: 3,
    },
  ];

  const createdPersonas = await db
    .insert(schema.personas)
    .values(
      personaData.map((p) => ({
        ...p,
        userId: user.id,
        timezone: "Europe/Istanbul",
        isActive: true,
      }))
    )
    .returning();

  console.log(`Created ${createdPersonas.length} personas`);

  // Assign tags to personas
  const tagAssignments = [
    { personaIndex: 0, tagIndices: [0, 7] }, // tech_ahmet: Teknoloji, Bilim
    { personaIndex: 1, tagIndices: [3, 4] }, // foodie_zeynep: Yemek, Seyahat
    { personaIndex: 2, tagIndices: [1] }, // sporcu_can: Spor
    { personaIndex: 3, tagIndices: [6, 2] }, // artist_elif: Sanat, Müzik
    { personaIndex: 4, tagIndices: [4, 6] }, // traveler_mehmet: Seyahat, Sanat
  ];

  for (const assignment of tagAssignments) {
    await db.insert(schema.personaTags).values(
      assignment.tagIndices.map((tagIdx) => ({
        personaId: createdPersonas[assignment.personaIndex].id,
        tagId: createdTags[tagIdx].id,
      }))
    );
  }

  console.log("Assigned tags to personas");

  // Create some sample content
  const contentData = [
    {
      personaId: createdPersonas[0].id,
      platform: "twitter",
      contentType: "post",
      content:
        "Yapay zeka artık sadece büyük şirketlerin değil, herkesin aracı. Gemini API ile neler yapılabileceğini keşfetmeye devam ediyorum. #AI #YapayZeka",
      status: "draft",
      aiGenerated: false,
    },
    {
      personaId: createdPersonas[1].id,
      platform: "instagram",
      contentType: "post",
      content:
        "Bugünkü tarifim: Truffle yağlı mantarlı risotto 🍄✨ Pirinçleri yavaş yavaş pişirmek sabır işi ama sonuç kesinlikle buna değer! Tarifi highlights'ta bulabilirsiniz 👆\n\n#risotto #evyemekleri #gurme #yemektarifleri #italyanmutfagi",
      status: "published",
      aiGenerated: false,
    },
    {
      personaId: createdPersonas[2].id,
      platform: "instagram",
      contentType: "post",
      content:
        "Sabah 06:00 antrenmanı ✅ Bacak günü tamamlandı! 🦵💪 Bugünkü program:\n\n🔹 Squat 4x8\n🔹 Leg Press 3x12\n🔹 Romanian Deadlift 4x10\n🔹 Leg Extension 3x15\n\nBahaneler güçlü insanları durduramaz! 💯\n\n#fitness #legday #motivation #antrenman",
      status: "scheduled",
      scheduledAt: new Date(Date.now() + 3600000),
      aiGenerated: false,
    },
  ];

  const createdContent = await db
    .insert(schema.contentItems)
    .values(contentData as any)
    .returning();

  console.log(`Created ${createdContent.length} content items`);

  // Create a sample campaign
  const [campaign] = await db
    .insert(schema.campaigns)
    .values({
      userId: user.id,
      name: "Teknoloji Günü Kampanyası",
      description:
        "Teknoloji etiketli tüm personaların yapay zeka hakkında paylaşım yapması",
      status: "draft",
      targetTagIds: [createdTags[0].id], // Teknoloji tag
      contentTemplate:
        "Yapay zeka ve teknolojinin günlük hayata etkileri hakkında kendi tarzında bir paylaşım yaz.",
      platform: "twitter",
      settings: {
        delayMin: 5,
        delayMax: 30,
        maxPerPersona: 1,
      },
    })
    .returning();

  console.log(`Created campaign: ${campaign.name}`);

  // Log some activities
  await db.insert(schema.activityLog).values([
    {
      userId: user.id,
      entityType: "persona",
      entityId: createdPersonas[0].id,
      action: "created",
      details: { name: createdPersonas[0].name },
    },
    {
      userId: user.id,
      entityType: "content",
      entityId: createdContent[0].id,
      action: "created",
      details: { platform: "twitter" },
    },
    {
      userId: user.id,
      entityType: "campaign",
      entityId: campaign.id,
      action: "created",
      details: { name: campaign.name },
    },
  ]);

  console.log("Created activity logs");
  console.log("\nSeed complete! Login with:");
  console.log(`  Email: ${adminEmail}`);

  await client.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
