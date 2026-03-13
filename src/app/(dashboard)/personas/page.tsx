"use client";

import { Suspense, useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Search,
  Loader2,
  Users,
  Globe,
  MapPin,
  LayoutGrid,
  List,
  Upload,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Mail,
  MessageSquare,
  Share2,
  BadgeCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { countries, getCitiesByCountry } from "@/lib/data/countries";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tag {
  id: string;
  name: string;
  color: string | null;
}

interface Role {
  id: string;
  name: string;
  color: string | null;
}

interface Persona {
  id: string;
  name: string;
  bio: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  behavioralPatterns: Record<string, string>;
  gender: string | null;
  birthDate: string | null;
  language: string | null;
  country: string | null;
  city: string | null;
  timezone: string | null;
  activeHoursStart: number | null;
  activeHoursEnd: number | null;
  maxPostsPerDay: number | null;
  isActive: boolean | null;
  isVerified: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
  tags: Tag[];
  roles: Role[];
  socialAccountCount: number;
  forumAccountCount: number;
  emailAccountCount: number;
}

interface CreateFormData {
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

const languageLabels: Record<string, string> = {
  tr: "TR",
  en: "EN",
  de: "DE",
  fr: "FR",
  es: "ES",
  ar: "AR",
  ru: "RU",
  pt: "PT",
  ja: "JA",
  zh: "ZH",
  ko: "KO",
  it: "IT",
  nl: "NL",
  pl: "PL",
  sv: "SV",
  hi: "HI",
  bn: "BN",
  ur: "UR",
  fa: "FA",
  id: "ID",
  ms: "MS",
  th: "TH",
  vi: "VI",
  tl: "TL",
  el: "EL",
  cs: "CS",
  ro: "RO",
  hu: "HU",
  da: "DA",
  no: "NO",
  fi: "FI",
  uk: "UK",
  he: "HE",
  sw: "SW",
  az: "AZ",
  kk: "KK",
  uz: "UZ",
  ka: "KA",
  sr: "SR",
  hr: "HR",
  bg: "BG",
  sq: "SQ",
  ca: "CA",
  sk: "SK",
  lt: "LT",
  lv: "LV",
  et: "ET",
  sl: "SL",
  mk: "MK",
};

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

const defaultFormData: CreateFormData = {
  name: "",
  bio: "",
  gender: "",
  birthDate: "",
  country: "",
  city: "",
  language: "tr",
  timezone: "Europe/Istanbul",
  activeHoursStart: 9,
  activeHoursEnd: 23,
  maxPostsPerDay: 5,
};

// ---------------------------------------------------------------------------
// Compact Persona Row (Table View)
// ---------------------------------------------------------------------------

function PersonaRow({
  persona,
}: {
  persona: Persona;
}) {
  return (
    <TableRow
      className="cursor-pointer hover:bg-muted/50 relative"
    >
      <TableCell>
        <Link href={`/personas/${persona.id}`} className="absolute inset-0 z-10" />
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium flex items-center gap-1">
              {persona.name}
              {persona.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
            </p>
            <p className="truncate text-xs text-muted-foreground">@{persona.name}</p>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-xs">
          {persona.gender === "erkek" ? "Erkek" : persona.gender === "kadın" ? "Kadın" : "-"}
        </span>
      </TableCell>
      <TableCell>
        <span className="text-xs text-muted-foreground">
          {persona.birthDate || "-"}
        </span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-medium">
            {languageLabels[persona.language || "tr"] || persona.language}
          </span>
        </div>
      </TableCell>
      <TableCell>
        {(persona.country || persona.city) ? (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="h-3 w-3 shrink-0" />
            <span className="truncate">
              {[persona.city, persona.country].filter(Boolean).join(", ")}
            </span>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </TableCell>
      <TableCell>
        <Badge
          variant={persona.isActive ? "default" : "secondary"}
          className="text-xs"
        >
          {persona.isActive ? "Aktif" : "Pasif"}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex flex-wrap gap-1">
          {persona.tags.slice(0, 3).map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs px-1.5 py-0"
              style={{
                borderColor: tag.color ?? undefined,
                color: tag.color ?? undefined,
              }}
            >
              {tag.name}
            </Badge>
          ))}
          {persona.tags.length > 3 && (
            <span className="text-xs text-muted-foreground">
              +{persona.tags.length - 3}
            </span>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
}

// ---------------------------------------------------------------------------
// Compact Card (Grid View)
// ---------------------------------------------------------------------------

function PersonaCard({
  persona,
}: {
  persona: Persona;
}) {
  return (
    <Link href={`/personas/${persona.id}`}>
    <Card
      className="cursor-pointer transition-shadow hover:shadow-md"
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            {persona.avatarUrl && (
              <AvatarImage src={persona.avatarUrl} alt={persona.name} />
            )}
            <AvatarFallback className="text-xs">
              {getInitials(persona.name)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium flex items-center gap-1">
                {persona.name}
                {persona.isVerified && <BadgeCheck className="h-3.5 w-3.5 text-blue-500 shrink-0" />}
              </p>
              <Badge
                variant={persona.isActive ? "default" : "secondary"}
                className="shrink-0 text-xs"
              >
                {persona.isActive ? "Aktif" : "Pasif"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">@{persona.name}</p>
            <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
              {persona.gender && (
                <span>{persona.gender === "erkek" ? "Erkek" : "Kadın"}</span>
              )}
              <span className="font-medium">
                {languageLabels[persona.language || "tr"] || persona.language}
              </span>
              {(persona.country || persona.city) && (
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="h-3 w-3" />
                  {[persona.city, persona.country].filter(Boolean).join(", ")}
                </span>
              )}
            </div>
            {persona.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {persona.tags.slice(0, 3).map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="outline"
                    className="text-xs px-1.5 py-0"
                    style={{
                      borderColor: tag.color ?? undefined,
                      color: tag.color ?? undefined,
                    }}
                  >
                    {tag.name}
                  </Badge>
                ))}
                {persona.tags.length > 3 && (
                  <span className="text-xs text-muted-foreground">
                    +{persona.tags.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Create Persona Dialog
// ---------------------------------------------------------------------------

function CreatePersonaDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [formData, setFormData] = useState<CreateFormData>({ ...defaultFormData });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [duplicates, setDuplicates] = useState<{ id: string; name: string }[]>([]);
  const duplicateTimer = useRef<ReturnType<typeof setTimeout>>(null);

  function resetForm() {
    setFormData({ ...defaultFormData });
    setError("");
    setDuplicates([]);
  }

  function handleNameChange(name: string) {
    setFormData((f) => ({ ...f, name }));
    if (duplicateTimer.current) clearTimeout(duplicateTimer.current);
    if (name.trim().length < 2) {
      setDuplicates([]);
      return;
    }
    duplicateTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/personas/check-name?name=${encodeURIComponent(name.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setDuplicates(data.duplicates || []);
        }
      } catch {
        // ignore
      }
    }, 400);
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
      const res = await fetch("/api/personas", {
        method: "POST",
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
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(
          data?.error?.fieldErrors
            ? Object.values(data.error.fieldErrors).flat().join(", ")
            : "Persona oluşturulamadı."
        );
      }

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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Yeni Persona Oluştur</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="create-name">
              Kullanıcı Adı <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              placeholder="ornek_kullanıcı"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              disabled={isSubmitting}
            />
            {duplicates.length > 0 && (
              <div className="flex items-start gap-2 rounded-md border border-yellow-300 bg-yellow-50 p-2 text-xs text-yellow-800 dark:border-yellow-700 dark:bg-yellow-950 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Benzer isimde {duplicates.length} persona mevcut:</span>{" "}
                  {duplicates.map((d) => d.name).join(", ")}
                </div>
              </div>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label htmlFor="create-bio">Biyografi</Label>
            <Textarea
              id="create-bio"
              placeholder="Kısa bir tanım..."
              rows={2}
              value={formData.bio}
              onChange={(e) => setFormData((f) => ({ ...f, bio: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          {/* Gender & Birth Date */}
          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="create-birthdate">Doğum Tarihi</Label>
              <Input
                id="create-birthdate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData((f) => ({ ...f, birthDate: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Country & City */}
          <div className="grid grid-cols-2 gap-4">
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

          {/* Language & Timezone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-language">Dil</Label>
              <Select
                value={formData.language}
                onValueChange={(v) => setFormData((f) => ({ ...f, language: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="create-language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(languageNames).map(([code, name]) => (
                    <SelectItem key={code} value={code}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-timezone">Saat Dilimi</Label>
              <Select
                value={formData.timezone}
                onValueChange={(v) => setFormData((f) => ({ ...f, timezone: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger id="create-timezone">
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

          {/* Active Hours */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="create-activeStart">Aktif Başlangıç</Label>
              <Input
                id="create-activeStart"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursStart}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    activeHoursStart: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-activeEnd">Aktif Bitiş</Label>
              <Input
                id="create-activeEnd"
                type="number"
                min={0}
                max={23}
                value={formData.activeHoursEnd}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    activeHoursEnd: parseInt(e.target.value) || 0,
                  }))
                }
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-maxPosts">Maks. Gönderi</Label>
              <Input
                id="create-maxPosts"
                type="number"
                min={1}
                max={100}
                value={formData.maxPostsPerDay}
                onChange={(e) =>
                  setFormData((f) => ({
                    ...f,
                    maxPostsPerDay: parseInt(e.target.value) || 1,
                  }))
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
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Bulk Create Dialog
// ---------------------------------------------------------------------------

interface BulkPersonaEntry {
  name: string;
  bio: string;
  country: string;
  city: string;
  language: string;
}

function BulkCreateDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}) {
  const [entries, setEntries] = useState<BulkPersonaEntry[]>([
    { name: "", bio: "", country: "", city: "", language: "tr" },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ success: number; total: number } | null>(null);

  function resetForm() {
    setEntries([{ name: "", bio: "", country: "", city: "", language: "tr" }]);
    setError("");
    setResult(null);
  }

  function addRow() {
    setEntries((prev) => [
      ...prev,
      { name: "", bio: "", country: "", city: "", language: "tr" },
    ]);
  }

  function removeRow(index: number) {
    if (entries.length <= 1) return;
    setEntries((prev) => prev.filter((_, i) => i !== index));
  }

  function updateRow(index: number, field: keyof BulkPersonaEntry, value: string) {
    setEntries((prev) =>
      prev.map((entry, i) =>
        i === index ? { ...entry, [field]: value } : entry
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setResult(null);

    const validEntries = entries.filter((e) => e.name.trim());
    if (validEntries.length === 0) {
      setError("En az bir persona ismi gerekli.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/personas/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personas: validEntries.map((e) => ({
            name: e.name.trim(),
            bio: e.bio.trim() || undefined,
            country: e.country.trim() || undefined,
            city: e.city.trim() || undefined,
            language: e.language,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error("Toplu oluşturma başarısız.");
      }

      const data = await res.json();
      setResult({ success: data.successCount, total: data.totalCount });

      if (data.successCount > 0) {
        onCreated();
      }
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
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>Toplu Persona Oluştur</DialogTitle>
          <DialogDescription>
            Birden fazla persona aynı anda oluşturabilirsiniz. Maks. 50 adet.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Kullanıcı Adı *</TableHead>

                  <TableHead className="w-[200px]">Biyografi</TableHead>
                  <TableHead className="w-[120px]">Ülke</TableHead>
                  <TableHead className="w-[100px]">Şehir</TableHead>
                  <TableHead className="w-[80px]">Dil</TableHead>
                  <TableHead className="w-[40px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((entry, index) => (
                  <TableRow key={index}>
                    <TableCell className="p-1.5">
                      <Input
                        placeholder="kullanıcı_adı"
                        value={entry.name}
                        onChange={(e) => updateRow(index, "name", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        placeholder="Kısa bio..."
                        value={entry.bio}
                        onChange={(e) => updateRow(index, "bio", e.target.value)}
                        disabled={isSubmitting}
                        className="h-8 text-sm"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.country}
                        onValueChange={(v) => {
                          updateRow(index, "country", v);
                          updateRow(index, "city", "");
                        }}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Ülke" />
                        </SelectTrigger>
                        <SelectContent>
                          {countries.map((c) => (
                            <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.city}
                        onValueChange={(v) => updateRow(index, "city", v)}
                        disabled={isSubmitting || !entry.country}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue placeholder="Şehir" />
                        </SelectTrigger>
                        <SelectContent>
                          {getCitiesByCountry(entry.country).map((city) => (
                            <SelectItem key={city} value={city}>{city}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={entry.language}
                        onValueChange={(v) => updateRow(index, "language", v)}
                        disabled={isSubmitting}
                      >
                        <SelectTrigger className="h-8 text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(languageNames).map(([code, name]) => (
                            <SelectItem key={code} value={code}>
                              {code.toUpperCase()}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeRow(index)}
                        disabled={entries.length <= 1 || isSubmitting}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addRow}
            disabled={entries.length >= 50 || isSubmitting}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Satır Ekle
          </Button>

          {result && (
            <div className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600">
              {result.success}/{result.total} persona başarıyla oluşturuldu.
            </div>
          )}

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
              Kapat
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  {entries.filter((e) => e.name.trim()).length} Persona Oluştur
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function PersonasPageWrapper() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>}>
      <PersonasPage />
    </Suspense>
  );
}

function PersonasPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Read filters from URL search params (persisted across navigation)
  const search = searchParams.get("q") || "";
  const filterGender = searchParams.get("gender") || "all";
  const filterStatus = searchParams.get("status") || "all";
  const filterCountry = searchParams.get("country") || "all";
  const filterLanguage = searchParams.get("lang") || "all";
  const filterTag = searchParams.get("tag") || "all";
  const filterRole = searchParams.get("role") || "all";
  const filterAccountParam = searchParams.get("account") || "all";
  const filterAccounts = filterAccountParam === "all" ? [] : filterAccountParam.split(",");
  const sortBy = searchParams.get("sort") || "newest";
  const viewMode = (searchParams.get("view") || "table") as "table" | "grid";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("size") || "25", 10);

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search input to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Helper to update URL search params
  const updateParams = useCallback((updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "" || value === "all" || (key === "sort" && value === "newest") || (key === "view" && value === "table") || (key === "page" && value === "1") || (key === "size" && value === "25")) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    const qs = params.toString();
    router.replace(`/personas${qs ? `?${qs}` : ""}`, { scroll: false });
  }, [searchParams, router]);

  const setSearch = (v: string) => updateParams({ q: v, page: "1" });
  const setFilterGender = (v: string) => updateParams({ gender: v, page: "1" });
  const setFilterStatus = (v: string) => updateParams({ status: v, page: "1" });
  const setFilterCountry = (v: string) => updateParams({ country: v, page: "1" });
  const setFilterLanguage = (v: string) => updateParams({ lang: v, page: "1" });
  const setFilterTag = (v: string) => updateParams({ tag: v, page: "1" });
  const setFilterRole = (v: string) => updateParams({ role: v, page: "1" });
  const toggleFilterAccount = (v: string) => {
    const next = filterAccounts.includes(v)
      ? filterAccounts.filter((a) => a !== v)
      : [...filterAccounts, v];
    updateParams({ account: next.length > 0 ? next.join(",") : "all", page: "1" });
  };
  const clearFilterAccounts = () => updateParams({ account: "all", page: "1" });
  const setSortBy = (v: string) => updateParams({ sort: v, page: "1" });
  const setViewMode = (v: string) => updateParams({ view: v });
  const setCurrentPage = (v: number) => updateParams({ page: String(v) });
  const setPageSize = (v: number) => updateParams({ size: String(v), page: "1" });

  const fetchPersonas = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/personas");
      if (!res.ok) throw new Error("Personas yüklenemedi.");
      const data = await res.json();
      setPersonas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Derive unique values for filter dropdowns
  const uniqueCountries = [...new Set(personas.map((p) => p.country).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b, "tr"));
  const uniqueLanguages = [...new Set(personas.map((p) => p.language).filter(Boolean) as string[])].sort();
  const uniqueTags = [...new Map(personas.flatMap((p) => p.tags).map((t) => [t.id, t])).values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const uniqueRoles = [...new Map(personas.flatMap((p) => p.roles || []).map((r) => [r.id, r])).values()].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const activeFilterCount = [filterCountry, filterLanguage, filterTag, filterRole].filter((f) => f !== "all").length + filterAccounts.length;

  // Filters now use URL search params - page reset happens in updateParams

  // Client-side filtering and sorting
  const filteredPersonas = personas
    .filter((p) => {
      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const matches =
          p.name.toLowerCase().includes(q) ||
          (p.country && p.country.toLowerCase().includes(q)) ||
          (p.city && p.city.toLowerCase().includes(q)) ||
          (p.language && p.language.toLowerCase().includes(q)) ||
          (p.bio && p.bio.toLowerCase().includes(q)) ||
          p.tags.some((t) => t.name.toLowerCase().includes(q)) ||
          (p.roles || []).some((r) => r.name.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Gender filter
      if (filterGender !== "all" && p.gender !== filterGender) return false;
      // Status filter
      if (filterStatus === "active" && !p.isActive) return false;
      if (filterStatus === "inactive" && p.isActive) return false;
      if (filterStatus === "verified" && !p.isVerified) return false;
      if (filterStatus === "unverified" && p.isVerified) return false;
      // Country filter
      if (filterCountry !== "all" && p.country !== filterCountry) return false;
      // Language filter
      if (filterLanguage !== "all" && p.language !== filterLanguage) return false;
      // Tag filter
      if (filterTag !== "all" && !p.tags.some((t) => t.id === filterTag)) return false;
      // Role filter
      if (filterRole !== "all" && !(p.roles || []).some((r) => r.id === filterRole)) return false;
      // Account filters (multi-select)
      for (const af of filterAccounts) {
        if (af === "has_email" && p.emailAccountCount === 0) return false;
        if (af === "no_email" && p.emailAccountCount > 0) return false;
        if (af === "has_social" && p.socialAccountCount === 0) return false;
        if (af === "no_social" && p.socialAccountCount > 0) return false;
        if (af === "has_forum" && p.forumAccountCount === 0) return false;
        if (af === "no_forum" && p.forumAccountCount > 0) return false;
        if (af === "no_accounts" && (p.emailAccountCount + p.socialAccountCount + p.forumAccountCount) > 0) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (b.createdAt || "").localeCompare(a.createdAt || "");
        case "oldest":
          return (a.createdAt || "").localeCompare(b.createdAt || "");
        case "name_asc":
          return a.name.localeCompare(b.name, "tr");
        case "name_desc":
          return b.name.localeCompare(a.name, "tr");
        default:
          return 0;
      }
    });

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filteredPersonas.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedPersonas = filteredPersonas.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Personas</h1>
          {!isLoading && (
            <p className="text-sm text-muted-foreground">
              Toplam {personas.length} persona
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />
            Toplu Oluştur
          </Button>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Yeni Persona
          </Button>
        </div>
      </div>

      <Separator />

      {/* Search + Filters + View Toggle */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Persona, ülke, şehir, etiket veya rol ara..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={filterGender} onValueChange={setFilterGender}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Cinsiyet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="erkek">Erkek</SelectItem>
              <SelectItem value="kadın">Kadın</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="verified">Onaylı</SelectItem>
              <SelectItem value="unverified">Onaysız</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">En Yeni</SelectItem>
              <SelectItem value="oldest">En Eski</SelectItem>
              <SelectItem value="name_asc">İsim (A-Z)</SelectItem>
              <SelectItem value="name_desc">İsim (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          <Button
            variant={showAdvancedFilters ? "secondary" : "outline"}
            size="sm"
            onClick={() => setShowAdvancedFilters((v) => !v)}
            className="gap-1.5"
          >
            <Filter className="h-3.5 w-3.5" />
            Filtreler
            {activeFilterCount > 0 && (
              <Badge variant="default" className="ml-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center">
                {activeFilterCount}
              </Badge>
            )}
          </Button>

          <div className="flex rounded-lg border">
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-r-none"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9 rounded-l-none"
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/30 p-3">
            <Select value={filterCountry} onValueChange={setFilterCountry}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
                <SelectValue placeholder="Ülke" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Ülkeler</SelectItem>
                {uniqueCountries.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterLanguage} onValueChange={setFilterLanguage}>
              <SelectTrigger className="w-[140px] h-8 text-sm">
                <SelectValue placeholder="Dil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Diller</SelectItem>
                {uniqueLanguages.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {languageNames[lang] || lang.toUpperCase()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterTag} onValueChange={setFilterTag}>
              <SelectTrigger className="w-[150px] h-8 text-sm">
                <SelectValue placeholder="Etiket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Etiketler</SelectItem>
                {uniqueTags.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>{tag.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[160px] h-8 text-sm">
                <SelectValue placeholder="Rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Roller</SelectItem>
                {uniqueRoles.map((role) => (
                  <SelectItem key={role.id} value={role.id}>{role.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[180px] h-8 text-sm justify-between">
                  <span className="truncate">
                    {filterAccounts.length === 0
                      ? "Hesap Durumu"
                      : `${filterAccounts.length} filtre`}
                  </span>
                  <ChevronDown className="ml-1 h-3.5 w-3.5 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2" align="start">
                <div className="space-y-1">
                  {[
                    { value: "has_email", label: "E-posta Var" },
                    { value: "no_email", label: "E-posta Yok" },
                    { value: "has_social", label: "Sosyal Medya Var" },
                    { value: "no_social", label: "Sosyal Medya Yok" },
                    { value: "has_forum", label: "Forum Hesabı Var" },
                    { value: "no_forum", label: "Forum Hesabı Yok" },
                    { value: "no_accounts", label: "Hiç Hesap Yok" },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-muted"
                    >
                      <Checkbox
                        checked={filterAccounts.includes(opt.value)}
                        onCheckedChange={() => toggleFilterAccount(opt.value)}
                      />
                      {opt.label}
                    </label>
                  ))}
                  {filterAccounts.length > 0 && (
                    <>
                      <Separator className="my-1" />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-7 text-xs"
                        onClick={clearFilterAccounts}
                      >
                        Temizle
                      </Button>
                    </>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground"
                onClick={() => {
                  setFilterCountry("all");
                  setFilterLanguage("all");
                  setFilterTag("all");
                  setFilterRole("all");
                  clearFilterAccounts();
                }}
              >
                <X className="mr-1 h-3 w-3" />
                Temizle
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Filter summary */}
      {!isLoading && !error && (
        <p className="text-xs text-muted-foreground">
          {filteredPersonas.length === personas.length
            ? `${personas.length} persona`
            : `${filteredPersonas.length} / ${personas.length} persona gösteriliyor`}
        </p>
      )}

      {/* Error state */}
      {error && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setIsLoading(true);
                fetchPersonas();
              }}
            >
              Tekrar Dene
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && personas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-full bg-muted p-4">
              <Users className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Henüz persona yok</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              İlk personanızı oluşturarak başlayabilirsiniz.
            </p>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" onClick={() => setBulkDialogOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Toplu Oluştur
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Persona
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No search results */}
      {!isLoading && !error && personas.length > 0 && filteredPersonas.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Filter className="h-8 w-8 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Sonuç bulunamadı</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Seçili filtreler için eşleşen persona bulunamadı.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSearchInput("");
                router.replace("/personas", { scroll: false });
              }}
            >
              Filtreleri Temizle
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table View */}
      {!isLoading && !error && filteredPersonas.length > 0 && viewMode === "table" && (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Persona</TableHead>
                <TableHead className="w-[70px]">Cinsiyet</TableHead>
                <TableHead className="w-[100px]">Doğum Tarihi</TableHead>
                <TableHead className="w-[60px]">Dil</TableHead>
                <TableHead className="w-[160px]">Konum</TableHead>
                <TableHead className="w-[80px]">Durum</TableHead>
                <TableHead className="w-[200px]">Etiketler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPersonas.map((persona) => (
                <PersonaRow
                  key={persona.id}
                  persona={persona}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Grid View */}
      {!isLoading && !error && filteredPersonas.length > 0 && viewMode === "grid" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {paginatedPersonas.map((persona) => (
            <PersonaCard
              key={persona.id}
              persona={persona}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && !error && filteredPersonas.length > 0 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Sayfa başına:</span>
            <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
              <SelectTrigger className="h-8 w-[75px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="500">500</SelectItem>
              </SelectContent>
            </Select>
            <span className="ml-2">
              {(safePage - 1) * pageSize + 1}-{Math.min(safePage * pageSize, filteredPersonas.length)} / {filteredPersonas.length}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(1)}
            >
              <ChevronLeft className="h-4 w-4" />
              <ChevronLeft className="h-4 w-4 -ml-2.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage <= 1}
              onClick={() => setCurrentPage(Math.max(1, safePage - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-3 text-sm font-medium">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(Math.min(totalPages, safePage + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(totalPages)}
            >
              <ChevronRight className="h-4 w-4" />
              <ChevronRight className="h-4 w-4 -ml-2.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <CreatePersonaDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreated={() => {
          setIsLoading(true);
          fetchPersonas();
        }}
      />
      <BulkCreateDialog
        open={bulkDialogOpen}
        onOpenChange={setBulkDialogOpen}
        onCreated={() => {
          setIsLoading(true);
          fetchPersonas();
        }}
      />
    </div>
  );
}
