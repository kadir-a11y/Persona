"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  draft: { label: "Taslak", class: "bg-gray-100 text-gray-700", icon: FileText },
  scheduled: { label: "Planlandı", class: "bg-blue-100 text-blue-700", icon: Clock },
  published: { label: "Yayınlandı", class: "bg-green-100 text-green-700", icon: CheckCircle },
  failed: { label: "Başarısız", class: "bg-red-100 text-red-700", icon: XCircle },
  cancelled: { label: "İptal", class: "bg-yellow-100 text-yellow-700", icon: AlertTriangle },
};

const CONTENT_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType }> = {
  reply: { label: "Yanıt", icon: MessageSquare },
  comment: { label: "Yorum", icon: MessageSquare },
  post: { label: "Gönderi", icon: PenLine },
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
};

const PAGE_SIZE = 20;

// ── Component ──────────────────────────────────────────────────────────

export default function ContentHistoryTab({ projectId }: { projectId: string }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterPlatform, setFilterPlatform] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

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

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [filterPlatform, filterStatus, filterType]);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "—";
    const d = new Date(dateStr);
    return d.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const truncate = (text: string, max = 140) =>
    text.length > max ? text.slice(0, max) + "…" : text;

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <Select value={filterPlatform} onValueChange={setFilterPlatform}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Platformlar</SelectItem>
            <SelectItem value="twitter">Twitter/X</SelectItem>
            <SelectItem value="instagram">Instagram</SelectItem>
            <SelectItem value="facebook">Facebook</SelectItem>
            <SelectItem value="linkedin">LinkedIn</SelectItem>
            <SelectItem value="tiktok">TikTok</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Durum" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Durumlar</SelectItem>
            <SelectItem value="scheduled">Planlandı</SelectItem>
            <SelectItem value="published">Yayınlandı</SelectItem>
            <SelectItem value="failed">Başarısız</SelectItem>
            <SelectItem value="draft">Taslak</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[130px] h-8 text-sm">
            <SelectValue placeholder="Tür" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Türler</SelectItem>
            <SelectItem value="reply">Yanıt</SelectItem>
            <SelectItem value="comment">Yorum</SelectItem>
            <SelectItem value="post">Gönderi</SelectItem>
            <SelectItem value="like">Beğeni</SelectItem>
            <SelectItem value="retweet">Repost</SelectItem>
            <SelectItem value="quote">Alıntı</SelectItem>
          </SelectContent>
        </Select>

        <span className="text-sm text-muted-foreground ml-auto">
          {total} içerik
        </span>
      </div>

      {/* Content List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Send className="h-8 w-8 mx-auto mb-2 opacity-40" />
            <p>Henüz içerik yok.</p>
            <p className="text-xs mt-1">Workspace&apos;te içerik üretip yayınladığınızda burada görünecek.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const statusCfg = STATUS_CONFIG[item.status || "draft"] || STATUS_CONFIG.draft;
            const typeCfg = CONTENT_TYPE_CONFIG[item.contentType || "post"] || CONTENT_TYPE_CONFIG.post;
            const StatusIcon = statusCfg.icon;
            const TypeIcon = typeCfg.icon;

            return (
              <Card key={item.id} className="hover:shadow-sm transition-shadow">
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
                        <span title="Oluşturulma">
                          {formatDate(item.createdAt)}
                        </span>
                        {item.scheduledAt && (
                          <span className="flex items-center gap-1" title="Planlanan">
                            <Clock className="h-3 w-3" />
                            {formatDate(item.scheduledAt)}
                          </span>
                        )}
                        {item.publishedAt && (
                          <span className="flex items-center gap-1 text-green-600" title="Yayınlanma">
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
          <Button
            variant="outline"
            size="sm"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Önceki
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            Sonraki
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
