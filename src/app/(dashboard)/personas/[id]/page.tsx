"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Plus,
  X,
  Loader2,
  User,
  Globe,
  Clock,
  MessageSquare,
  Hash,
  Smile,
  Pen,
  Settings2,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  Mail,
  Phone,
  Key,
  ExternalLink,
  BookOpen,
  StickyNote,
  Shield,
  Image,
  Film,
  FileIcon,
  Upload,
  Download,
  Sparkles,
  Copy,
  Save,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { countries, getCitiesByCountry } from "@/lib/data/countries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface SocialAccount {
  id: string;
  platform: string;
  platformUserId: string | null;
  platformUsername: string | null;
  platformEmail: string | null;
  platformPhone: string | null;
  platformPassword: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecretKey: string | null;
  accessToken: string | null;
  accessTokenSecret: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface ForumAccount {
  id: string;
  portalName: string;
  portalUrl: string | null;
  username: string | null;
  email: string | null;
  phone: string | null;
  password: string | null;
  apiEndpoint: string | null;
  apiKey: string | null;
  apiSecretKey: string | null;
  accessToken: string | null;
  accessTokenSecret: string | null;
  notes: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface EmailAccount {
  id: string;
  provider: string;
  email: string;
  password: string | null;
  phone: string | null;
  recoveryEmail: string | null;
  smtpHost: string | null;
  smtpPort: string | null;
  imapHost: string | null;
  imapPort: string | null;
  apiKey: string | null;
  notes: string | null;
  isActive: boolean | null;
  lastUsedAt: string | null;
  createdAt: string | null;
}

interface ContentItem {
  id: string;
  platform: string;
  contentType: string;
  content: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  aiGenerated: boolean;
  createdAt: string | null;
}

interface BehavioralPatterns {
  writing_style?: string;
  tone?: string;
  emoji_usage?: string;
  hashtag_style?: string;
}

interface Persona {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
  gender: string | null;
  birthDate: string | null;
  country: string | null;
  city: string | null;
  language: string | null;
  timezone: string | null;
  activeHoursStart: number | null;
  activeHoursEnd: number | null;
  maxPostsPerDay: number | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: Tag[];
  socialAccounts: SocialAccount[];
  forumAccounts: ForumAccount[];
  emailAccounts: EmailAccount[];
}

interface EditFormData {
  name: string;
  bio: string;
  gender: string;
  birthDate: string;
  country: string;
  city: string;
  language: string;
  timezone: string;
  activeHoursStart: number;
  activeHoursEnd: number;
  maxPostsPerDay: number;
  isActive: boolean;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: BehavioralPatterns;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const languageNames: Record<string, string> = {
  tr: "Türkçe",
  en: "English",
  de: "Deutsch",
  fr: "Français",
  es: "Español",
  ar: "العربية",
  ru: "Русский",
  pt: "Português",
  ja: "日本語",
  zh: "中文",
  ko: "한국어",
  it: "Italiano",
  nl: "Nederlands",
  pl: "Polski",
  sv: "Svenska",
  hi: "हिन्दी",
  bn: "বাংলা",
  ur: "اردو",
  fa: "فارسی",
  id: "Bahasa Indonesia",
  ms: "Bahasa Melayu",
  th: "ไทย",
  vi: "Tiếng Việt",
  tl: "Filipino",
  el: "Ελληνικά",
  cs: "Čeština",
  ro: "Română",
  hu: "Magyar",
  da: "Dansk",
  no: "Norsk",
  fi: "Suomi",
  uk: "Українська",
  he: "עברית",
  sw: "Kiswahili",
  az: "Azərbaycan",
  kk: "Қазақша",
  uz: "Oʻzbek",
  ka: "ქართული",
  sr: "Српски",
  hr: "Hrvatski",
  bg: "Български",
  sq: "Shqip",
  ca: "Català",
  sk: "Slovenčina",
  lt: "Lietuvių",
  lv: "Latviešu",
  et: "Eesti",
  sl: "Slovenščina",
  mk: "Македонски",
};

const usageLevelLabels: Record<string, string> = {
  none: "Hiç",
  minimal: "Minimal",
  moderate: "Orta",
  heavy: "Yoğun",
};

const statusLabels: Record<string, string> = {
  draft: "Taslak",
  scheduled: "Zamanlanmış",
  published: "Yayınlanmış",
  failed: "Başarısız",
};

const statusColors: Record<string, string> = {
  draft: "secondary",
  scheduled: "outline",
  published: "default",
  failed: "destructive",
};

const platformNames: Record<string, string> = {
  twitter: "X (Twitter)",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  threads: "Threads",
  pinterest: "Pinterest",
};

function platformIcon(platform: string): string {
  const icons: Record<string, string> = {
    twitter: "X", instagram: "IG", facebook: "FB", linkedin: "LI",
    tiktok: "TT", youtube: "YT", threads: "TH", pinterest: "PI",
  };
  return icons[platform.toLowerCase()] || platform.slice(0, 2).toUpperCase();
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ---------------------------------------------------------------------------
// Profile skeleton
// ---------------------------------------------------------------------------

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-8 w-8 rounded bg-muted" />
        <div className="h-6 w-40 rounded bg-muted" />
      </div>
      <Card className="animate-pulse">
        <CardHeader className="flex flex-row items-center gap-6">
          <div className="h-20 w-20 rounded-full bg-muted" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-1/3 rounded bg-muted" />
            <div className="h-4 w-1/4 rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        </CardHeader>
      </Card>
      <div className="h-10 w-full rounded bg-muted" />
      <Card className="animate-pulse">
        <CardContent className="space-y-4 pt-6">
          <div className="h-4 w-full rounded bg-muted" />
          <div className="h-4 w-4/5 rounded bg-muted" />
          <div className="h-4 w-3/5 rounded bg-muted" />
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Edit Dialog
// ---------------------------------------------------------------------------

function EditPersonaDialog({
  open,
  onOpenChange,
  persona,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  persona: Persona;
  onUpdated: () => void;
}) {
  const [formData, setFormData] = useState<EditFormData>({
    name: persona.name,
    bio: persona.bio || "",
    gender: persona.gender || "",
    birthDate: persona.birthDate || "",
    country: persona.country || "",
    city: persona.city || "",
    language: persona.language || "tr",
    timezone: persona.timezone || "Europe/Istanbul",
    activeHoursStart: persona.activeHoursStart ?? 9,
    activeHoursEnd: persona.activeHoursEnd ?? 23,
    maxPostsPerDay: persona.maxPostsPerDay ?? 5,
    isActive: persona.isActive ?? true,
    personalityTraits: persona.personalityTraits || [],
    interests: persona.interests || [],
    behavioralPatterns: persona.behavioralPatterns || {},
  });
  const [newTrait, setNewTrait] = useState("");
  const [newInterest, setNewInterest] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setFormData({
      name: persona.name,
      bio: persona.bio || "",
      gender: persona.gender || "",
      birthDate: persona.birthDate || "",
      country: persona.country || "",
      city: persona.city || "",
      language: persona.language || "tr",
      timezone: persona.timezone || "Europe/Istanbul",
      activeHoursStart: persona.activeHoursStart ?? 9,
      activeHoursEnd: persona.activeHoursEnd ?? 23,
      maxPostsPerDay: persona.maxPostsPerDay ?? 5,
      isActive: persona.isActive ?? true,
      personalityTraits: persona.personalityTraits || [],
      interests: persona.interests || [],
      behavioralPatterns: persona.behavioralPatterns || {},
    });
  }, [persona]);

  function addTrait() {
    const v = newTrait.trim();
    if (v && !formData.personalityTraits.includes(v)) {
      setFormData((f) => ({ ...f, personalityTraits: [...f.personalityTraits, v] }));
      setNewTrait("");
    }
  }

  function removeTrait(t: string) {
    setFormData((f) => ({
      ...f,
      personalityTraits: f.personalityTraits.filter((x) => x !== t),
    }));
  }

  function addInterest() {
    const v = newInterest.trim();
    if (v && !formData.interests.includes(v)) {
      setFormData((f) => ({ ...f, interests: [...f.interests, v] }));
      setNewInterest("");
    }
  }

  function removeInterest(i: string) {
    setFormData((f) => ({
      ...f,
      interests: f.interests.filter((x) => x !== i),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Persona ismi zorunludur.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name.trim(),
          bio: formData.bio.trim() || undefined,
          gender: formData.gender || undefined,
          birthDate: formData.birthDate || undefined,
          country: formData.country.trim() || undefined,
          city: formData.city.trim() || undefined,
          language: formData.language,
          timezone: formData.timezone,
          activeHoursStart: formData.activeHoursStart,
          activeHoursEnd: formData.activeHoursEnd,
          maxPostsPerDay: formData.maxPostsPerDay,
          isActive: formData.isActive,
          personalityTraits: formData.personalityTraits,
          interests: formData.interests,
          behavioralPatterns: formData.behavioralPatterns,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(", ")
            : "Güncelleme başarısız."
        );
      }

      onOpenChange(false);
      onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Personayı Düzenle</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic info */}
          <div className="space-y-2">
            <Label htmlFor="edit-name">
              Kullanıcı Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="edit-name"
              value={formData.name}
              onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-bio">Biyografi</Label>
            <Textarea
              id="edit-bio"
              rows={3}
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Gender & Birth Date */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Cinsiyet</Label>
              <Select
                value={formData.gender}
                onValueChange={(v) => setFormData((f) => ({ ...f, gender: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-birthdate">Doğum Tarihi</Label>
              <Input
                id="edit-birthdate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((f) => ({ ...f, birthDate: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Country & City */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Ülke</Label>
              <Select
                value={formData.country}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, country: v, city: "" }))
                }
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Ülke seçin" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Şehir</Label>
              <Select
                value={formData.city}
                onValueChange={(v) =>
                  setFormData((f) => ({ ...f, city: v }))
                }
                disabled={isSubmitting || !formData.country}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Şehir seçin" />
                </SelectTrigger>
                <SelectContent>
                  {getCitiesByCountry(formData.country).map((city) => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <Switch
              id="edit-active"
              checked={formData.isActive}
              onCheckedChange={(v) => setFormData((f) => ({ ...f, isActive: v }))}
              disabled={isSubmitting}
            />
            <Label htmlFor="edit-active">
              {formData.isActive ? "Aktif" : "Pasif"}
            </Label>
          </div>

          <Separator />

          {/* Personality Traits */}
          <div className="space-y-2">
            <Label>Kişilik Özellikleri</Label>
            <div className="flex flex-wrap gap-1.5">
              {formData.personalityTraits.map((t) => (
                <Badge key={t} variant="secondary" className="gap-1">
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTrait(t)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Yeni özellik ekle..."
                value={newTrait}
                onChange={(e) => setNewTrait(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTrait();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" variant="outline" size="icon" onClick={addTrait}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-2">
            <Label>İlgi Alanları</Label>
            <div className="flex flex-wrap gap-1.5">
              {formData.interests.map((i) => (
                <Badge key={i} variant="outline" className="gap-1">
                  {i}
                  <button
                    type="button"
                    onClick={() => removeInterest(i)}
                    className="ml-1 rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Yeni ilgi alanı ekle..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addInterest();
                  }
                }}
                disabled={isSubmitting}
              />
              <Button type="button" variant="outline" size="icon" onClick={addInterest}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Behavioral patterns */}
          <div className="space-y-3">
            <Label>Davranışsal Kalıplar</Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="edit-writingStyle" className="text-xs text-muted-foreground">
                  Yazım Stili
                </Label>
                <Input
                  id="edit-writingStyle"
                  placeholder="örneğin: resmi, samimi..."
                  value={formData.behavioralPatterns.writing_style || ""}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, writing_style: e.target.value },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-tone" className="text-xs text-muted-foreground">
                  Ton
                </Label>
                <Input
                  id="edit-tone"
                  placeholder="örneğin: ciddi, eğlenceli..."
                  value={formData.behavioralPatterns.tone || ""}
                  onChange={(e) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, tone: e.target.value },
                    }))
                  }
                  disabled={isSubmitting}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-emojiUsage" className="text-xs text-muted-foreground">
                  Emoji Kullanımı
                </Label>
                <Select
                  value={formData.behavioralPatterns.emoji_usage || "none"}
                  onValueChange={(v) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, emoji_usage: v },
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-emojiUsage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Hiç</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yoğun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-hashtagStyle" className="text-xs text-muted-foreground">
                  Hashtag Stili
                </Label>
                <Select
                  value={formData.behavioralPatterns.hashtag_style || "none"}
                  onValueChange={(v) =>
                    setFormData((f) => ({
                      ...f,
                      behavioralPatterns: { ...f.behavioralPatterns, hashtag_style: v },
                    }))
                  }
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="edit-hashtagStyle">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Hiç</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="moderate">Orta</SelectItem>
                    <SelectItem value="heavy">Yoğun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Settings */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="edit-language">Dil</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => setFormData((f) => ({ ...f, language: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-timezone">Saat Dilimi</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => setFormData((f) => ({ ...f, timezone: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="edit-timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">Europe/Istanbul</SelectItem>
                  <SelectItem value="Europe/London">Europe/London</SelectItem>
                  <SelectItem value="Europe/Berlin">Europe/Berlin</SelectItem>
                  <SelectItem value="Europe/Moscow">Europe/Moscow</SelectItem>
                  <SelectItem value="America/New_York">America/New_York</SelectItem>
                  <SelectItem value="America/Los_Angeles">America/Los_Angeles</SelectItem>
                  <SelectItem value="Asia/Tokyo">Asia/Tokyo</SelectItem>
                  <SelectItem value="Asia/Shanghai">Asia/Shanghai</SelectItem>
                  <SelectItem value="Asia/Dubai">Asia/Dubai</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="edit-activeStart">Aktif Başlangıç</Label>
              <Input
                id="edit-activeStart"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursStart}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, activeHoursStart: parseInt(e.target.value) || 0 }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-activeEnd">Aktif Bitiş</Label>
              <Input
                id="edit-activeEnd"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursEnd}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, activeHoursEnd: parseInt(e.target.value) || 0 }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-maxPosts">Maks. Gönderi</Label>
              <Input
                id="edit-maxPosts"
                type="number"
                min={1}
                max={100}
                value={formData.maxPostsPerDay}
                onChange={(e) =>
                  setFormData((f) => ({ ...f, maxPostsPerDay: parseInt(e.target.value) || 1 }))
                }
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                "Kaydet"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Add Social Account Dialog
// ---------------------------------------------------------------------------

function AddSocialAccountDialog({
  open,
  onOpenChange,
  personaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
  onCreated: () => void;
}) {
  const [platform, setPlatform] = useState("twitter");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiSecretKey, setApiSecretKey] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [accessTokenSecret, setAccessTokenSecret] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setPlatform("twitter");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setApiEndpoint("");
    setApiKey("");
    setApiSecretKey("");
    setAccessToken("");
    setAccessTokenSecret("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/social-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          platform,
          platformUsername: username.trim() || undefined,
          platformEmail: email.trim() || undefined,
          platformPhone: phone.trim() || undefined,
          platformPassword: password || undefined,
          apiEndpoint: apiEndpoint.trim() || undefined,
          apiKey: apiKey.trim() || undefined,
          apiSecretKey: apiSecretKey.trim() || undefined,
          accessToken: accessToken.trim() || undefined,
          accessTokenSecret: accessTokenSecret.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Sosyal Medya Hesabı Ekle</DialogTitle>
          <DialogDescription>Platform hesap bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Platform</Label>
              <Select value={platform} onValueChange={setPlatform} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(platformNames).map(([key, name]) => (
                    <SelectItem key={key} value={key}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kullanıcı Adı</Label>
              <Input className="h-9 text-sm" placeholder="@kullanıcıadı" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Şifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Hesap şifresi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-posta</Label>
              <Input className="h-9 text-sm" type="email" placeholder="hesap@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefon</Label>
              <Input className="h-9 text-sm" placeholder="+90 5xx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Bilgileri (opsiyonel)</p>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">API Endpoint</Label>
            <Input className="h-9 text-sm" placeholder="https://api.example.com" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Key</Label>
              <Input className="h-9 text-sm" placeholder="API Key" value={apiKey} onChange={(e) => setApiKey(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Secret Key</Label>
              <Input className="h-9 text-sm" placeholder="API Secret Key" value={apiSecretKey} onChange={(e) => setApiSecretKey(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token</Label>
              <Input className="h-9 text-sm" placeholder="Access Token" value={accessToken} onChange={(e) => setAccessToken(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token Secret</Label>
              <Input className="h-9 text-sm" placeholder="Access Token Secret" value={accessTokenSecret} onChange={(e) => setAccessTokenSecret(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Tags management sub-component
// ---------------------------------------------------------------------------

function TagsManager({
  personaId,
  personaTags,
  onUpdated,
}: {
  personaId: string;
  personaTags: Tag[];
  onUpdated: () => void;
}) {
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTagIds, setSelectedTagIds] = useState<Set<string>>(
    new Set(personaTags.map((t) => t.id))
  );

  useEffect(() => {
    setSelectedTagIds(new Set(personaTags.map((t) => t.id)));
  }, [personaTags]);

  useEffect(() => {
    fetch("/api/tags")
      .then((res) => res.json())
      .then((data) => setAllTags(data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  function toggleTag(tagId: string) {
    setSelectedTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(tagId)) next.delete(tagId);
      else next.add(tagId);
      return next;
    });
  }

  async function saveTags() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/tags`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tagIds: Array.from(selectedTagIds) }),
      });
      if (!res.ok) throw new Error();
      onUpdated();
    } catch {
      console.error("Etiketler kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedTagIds.size !== personaTags.length ||
    personaTags.some((t) => !selectedTagIds.has(t.id));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allTags.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-sm text-muted-foreground">
          Henüz etiket oluşturulmamış.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istediğiniz etiketleri seçin.
      </p>
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => {
          const isSelected = selectedTagIds.has(tag.id);
          return (
            <Badge
              key={tag.id}
              variant={isSelected ? "default" : "outline"}
              className="cursor-pointer select-none transition-colors"
              style={
                isSelected
                  ? { backgroundColor: tag.color ?? undefined }
                  : { borderColor: tag.color ?? undefined, color: tag.color ?? undefined }
              }
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
              {isSelected && <X className="ml-1 h-3 w-3" />}
            </Badge>
          );
        })}
      </div>
      {hasChanges && (
        <Button onClick={saveTags} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Posts Tab Content
// ---------------------------------------------------------------------------

function PostsTab({ personaId }: { personaId: string }) {
  const [posts, setPosts] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/personas/${personaId}/content`)
      .then((res) => res.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setIsLoading(false));
  }, [personaId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <FileText className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Henüz gönderi yok</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Bu personaya henüz içerik oluşturulmamış.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {posts.map((post) => (
        <div
          key={post.id}
          className="rounded-lg border p-4 space-y-2"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-bold">
                {platformIcon(post.platform)}
              </div>
              <span className="text-xs font-medium capitalize text-muted-foreground">
                {post.platform}
              </span>
              {post.aiGenerated && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  AI
                </Badge>
              )}
            </div>
            <Badge
              variant={statusColors[post.status] as any || "secondary"}
            >
              {statusLabels[post.status] || post.status}
            </Badge>
          </div>
          <p className="text-sm whitespace-pre-wrap line-clamp-4">{post.content}</p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{formatShortDate(post.createdAt)}</span>
            {post.scheduledAt && (
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatShortDate(post.scheduledAt)}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Social Account Card with credentials
// ---------------------------------------------------------------------------

function SocialAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: SocialAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    platformUsername: account.platformUsername || "",
    platformEmail: account.platformEmail || "",
    platformPhone: account.platformPhone || "",
    platformPassword: account.platformPassword || "",
    apiEndpoint: account.apiEndpoint || "",
    apiKey: account.apiKey || "",
    apiSecretKey: account.apiSecretKey || "",
    accessToken: account.accessToken || "",
    accessTokenSecret: account.accessTokenSecret || "",
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/social-accounts/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/social-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platformUsername: editData.platformUsername || undefined,
          platformEmail: editData.platformEmail || undefined,
          platformPhone: editData.platformPhone || undefined,
          platformPassword: editData.platformPassword || undefined,
          apiEndpoint: editData.apiEndpoint || undefined,
          apiKey: editData.apiKey || undefined,
          apiSecretKey: editData.apiSecretKey || undefined,
          accessToken: editData.accessToken || undefined,
          accessTokenSecret: editData.accessTokenSecret || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setIsEditing(false);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
              {platformIcon(account.platform)}
            </div>
            <p className="text-sm font-medium">
              {platformNames[account.platform] || account.platform} — Düzenle
            </p>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kullanıcı Adı</Label>
              <Input className="h-8 text-sm" value={editData.platformUsername} onChange={(e) => setEditData((d) => ({ ...d, platformUsername: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Şifre</Label>
              <Input className="h-8 text-sm" value={editData.platformPassword} onChange={(e) => setEditData((d) => ({ ...d, platformPassword: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.platformEmail} onChange={(e) => setEditData((d) => ({ ...d, platformEmail: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.platformPhone} onChange={(e) => setEditData((d) => ({ ...d, platformPhone: e.target.value }))} />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>

          <div className="space-y-1">
            <Label className="text-xs">API Endpoint</Label>
            <Input className="h-8 text-sm" value={editData.apiEndpoint} onChange={(e) => setEditData((d) => ({ ...d, apiEndpoint: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">API Key</Label>
              <Input className="h-8 text-sm" value={editData.apiKey} onChange={(e) => setEditData((d) => ({ ...d, apiKey: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">API Secret Key</Label>
              <Input className="h-8 text-sm" value={editData.apiSecretKey} onChange={(e) => setEditData((d) => ({ ...d, apiSecretKey: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Access Token</Label>
              <Input className="h-8 text-sm" value={editData.accessToken} onChange={(e) => setEditData((d) => ({ ...d, accessToken: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Access Token Secret</Label>
              <Input className="h-8 text-sm" value={editData.accessTokenSecret} onChange={(e) => setEditData((d) => ({ ...d, accessTokenSecret: e.target.value }))} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>İptal</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
            Kaydet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            {platformIcon(account.platform)}
          </div>
          <div>
            <p className="text-sm font-medium">
              {platformNames[account.platform] || account.platform}
            </p>
            {account.platformUsername && (
              <p className="text-xs text-muted-foreground">
                @{account.platformUsername}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesabı silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu sosyal medya hesap bilgileri kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid gap-2 text-sm">
        {account.platformEmail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{account.platformEmail}</span>
          </div>
        )}
        {account.platformPhone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.platformPhone}</span>
          </div>
        )}
        {account.platformPassword && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Şifre: </span>
            <span className="font-mono text-xs">
              {showPassword ? account.platformPassword : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* API Credentials */}
      {(account.apiKey || account.accessToken) && (
        <div className="grid gap-1.5 text-sm border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>
          {account.apiEndpoint && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs truncate">{account.apiEndpoint}</span>
            </div>
          )}
          {account.apiKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Key: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiKey : "••••••••"}</span>
            </div>
          )}
          {account.apiSecretKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiSecretKey : "••••••••"}</span>
            </div>
          )}
          {account.accessToken && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Access Token: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessToken : "••••••••"}</span>
            </div>
          )}
          {account.accessTokenSecret && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Token Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessTokenSecret : "••••••••"}</span>
            </div>
          )}
        </div>
      )}

      {account.lastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Son kullanım: {formatShortDate(account.lastUsedAt)}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add Forum Account Dialog
// ---------------------------------------------------------------------------

function AddForumAccountDialog({
  open,
  onOpenChange,
  personaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
  onCreated: () => void;
}) {
  const [portalName, setPortalName] = useState("");
  const [portalUrl, setPortalUrl] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [forumApiEndpoint, setForumApiEndpoint] = useState("");
  const [forumApiKey, setForumApiKey] = useState("");
  const [forumApiSecretKey, setForumApiSecretKey] = useState("");
  const [forumAccessToken, setForumAccessToken] = useState("");
  const [forumAccessTokenSecret, setForumAccessTokenSecret] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setPortalName("");
    setPortalUrl("");
    setUsername("");
    setEmail("");
    setPhone("");
    setPassword("");
    setForumApiEndpoint("");
    setForumApiKey("");
    setForumApiSecretKey("");
    setForumAccessToken("");
    setForumAccessTokenSecret("");
    setNotes("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!portalName.trim()) {
      setError("Portal adı zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/forum-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          portalName: portalName.trim(),
          portalUrl: portalUrl.trim() || undefined,
          username: username.trim() || undefined,
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          password: password || undefined,
          apiEndpoint: forumApiEndpoint.trim() || undefined,
          apiKey: forumApiKey.trim() || undefined,
          apiSecretKey: forumApiSecretKey.trim() || undefined,
          accessToken: forumAccessToken.trim() || undefined,
          accessTokenSecret: forumAccessTokenSecret.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Forum / Portal Hesabı Ekle</DialogTitle>
          <DialogDescription>Forum veya portal üyelik bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Portal Adı *</Label>
              <Input className="h-9 text-sm" placeholder="Technopat, r10.net" value={portalName} onChange={(e) => setPortalName(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Portal URL</Label>
              <Input className="h-9 text-sm" placeholder="https://forum.example.com" value={portalUrl} onChange={(e) => setPortalUrl(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kullanıcı Adı</Label>
              <Input className="h-9 text-sm" placeholder="kullanıcıadı" value={username} onChange={(e) => setUsername(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Şifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Hesap şifresi" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-posta</Label>
              <Input className="h-9 text-sm" type="email" placeholder="hesap@email.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefon</Label>
              <Input className="h-9 text-sm" placeholder="+90 5xx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">API Bilgileri (opsiyonel)</p>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">API Endpoint</Label>
            <Input className="h-9 text-sm" placeholder="https://api.example.com" value={forumApiEndpoint} onChange={(e) => setForumApiEndpoint(e.target.value)} disabled={isSubmitting} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Key</Label>
              <Input className="h-9 text-sm" placeholder="API Key" value={forumApiKey} onChange={(e) => setForumApiKey(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">API Secret Key</Label>
              <Input className="h-9 text-sm" placeholder="API Secret Key" value={forumApiSecretKey} onChange={(e) => setForumApiSecretKey(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token</Label>
              <Input className="h-9 text-sm" placeholder="Access Token" value={forumAccessToken} onChange={(e) => setForumAccessToken(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Access Token Secret</Label>
              <Input className="h-9 text-sm" placeholder="Access Token Secret" value={forumAccessTokenSecret} onChange={(e) => setForumAccessTokenSecret(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notlar</Label>
            <Textarea className="text-sm min-h-[60px]" placeholder="Ek notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSubmitting} />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Add Email Account Dialog
// ---------------------------------------------------------------------------

function AddEmailAccountDialog({
  open,
  onOpenChange,
  personaId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  personaId: string;
  onCreated: () => void;
}) {
  const [provider, setProvider] = useState("hotmail");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function resetForm() {
    setProvider("hotmail");
    setEmail("");
    setPassword("");
    setPhone("");
    setRecoveryEmail("");
    setNotes("");
    setShowPassword(false);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("E-posta adresi zorunludur.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/email-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          provider,
          email: email.trim(),
          password: password || undefined,
          phone: phone.trim() || undefined,
          recoveryEmail: recoveryEmail.trim() || undefined,
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) throw new Error("Hesap eklenemedi.");

      resetForm();
      onOpenChange(false);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>E-posta Hesabı Ekle</DialogTitle>
          <DialogDescription>E-posta hesap bilgilerini girin.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto pr-1 flex-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Sağlayıcı</Label>
              <Select value={provider} onValueChange={setProvider} disabled={isSubmitting}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotmail">Hotmail / Outlook</SelectItem>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="yandex">Yandex</SelectItem>
                  <SelectItem value="protonmail">ProtonMail</SelectItem>
                  <SelectItem value="icloud">iCloud</SelectItem>
                  <SelectItem value="other">Diğer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">E-posta Adresi *</Label>
              <Input className="h-9 text-sm" type="email" placeholder="hesap@hotmail.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Şifre</Label>
              <div className="relative">
                <Input className="h-9 text-sm pr-8" type={showPassword ? "text" : "password"} placeholder="Şifre" value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Telefon</Label>
              <Input className="h-9 text-sm" placeholder="+90 5xx" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSubmitting} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium">Kurtarma E-postası</Label>
              <Input className="h-9 text-sm" type="email" placeholder="recovery@email.com" value={recoveryEmail} onChange={(e) => setRecoveryEmail(e.target.value)} disabled={isSubmitting} />
            </div>
          </div>

          <Separator />

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Notlar</Label>
            <Textarea className="text-sm min-h-[60px]" placeholder="Ek notlar..." value={notes} onChange={(e) => setNotes(e.target.value)} disabled={isSubmitting} />
          </div>

          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              İptal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Ekle
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Email Account Card
// ---------------------------------------------------------------------------

const emailProviderNames: Record<string, string> = {
  hotmail: "Hotmail / Outlook",
  gmail: "Gmail",
  yandex: "Yandex",
  protonmail: "ProtonMail",
  icloud: "iCloud",
  other: "Diğer",
};

function EmailAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: EmailAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    provider: account.provider || "hotmail",
    email: account.email || "",
    password: account.password || "",
    phone: account.phone || "",
    recoveryEmail: account.recoveryEmail || "",
    notes: account.notes || "",
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          provider: editData.provider,
          email: editData.email.trim(),
          password: editData.password || undefined,
          phone: editData.phone.trim() || undefined,
          recoveryEmail: editData.recoveryEmail.trim() || undefined,
          notes: editData.notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setIsEditing(false);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">E-posta Hesabı — Düzenle</p>
        <div className="grid gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Sağlayıcı</Label>
            <Select value={editData.provider} onValueChange={(v) => setEditData((d) => ({ ...d, provider: v }))}>
              <SelectTrigger className="h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hotmail">Hotmail / Outlook</SelectItem>
                <SelectItem value="gmail">Gmail</SelectItem>
                <SelectItem value="yandex">Yandex</SelectItem>
                <SelectItem value="protonmail">ProtonMail</SelectItem>
                <SelectItem value="icloud">iCloud</SelectItem>
                <SelectItem value="other">Diğer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Şifre</Label>
              <Input className="h-8 text-sm" value={editData.password} onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.phone} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Kurtarma E-postası</Label>
              <Input className="h-8 text-sm" value={editData.recoveryEmail} onChange={(e) => setEditData((d) => ({ ...d, recoveryEmail: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notlar</Label>
            <Input className="h-8 text-sm" value={editData.notes} onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>İptal</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
            Kaydet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{emailProviderNames[account.provider] || account.provider}</p>
            <p className="text-xs text-muted-foreground">{account.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesabı silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu e-posta hesap bilgileri kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid gap-2 text-sm">
        {account.password && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Şifre: </span>
            <span className="font-mono text-xs">
              {showPassword ? account.password : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
        {account.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.phone}</span>
          </div>
        )}
        {account.recoveryEmail && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span className="text-xs">Kurtarma: {account.recoveryEmail}</span>
          </div>
        )}
        {account.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-xs">{account.notes}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Forum Account Card with credentials
// ---------------------------------------------------------------------------

function ForumAccountCard({
  account,
  onDelete,
  onUpdated,
}: {
  account: ForumAccount;
  onDelete: () => void;
  onUpdated: () => void;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState({
    portalName: account.portalName || "",
    portalUrl: account.portalUrl || "",
    username: account.username || "",
    email: account.email || "",
    phone: account.phone || "",
    password: account.password || "",
    apiEndpoint: account.apiEndpoint || "",
    apiKey: account.apiKey || "",
    apiSecretKey: account.apiSecretKey || "",
    accessToken: account.accessToken || "",
    accessTokenSecret: account.accessTokenSecret || "",
    notes: account.notes || "",
  });

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/forum-accounts/${account.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      onDelete();
    } catch {
      setIsDeleting(false);
    }
  }

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/forum-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          portalName: editData.portalName.trim(),
          portalUrl: editData.portalUrl.trim() || undefined,
          username: editData.username.trim() || undefined,
          email: editData.email.trim() || undefined,
          phone: editData.phone.trim() || undefined,
          password: editData.password || undefined,
          apiEndpoint: editData.apiEndpoint.trim() || undefined,
          apiKey: editData.apiKey.trim() || undefined,
          apiSecretKey: editData.apiSecretKey.trim() || undefined,
          accessToken: editData.accessToken.trim() || undefined,
          accessTokenSecret: editData.accessTokenSecret.trim() || undefined,
          notes: editData.notes.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error();
      setIsEditing(false);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  if (isEditing) {
    return (
      <div className="rounded-lg border p-4 space-y-3">
        <p className="text-sm font-medium">Forum / Portal — Düzenle</p>
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Portal Adı</Label>
              <Input className="h-8 text-sm" value={editData.portalName} onChange={(e) => setEditData((d) => ({ ...d, portalName: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Portal URL</Label>
              <Input className="h-8 text-sm" value={editData.portalUrl} onChange={(e) => setEditData((d) => ({ ...d, portalUrl: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Kullanıcı Adı</Label>
              <Input className="h-8 text-sm" value={editData.username} onChange={(e) => setEditData((d) => ({ ...d, username: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Şifre</Label>
              <Input className="h-8 text-sm" value={editData.password} onChange={(e) => setEditData((d) => ({ ...d, password: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">E-posta</Label>
              <Input className="h-8 text-sm" value={editData.email} onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Telefon</Label>
              <Input className="h-8 text-sm" value={editData.phone} onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))} />
            </div>
          </div>
          <Separator />
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>
          <div className="space-y-1">
            <Label className="text-xs">API Endpoint</Label>
            <Input className="h-8 text-sm" value={editData.apiEndpoint} onChange={(e) => setEditData((d) => ({ ...d, apiEndpoint: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">API Key</Label>
              <Input className="h-8 text-sm" value={editData.apiKey} onChange={(e) => setEditData((d) => ({ ...d, apiKey: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">API Secret Key</Label>
              <Input className="h-8 text-sm" value={editData.apiSecretKey} onChange={(e) => setEditData((d) => ({ ...d, apiSecretKey: e.target.value }))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Access Token</Label>
              <Input className="h-8 text-sm" value={editData.accessToken} onChange={(e) => setEditData((d) => ({ ...d, accessToken: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Access Token Secret</Label>
              <Input className="h-8 text-sm" value={editData.accessTokenSecret} onChange={(e) => setEditData((d) => ({ ...d, accessTokenSecret: e.target.value }))} />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Notlar</Label>
            <Input className="h-8 text-sm" value={editData.notes} onChange={(e) => setEditData((d) => ({ ...d, notes: e.target.value }))} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>İptal</Button>
          <Button size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
            Kaydet
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">{account.portalName}</p>
            {account.username && (
              <p className="text-xs text-muted-foreground">@{account.username}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {account.portalUrl && (
            <a
              href={account.portalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          )}
          <Badge variant={account.isActive ? "default" : "secondary"}>
            {account.isActive ? "Aktif" : "Pasif"}
          </Badge>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditing(true)}>
            <Edit className="h-3.5 w-3.5 text-muted-foreground" />
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={isDeleting}>
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Hesabı silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu forum/portal hesap bilgileri kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Credentials */}
      <div className="grid gap-2 text-sm">
        {account.email && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="h-3.5 w-3.5 shrink-0" />
            <span>{account.email}</span>
          </div>
        )}
        {account.phone && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="h-3.5 w-3.5 shrink-0" />
            <span>{account.phone}</span>
          </div>
        )}
        {account.password && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Key className="h-3.5 w-3.5 shrink-0" />
            <span className="font-mono text-xs">
              {showPassword ? account.password : "••••••••"}
            </span>
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </button>
          </div>
        )}
        {account.notes && (
          <div className="flex items-start gap-2 text-muted-foreground">
            <StickyNote className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            <span className="text-xs">{account.notes}</span>
          </div>
        )}
      </div>

      {/* API Credentials */}
      {(account.apiKey || account.accessToken) && (
        <div className="grid gap-1.5 text-sm border-t pt-2">
          <p className="text-xs font-medium text-muted-foreground">API Bilgileri</p>
          {account.apiEndpoint && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="font-mono text-xs truncate">{account.apiEndpoint}</span>
            </div>
          )}
          {account.apiKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Key: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiKey : "••••••••"}</span>
            </div>
          )}
          {account.apiSecretKey && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Key className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">API Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.apiSecretKey : "••••••••"}</span>
            </div>
          )}
          {account.accessToken && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Access Token: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessToken : "••••••••"}</span>
            </div>
          )}
          {account.accessTokenSecret && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-3.5 w-3.5 shrink-0" />
              <span className="text-xs">Token Secret: </span>
              <span className="font-mono text-xs">{showPassword ? account.accessTokenSecret : "••••••••"}</span>
            </div>
          )}
        </div>
      )}

      {account.lastUsedAt && (
        <p className="text-xs text-muted-foreground">
          Son kullanım: {formatShortDate(account.lastUsedAt)}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Media Tab
// ---------------------------------------------------------------------------

interface MediaItem {
  id: string;
  type: string;
  filename: string;
  r2Key: string;
  url: string;
  contentType: string | null;
  size: number | null;
  createdAt: string | null;
}

function formatFileSize(bytes: number | null): string {
  if (!bytes) return "-";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / 1024 / 1024).toFixed(1) + " MB";
}

function MediaTab({ personaId }: { personaId: string }) {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "video" | "document">("all");

  const fetchMedia = useCallback(async () => {
    try {
      const res = await fetch(`/api/media?personaId=${personaId}`);
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch {
      setMedia([]);
    } finally {
      setIsLoading(false);
    }
  }, [personaId]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadError("");
    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const formData = new FormData();
        formData.append("file", files[i]);
        formData.append("personaId", personaId);

        const res = await fetch("/api/media", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || "Yükleme başarısız.");
        }
      }
      fetchMedia();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Yükleme başarısız.");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/media/${id}`, { method: "DELETE" });
      if (res.ok) {
        setMedia((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // silently fail
    }
  }

  const filtered = filter === "all" ? media : media.filter((m) => m.type === filter);

  const counts = {
    all: media.length,
    image: media.filter((m) => m.type === "image").length,
    video: media.filter((m) => m.type === "video").length,
    document: media.filter((m) => m.type === "document").length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload & Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1">
          {(["all", "image", "video", "document"] as const).map((t) => (
            <Button
              key={t}
              variant={filter === t ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(t)}
              className="text-xs"
            >
              {t === "all" && "Tümü"}
              {t === "image" && "Görseller"}
              {t === "video" && "Videolar"}
              {t === "document" && "Belgeler"}
              {counts[t] > 0 && (
                <Badge variant="secondary" className="ml-1.5 text-xs px-1.5 py-0">
                  {counts[t]}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        <div>
          <input
            type="file"
            id="media-upload"
            className="hidden"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleUpload}
            disabled={isUploading}
          />
          <Button
            size="sm"
            onClick={() => document.getElementById("media-upload")?.click()}
            disabled={isUploading}
          >
            {isUploading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 h-3.5 w-3.5" />
            )}
            Yükle
          </Button>
        </div>
      </div>

      {uploadError && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {uploadError}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Image className="h-8 w-8 text-muted-foreground" />
          <h3 className="mt-4 text-sm font-semibold">
            {media.length === 0 ? "Henüz medya yok" : "Bu filtrede medya yok"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Görsel, video veya belge yükleyin.
          </p>
          {media.length === 0 && (
            <Button
              size="sm"
              className="mt-4"
              onClick={() => document.getElementById("media-upload")?.click()}
            >
              <Upload className="mr-1.5 h-3.5 w-3.5" />
              Dosya Yükle
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-lg border overflow-hidden"
            >
              {/* Preview */}
              {item.type === "image" ? (
                <div className="aspect-video bg-muted">
                  <img
                    src={item.url}
                    alt={item.filename}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
              ) : (
                <div className="aspect-video bg-muted flex items-center justify-center">
                  {item.type === "video" ? (
                    <Film className="h-10 w-10 text-muted-foreground" />
                  ) : (
                    <FileIcon className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Info */}
              <div className="p-3 space-y-1">
                <p className="text-xs font-medium truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{formatFileSize(item.size)}</span>
                  <span>{formatShortDate(item.createdAt)}</span>
                </div>
              </div>

              {/* Hover actions */}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background"
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="flex h-7 w-7 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm border shadow-sm hover:bg-background">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Dosyayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{item.filename}&rdquo; kalıcı olarak silinecektir.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>İptal</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(item.id)}>
                        Sil
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Roles Manager (for persona detail)
// ---------------------------------------------------------------------------

interface RoleItem {
  roleId: string;
  roleName: string;
  roleColor: string | null;
  roleDescription: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface AvailableRole {
  id: string;
  name: string;
  color: string | null;
  categoryId: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

function RolesManager({
  personaId,
  onUpdated,
}: {
  personaId: string;
  onUpdated: () => void;
}) {
  const [assignedRoles, setAssignedRoles] = useState<RoleItem[]>([]);
  const [allRoles, setAllRoles] = useState<AvailableRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedRoleIds, setSelectedRoleIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    Promise.all([
      fetch(`/api/personas/${personaId}/roles`).then((r) => r.json()),
      fetch("/api/roles").then((r) => r.json()),
    ])
      .then(([assigned, all]) => {
        const assignedArr = Array.isArray(assigned) ? assigned : [];
        setAssignedRoles(assignedArr);
        setSelectedRoleIds(new Set(assignedArr.map((r: RoleItem) => r.roleId)));
        setAllRoles(Array.isArray(all) ? all : []);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [personaId]);

  function toggleRole(roleId: string) {
    setSelectedRoleIds((prev) => {
      const next = new Set(prev);
      if (next.has(roleId)) next.delete(roleId);
      else next.add(roleId);
      return next;
    });
  }

  async function saveRoles() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${personaId}/roles`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: Array.from(selectedRoleIds) }),
      });
      if (!res.ok) throw new Error();
      // Refresh assigned roles
      const updated = await fetch(`/api/personas/${personaId}/roles`).then((r) =>
        r.json()
      );
      setAssignedRoles(Array.isArray(updated) ? updated : []);
      onUpdated();
    } catch {
      console.error("Roller kaydedilemedi.");
    } finally {
      setIsSaving(false);
    }
  }

  const hasChanges =
    selectedRoleIds.size !== assignedRoles.length ||
    assignedRoles.some((r) => !selectedRoleIds.has(r.roleId));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (allRoles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Shield className="h-8 w-8 text-muted-foreground" />
        <h3 className="mt-4 text-sm font-semibold">Henüz rol tanımlanmamış</h3>
        <p className="mt-1 text-xs text-muted-foreground">
          Öncelikle &ldquo;Roller&rdquo; sayfasından rol ve kategori oluşturun.
        </p>
      </div>
    );
  }

  // Group roles by category for display
  const grouped = new Map<string, { categoryName: string; categoryColor: string | null; roles: AvailableRole[] }>();
  const uncategorized: AvailableRole[] = [];

  for (const role of allRoles) {
    if (role.categoryId && role.categoryName) {
      const existing = grouped.get(role.categoryId);
      if (existing) {
        existing.roles.push(role);
      } else {
        grouped.set(role.categoryId, {
          categoryName: role.categoryName,
          categoryColor: role.categoryColor,
          roles: [role],
        });
      }
    } else {
      uncategorized.push(role);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bu personaya atamak istediğiniz rolleri seçin. AI içerik üretiminde bu roller dikkate alınacaktır.
      </p>

      {Array.from(grouped.entries()).map(([catId, group]) => (
        <div key={catId} className="space-y-2">
          <div className="flex items-center gap-2">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: group.categoryColor || "#6B7280" }}
            />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {group.categoryName}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {group.roles.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      ))}

      {uncategorized.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Diğer
          </span>
          <div className="flex flex-wrap gap-2">
            {uncategorized.map((role) => {
              const isSelected = selectedRoleIds.has(role.id);
              return (
                <Badge
                  key={role.id}
                  variant={isSelected ? "default" : "outline"}
                  className="cursor-pointer select-none transition-colors"
                  style={
                    isSelected
                      ? { backgroundColor: role.color ?? undefined }
                      : { borderColor: role.color ?? undefined, color: role.color ?? undefined }
                  }
                  onClick={() => toggleRole(role.id)}
                >
                  {role.name}
                  {isSelected && <X className="ml-1 h-3 w-3" />}
                </Badge>
              );
            })}
          </div>
        </div>
      )}

      {hasChanges && (
        <Button onClick={saveRoles} disabled={isSaving} size="sm">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            "Değişiklikleri Kaydet"
          )}
        </Button>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Settings Tab (editable)
// ---------------------------------------------------------------------------

function SettingsTab({ persona, onUpdated }: { persona: Persona; onUpdated: () => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [data, setData] = useState({
    language: persona.language || "tr",
    gender: persona.gender || "",
    birthDate: persona.birthDate || "",
    country: persona.country || "",
    city: persona.city || "",
    timezone: persona.timezone || "Europe/Istanbul",
    activeHoursStart: persona.activeHoursStart ?? 9,
    activeHoursEnd: persona.activeHoursEnd ?? 23,
    maxPostsPerDay: persona.maxPostsPerDay ?? 5,
    isActive: persona.isActive ?? true,
    isVerified: persona.isVerified ?? false,
  });

  useEffect(() => {
    setData({
      language: persona.language || "tr",
      gender: persona.gender || "",
      birthDate: persona.birthDate || "",
      country: persona.country || "",
      city: persona.city || "",
      timezone: persona.timezone || "Europe/Istanbul",
      activeHoursStart: persona.activeHoursStart ?? 9,
      activeHoursEnd: persona.activeHoursEnd ?? 23,
      maxPostsPerDay: persona.maxPostsPerDay ?? 5,
      isActive: persona.isActive ?? true,
      isVerified: persona.isVerified ?? false,
    });
  }, [persona]);

  async function handleSave() {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/personas/${persona.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setIsEditing(false);
      onUpdated();
    } catch {
      // ignore
    } finally {
      setIsSaving(false);
    }
  }

  const cityList = data.country ? getCitiesByCountry(data.country) : [];

  if (isEditing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Settings2 className="h-4 w-4" />
            Ayarlar — Düzenle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label className="text-xs">Dil</Label>
              <Select value={data.language} onValueChange={(v) => setData((d) => ({ ...d, language: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>{name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Cinsiyet</Label>
              <Select value={data.gender} onValueChange={(v) => setData((d) => ({ ...d, gender: v }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="erkek">Erkek</SelectItem>
                  <SelectItem value="kadın">Kadın</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Doğum Tarihi</Label>
              <Input className="h-8 text-sm" type="date" value={data.birthDate} onChange={(e) => setData((d) => ({ ...d, birthDate: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ülke</Label>
              <Select value={data.country} onValueChange={(v) => setData((d) => ({ ...d, country: v, city: "" }))}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seçin" /></SelectTrigger>
                <SelectContent>
                  {countries.map((c) => (
                    <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Şehir</Label>
              {cityList.length > 0 ? (
                <Select value={data.city} onValueChange={(v) => setData((d) => ({ ...d, city: v }))}>
                  <SelectTrigger className="h-8 text-sm"><SelectValue placeholder="Seçin" /></SelectTrigger>
                  <SelectContent>
                    {cityList.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input className="h-8 text-sm" value={data.city} onChange={(e) => setData((d) => ({ ...d, city: e.target.value }))} placeholder="Şehir" />
              )}
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Saat Dilimi</Label>
              <Input className="h-8 text-sm" value={data.timezone} onChange={(e) => setData((d) => ({ ...d, timezone: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aktif Saat Başlangıç</Label>
              <Input className="h-8 text-sm" type="number" min={0} max={23} value={data.activeHoursStart} onChange={(e) => setData((d) => ({ ...d, activeHoursStart: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Aktif Saat Bitiş</Label>
              <Input className="h-8 text-sm" type="number" min={0} max={23} value={data.activeHoursEnd} onChange={(e) => setData((d) => ({ ...d, activeHoursEnd: parseInt(e.target.value) || 0 }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Günlük Maks. Gönderi</Label>
              <Input className="h-8 text-sm" type="number" min={1} max={50} value={data.maxPostsPerDay} onChange={(e) => setData((d) => ({ ...d, maxPostsPerDay: parseInt(e.target.value) || 1 }))} />
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={data.isActive} onCheckedChange={(v) => setData((d) => ({ ...d, isActive: v }))} />
              <Label className="text-xs">{data.isActive ? "Aktif" : "Pasif"}</Label>
            </div>
            <div className="flex items-center gap-3 pt-4">
              <Switch checked={data.isVerified} onCheckedChange={(v) => setData((d) => ({ ...d, isVerified: v }))} />
              <Label className="text-xs">{data.isVerified ? "Onaylı ✓" : "Onaysız"}</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)} disabled={isSaving}>İptal</Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
              Kaydet
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Settings2 className="h-4 w-4" />
          Ayarlar
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
          <Edit className="mr-1.5 h-3.5 w-3.5" />
          Düzenle
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Dil</p>
            <p className="text-sm">{languageNames[persona.language || "tr"] || persona.language}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Cinsiyet</p>
            <p className="text-sm">{persona.gender === "erkek" ? "Erkek" : persona.gender === "kadın" ? "Kadın" : "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Doğum Tarihi</p>
            <p className="text-sm">{persona.birthDate || "-"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Konum</p>
            <p className="text-sm">
              {[persona.city, persona.country].filter(Boolean).join(", ") || "-"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Saat Dilimi</p>
            <p className="text-sm">{persona.timezone || "Europe/Istanbul"}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Aktif Saatler</p>
            <p className="text-sm">
              {persona.activeHoursStart ?? 9}:00 - {persona.activeHoursEnd ?? 23}:00
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Günlük Maks. Gönderi</p>
            <p className="text-sm">{persona.maxPostsPerDay ?? 5}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Durum</p>
            <div className="flex items-center gap-2">
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
              {persona.isVerified && (
                <Badge variant="outline" className="text-blue-500 border-blue-500">
                  ✓ Onaylı
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Son Güncelleme</p>
            <p className="text-sm">{formatDate(persona.updatedAt)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Oluşturulma</p>
            <p className="text-sm">{formatDate(persona.createdAt)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonaDetailPage() {
  const { toast } = useToast();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [addForumOpen, setAddForumOpen] = useState(false);
  const [addEmailOpen, setAddEmailOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // AI Content Generation
  const [aiPlatform, setAiPlatform] = useState("twitter");
  const [aiContentType, setAiContentType] = useState("post");
  const [aiLanguage, setAiLanguage] = useState("");
  const [aiTopic, setAiTopic] = useState("");
  const [aiInstructions, setAiInstructions] = useState("");
  const [aiCount, setAiCount] = useState("1");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResults, setAiResults] = useState<string[]>([]);

  async function handleAiGenerate() {
    if (!persona) return;
    setAiLoading(true);
    setAiResults([]);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: persona.id,
          platform: aiPlatform,
          contentType: aiContentType,
          language: aiLanguage || undefined,
          topic: aiTopic || undefined,
          additionalInstructions: aiInstructions || undefined,
          count: parseInt(aiCount),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResults(data.results || []);
        toast({ title: "İçerik üretildi", description: `${(data.results || []).length} içerik başarıyla oluşturuldu.` });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("AI generation failed:", err);
        toast({ title: "İçerik üretilemedi", description: err.details || err.error || "Bir hata oluştu. Lütfen tekrar deneyin.", variant: "destructive" });
      }
    } catch (error) {
      console.error("AI generation failed:", error);
      toast({ title: "Bağlantı hatası", description: "Sunucuya bağlanılamadı. Lütfen tekrar deneyin.", variant: "destructive" });
    } finally {
      setAiLoading(false);
    }
  }

  const fetchPersona = useCallback(async () => {
    try {
      setError("");
      const res = await fetch(`/api/personas/${id}`);
      if (res.status === 404) {
        setError("Persona bulunamadı.");
        return;
      }
      if (!res.ok) throw new Error("Persona yüklenemedi.");
      const data = await res.json();
      setPersona(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchPersona();
  }, [fetchPersona]);

  async function handleDelete() {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/personas/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Silme başarısız.");
      router.push("/personas");
    } catch {
      setIsDeleting(false);
    }
  }

  if (isLoading) return <ProfileSkeleton />;

  if (error || !persona) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => router.push("/personas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <User className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">
              {error || "Persona bulunamadı"}
            </h3>
            <Button variant="outline" className="mt-6" onClick={() => router.push("/personas")}>
              Personas Listesine Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const traits = Array.isArray(persona.personalityTraits) ? persona.personalityTraits : [];
  const interests = Array.isArray(persona.interests) ? persona.interests : [];
  const patterns =
    persona.behavioralPatterns && typeof persona.behavioralPatterns === "object"
      ? persona.behavioralPatterns
      : {};

  return (
    <div className="space-y-6">
      {/* Top bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Button variant="ghost" onClick={() => router.push("/personas")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Geri
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditDialogOpen(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Düzenle
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={isDeleting}>
                {isDeleting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Sil
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Personayı silmek istediğinize emin misiniz?</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu işlem geri alınamaz. &ldquo;{persona.name}&rdquo; personası ve ilişkili
                  tüm verileri kalıcı olarak silinecektir.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>İptal</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Sil</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Profile header card */}
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Avatar className="h-20 w-20">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xl">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">{persona.name}</h2>
              <Badge variant={persona.isActive ? "default" : "secondary"}>
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <p className="text-muted-foreground">@{persona.name}</p>
            {persona.bio && (
              <p className="mt-1 text-sm text-muted-foreground">{persona.bio}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Globe className="h-3.5 w-3.5" />
                {languageNames[persona.language || "tr"] || persona.language}
              </span>
              {persona.gender && (
                <span className="flex items-center gap-1">
                  <User className="h-3.5 w-3.5" />
                  {persona.gender === "erkek" ? "Erkek" : "Kadın"}
                </span>
              )}
              {persona.birthDate && (
                <span className="flex items-center gap-1">
                  {persona.birthDate}
                </span>
              )}
              {(persona.country || persona.city) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[persona.city, persona.country].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {persona.activeHoursStart ?? 9}:00 - {persona.activeHoursEnd ?? 23}:00
              </span>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="profil">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="sosyal">Sosyal Hesaplar</TabsTrigger>
          <TabsTrigger value="eposta">E-posta</TabsTrigger>
          <TabsTrigger value="forumlar">Forum & Portallar</TabsTrigger>
          <TabsTrigger value="roller">Roller</TabsTrigger>
          <TabsTrigger value="medya">Medya</TabsTrigger>
          <TabsTrigger value="gonderiler">Gönderiler</TabsTrigger>
          <TabsTrigger value="ai-icerik">AI İçerik</TabsTrigger>
          <TabsTrigger value="etiketler">Etiketler</TabsTrigger>
          <TabsTrigger value="ayarlar">Ayarlar</TabsTrigger>
        </TabsList>

        {/* ---- Profil Tab ---- */}
        <TabsContent value="profil" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Kişilik Özellikleri
              </CardTitle>
            </CardHeader>
            <CardContent>
              {traits.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {traits.map((t) => (
                    <Badge key={t} variant="secondary">{t}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz kişilik özelliği eklenmemiş.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-4 w-4" />
                İlgi Alanları
              </CardTitle>
            </CardHeader>
            <CardContent>
              {interests.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {interests.map((i) => (
                    <Badge key={i} variant="outline">{i}</Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Henüz ilgi alanı eklenmemiş.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Pen className="h-4 w-4" />
                Davranışsal Kalıplar
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Yazım Stili</p>
                  <p className="text-sm">{patterns.writing_style || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Ton</p>
                  <p className="text-sm">{patterns.tone || "-"}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Emoji Kullanımı</p>
                  <p className="text-sm">
                    {patterns.emoji_usage
                      ? usageLevelLabels[patterns.emoji_usage] || patterns.emoji_usage
                      : "-"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground">Hashtag Stili</p>
                  <p className="text-sm">
                    {patterns.hashtag_style
                      ? usageLevelLabels[patterns.hashtag_style] || patterns.hashtag_style
                      : "-"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Sosyal Hesaplar Tab ---- */}
        <TabsContent value="sosyal">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Sosyal Hesaplar</CardTitle>
                <CardDescription>
                  Personaya bağlı sosyal medya hesapları ve kimlik bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddSocialOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.socialAccounts && persona.socialAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.socialAccounts.map((account) => (
                    <SocialAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı sosyal hesap yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz sosyal medya hesabı bağlanmamış.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddSocialOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- E-posta Hesapları Tab ---- */}
        <TabsContent value="eposta">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">E-posta Hesapları</CardTitle>
                <CardDescription>
                  Personaya bağlı e-posta hesapları ve giriş bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddEmailOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.emailAccounts && persona.emailAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.emailAccounts.map((account) => (
                    <EmailAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <Mail className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı e-posta hesabı yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz e-posta hesabı eklenmemiş.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddEmailOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Forum & Portallar Tab ---- */}
        <TabsContent value="forumlar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Forum & Portal Üyelikleri</CardTitle>
                <CardDescription>
                  Personanın üye olduğu forum ve portallardaki hesap bilgileri.
                </CardDescription>
              </div>
              <Button size="sm" onClick={() => setAddForumOpen(true)}>
                <Plus className="mr-1.5 h-3.5 w-3.5" />
                Hesap Ekle
              </Button>
            </CardHeader>
            <CardContent>
              {persona.forumAccounts && persona.forumAccounts.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {persona.forumAccounts.map((account) => (
                    <ForumAccountCard
                      key={account.id}
                      account={account}
                      onDelete={fetchPersona}
                      onUpdated={fetchPersona}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-8 w-8 text-muted-foreground" />
                  <h3 className="mt-4 text-sm font-semibold">Bağlı forum/portal hesabı yok</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Bu personaya henüz forum veya portal hesabı eklenmemiş.
                  </p>
                  <Button size="sm" className="mt-4" onClick={() => setAddForumOpen(true)}>
                    <Plus className="mr-1.5 h-3.5 w-3.5" />
                    Hesap Ekle
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Roller Tab ---- */}
        <TabsContent value="roller">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Roller
              </CardTitle>
              <CardDescription>
                Personanın karakter özelliklerini belirleyen roller. AI içerik üretiminde kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RolesManager personaId={persona.id} onUpdated={fetchPersona} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Medya Tab ---- */}
        <TabsContent value="medya">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Image className="h-4 w-4" />
                Medya Kütüphanesi
              </CardTitle>
              <CardDescription>
                Personanın görsel, video ve belge dosyaları. İçerik paylaşımlarında kullanılır.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MediaTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Gönderiler Tab ---- */}
        <TabsContent value="gonderiler">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4" />
                Gönderiler
              </CardTitle>
              <CardDescription>
                Bu personanın tüm içerikleri ve gönderleri.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PostsTab personaId={persona.id} />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- AI İçerik Tab ---- */}
        <TabsContent value="ai-icerik" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4" />
                AI İçerik Üretici
              </CardTitle>
              <CardDescription>
                Persona profiline uygun yapay zeka destekli içerik üretin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={aiPlatform} onValueChange={setAiPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>İçerik Türü</Label>
                  <Select value={aiContentType} onValueChange={setAiContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="post">Gönderi</SelectItem>
                      <SelectItem value="reply">Yanıt</SelectItem>
                      <SelectItem value="comment">Yorum</SelectItem>
                      <SelectItem value="story">Hikaye</SelectItem>
                      <SelectItem value="reel">Reel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Dil</Label>
                  <Select value={aiLanguage} onValueChange={setAiLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Persona Dili" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=" ">Persona Dili</SelectItem>
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="it">Italiano</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                      <SelectItem value="ja">日本語</SelectItem>
                      <SelectItem value="ko">한국어</SelectItem>
                      <SelectItem value="zh">中文</SelectItem>
                      <SelectItem value="nl">Nederlands</SelectItem>
                      <SelectItem value="pl">Polski</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Konu (Opsiyonel)</Label>
                <Input
                  placeholder="İçeriğin konusu veya teması..."
                  value={aiTopic}
                  onChange={(e) => setAiTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ek Talimatlar (Opsiyonel)</Label>
                <Textarea
                  placeholder="İçerik üretimi için ek yönergeler..."
                  value={aiInstructions}
                  onChange={(e) => setAiInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex items-end gap-4">
                <div className="space-y-2">
                  <Label>Adet</Label>
                  <Select value={aiCount} onValueChange={setAiCount}>
                    <SelectTrigger className="w-[80px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button onClick={handleAiGenerate} disabled={aiLoading}>
                  {aiLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  İçerik Üret
                </Button>
              </div>
            </CardContent>
          </Card>

          {aiResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium">
                Üretilen İçerikler ({aiResults.length})
              </h3>
              {aiResults.map((result, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <p className="whitespace-pre-wrap text-sm">{result}</p>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(result);
                        }}
                      >
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Kopyala
                      </Button>
                      <Button variant="outline" size="sm">
                        <Save className="mr-2 h-3.5 w-3.5" />
                        Kaydet
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ---- Etiketler Tab ---- */}
        <TabsContent value="etiketler">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Etiketler</CardTitle>
              <CardDescription>Personaya atanan etiketleri yönetin.</CardDescription>
            </CardHeader>
            <CardContent>
              <TagsManager
                personaId={persona.id}
                personaTags={persona.tags}
                onUpdated={fetchPersona}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---- Ayarlar Tab ---- */}
        <TabsContent value="ayarlar">
          <SettingsTab persona={persona} onUpdated={fetchPersona} />
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {persona && (
        <>
          <EditPersonaDialog
            open={editDialogOpen}
            onOpenChange={setEditDialogOpen}
            persona={persona}
            onUpdated={fetchPersona}
          />
          <AddSocialAccountDialog
            open={addSocialOpen}
            onOpenChange={setAddSocialOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
          <AddForumAccountDialog
            open={addForumOpen}
            onOpenChange={setAddForumOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
          <AddEmailAccountDialog
            open={addEmailOpen}
            onOpenChange={setAddEmailOpen}
            personaId={persona.id}
            onCreated={fetchPersona}
          />
        </>
      )}
    </div>
  );
}
