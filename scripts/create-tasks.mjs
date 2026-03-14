import postgres from "postgres";

const client = postgres(process.env.DATABASE_URL);

async function run() {
  const users = await client`SELECT id, name, email FROM users`;
  console.log("Kullanicilar:", users.map(u => u.name));

  const enes = users.find(u => u.email === "enesalmis@hayalet.dev");
  const murat = users.find(u => u.email === "muratbutun@hayalet.dev");
  const ogulcan = users.find(u => u.email === "ogulcanaltas@hayalet.dev");
  const kadir = users.find(u => u.email === "kadirkurtulus@hayalet.dev");

  if (!enes || !murat || !ogulcan || !kadir) {
    console.error("Tum kullanicilar bulunamadi!");
    await client.end();
    return;
  }

  const tasks = [
    // Enes - Persona ve hesap oluşturma görevleri
    {
      title: "Persona hesaplarını eksiksiz oluştur",
      description: "Her persona için e-posta, telefon, sosyal medya hesaplarını tam olarak oluştur. Her hesabı eksiksiz tamamladıktan sonra diğerine geç. Hesaplar tamamlandıkça canlandırma işlemleri başlayacak.",
      priority: "urgent",
      assignedTo: enes.id,
      createdBy: kadir.id,
    },
    {
      title: "Sosyal medya API bilgilerini sisteme gir",
      description: "Oluşturulan sosyal medya hesaplarının API anahtarlarını, token bilgilerini sisteme eksiksiz gir. Her hesap için doğrulama yap.",
      priority: "high",
      assignedTo: enes.id,
      createdBy: kadir.id,
    },

    // Murat - API kurulumu ve veri akışı
    {
      title: "En az 1-2 mecrada API akışını başlat",
      description: "Öncelikli olarak en az bir veya iki sosyal medya platformunda API bağlantısını kur ve veri akışını başlat. Sırayla diğer mecralara geç. Bu akışlara göre ekip hareket etmeye başlayacak.",
      priority: "urgent",
      assignedTo: murat.id,
      createdBy: kadir.id,
    },
    {
      title: "Monitoring ve içerik beslemesi altyapısını kur",
      description: "API akışı başladıktan sonra monitoring sistemini aktif et, içerik beslemesi pipeline'ını çalışır hale getir.",
      priority: "high",
      assignedTo: murat.id,
      createdBy: kadir.id,
    },

    // Oğulcan - Proje yönetimi ve içerik stratejisi
    {
      title: "Projeleri oluştur ve yapılandır",
      description: "Kişiler oluştuğu gibi projeleri çıkar ve yapılandır. Her proje için ekip ataması, hedef ve zaman çizelgesi belirle.",
      priority: "high",
      assignedTo: ogulcan.id,
      createdBy: kadir.id,
    },
    {
      title: "Kişilerin günlük içerik yönetimini başlat",
      description: "Personalar aktif olduğunda günlük içerik akışını yönet. Sayfadaki başlıklarla beraber tweet ve diğer aksiyonların kontrolünü sağla.",
      priority: "high",
      assignedTo: ogulcan.id,
      createdBy: kadir.id,
    },
    {
      title: "İçerik strateji ve kararlarını belirle",
      description: "Her proje ve persona için içerik stratejisini oluştur. Hangi mecrada, ne sıklıkla, ne tür içerikler paylaşılacağını planla.",
      priority: "normal",
      assignedTo: ogulcan.id,
      createdBy: kadir.id,
    },
  ];

  for (const task of tasks) {
    await client`INSERT INTO team_tasks (title, description, priority, assigned_to, created_by, status) VALUES (${task.title}, ${task.description}, ${task.priority}, ${task.assignedTo}, ${task.createdBy}, 'pending')`;
    console.log("Gorev eklendi:", task.title, "->", users.find(u => u.id === task.assignedTo)?.name);
  }

  console.log("\nToplam", tasks.length, "gorev eklendi.");
  await client.end();
}

run().catch(e => { console.error(e); process.exit(1); });
