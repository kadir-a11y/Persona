"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  FileText,
  Trash2,
  Twitter,
  Instagram,
  Facebook,
  Linkedin,
  Sparkles,
  MoreHorizontal,
  Pencil,
  Ban,
  Eye,
  Download,
  Search,
  X,
  Loader2,
  Bot,
  Clock,
  Calendar,
  CheckSquare,
  Play,
  RotateCcw,
} from "lucide-react";
import AiContentContent from "@/components/content/ai-content";

// --- Types ---

interface ContentItemRow {
  contentItem: {
    id: string;
    personaId: string;
    campaignId: string | null;
    platform: string;
    contentType: string;
    content: string;
    mediaUrls: string[];
    status: string;
    scheduledAt: string | null;
    publishedAt: string | null;
    errorMessage: string | null;
    aiGenerated: boolean;
    aiPrompt: string | null;
    aiModel: string | null;
    metadata: Record<string, unknown>;
    createdAt: string;
    updatedAt: string;
  };
  personaName: string;
  personaAvatar: string | null;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
}

// --- Constants ---

const STATUS_TABS = [
  { label: "Tümü", value: "all" },
  { label: "Taslak", value: "draft" },
  { label: "Zamanlanmış", value: "scheduled" },
  { label: "Kuyrukta", value: "queued" },
  { label: "Yayında", value: "published" },
  { label: "Başarısız", value: "failed" },
  { label: "İptal", value: "cancelled" },
] as const;

const STATUS_BADGE_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 border-gray-200",
  scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  queued: "bg-yellow-100 text-yellow-700 border-yellow-200",
  publishing: "bg-orange-100 text-orange-700 border-orange-200",
  published: "bg-green-100 text-green-700 border-green-200",
  failed: "bg-red-100 text-red-700 border-red-200",
  cancelled: "bg-gray-100 text-gray-500 border-gray-200",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Taslak",
  scheduled: "Zamanlanmış",
  queued: "Kuyrukta",
  publishing: "Yayınlanıyor",
  published: "Yayında",
  failed: "Başarısız",
  cancelled: "İptal Edildi",
};

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  twitter: "bg-blue-100 text-blue-700 border-blue-200",
  instagram: "bg-pink-100 text-pink-700 border-pink-200",
  facebook: "bg-blue-100 text-blue-800 border-blue-200",
  linkedin: "bg-blue-100 text-blue-600 border-blue-200",
  tiktok: "bg-gray-900 text-white border-gray-900",
  reddit: "bg-orange-100 text-orange-700 border-orange-200",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  reddit: "Reddit",
};

const PLATFORMS = ["twitter", "instagram", "facebook", "linkedin", "tiktok", "reddit"] as const;

const CONTENT_TYPES = [
  { value: "post", label: "Post" },
  { value: "reply", label: "Yanıt" },
  { value: "comment", label: "Yorum" },
  { value: "story", label: "Hikaye" },
  { value: "reel", label: "Reel" },
] as const;

const CONTENT_TYPE_LABELS: Record<string, string> = {
  post: "Post",
  reply: "Yanıt",
  comment: "Yorum",
  story: "Hikaye",
  reel: "Reel",
};

function PlatformIcon({ platform }: { platform: string }) {
  switch (platform) {
    case "twitter":
      return <Twitter className="h-3.5 w-3.5" />;
    case "instagram":
      return <Instagram className="h-3.5 w-3.5" />;
    case "facebook":
      return <Facebook className="h-3.5 w-3.5" />;
    case "linkedin":
      return <Linkedin className="h-3.5 w-3.5" />;
    default:
      return null;
  }
}

