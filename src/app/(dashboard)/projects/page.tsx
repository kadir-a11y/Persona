"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Trash2,
  Eye,
  FolderKanban,
  Search,
  AlertTriangle,
  MessageSquare,
  CheckSquare,
  Users,
} from "lucide-react";

// --- Types ---

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  severity: string;
  status: string;
  clientName: string | null;
  languages: string[];
  keywords: string[];
  severityScore: number;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  mentionCount: number;
  activeTaskCount: number;
  teamCount: number;
}

// --- Constants ---

const PROJECT_TYPE_LABELS: Record<string, string> = {
  crisis_management: "Kriz Yönetimi",
  reputation_defense: "Repütasyon Savunması",
  perception_operation: "Algı Operasyonu",
  monitoring: "İzleme",
};

const PROJECT_TYPE_COLORS: Record<string, string> = {
  crisis_management: "bg-red-100 text-red-700 border-red-200",
  reputation_defense: "bg-orange-100 text-orange-700 border-orange-200",
  perception_operation: "bg-purple-100 text-purple-700 border-purple-200",
  monitoring: "bg-blue-100 text-blue-700 border-blue-200",
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: "Kritik",
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const STATUS_LABELS: Record<string, string> = {
  detected: "Tespit Edildi",
  analyzing: "Analiz Ediliyor",
  responding: "Müdahale Ediliyor",
  monitoring: "İzleniyor",
  resolved: "Çözüldü",
  archived: "Arşivlendi",
};

const STATUS_COLORS: Record<string, string> = {
  detected: "bg-red-100 text-red-700 border-red-200",
  analyzing: "bg-yellow-100 text-yellow-700 border-yellow-200",
  responding: "bg-blue-100 text-blue-700 border-blue-200",
  monitoring: "bg-cyan-100 text-cyan-700 border-cyan-200",
  resolved: "bg-green-100 text-green-700 border-green-200",
  archived: "bg-gray-100 text-gray-700 border-gray-200",
};

const LANGUAGE_NAMES: Record<string, string> = {
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

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterSeverity, setFilterSeverity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createType, setCreateType] = useState("");
  const [createSeverity, setCreateSeverity] = useState("");
  const [createClientName, setCreateClientName] = useState("");
  const [createKeywords, setCreateKeywords] = useState("");
  const [createLanguages, setCreateLanguages] = useState<string[]>(["tr"]);
  const [langSearch, setLangSearch] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterType && filterType !== "all") params.set("type", filterType);
      if (filterStatus && filterStatus !== "all") params.set("status", filterStatus);
      if (filterSeverity && filterSeverity !== "all") params.set("severity", filterSeverity);
      if (searchQuery.trim()) params.set("search", searchQuery.trim());
      const qs = params.toString();
      const res = await fetch(`/api/projects${qs ? `?${qs}` : ""}`);
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error("Failed to fetch projects:", error);
    } finally {
      setLoading(false);
    }
  }, [filterType, filterStatus, filterSeverity, searchQuery]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  function resetCreateForm() {
    setCreateName("");
    setCreateDescription("");
    setCreateType("");
    setCreateSeverity("");
    setCreateClientName("");
    setCreateKeywords("");
    setCreateLanguages(["tr"]);
    setLangSearch("");
  }

  async function handleCreate() {
    if (!createName.trim() || !createType || !createSeverity) return;
    setCreateLoading(true);
    try {
      const keywords = createKeywords
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
      const body: Record<string, unknown> = {
        name: createName.trim(),
        description: createDescription.trim() || undefined,
        type: createType,
        severity: createSeverity,
        clientName: createClientName.trim() || undefined,
        keywords,
        languages: createLanguages,
      };
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetCreateForm();
        setCreateOpen(false);
        await fetchProjects();
      }
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function openDeleteDialog(project: Project) {
    setDeleteProject(project);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteProject) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/projects/${deleteProject.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteProject(null);
        await fetchProjects();
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function parseKeywordsInput(value: string) {
    return value
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Projeler</h1>
          <p className="text-muted-foreground">
            Projelerinizi oluşturun, yönetin ve takip edin.
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Proje
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Proje Oluştur</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Proje Adı</Label>
                <Input
                  placeholder="Proje adını girin..."
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Açıklama</Label>
                <Textarea
                  placeholder="Proje açıklaması..."
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tür</Label>
                  <Select value={createType} onValueChange={setCreateType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Önem Derecesi</Label>
                  <Select value={createSeverity} onValueChange={setCreateSeverity}>
                    <SelectTrigger>
                      <SelectValue placeholder="Önem derecesi seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Müşteri Adı</Label>
                <Input
                  placeholder="Müşteri adını girin..."
                  value={createClientName}
                  onChange={(e) => setCreateClientName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Diller</Label>
                {createLanguages.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {createLanguages.map((code) => (
                      <Badge
                        key={code}
                        variant="secondary"
                        className="text-xs cursor-pointer hover:bg-destructive/20"
                        onClick={() => setCreateLanguages((prev) => prev.filter((c) => c !== code))}
                      >
                        {LANGUAGE_NAMES[code] || code} &times;
                      </Badge>
                    ))}
                  </div>
                )}
                <Input
                  placeholder="Dil ara..."
                  value={langSearch}
                  onChange={(e) => setLangSearch(e.target.value)}
                />
                <div className="max-h-32 overflow-y-auto border rounded-md p-1">
                  {Object.entries(LANGUAGE_NAMES)
                    .filter(
                      ([code, name]) =>
                        !createLanguages.includes(code) &&
                        (name.toLowerCase().includes(langSearch.toLowerCase()) ||
                          code.toLowerCase().includes(langSearch.toLowerCase()))
                    )
                    .slice(0, 20)
                    .map(([code, name]) => (
                      <button
                        key={code}
                        type="button"
                        className="w-full text-left px-2 py-1 text-sm rounded hover:bg-accent"
                        onClick={() => {
                          setCreateLanguages((prev) => [...prev, code]);
                          setLangSearch("");
                        }}
                      >
                        {name} ({code})
                      </button>
                    ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Anahtar Kelimeler</Label>
                <Input
                  placeholder="Virgülle ayırarak girin (örn: kriz, sosyal medya, marka)"
                  value={createKeywords}
                  onChange={(e) => setCreateKeywords(e.target.value)}
                />
                {parseKeywordsInput(createKeywords).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {parseKeywordsInput(createKeywords).map((kw, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
                İptal
              </Button>
              <Button
                onClick={handleCreate}
                disabled={
                  createLoading ||
                  !createName.trim() ||
                  !createType ||
                  !createSeverity ||
                  createLanguages.length === 0
                }
              >
                {createLoading ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Proje ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tüm Türler" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            {Object.entries(PROJECT_TYPE_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tüm Durumlar" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            {Object.entries(STATUS_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Tüm Önem Dereceleri" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Önem Dereceleri</SelectItem>
            {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Project List */}
      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FolderKanban className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-semibold">Henüz proje yok</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              İlk projenizi oluşturarak başlayın.
            </p>
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Yeni Proje
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-lg truncate flex-1 min-w-0">
                    {project.name}
                  </CardTitle>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge
                      variant="outline"
                      className={`text-xs ${PROJECT_TYPE_COLORS[project.type] || ""}`}
                    >
                      {PROJECT_TYPE_LABELS[project.type] || project.type}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-xs ${SEVERITY_COLORS[project.severity] || ""}`}
                    >
                      {SEVERITY_LABELS[project.severity] || project.severity}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {/* Status */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={STATUS_COLORS[project.status] || ""}
                  >
                    {STATUS_LABELS[project.status] || project.status}
                  </Badge>
                </div>

                {/* Languages */}
                {project.languages && project.languages.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.languages.map((code) => (
                      <Badge key={code} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                        {LANGUAGE_NAMES[code] || code}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Client Name */}
                {project.clientName && (
                  <div className="text-sm text-muted-foreground">
                    Müşteri: <span className="font-medium text-foreground">{project.clientName}</span>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1" title="Bahsedilme Sayısı">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span>{project.mentionCount}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Aktif Görev">
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>{project.activeTaskCount}</span>
                  </div>
                  <div className="flex items-center gap-1" title="Ekip Büyüklüğü">
                    <Users className="h-3.5 w-3.5" />
                    <span>{project.teamCount}</span>
                  </div>
                </div>

                {/* Severity Score Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      Önem Skoru
                    </span>
                    <span className="font-medium">{project.severityScore}/100</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        project.severityScore >= 75
                          ? "bg-red-500"
                          : project.severityScore >= 50
                          ? "bg-orange-500"
                          : project.severityScore >= 25
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(project.severityScore, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Keywords */}
                {project.keywords && project.keywords.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.keywords.map((kw, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {kw}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Created Date */}
                <div className="text-xs text-muted-foreground">
                  Oluşturulma: {formatDate(project.createdAt)}
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex w-full items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/projects/${project.id}`}>
                      <Eye className="mr-1.5 h-3.5 w-3.5" />
                      Detay
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => openDeleteDialog(project)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{deleteProject?.name}&rdquo; projesini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
