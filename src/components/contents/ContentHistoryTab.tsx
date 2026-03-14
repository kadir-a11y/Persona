"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Loader2,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  FileText,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MessageSquare,
  Heart,
  Repeat2,
  Quote,
  PenLine,
  MoreHorizontal,
  Pencil,
  Trash2,
  Ban,
  Eye,
  Search,
  X,
  Bot,
  Calendar,
  CheckSquare,
  Plus,
  Play,
  RotateCcw,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface ContentItem {
  id: string;
  personaId: string;
  platform: string;
  contentType: string | null;
  content: string;
  status: string | null;
  scheduledAt: string | null;
  publishedAt: string | null;
  errorMessage: string | null;
  aiGenerated: boolean | null;
  aiPrompt: string | null;
  aiModel: string | null;
  sourceContentUrl: string | null;
  createdAt: string;
  personaName: string;
  personaAvatar: string | null;
}

interface ContentResponse {
  items: ContentItem[];
  total: number;
  limit: number;
  offset: number;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
}

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  draft: { label: "Taslak", class: "bg-gray-100 text-gray-700", icon: FileText },
  scheduled: { label: "Planlandı", class: "bg-blue-100 text-blue-700", icon: Clock },
  queued: { label: "Kuyrukta", class: "bg-yellow-100 text-yellow-700", icon: Clock },
  publishing: { label: "Yayınlanıyor", class: "bg-orange-100 text-orange-700", icon: Clock },
  published: { label: "Yayınlandı", class: "bg-green-100 text-green-700", icon: CheckCircle },
  failed: { label: "Başarısız", class: "bg-red-100 text-red-700", icon: XCircle },
  cancelled: { label: "İptal", class: "bg-gray-100 text-gray-500", icon: AlertTriangle },
};

const CONTENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  reply: { label: "Yanıt", icon: MessageSquare },
  comment: { label: "Yorum", icon: MessageSquare },
  post: { label: "Gönderi", icon: PenLine },
  story: { label: "Hikaye", icon: PenLine },
  reel: { label: "Reel", icon: PenLine },
  like: { label: "Beğeni", icon: Heart },
  retweet: { label: "Repost", icon: Repeat2 },
  quote: { label: "Alıntı", icon: Quote },
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
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

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────────────

