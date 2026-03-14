# Persona — Sosyal Medya Management Platformu

Sosyal medya hesaplarını tek panelden yöneten, AI destekli içerik üreten, zamanlama ve kuyruk sistemiyle çoklu hesap operasyonu sağlayan bir sosyal medya management platformu. Hootsuite benzeri — kullanıcılar kendi hesaplarını ekler, platform içerik üretimi, zamanlama ve yayınlamayı yönetir.

Tech: Next.js 15 (App Router) + TypeScript + PostgreSQL 16 (Drizzle ORM) + Redis 7 + BullMQ + Google Gemini API + Tailwind/shadcn + Auth.js v5 + Cloudflare R2 + Coolify VPS
Repo: github.com/kadir-a11y/persona (private)

---

## ⚠️ Session Başlangıç — BUNU ATLA DEMEDİKÇE SIRASI İLE YAP

1. Bu dosyayı oku ✓ (zaten okudun)
2. `.env` dosyası var mı kontrol et. YOKSA → aşağıdaki "İlk Kurulum" bölümüne git, ÖNCE onu çöz.
3. Notion Handoff Log'un **EN ÜSTTEKİ** kaydını oku:
   → https://www.notion.so/323dccfc21ee8185aee7e4f31747bffb
4. Kullanıcıya şu formatla başla — TAHMİN ETME, HANDOFF'TAN OKU:
   ```
   Son session: [tarih — başlık]
   Yapılan: [kısa özet]
   Kalınan yer: [nerede kalındı]
   Önerilen adım: [handoff'taki öneri]
   
   Bununla devam edelim mi, yoksa farklı bir şey mi yapalım?
   ```
5. Kullanıcı onay verene kadar kod yazma.

Gerekirse ek bilgi için:
- Claude Context (iş kuralları, tuzaklar): https://www.notion.so/323dccfc21ee81b3b248df22166f42aa
- Görev Takibi: https://www.notion.so/e9a281ceb8724c76a519b93f80b67295
- Teknik Spec: https://www.notion.so/323dccfc21ee81b193a0c8d99a4bb9ff

---

## 🔧 İlk Kurulum (sadece yeni bilgisayar veya .env yoksa)

`.env` dosyası git'e dahil değildir. Yeni bir ortamda çalışırken:

1. Notion Altyapı & Erişim sayfasını oku: https://www.notion.so/323dccfc21ee8143a7eaf864effacbee
2. Oradaki değerleri kullanarak proje kök dizininde `.env` dosyası oluştur
3. Docker servislerini başlat: `docker compose up -d`
4. Uygulamayı test et: `pnpm dev`

SSH bağlantısı gerekiyorsa:
- Host: 46.225.216.104 | User: root | Key: ~/.ssh/coolify_key
- SSH config yoksa: `ssh -i ~/.ssh/coolify_key root@46.225.216.104`

Bu adımlar sadece 1 kere yapılır. `.env` oluşturulduktan sonra bu bölüm atlanır.

---

## 🔴 ZORUNLU: Session Bitiş — BUNLARI YAPMADAN SESSION BİTMEZ

Kullanıcı "bitti", "tamam", "kapat", "son", "bitir" veya benzeri bir şey derse:
ÖNCE aşağıdakileri yap, SONRA session'ı bitir.

### Adım 1: Handoff Log'a kayıt yaz
Notion'a yeni kayıt ekle (en üste):
```
### [TARİH] — [Başlık]
**Durum:** Tamamlandı / Kodlandı (deploy bekliyor) / Devam edecek
**PC:** Ev / Ofis
**Ne yapıldı:** [bullet list]
**Nerede kalındı:** [net açıklama]
**Blocker:** [varsa / Yok]
**Önerilen sonraki adım:** [somut, spesifik — "devam et" yazmak YASAK]
**Son commit:** [hash + mesaj]
**Deploy:** [Evet / Hayır — neden]
**Değişen dosyalar:** [liste]
```

Ayrıca sayfanın en üstündeki "Son durum" tablosunu güncelle:
- Aktif branch, Son commit, Deploy durumu, Son çalışılan PC

### Adım 2: Görev Takibi'ni güncelle
- Tamamlanan görevleri "Tamamlandı" yap
- Yeni çıkan görevleri ekle
- Durum değişikliklerini işle

### Adım 3: Kullanıcıya onayla
"Handoff yazıldı, görevler güncellendi. Başka bir şey var mı?"

**Kullanıcı session'ı bitirmek isteyip handoff'u reddederse bile en az 2 cümlelik kısa handoff yaz.**

---

## 🔴 ZORUNLU: Uzun Session Kuralı

Her 30 dakikada bir VEYA büyük bir görev tamamlandığında:
→ "Handoff güncellemeli miyim?" diye sor.
Kullanıcı hayır derse devam et ama session sonunda mutlaka yaz.

---

## Notion Sayfa Linkleri

| Sayfa | Link |
|---|---|
| Proje Ana Sayfa | https://www.notion.so/323dccfc21ee811d881cf291e428bb4f |
| Claude Context | https://www.notion.so/323dccfc21ee81b3b248df22166f42aa |
| Handoff Log | https://www.notion.so/323dccfc21ee8185aee7e4f31747bffb |
| Görev Takibi (DB) | https://www.notion.so/e9a281ceb8724c76a519b93f80b67295 |
| Teknik Spec | https://www.notion.so/323dccfc21ee81b193a0c8d99a4bb9ff |
| Altyapı & Erişim | https://www.notion.so/323dccfc21ee8143a7eaf864effacbee |
| Strateji & Vizyon | https://www.notion.so/323dccfc21ee81bdaad4e19898c60ebe |
| Gelecek Fikirler | https://www.notion.so/323dccfc21ee81b5aa0be865d01e64bc |
| Notlar & Arşiv | https://www.notion.so/323dccfc21ee812ca06ff7ff33550c4c |

---

## Global Kurallar

### Temel İlkeler
- **Önce oku, sonra yap.** Dosyayı düzenlemeden önce tamamını oku. Kısmi okuma = hata.
- **Önce planla, sonra kodla.** Karmaşık işlemlerde adımları yaz, onay al, sonra uygula.
- **Tek kaynak, tek dosya.** Mevcut dosyayı güncelle, aynı isimde yeni oluşturma.
- **Emin değilsen varsayma, sor.**

### Yapma
- Dosyayı kısmen okuyup işlem yapma
- Aynı isimde yeni dosya oluşturma
- Onay almadan büyük değişiklik yapma
- Hata alınca aynı yöntemi tekrar deneme — farklı yaklaşım öner
- Uzun dosyaları tek seferde yazmaya çalışma
- Commented-out kod bırakma
- Console.log production'da bırakma
- Empty catch block ile error yutma

### Yap
- Dosya işlemlerinde tam yol kullan
- Her işlem öncesi mevcut durumu özetle
- Karmaşık işleri adımlara böl
- Input validation, XSS prevention, SQL injection prevention
- Type safety ve error handling zorunlu
- DRY prensibi

### Commit
- Format: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- İngilizce, tek mantıksal değişiklik per commit
- Branch: `main` (production), `feat/[isim]`, `fix/[isim]`

### Notion Kuralları
- Yeni sayfa oluşturmadan ÖNCE `notion-search` ile mevcut sayfayı ara
- Duplicate sayfa oluşturma — varsa güncelle

### 4 Aşamalı Workflow
1. **Analiz** — Görevi anla, mevcut kodu incele
2. **Planlama** — Adım adım plan, onay al
3. **Uygulama** — Plana göre kod yaz, incremental
4. **Review** — Değişiklikleri özetle, dökümante et