export default function ContentPage() {
  const [items, setItems] = useState<ContentItemRow[]>([]);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [personaFilter, setPersonaFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createPersonaId, setCreatePersonaId] = useState("");
  const [createPlatform, setCreatePlatform] = useState("");
  const [createContentType, setCreateContentType] = useState("post");
  const [createContent, setCreateContent] = useState("");
  const [createScheduledAt, setCreateScheduledAt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItemRow | null>(null);
  const [editPlatform, setEditPlatform] = useState("");
  const [editContentType, setEditContentType] = useState("post");
  const [editContent, setEditContent] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Detail dialog state
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ContentItemRow | null>(null);

  // Delete state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContentItemRow | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchContent = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeTab !== "all") params.set("status", activeTab);
      if (platformFilter !== "all") params.set("platform", platformFilter);
      if (personaFilter !== "all") params.set("personaId", personaFilter);

      const res = await fetch(`/api/content?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch content:", error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, platformFilter, personaFilter]);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
    }
  }, []);

  useEffect(() => {
    fetchContent();
  }, [fetchContent]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  // Client-side search filter
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (row) =>
        row.contentItem.content.toLowerCase().includes(q) ||
        row.personaName.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  // --- Handlers ---

  async function handleCreate() {
    if (!createPersonaId || !createPlatform || !createContent.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        personaId: createPersonaId,
        platform: createPlatform,
        contentType: createContentType,
        content: createContent.trim(),
        status: createScheduledAt ? "scheduled" : "draft",
      };
      if (createScheduledAt) {
        body.scheduledAt = new Date(createScheduledAt).toISOString();
      }
      const res = await fetch("/api/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        resetCreateForm();
        setCreateOpen(false);
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  function resetCreateForm() {
    setCreatePersonaId("");
    setCreatePlatform("");
    setCreateContentType("post");
    setCreateContent("");
    setCreateScheduledAt("");
  }

  function openEdit(item: ContentItemRow) {
    setEditItem(item);
    setEditPlatform(item.contentItem.platform);
    setEditContentType(item.contentItem.contentType);
    setEditContent(item.contentItem.content);
    setEditScheduledAt(
      item.contentItem.scheduledAt
        ? new Date(item.contentItem.scheduledAt).toISOString().slice(0, 16)
        : ""
    );
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editItem || !editContent.trim()) return;
    setEditLoading(true);
    try {
      const body: Record<string, unknown> = {
        platform: editPlatform,
        contentType: editContentType,
        content: editContent.trim(),
      };
      if (editScheduledAt) {
        body.scheduledAt = new Date(editScheduledAt).toISOString();
        if (editItem.contentItem.status === "draft") {
          body.status = "scheduled";
        }
      } else if (editItem.contentItem.status === "scheduled") {
        body.status = "draft";
        body.scheduledAt = undefined;
      }
      const res = await fetch(`/api/content/${editItem.contentItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditOpen(false);
        setEditItem(null);
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to update content:", error);
    } finally {
      setEditLoading(false);
    }
  }

  function openDetail(item: ContentItemRow) {
    setDetailItem(item);
    setDetailOpen(true);
  }

  function openDelete(item: ContentItemRow) {
    setDeleteItem(item);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/content/${deleteItem.contentItem.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteItem(null);
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to delete content:", error);
    } finally {
      setDeleteLoading(false);
    }
  }

  async function handleStatusChange(item: ContentItemRow, newStatus: string) {
    setActionLoading(item.contentItem.id);
    try {
      const res = await fetch(`/api/content/${item.contentItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchContent();
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch("/api/export/content");
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `icerikler-${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("Failed to export:", error);
    }
  }

  function formatDate(dateStr: string | null) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">İçerik</h1>
          <p className="text-muted-foreground">
            İçerik kuyruğunuzu oluşturun, zamanlayın ve yönetin.
          </p>
        </div>
      </div>

      <Tabs defaultValue="list" className="space-y-6">
        <TabsList>
          <TabsTrigger value="list" className="gap-2">
            <FileText className="h-4 w-4" />
            İçerik Listesi
          </TabsTrigger>
          <TabsTrigger value="ai-generate" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Üretici
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Top bar: search + actions */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="İçerik veya persona ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-8"
              />
              {searchQuery && (
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="mr-2 h-4 w-4" />
              CSV
            </Button>
            <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Yeni İçerik
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>Yeni İçerik Oluştur</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Persona</Label>
                    <Select value={createPersonaId} onValueChange={setCreatePersonaId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Persona seçin..." />
                      </SelectTrigger>
                      <SelectContent>
                        {personas.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={createPlatform} onValueChange={setCreatePlatform}>
                        <SelectTrigger>
                          <SelectValue placeholder="Platform seçin..." />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {PLATFORM_LABELS[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>İçerik Türü</Label>
                      <Select value={createContentType} onValueChange={setCreateContentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map((ct) => (
                            <SelectItem key={ct.value} value={ct.value}>
                              {ct.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>İçerik</Label>
                    <Textarea
                      placeholder="İçerik metnini girin..."
                      value={createContent}
                      onChange={(e) => setCreateContent(e.target.value)}
                      rows={5}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zamanlama (opsiyonel)</Label>
                    <Input
                      type="datetime-local"
                      value={createScheduledAt}
                      onChange={(e) => setCreateScheduledAt(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>
                    İptal
                  </Button>
                  <Button
                    onClick={handleCreate}
                    disabled={createLoading || !createPersonaId || !createPlatform || !createContent.trim()}
                  >
                    {createLoading ? "Oluşturuluyor..." : "Oluştur"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 flex-wrap">
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setLoading(true); }} className="flex-1">
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <TabsList>
                  {STATUS_TABS.map((tab) => (
                    <TabsTrigger key={tab.value} value={tab.value} className="text-xs">
                      {tab.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
                <div className="flex items-center gap-2">
                  <Select value={personaFilter} onValueChange={(v) => { setPersonaFilter(v); setLoading(true); }}>
                    <SelectTrigger className="w-[160px] h-9 text-xs">
                      <SelectValue placeholder="Persona" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Personalar</SelectItem>
                      {personas.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={platformFilter} onValueChange={(v) => { setPlatformFilter(v); setLoading(true); }}>
                    <SelectTrigger className="w-[150px] h-9 text-xs">
                      <SelectValue placeholder="Platform" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Platformlar</SelectItem>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {PLATFORM_LABELS[p]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* All tab contents share the same table */}
              {STATUS_TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-4">
                  <ContentTable
                    items={filteredItems}
                    formatDate={formatDate}
                    onDelete={openDelete}
                    onEdit={openEdit}
                    onStatusChange={handleStatusChange}
                    onDetail={openDetail}
                    actionLoading={actionLoading}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Delete Confirmation */}
          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>İçeriği Sil</AlertDialogTitle>
                <AlertDialogDescription>
                  Bu içeriği silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                </AlertDialogDescription>
              </AlertDialogHeader>
              {deleteItem && (
                <div className="rounded-md border bg-muted/50 p-3 text-sm">
                  <p className="font-medium">{deleteItem.personaName}</p>
                  <p className="mt-1 text-muted-foreground line-clamp-2">{deleteItem.contentItem.content}</p>
                </div>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel disabled={deleteLoading}>Vazgeç</AlertDialogCancel>
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

          {/* Edit Dialog */}
          <Dialog open={editOpen} onOpenChange={(open) => { setEditOpen(open); if (!open) setEditItem(null); }}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>İçeriği Düzenle</DialogTitle>
              </DialogHeader>
              {editItem && (
                <div className="space-y-4 py-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Avatar className="h-6 w-6">
                      {editItem.personaAvatar && (
                        <AvatarImage src={editItem.personaAvatar} alt={editItem.personaName} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {editItem.personaName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {editItem.personaName}
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Platform</Label>
                      <Select value={editPlatform} onValueChange={setEditPlatform}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PLATFORMS.map((p) => (
                            <SelectItem key={p} value={p}>
                              {PLATFORM_LABELS[p]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>İçerik Türü</Label>
                      <Select value={editContentType} onValueChange={setEditContentType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTENT_TYPES.map((ct) => (
                            <SelectItem key={ct.value} value={ct.value}>
                              {ct.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>İçerik</Label>
                    <Textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={6}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Zamanlama (opsiyonel)</Label>
                    <Input
                      type="datetime-local"
                      value={editScheduledAt}
                      onChange={(e) => setEditScheduledAt(e.target.value)}
                    />
                  </div>
                </div>
              )}
              <DialogFooter>
                <Button variant="outline" onClick={() => { setEditOpen(false); setEditItem(null); }}>
                  İptal
                </Button>
                <Button onClick={handleEdit} disabled={editLoading || !editContent.trim()}>
                  {editLoading ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Detail Dialog */}
          <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>İçerik Detayı</DialogTitle>
              </DialogHeader>
              {detailItem && (
                <ScrollArea className="max-h-[70vh]">
                  <div className="space-y-5 pr-4">
                    {/* Persona & Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {detailItem.personaAvatar && (
                            <AvatarImage src={detailItem.personaAvatar} alt={detailItem.personaName} />
                          )}
                          <AvatarFallback>
                            {detailItem.personaName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{detailItem.personaName}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge variant="outline" className={PLATFORM_BADGE_COLORS[detailItem.contentItem.platform] || ""}>
                              <PlatformIcon platform={detailItem.contentItem.platform} />
                              <span className="ml-1">{PLATFORM_LABELS[detailItem.contentItem.platform] || detailItem.contentItem.platform}</span>
                            </Badge>
                            <Badge variant="secondary" className="text-xs">
                              {CONTENT_TYPE_LABELS[detailItem.contentItem.contentType] || detailItem.contentItem.contentType}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className={STATUS_BADGE_COLORS[detailItem.contentItem.status] || ""}>
                        {STATUS_LABELS[detailItem.contentItem.status] || detailItem.contentItem.status}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="rounded-md border bg-muted/30 p-4">
                      <p className="whitespace-pre-wrap text-sm leading-relaxed">{detailItem.contentItem.content}</p>
                    </div>

                    {/* Metadata grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" /> Oluşturulma
                        </p>
                        <p className="font-medium">{formatDate(detailItem.contentItem.createdAt)}</p>
                      </div>
                      {detailItem.contentItem.scheduledAt && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5" /> Zamanlanan
                          </p>
                          <p className="font-medium">{formatDate(detailItem.contentItem.scheduledAt)}</p>
                        </div>
                      )}
                      {detailItem.contentItem.publishedAt && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <CheckSquare className="h-3.5 w-3.5" /> Yayınlanma
                          </p>
                          <p className="font-medium text-green-600">{formatDate(detailItem.contentItem.publishedAt)}</p>
                        </div>
                      )}
                      {detailItem.contentItem.aiGenerated && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground flex items-center gap-1.5">
                            <Bot className="h-3.5 w-3.5" /> AI Model
                          </p>
                          <p className="font-medium">{detailItem.contentItem.aiModel || "Belirtilmemiş"}</p>
                        </div>
                      )}
                    </div>

                    {/* Error message */}
                    {detailItem.contentItem.errorMessage && (
                      <div className="rounded-md border border-red-200 bg-red-50 p-3">
                        <p className="text-sm font-medium text-red-700">Hata</p>
                        <p className="text-sm text-red-600 mt-1">{detailItem.contentItem.errorMessage}</p>
                      </div>
                    )}

                    {/* AI Prompt */}
                    {detailItem.contentItem.aiGenerated && detailItem.contentItem.aiPrompt && (
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground font-medium">AI Prompt</p>
                        <div className="rounded-md border bg-muted/30 p-3">
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap">{detailItem.contentItem.aiPrompt}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}
              <DialogFooter>
                {detailItem && (
                  <div className="flex gap-2 mr-auto">
                    {["draft", "scheduled"].includes(detailItem.contentItem.status) && (
                      <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}>
                        <Pencil className="mr-1.5 h-3.5 w-3.5" />
                        Düzenle
                      </Button>
                    )}
                    {["scheduled", "queued"].includes(detailItem.contentItem.status) && (
                      <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "cancelled"); }}>
                        <Ban className="mr-1.5 h-3.5 w-3.5" />
                        Durdur
                      </Button>
                    )}
                    {detailItem.contentItem.status === "scheduled" && (
                      <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "draft"); }}>
                        <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                        Taslağa Çevir
                      </Button>
                    )}
                    {["cancelled", "failed"].includes(detailItem.contentItem.status) && (
                      <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "draft"); }}>
                        <Play className="mr-1.5 h-3.5 w-3.5" />
                        Devam Ettir
                      </Button>
                    )}
                  </div>
                )}
                <Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </TabsContent>

        <TabsContent value="ai-generate">
          <AiContentContent embedded />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Content Table ---

function ContentTable({
  items,
  formatDate,
  onDelete,
  onEdit,
  onStatusChange,
  onDetail,
  actionLoading,
}: {
  items: ContentItemRow[];
  formatDate: (d: string | null) => string;
  onDelete: (item: ContentItemRow) => void;
  onEdit: (item: ContentItemRow) => void;
  onStatusChange: (item: ContentItemRow, status: string) => void;
  onDetail: (item: ContentItemRow) => void;
  actionLoading: string | null;
}) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-12">
        <FileText className="h-12 w-12 text-muted-foreground/50" />
        <h3 className="mt-4 text-lg font-semibold">İçerik bulunamadı</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu filtrelemeye uygun içerik yok.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Persona</TableHead>
            <TableHead>Platform</TableHead>
            <TableHead className="max-w-[300px]">İçerik</TableHead>
            <TableHead>Tür</TableHead>
            <TableHead>Durum</TableHead>
            <TableHead>Tarih</TableHead>
            <TableHead className="w-[60px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((row) => {
            const ci = row.contentItem;
            const canEdit = ["draft", "scheduled"].includes(ci.status);
            const canStop = ["scheduled", "queued"].includes(ci.status);
            const canResume = ["cancelled", "failed"].includes(ci.status);
            const canBackToDraft = ci.status === "scheduled";

            return (
              <TableRow
                key={ci.id}
                className="cursor-pointer"
                onClick={() => onDetail(row)}
              >
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Avatar className="h-7 w-7">
                      {row.personaAvatar && (
                        <AvatarImage src={row.personaAvatar} alt={row.personaName} />
                      )}
                      <AvatarFallback className="text-[10px]">
                        {row.personaName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{row.personaName}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${PLATFORM_BADGE_COLORS[ci.platform] || ""}`}
                  >
                    <PlatformIcon platform={ci.platform} />
                    <span className="ml-1">{PLATFORM_LABELS[ci.platform] || ci.platform}</span>
                  </Badge>
                </TableCell>
                <TableCell className="max-w-[300px]">
                  <div className="flex items-center gap-1.5">
                    {ci.aiGenerated && <Bot className="h-3.5 w-3.5 text-purple-500 shrink-0" />}
                    <p className="truncate text-sm">
                      {ci.content.length > 80
                        ? ci.content.slice(0, 80) + "..."
                        : ci.content}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground">
                    {CONTENT_TYPE_LABELS[ci.contentType] || ci.contentType}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_BADGE_COLORS[ci.status] || ""}`}
                  >
                    {STATUS_LABELS[ci.status] || ci.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {ci.publishedAt
                    ? formatDate(ci.publishedAt)
                    : ci.scheduledAt
                      ? formatDate(ci.scheduledAt)
                      : formatDate(ci.createdAt)}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {actionLoading === ci.id ? (
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mx-auto" />
                  ) : (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onDetail(row)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Görüntüle
                        </DropdownMenuItem>
                        {canEdit && (
                          <DropdownMenuItem onClick={() => onEdit(row)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Düzenle
                          </DropdownMenuItem>
                        )}
                        {canStop && (
                          <DropdownMenuItem onClick={() => onStatusChange(row, "cancelled")}>
                            <Ban className="mr-2 h-4 w-4" />
                            Durdur
                          </DropdownMenuItem>
                        )}
                        {canBackToDraft && (
                          <DropdownMenuItem onClick={() => onStatusChange(row, "draft")}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Taslağa Çevir
                          </DropdownMenuItem>
                        )}
                        {canResume && (
                          <DropdownMenuItem onClick={() => onStatusChange(row, "draft")}>
                            <Play className="mr-2 h-4 w-4" />
                            Devam Ettir
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => onDelete(row)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
