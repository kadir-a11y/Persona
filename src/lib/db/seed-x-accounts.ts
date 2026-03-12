import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { eq } from "drizzle-orm";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString);
const db = drizzle(client, { schema });

const xAccounts = [
  { name: "Arda Yalçın", username: "YalcnArda44", password: "sKeKCiSFA6lHmEWIkXir", birthDate: "1999-06-05", email: "yalcin.arda1995@hotmail.com", emailPassword: "sKeKCiSFA6lHmEWIkXir" },
  { name: "Mert Eryılmaz", username: "", password: "", birthDate: "1999-09-30", email: "mert.erylmz06@hotmail.com", emailPassword: "boGMWWaq8cqdjbkJZ3zX" },
  { name: "Kaan Çelik", username: "", password: "", birthDate: "1997-01-11", email: "celikkaan393@hotmail.com", emailPassword: "mklgcAEDCUsIWeJvh9tv" },
  { name: "Deniz Aksoy", username: "", password: "", birthDate: "2001-03-02", email: "gentlemandeniz2001@hotmail.com", emailPassword: "VOPM1ZI0zVEMcljqXkhn" },
  { name: "Ege Yusuf Karataş", username: "", password: "", birthDate: "2001-12-19", email: "egeyusufkaratas@hotmail.com", emailPassword: "YMtbseEhzMcBbeYIGOwd" },
  { name: "Batuhan Korkmaz", username: "", password: "", birthDate: "1998-05-13", email: "batuhankrkmz05@hotmail.com", emailPassword: "nruBGLlzUi0IJuozTF88" },
  { name: "Doruk Aydın", username: "", password: "", birthDate: "2002-12-06", email: "dorukhanaydin34@hotmail.com", emailPassword: "Nf3R3GWkOPj6ZwwH0OwR" },
  { name: "Baran Gündüz", username: "", password: "", birthDate: "2003-11-22", email: "barangndz06@hotmail.com", emailPassword: "66tr0NG2wrqQkNL5kkyC" },
  { name: "Kuzey Şahin", username: "", password: "", birthDate: "2000-02-28", email: "kuzey.rizeli@hotmail.com", emailPassword: "RuuwXdNn4axWwHmww4U2" },
  { name: "Emirhan Polat", username: "", password: "", birthDate: "1999-04-09", email: "emirhan.polat55@hotmail.com", emailPassword: "AR8pEu9OrG483mTcTOxf" },
  { name: "Yiğit Aslantaş", username: "", password: "", birthDate: "1999-03-14", email: "yigit.aslantas@hotmail.com", emailPassword: "Fc7Rxhuo7DgSkJo7Ka67" },
  { name: "Kerem Demir", username: "", password: "", birthDate: "2001-07-22", email: "kerem.demir1@hotmail.com", emailPassword: "gvQ5MRhx4AAZwOwyvbti" },
  { name: "Ömer Faruk Kayalar", username: "", password: "", birthDate: "2003-01-17", email: "omerfarukkayalar@hotmail.com", emailPassword: "NV3XugN2465J8zZko85N" },
  { name: "Ahmet Efe Yıldız", username: "", password: "", birthDate: "1998-11-05", email: "ahmetefeyildiz1998@hotmail.com", emailPassword: "1kpUpHjyarVvodlQEadd" },
  { name: "Berkay Şimşek", username: "", password: "", birthDate: "2000-09-29", email: "berkaysimsek@hotmail.com", emailPassword: "arBJl0qoZteUHbgwCYP4" },
  { name: "Yusuf Can Özdemir", username: "", password: "", birthDate: "2002-05-08", email: "yusufcanozdmr34@hotmail.com", emailPassword: "lSWWCr58I7GilcYdLDJO" },
  { name: "Ali Mete Karaca", username: "", password: "", birthDate: "1997-12-11", email: "alimetekaraca@hotmail.com", emailPassword: "lSWWCr58I7Gilcmdzupw" },
  { name: "Emre Tunç", username: "", password: "", birthDate: "2004-04-24", email: "emretuncgs05@hotmail.com", emailPassword: "pJpqYIxiFRh4JJSoj5n5" },
  { name: "Furkan Yavuz", username: "", password: "", birthDate: "1999-08-16", email: "furkanyavuzz17@hotmail.com", emailPassword: "SB92C5SzuAWb603u0HuO" },
  { name: "Mehmet Akif Kılıç", username: "", password: "", birthDate: "2001-02-03", email: "mehmet.akif.kilic2@hotmail.com", emailPassword: "spLkzhMQ3zQlCaw2ALyc" },
  { name: "Aras Koç", username: "", password: "", birthDate: "2005-06-27", email: "arasskocc@hotmail.com", emailPassword: "ibqNCBVx12bz7vJAbjBD" },
  { name: "Buğra Alp Doğan", username: "", password: "", birthDate: "1998-10-19", email: "bugraalpdogan@hotmail.com", emailPassword: "1SF6Qp7YDipI16zRG3T6" },
  { name: "Talha Kaplan", username: "", password: "", birthDate: "2006-03-12", email: "talhakaplan@hotmail.com", emailPassword: "QFdUZhuC0bB7CCd6qBXu" },
  { name: "Oğuzhan Çetin", username: "", password: "", birthDate: "1997-07-30", email: "oguzhancetin56@hotmail.com", emailPassword: "0ckcUiloyGhKh8FMUIWM" },
  { name: "Hasan Emir Acar", username: "", password: "", birthDate: "2002-11-21", email: "hasanemiracr@hotmail.com", emailPassword: "n005qXNtAGIHz0RVAYOR" },
  { name: "Selim Uçar", username: "", password: "", birthDate: "2000-01-07", email: "selimucar11@hotmail.com", emailPassword: "cVdvm4GuvlAsm28CxY59" },
  { name: "Enes Baran Taş", username: "", password: "", birthDate: "2003-09-15", email: "enesbarastasTS@hotmail.com", emailPassword: "TiRqdxj94yyP1llu2ydr" },
  { name: "Murat Eren Şen", username: "", password: "", birthDate: "1999-05-04", email: "muraterensen@hotmail.com", emailPassword: "3ZAJLJ0q5kSOO6PDPayk" },
  { name: "Onur Alp Özkan", username: "", password: "", birthDate: "2001-12-26", email: "onuralpozkan2026@hotmail.com", emailPassword: "A98Ws4vGEkTQIKET5YqJ" },
  { name: "Batın Efe Kurt", username: "", password: "", birthDate: "2007-04-09", email: "batinefekurt14@hotmail.com", emailPassword: "2L5vf4t3Rb3GJX6r7oTh" },
  { name: "Serhat Aydın", username: "", password: "", birthDate: "1998-08-18", email: "onuralpozkan2026@hotmail.com", emailPassword: "zamMTt62rwH6NEjUL93N" },
  { name: "Kadir Aras Polat", username: "", password: "", birthDate: "2004-02-02", email: "kadiraraspolat@hotmail.com", emailPassword: "afxtosUmcStMpNHleEoc" },
  { name: "Yasin Demirtaş", username: "", password: "", birthDate: "2000-06-13", email: "yasindemirtas20@hotmail.com", emailPassword: "Y2zf6rSaJODmvMMCHxEL" },
  { name: "Hakan Eymen Yıldırım", username: "", password: "", birthDate: "2005-10-25", email: "hakaneymenyildirim@hotmail.com", emailPassword: "uYEYeHMrdBSDeUVuUfeL" },
  { name: "Tolga Caner Öz", username: "", password: "", birthDate: "2001-03-06", email: "", emailPassword: "EYfduPyGN5S6v6S7kCOF" },
  { name: "Taha Kaan Duman", username: "", password: "", birthDate: "1999-07-31", email: "", emailPassword: "cBCTtkL35xwNndC2y6oJ" },
  { name: "İlker Türkmen", username: "", password: "", birthDate: "2003-11-20", email: "", emailPassword: "8HHBzHjlypTHNzAgLV4V" },
  { name: "Samet Efe Arı", username: "", password: "", birthDate: "2002-01-10", email: "", emailPassword: "p8it4FzvoHIOhzo6Mswq" },
  { name: "Koray Bulut", username: "", password: "", birthDate: "1997-09-23", email: "", emailPassword: "zfckPDcznMc8Eawo7GZv" },
  { name: "Atakan Yıldızhan", username: "", password: "", birthDate: "2006-04-14", email: "", emailPassword: "GTUExMJ5U84O27XOArsS" },
  { name: "Sinan Doruk Özbay", username: "", password: "", birthDate: "2000-08-28", email: "", emailPassword: "dzM8TGu4sLFiv7F69eBs" },
  { name: "Barış Korkut", username: "", password: "", birthDate: "2004-12-05", email: "", emailPassword: "H5wSeugunRo6ZWsjzJxb" },
  { name: "Çağan Mete Korkut", username: "", password: "", birthDate: "1998-02-17", email: "", emailPassword: "5PR0FrB5IZNYF1TISz4c" },
  { name: "Eymen Kerem Uysal", username: "", password: "", birthDate: "2007-06-09", email: "", emailPassword: "F0oJxdShgmAyhLdcYSno" },
  { name: "Volkan Sarı", username: "", password: "", birthDate: "1999-10-12", email: "", emailPassword: "7vIlU6WH9TxmgQQemrWu" },
  { name: "Hazar Efe Demirci", username: "", password: "", birthDate: "2002-03-01", email: "", emailPassword: "LouBXv2jZtP1Kwd3PWRL" },
  { name: "Gökhan Tanrıverdi", username: "", password: "", birthDate: "2005-07-21", email: "", emailPassword: "88V1Zo4mI8Ix7o4VlZ3O" },
  { name: "Umut Ali Turan", username: "", password: "", birthDate: "2003-01-16", email: "", emailPassword: "xxWJytHBO8i67HRodBVA" },
  { name: "Mert Can Yalçın", username: "", password: "", birthDate: "1998-05-27", email: "", emailPassword: "Qe8ZZqKoD6u6Jh9tLDd8" },
  { name: "Çağrı Arslan", username: "", password: "", birthDate: "2004-09-08", email: "", emailPassword: "4Nf0YhWoNofDnppKkHsE" },
  { name: "Derya Özdemir", username: "", password: "", birthDate: "1998-10-15", email: "ozdemirderya2@hotmail.com", emailPassword: "aW8dT0ZE5pQPQTSt4mp4" },
  { name: "Elif Nur Atacılar", username: "", password: "", birthDate: "1996-05-18", email: "elifnuratacilar@hotmail.com", emailPassword: "qUBj4o4UNxfK4vxc2Ucq" },
  { name: "Eslem Aktaş", username: "", password: "", birthDate: "2002-08-07", email: "eslemaktasgg@hotmail.com", emailPassword: "GMT3U6MwnfMIXMZIjvz3" },
  { name: "Özlem Yazıcı", username: "", password: "", birthDate: "2000-02-01", email: "ozlmyzc35@hotmail.com", emailPassword: "LDtug6iqtiT9N86y5WLG" },
  { name: "Nur Baltacı", username: "", password: "", birthDate: "1999-03-19", email: "nurbaltaci77@hotmail.com", emailPassword: "LGqsMSy3aK7VEN3L00FJ" },
  { name: "Kader Kılıç", username: "", password: "", birthDate: "2003-12-29", email: "kilickader04@hotmail.com", emailPassword: "0Ijd1sGgFtkraLlkziSm" },
  { name: "Gözde Taşkın", username: "", password: "", birthDate: "2006-02-21", email: "gozdeyalcin@hotmail.com", emailPassword: "QgdCcpO69xNlQfzEvvDr" },
  { name: "Sibel Turanlı", username: "", password: "", birthDate: "1999-11-09", email: "sibel.turanli@hotmail.com", emailPassword: "oZb0EXU9oYNvLZxcEQXU" },
  { name: "Sevilay Yılmaz", username: "", password: "", birthDate: "2001-10-03", email: "sevilayyilmazz2001@hotmail.com", emailPassword: "xfISOobzDAchoMn3MQh8" },
  { name: "Yağmur Demirci", username: "", password: "", birthDate: "2002-08-07", email: "yagmurdemirci49@hotmail.com", emailPassword: "ly1buKnqayXg0cwfAT38" },
];