export default function ContentHistoryTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [personas, setPersonas] = useState<Persona[]>([]);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail dialog
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ContentItem | null>(null);
  const [editPlatform, setEditPlatform] = useState("");
  const [editContentType, setEditContentType] = useState("post");
  const [editContent, setEditContent] = useState("");
  const [editScheduledAt, setEditScheduledAt] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createPersonaId, setCreatePersonaId] = useState("");
  const [createPlatform, setCreatePlatform] = useState("");
  const [createContentType, setCreateContentType] = useState("post");
  const [createContent, setCreateContent] = useState("");
  const [createScheduledAt, setCreateScheduledAt] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ContentItem | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Action loading
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String(page * PAGE_SIZE),
      });
      if (filterPlatform !== "all") params.set("platform", filterPlatform);
      if (filterStatus !== "all") params.set("status", filterStatus);
      if (filterType !== "all") params.set("contentType", filterType);

      const res = await fetch(`/api/projects/${projectId}/contents?${params}`);
      if (!res.ok) throw new Error("Fetch failed");
      const data: ContentResponse = await res.json();
      setItems(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error("Content fetch error:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId, page, filterPlatform, filterStatus, filterType]);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
      }
    } catch {}
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  useEffect(() => {
    setPage(0);
  }, [filterPlatform, filterStatus, filterType]);

  // Client-side search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (item) =>
        item.content.toLowerCase().includes(q) ||
        item.personaName.toLowerCase().includes(q)
    );
  }, [items, searchQuery]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, max = 140) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  // --- Handlers ---

  function openDetail(item: ContentItem) {
    setDetailItem(item);
    setDetailOpen(true);
  }

  function openEdit(item: ContentItem) {
    setEditItem(item);
    setEditPlatform(item.platform);
    setEditContentType(item.contentType || "post");
    setEditContent(item.content);
    setEditScheduledAt(
      item.scheduledAt ? new Date(item.scheduledAt).toISOString().slice(0, 16) : ""
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
        if (editItem.status === "draft") body.status = "scheduled";
      } else if (editItem.status === "scheduled") {
        body.status = "draft";
        body.scheduledAt = undefined;
      }
      const res = await fetch(`/api/content/${editItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setEditOpen(false);
        setEditItem(null);
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to update content:", error);
    } finally {
      setEditLoading(false);
    }
  }

  function resetCreateForm() {
    setCreatePersonaId("");
    setCreatePlatform("");
    setCreateContentType("post");
    setCreateContent("");
    setCreateScheduledAt("");
  }

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
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to create content:", error);
    } finally {
      setCreateLoading(false);
    }
  }

  async function handleStatusChange(item: ContentItem, newStatus: string) {
    setActionLoading(item.id);
    try {
      const res = await fetch(`/api/content/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) await fetchItems();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete() {
    if (!deleteItem) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/content/${deleteItem.id}`, { method: "DELETE" });
      if (res.ok) {
        setDeleteOpen(false);
        setDeleteItem(null);
        await fetchItems();
      }
    } catch (error) {
      console.error("Failed to delete:", error);
    } finally {
      setDeleteLoading(false);
    }
  }


  return (
    <div className="space-y-4">
      {/* Top bar: search + create */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="İçerik veya persona ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-8 h-8 text-sm"
          />
          {searchQuery && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <Button size="sm" variant="outline" className="h-8" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-1.5 h-3.5 w-3.5" />
          İçerik Ekle
        </Button>
        <span className="text-sm text-muted-foreground ml-auto">
          {total} içerik
        </span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Platformlar</SelectItem>
            {PLATFORMS.map((p) => (
              <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
            <SelectItem value="scheduled">Planlandı</SelectItem>
            <SelectItem value="queued">Kuyrukta</SelectItem>
            <SelectItem value="published">Yayınlandı</SelectItem>
            <SelectItem value="failed">Başarısız</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            {CONTENT_TYPES.map((ct) => (
              <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>


      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filteredItems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Send className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Henüz içerik yok.</p>
            <p className="text-xs mt-1">İçerik ekleyerek başlayabilirsiniz.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredItems.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status || "draft"] || STATUS_CONFIG.draft;
            const typeCfg = CONTENT_TYPE_CONFIG[item.contentType || "post"] || CONTENT_TYPE_CONFIG.post;
            const StatusIcon = statusCfg.icon;
            const TypeIcon = typeCfg.icon;
            const canEdit = ["draft", "scheduled"].includes(item.status || "");
            const canStop = ["scheduled", "queued"].includes(item.status || "");
            const canResume = ["cancelled", "failed"].includes(item.status || "");
            const canBackToDraft = item.status === "scheduled";

            return (
              <Card
                key={item.id}
                className="hover:shadow-sm transition-shadow cursor-pointer"
                onClick={() => openDetail(item)}
              >
                <CardContent className="p-3">
                  <div className="flex gap-3">
                    {/* Avatar */}
                    <Avatar className="h-8 w-8 shrink-0 mt-0.5">
                      <AvatarImage src={item.personaAvatar || undefined} />
                      <AvatarFallback className="text-xs">
                        {item.personaName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-sm">{item.personaName}</span>
                        <Badge variant="outline" className="text-xs h-5 gap-1">
                          <TypeIcon className="h-3 w-3" />
                          {typeCfg.label}
                        </Badge>
                        <Badge variant="secondary" className="text-xs h-5">
                          {PLATFORM_LABELS[item.platform] || item.platform}
                        </Badge>
                        <Badge className={`text-xs h-5 gap-1 ${statusCfg.class}`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusCfg.label}
                        </Badge>
                        {item.aiGenerated && (
                          <Badge variant="outline" className="text-xs h-5 text-purple-600 border-purple-200">
                            AI
                          </Badge>
                        )}
                      </div>

                      <p className="text-sm mt-1 text-foreground/80">
                        {truncate(item.content)}
                      </p>

                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{formatDate(item.createdAt)}</span>
                        {item.scheduledAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.scheduledAt)}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            {formatDate(item.publishedAt)}
                          </span>
                        )}
                        {item.sourceContentUrl && (
                          <a
                            href={item.sourceContentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="h-3 w-3" />
                            Kaynak
                          </a>
                        )}
                        {item.errorMessage && (
                          <span className="text-red-500" title={item.errorMessage}>
                            <AlertTriangle className="h-3 w-3 inline mr-0.5" />
                            Hata
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                      {actionLoading === item.id ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openDetail(item)}>
                              <Eye className="mr-2 h-4 w-4" /> Görüntüle
                            </DropdownMenuItem>
                            {canEdit && (
                              <DropdownMenuItem onClick={() => openEdit(item)}>
                                <Pencil className="mr-2 h-4 w-4" /> Düzenle
                              </DropdownMenuItem>
                            )}
                            {canStop && (
                              <DropdownMenuItem onClick={() => handleStatusChange(item, "cancelled")}>
                                <Ban className="mr-2 h-4 w-4" /> Durdur
                              </DropdownMenuItem>
                            )}
                            {canBackToDraft && (
                              <DropdownMenuItem onClick={() => handleStatusChange(item, "draft")}>
                                <RotateCcw className="mr-2 h-4 w-4" /> Taslağa Çevir
                              </DropdownMenuItem>
                            )}
                            {canResume && (
                              <DropdownMenuItem onClick={() => handleStatusChange(item, "draft")}>
                                <Play className="mr-2 h-4 w-4" /> Devam Ettir
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => { setDeleteItem(item); setDeleteOpen(true); }}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4 mr-1" /> Önceki
          </Button>
          <span className="text-sm text-muted-foreground">{page + 1} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            Sonraki <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>İçerik Detayı</DialogTitle>
          </DialogHeader>
          {detailItem && (
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-5 pr-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={detailItem.personaAvatar || undefined} />
                      <AvatarFallback>{detailItem.personaName.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{detailItem.personaName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">
                          {PLATFORM_LABELS[detailItem.platform] || detailItem.platform}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {CONTENT_TYPE_CONFIG[detailItem.contentType || "post"]?.label || detailItem.contentType}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Badge className={`${STATUS_CONFIG[detailItem.status || "draft"]?.class || ""}`}>
                    {STATUS_CONFIG[detailItem.status || "draft"]?.label || detailItem.status}
                  </Badge>
                </div>

                <div className="rounded-md border bg-muted/30 p-4">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed">{detailItem.content}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <p className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" /> Oluşturulma
                    </p>
                    <p className="font-medium">{formatDate(detailItem.createdAt)}</p>
                  </div>
                  {detailItem.scheduledAt && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" /> Zamanlanan
                      </p>
                      <p className="font-medium">{formatDate(detailItem.scheduledAt)}</p>
                    </div>
                  )}
                  {detailItem.publishedAt && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <CheckSquare className="h-3.5 w-3.5" /> Yayınlanma
                      </p>
                      <p className="font-medium text-green-600">{formatDate(detailItem.publishedAt)}</p>
                    </div>
                  )}
                  {detailItem.aiGenerated && (
                    <div className="space-y-1">
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Bot className="h-3.5 w-3.5" /> AI Model
                      </p>
                      <p className="font-medium">{detailItem.aiModel || "Belirtilmemiş"}</p>
                    </div>
                  )}
                </div>

                {detailItem.errorMessage && (
                  <div className="rounded-md border border-red-200 bg-red-50 p-3">
                    <p className="text-sm font-medium text-red-700">Hata</p>
                    <p className="text-sm text-red-600 mt-1">{detailItem.errorMessage}</p>
                  </div>
                )}

                {detailItem.aiGenerated && detailItem.aiPrompt && (
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground font-medium">AI Prompt</p>
                    <div className="rounded-md border bg-muted/30 p-3">
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">{detailItem.aiPrompt}</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}
          <DialogFooter>
            {detailItem && (
              <div className="flex gap-2 mr-auto">
                {["draft", "scheduled"].includes(detailItem.status || "") && (
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); openEdit(detailItem); }}>
                    <Pencil className="mr-1.5 h-3.5 w-3.5" /> Düzenle
                  </Button>
                )}
                {["scheduled", "queued"].includes(detailItem.status || "") && (
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "cancelled"); }}>
                    <Ban className="mr-1.5 h-3.5 w-3.5" /> Durdur
                  </Button>
                )}
                {detailItem.status === "scheduled" && (
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "draft"); }}>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" /> Taslağa Çevir
                  </Button>
                )}
                {["cancelled", "failed"].includes(detailItem.status || "") && (
                  <Button variant="outline" size="sm" onClick={() => { setDetailOpen(false); handleStatusChange(detailItem, "draft"); }}>
                    <Play className="mr-1.5 h-3.5 w-3.5" /> Devam Ettir
                  </Button>
                )}
              </div>
            )}
            <Button variant="outline" onClick={() => setDetailOpen(false)}>Kapat</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <AvatarImage src={editItem.personaAvatar || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {editItem.personaName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {editItem.personaName}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={editPlatform} onValueChange={setEditPlatform}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>İçerik Türü</Label>
                  <Select value={editContentType} onValueChange={setEditContentType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((ct) => (
                        <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>İçerik</Label>
                <Textarea value={editContent} onChange={(e) => setEditContent(e.target.value)} rows={6} />
              </div>
              <div className="space-y-2">
                <Label>Zamanlama (opsiyonel)</Label>
                <Input type="datetime-local" value={editScheduledAt} onChange={(e) => setEditScheduledAt(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditItem(null); }}>İptal</Button>
            <Button onClick={handleEdit} disabled={editLoading || !editContent.trim()}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(open) => { setCreateOpen(open); if (!open) resetCreateForm(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni İçerik Ekle</DialogTitle>
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
                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
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
                      <SelectItem key={p} value={p}>{PLATFORM_LABELS[p]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>İçerik Türü</Label>
                <Select value={createContentType} onValueChange={setCreateContentType}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CONTENT_TYPES.map((ct) => (
                      <SelectItem key={ct.value} value={ct.value}>{ct.label}</SelectItem>
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
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreateForm(); }}>İptal</Button>
            <Button
              onClick={handleCreate}
              disabled={createLoading || !createPersonaId || !createPlatform || !createContent.trim()}
            >
              {createLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              <p className="mt-1 text-muted-foreground line-clamp-2">{deleteItem.content}</p>
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

    </div>
  );
}
