import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { projectPlaybooks } from "./schema/project-playbooks";
import { users } from "./schema/users";
import { eq } from "drizzle-orm";

async function seedPlaybooks() {
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  const db = drizzle(client);

  console.log("Playbook seed başlatılıyor...");

  // Admin kullanıcıyı bul
  const [admin] = await db
    .select()
    .from(users)
    .where(eq(users.email, "admin@hayalet.dev"))
    .limit(1);

  if (!admin) {
    console.error("Admin kullanıcı bulunamadı. Önce ana seed'i çalıştırın.");
    await client.end();
    return;
  }

  const playbooks = [
    {
      userId: admin.id,
      name: "Repütasyon Savunma Planı",
      description: "Müşterinin repütasyonuna yönelik saldırılara karşı koordineli savunma planı. Tüm hesaplarla organize içerik ve yanıt stratejisi.",
      type: "reputation_defense",
      isDefault: true,
      defaultKeywords: ["kriz", "skandal", "saldırı", "şikayet", "boykot"],
      templateTasks: [
        { title: "Saldırı kaynağı analizi", type: "analyze", phase: "detection", priority: "urgent" },
        { title: "Mevcut bahsetmeleri topla ve kategorize et", type: "monitor", phase: "detection", priority: "high" },
        { title: "Sentiment analiz raporu oluştur", type: "analyze", phase: "analysis", priority: "high" },
        { title: "Etki ve risk değerlendirmesi yap", type: "analyze", phase: "analysis", priority: "high" },
        { title: "Saldırgan profil analizi", type: "analyze", phase: "analysis", priority: "medium" },
        { title: "Pozitif içerik kampanyası başlat", type: "create_content", phase: "response", priority: "urgent" },
        { title: "Platform bazlı yanıt stratejisi belirle", type: "coordinate", phase: "response", priority: "high" },
        { title: "Twitter yanıt içerikleri oluştur", type: "create_content", phase: "response", priority: "high", platform: "twitter" },
        { title: "Instagram destek içerikleri oluştur", type: "create_content", phase: "response", priority: "high", platform: "instagram" },
        { title: "Forum savunma paylaşımları hazırla", type: "reply", phase: "response", priority: "medium" },
        { title: "Konuşma yoğunluğu takibi", type: "monitor", phase: "monitoring", priority: "medium" },
        { title: "Yeni bahsetme kontrolü (günlük)", type: "monitor", phase: "monitoring", priority: "medium" },
        { title: "Sentiment trend izleme", type: "monitor", phase: "monitoring", priority: "low" },
        { title: "Sonuç raporu oluştur", type: "analyze", phase: "resolution", priority: "low" },
        { title: "Başarı metriklerini değerlendir", type: "analyze", phase: "resolution", priority: "low" },
      ],
      templateTeam: [
        { assignmentType: "role", teamRole: "defender" },
        { assignmentType: "role", teamRole: "monitor" },
        { assignmentType: "role", teamRole: "amplifier" },
        { assignmentType: "role", teamRole: "coordinator" },
      ],
    },
    {
      userId: admin.id,
      name: "Kriz Yönetimi Planı",
      description: "Ani kriz durumlarında hızlı müdahale planı. Acil değerlendirme, koordinasyon ve iletişim stratejisi.",
      type: "crisis_management",
      isDefault: true,
      defaultKeywords: ["acil", "kriz", "skandal", "ifşa", "sızıntı"],
      templateTasks: [
        { title: "ACİL: Durumu değerlendir ve kapsamı belirle", type: "analyze", phase: "detection", priority: "urgent" },
        { title: "Tüm platformlardaki yansımaları tara", type: "monitor", phase: "detection", priority: "urgent" },
        { title: "Kriz ekibini aktifleştir", type: "coordinate", phase: "detection", priority: "urgent" },
        { title: "Detaylı durum analizi ve brief hazırla", type: "analyze", phase: "analysis", priority: "urgent" },
        { title: "Medya/basın yansımalarını değerlendir", type: "analyze", phase: "analysis", priority: "high" },
        { title: "Resmi açıklama taslağı hazırla", type: "create_content", phase: "response", priority: "urgent" },
        { title: "Tüm kanallardan koordineli yanıt yayınla", type: "coordinate", phase: "response", priority: "urgent" },
        { title: "Negatif içerikleri raporla", type: "report", phase: "response", priority: "high" },
        { title: "Destekçi içerik seferberliği başlat", type: "create_content", phase: "response", priority: "high" },
        { title: "Saatlik durum güncellemesi", type: "monitor", phase: "monitoring", priority: "high" },
        { title: "Rakip/saldırgan aktivite takibi", type: "monitor", phase: "monitoring", priority: "medium" },
        { title: "Kriz kapanış raporu", type: "analyze", phase: "resolution", priority: "medium" },
      ],
      templateTeam: [
        { assignmentType: "role", teamRole: "coordinator" },
        { assignmentType: "role", teamRole: "defender" },
        { assignmentType: "role", teamRole: "monitor" },
        { assignmentType: "role", teamRole: "reporter" },
      ],
    },
    {
      userId: admin.id,
      name: "İzleme Planı",
      description: "Henüz müdahale gerektirmeyen ancak yakından takip edilmesi gereken durumlar için temel izleme planı.",
      type: "monitoring",
      isDefault: true,
      defaultKeywords: [],
      templateTasks: [
        { title: "Günlük bahsetme taraması", type: "monitor", phase: "detection", priority: "medium" },
        { title: "Haftalık sentiment raporu", type: "analyze", phase: "analysis", priority: "low" },
        { title: "Platform bazlı trend takibi", type: "monitor", phase: "monitoring", priority: "low" },
        { title: "Alarm eşiği kontrolü", type: "monitor", phase: "monitoring", priority: "medium" },
      ],
      templateTeam: [
        { assignmentType: "role", teamRole: "monitor" },
      ],
    },
    {
      userId: admin.id,
      name: "Algı Operasyonu Planı",
      description: "Belirli bir narratifi desteklemek veya algıyı yönlendirmek için koordineli içerik ve iletişim planı.",
      type: "perception_operation",
      isDefault: true,
      defaultKeywords: [],
      templateTasks: [
        { title: "Hedef kitle ve platform analizi", type: "analyze", phase: "detection", priority: "high" },
        { title: "Mevcut algı haritası çıkar", type: "analyze", phase: "analysis", priority: "high" },
        { title: "Mesaj çerçevesi ve narratif belirle", type: "coordinate", phase: "analysis", priority: "urgent" },
        { title: "İçerik takvimi oluştur", type: "coordinate", phase: "response", priority: "high" },
        { title: "Platform bazlı içerik üret", type: "create_content", phase: "response", priority: "high" },
        { title: "Etkileyici hesaplarla koordinasyon", type: "coordinate", phase: "response", priority: "medium" },
        { title: "Organik etkileşim kampanyası", type: "create_content", phase: "response", priority: "medium" },
        { title: "Algı değişimi ölçümü", type: "analyze", phase: "monitoring", priority: "medium" },
        { title: "Karşı narratif takibi", type: "monitor", phase: "monitoring", priority: "medium" },
        { title: "Etki raporu ve sonuçlar", type: "analyze", phase: "resolution", priority: "low" },
      ],
      templateTeam: [
        { assignmentType: "role", teamRole: "coordinator" },
        { assignmentType: "role", teamRole: "amplifier" },
        { assignmentType: "role", teamRole: "defender" },
        { assignmentType: "role", teamRole: "monitor" },
      ],
    },
  ];

  for (const playbook of playbooks) {
    await db.insert(projectPlaybooks).values(playbook);
    console.log(`  ✓ ${playbook.name}`);
  }

  console.log(`\n${playbooks.length} playbook oluşturuldu.`);
  await client.end();
}

seedPlaybooks().catch(console.error);