async function seedXAccounts() {
  console.log("Seeding X accounts...");

  // Get admin user
  const [adminUser] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "admin@hayalet.dev"))
    .limit(1);

  if (!adminUser) {
    console.error("Admin user not found! Run main seed first.");
    await client.end();
    process.exit(1);
  }

  let created = 0;
  let skipped = 0;

  for (const account of xAccounts) {
    // Check if persona already exists by name
    const [existing] = await db
      .select()
      .from(schema.personas)
      .where(eq(schema.personas.name, account.name))
      .limit(1);

    if (existing) {
      console.log(`  Skipped (exists): ${account.name}`);
      skipped++;
      continue;
    }

    // Create persona
    const [persona] = await db
      .insert(schema.personas)
      .values({
        userId: adminUser.id,
        name: account.name,
        displayName: account.name,
        birthDate: account.birthDate,
        language: "tr",
        country: "Türkiye",
        timezone: "Europe/Istanbul",
        isActive: true,
      })
      .returning();

    // Create social account (X/Twitter) — only if username exists
    if (account.username) {
      await db.insert(schema.socialAccounts).values({
        personaId: persona.id,
        platform: "twitter",
        platformUsername: account.username,
        platformPassword: account.password || null,
        isActive: true,
      });
    }

    // Create email account — if email exists
    if (account.email) {
      await db.insert(schema.emailAccounts).values({
        personaId: persona.id,
        provider: "hotmail",
        email: account.email,
        password: account.emailPassword || null,
        isActive: true,
      });
    }

    console.log(`  Created: ${account.name}`);
    created++;
  }

  console.log(`\nSeed complete! Created: ${created}, Skipped: ${skipped}`);
  await client.end();
}

seedXAccounts().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
