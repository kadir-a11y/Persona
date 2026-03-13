"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
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
  Check,
  X,
  CheckCheck,
  Edit3,
  Globe,
  MessageSquare,
  User,
  Filter,
  Zap,
  ChevronRight,
  Clock,
  Sparkles,
  Search,
  Plus,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────

interface FeedItem {
  id: string;
  platform: string;
  sourceUrl: string | null;
  sourceAuthor: string | null;
  content: string;
  sentiment: string;
  reachEstimate: number | null;
  engagementCount: number;
  detectedAt: string;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
  language: string | null;
  country: string | null;
  gender: string | null;
  isActive: boolean;
  tags: { id: string; name: string; color: string }[];
  roles: { id: string; name: string }[];
}

interface WorkspaceResponse {
  id: string;
  personaId: string;
  generatedContent: string;
  editedContent: string | null;
  sentiment: string | null;
  platform: string;
  status: string;
  personaName: string;
  personaAvatar: string | null;
  personaLanguage: string | null;
  personaCountry: string | null;
  errorMessage: string | null;
  scheduledAt: string | null;
}

interface FilterOptions {
  countries: string[];
  languages: string[];
  tags: { id: string; name: string; color: string }[];
  roles: { id: string; name: string }[];
}

// ── Constants ──────────────────────────────────────────────────────────

const INTERACTION_TYPES = [
  { value: "reply", label: "Yanıt", icon: "💬", requiresAI: true },
  { value: "like", label: "Beğeni", icon: "❤️", requiresAI: false },
  { value: "retweet", label: "Repost", icon: "🔁", requiresAI: false },
  { value: "quote", label: "Alıntı", icon: "📝", requiresAI: true },
  { value: "comment", label: "Yorum", icon: "💭", requiresAI: true },
  { value: "post", label: "Post", icon: "📢", requiresAI: true },
] as const;

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter/X",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "bg-green-100 text-green-800",
  negative: "bg-red-100 text-red-800",
  neutral: "bg-gray-100 text-gray-800",
};

const STATUS_COLORS: Record<string, string> = {
  pending_review: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  published: "bg-blue-100 text-blue-800",
  failed: "bg-red-100 text-red-800",
};

const STATUS_LABELS: Record<string, string> = {
  pending_review: "İnceleniyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
  published: "Yayınlandı",
  failed: "Başarısız",
};

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

// ── Main Component ─────────────────────────────────────────────────────

export default function WorkspaceTab({ projectId }: { projectId: string }) {
  // Feed state
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [feedLoading, setFeedLoading] = useState(false);
  const [feedPlatform, setFeedPlatform] = useState("all");
  const [platformCounts, setPlatformCounts] = useState<{ platform: string; count: number }[]>([]);
  const [feedTotal, setFeedTotal] = useState(0);

  // Selection state
  const [selectedFeedItem, setSelectedFeedItem] = useState<FeedItem | null>(null);

  // AI command state
  const [aiCommand, setAiCommand] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("twitter");
  const [interactionType, setInteractionType] = useState("reply");

  // Persona selection state
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [selectedPersonaIds, setSelectedPersonaIds] = useState<Set<string>>(new Set());
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(null);
  const [filterCountry, setFilterCountry] = useState("all");
  const [filterLanguage, setFilterLanguage] = useState("all");
  const [filterTagIds, setFilterTagIds] = useState<string[]>([]);
  const [filterRoleIds, setFilterRoleIds] = useState<string[]>([]);
  const [personaSearch, setPersonaSearch] = useState("");

  // Generation state
  const [generating, setGenerating] = useState(false);
  const [responses, setResponses] = useState<WorkspaceResponse[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  // Publishing state
  const [publishing, setPublishing] = useState(false);

  // Response filter state
  const [responseStatusFilter, setResponseStatusFilter] = useState("all");

  // New content form state
  const [showNewContent, setShowNewContent] = useState(false);
  const [newContent, setNewContent] = useState({
    platform: "twitter",
    content: "",
    sourceUrl: "",
    sourceAuthor: "",
    sentiment: "neutral",
  });
  const [addingContent, setAddingContent] = useState(false);

  // ── Fetch Functions ────────────────────────────────────────────────

  const fetchFeed = useCallback(async () => {
    setFeedLoading(true);
    try {
      const params = new URLSearchParams();
      if (feedPlatform !== "all") params.set("platform", feedPlatform);
      params.set("limit", "30");

      const res = await fetch(`/api/projects/${projectId}/feed?${params}`);
      if (res.ok) {
        const data = await res.json();
        setFeed(data.items);
        setFeedTotal(data.total);
        setPlatformCounts(data.platformCounts?.platforms || []);
      }
    } catch (error) {
      console.error("Feed fetch failed:", error);
    } finally {
      setFeedLoading(false);
    }
  }, [projectId, feedPlatform]);

  const fetchPersonas = useCallback(async () => {
    setPersonasLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCountry !== "all") params.set("country", filterCountry);
      if (filterLanguage !== "all") params.set("language", filterLanguage);
      if (filterTagIds.length > 0) params.set("tagIds", filterTagIds.join(","));
      if (filterRoleIds.length > 0) params.set("roleIds", filterRoleIds.join(","));
      params.set("isActive", "true");

      const res = await fetch(`/api/personas/filter?${params}`);
      if (res.ok) {
        setPersonas(await res.json());
      }
    } catch (error) {
      console.error("Personas fetch failed:", error);
    } finally {
      setPersonasLoading(false);
    }
  }, [filterCountry, filterLanguage, filterTagIds, filterRoleIds]);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const res = await fetch("/api/personas/filter?options=true");
      if (res.ok) {
        setFilterOptions(await res.json());
      }
    } catch (error) {
      console.error("Filter options fetch failed:", error);
    }
  }, []);

  useEffect(() => {
    fetchFeed();
  }, [fetchFeed]);

  useEffect(() => {
    fetchPersonas();
    fetchFilterOptions();
  }, [fetchPersonas, fetchFilterOptions]);

  // ── Actions ────────────────────────────────────────────────────────

  const handleGenerate = async () => {
    if (requiresAI && !aiCommand.trim()) return;
    if (selectedPersonaIds.size === 0) return;
    setGenerating(true);

    try {
      // Create session
      const sessionRes = await fetch(`/api/projects/${projectId}/workspace/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourceContentId: selectedFeedItem?.id || undefined,
          aiCommand: requiresAI ? aiCommand : `${interactionType} action`,
          selectedPersonaIds: Array.from(selectedPersonaIds),
          platform: selectedPlatform,
        }),
      });

      if (!sessionRes.ok) throw new Error("Session creation failed");
      const session = await sessionRes.json();
      setActiveSessionId(session.id);

      // Generate responses
      const genRes = await fetch(
        `/api/projects/${projectId}/workspace/sessions/${session.id}/generate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contentType: interactionType,
          }),
        }
      );

      if (genRes.ok) {
        const generatedResponses = await genRes.json();
        setResponses(generatedResponses);
      }
    } catch (error) {
      console.error("Generation failed:", error);
    } finally {
      setGenerating(false);
    }
  };

  const handleApprove = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}/approve`,
        { method: "POST" }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) => (r.id === responseId ? { ...r, status: "approved" } : r))
        );
      }
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}/reject`,
        { method: "POST" }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) => (r.id === responseId ? { ...r, status: "rejected" } : r))
        );
      }
    } catch (error) {
      console.error("Reject failed:", error);
    }
  };

  const handleBulkApprove = async () => {
    const pendingIds = responses
      .filter((r) => r.status === "pending_review")
      .map((r) => r.id);
    if (pendingIds.length === 0) return;

    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/bulk-approve`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ responseIds: pendingIds }),
        }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) =>
            pendingIds.includes(r.id) ? { ...r, status: "approved" } : r
          )
        );
      }
    } catch (error) {
      console.error("Bulk approve failed:", error);
    }
  };

  const handleSaveEdit = async (responseId: string) => {
    try {
      const res = await fetch(
        `/api/projects/${projectId}/workspace/responses/${responseId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ editedContent: editContent }),
        }
      );
      if (res.ok) {
        setResponses((prev) =>
          prev.map((r) =>
            r.id === responseId ? { ...r, editedContent: editContent } : r
          )
        );
        setEditingId(null);
        setEditContent("");
      }
    } catch (error) {
      console.error("Save edit failed:", error);
    }
  };

  const handlePublish = async () => {
    if (!activeSessionId) return;
    setPublishing(true);

    try {
      const res = await fetch(`/api/projects/${projectId}/workspace/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId,
          staggerMinutes: 5,
        }),
      });

      if (res.ok) {
        const results = await res.json();
        setResponses((prev) =>
          prev.map((r) => {
            const published = results.find(
              (p: { responseId: string }) => p.responseId === r.id
            );
            if (published) {
              return {
                ...r,
                status: "published",
                scheduledAt: published.scheduledAt,
              };
            }
            return r;
          })
        );
      }
    } catch (error) {
      console.error("Publish failed:", error);
    } finally {
      setPublishing(false);
    }
  };

  const handleAddContent = async () => {
    if (!newContent.content.trim()) return;
    setAddingContent(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/feed`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: newContent.platform,
          content: newContent.content,
          sourceUrl: newContent.sourceUrl || undefined,
          sourceAuthor: newContent.sourceAuthor || undefined,
          sentiment: newContent.sentiment,
        }),
      });
      if (res.ok) {
        setNewContent({ platform: "twitter", content: "", sourceUrl: "", sourceAuthor: "", sentiment: "neutral" });
        setShowNewContent(false);
        fetchFeed();
      }
    } catch (error) {
      console.error("Add content failed:", error);
    } finally {
      setAddingContent(false);
    }
  };

  const handleAddMockData = async () => {
    try {
      await fetch(`/api/projects/${projectId}/feed/mock`, { method: "POST" });
      fetchFeed();
    } catch (error) {
      console.error("Mock data failed:", error);
    }
  };

  const togglePersona = (personaId: string) => {
    setSelectedPersonaIds((prev) => {
      const next = new Set(prev);
      if (next.has(personaId)) {
        next.delete(personaId);
      } else {
        next.add(personaId);
      }
      return next;
    });
  };

  const selectAllPersonas = () => {
    const visibleIds = filteredPersonas.map((p) => p.id);
    const allVisibleSelected = visibleIds.every((id) => selectedPersonaIds.has(id));
    if (allVisibleSelected) {
      setSelectedPersonaIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedPersonaIds((prev) => {
        const next = new Set(prev);
        visibleIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  // ── Computed ───────────────────────────────────────────────────────

  const approvedCount = responses.filter((r) => r.status === "approved").length;
  const pendingCount = responses.filter((r) => r.status === "pending_review").length;
  const currentInteraction = INTERACTION_TYPES.find((t) => t.value === interactionType) || INTERACTION_TYPES[0];
  const requiresAI = currentInteraction.requiresAI;
  const failedCount = responses.filter((r) => r.status === "failed").length;
  const publishedCount = responses.filter((r) => r.status === "published").length;
  const rejectedCount = responses.filter((r) => r.status === "rejected").length;

  const filteredResponses = responseStatusFilter === "all"
    ? responses
    : responses.filter((r) => r.status === responseStatusFilter);

  const responseStatusTabs = [
    { value: "all", label: "Tümü", count: responses.length },
    { value: "pending_review", label: "Bekleyen", count: pendingCount },
    { value: "approved", label: "Onaylı", count: approvedCount },
    { value: "rejected", label: "Reddedilen", count: rejectedCount },
    { value: "published", label: "Yayınlanan", count: publishedCount },
    { value: "failed", label: "Başarısız", count: failedCount },
  ];

  const filteredPersonas = personaSearch
    ? personas.filter((p) =>
        p.name.toLowerCase().includes(personaSearch.toLowerCase())
      )
    : personas;

  const activeFilterCount =
    (filterCountry !== "all" ? 1 : 0) +
    (filterLanguage !== "all" ? 1 : 0) +
    filterTagIds.length +
    filterRoleIds.length;

  const clearAllFilters = () => {
    setFilterCountry("all");
    setFilterLanguage("all");
    setFilterTagIds([]);
    setFilterRoleIds([]);
    setPersonaSearch("");
  };

  const toggleTagFilter = (tagId: string) => {
    setFilterTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const toggleRoleFilter = (roleId: string) => {
    setFilterRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId]
    );
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top: Content Feed + Workspace Panel ─────────────────── */}
      <div className="grid gap-4 lg:grid-cols-12">
        {/* Left: Content Feed */}
        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">İçerik Akışı</CardTitle>
                <div className="flex gap-1">
                  <Button
                    variant={showNewContent ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowNewContent(!showNewContent)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Yeni
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleAddMockData}>
                    <Sparkles className="h-3.5 w-3.5 mr-1" />
                    Mock
                  </Button>
                </div>
              </div>
              {/* Platform Filter Tabs */}
              <div className="flex flex-wrap gap-1 mt-2">
                <Button
                  variant={feedPlatform === "all" ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setFeedPlatform("all")}
                >
                  Tümü ({feedTotal})
                </Button>
                {platformCounts.map((pc) => (
                  <Button
                    key={pc.platform}
                    variant={feedPlatform === pc.platform ? "default" : "outline"}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setFeedPlatform(pc.platform)}
                  >
                    {PLATFORM_LABELS[pc.platform] || pc.platform} ({pc.count})
                  </Button>
                ))}
              </div>
            </CardHeader>

            {/* New Content Form */}
            {showNewContent && (
              <CardContent className="border-b pb-3 space-y-2">
                <Select
                  value={newContent.platform}
                  onValueChange={(v) => setNewContent((p) => ({ ...p, platform: v }))}
                >
                  <SelectTrigger className="h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="twitter">Twitter/X</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="facebook">Facebook</SelectItem>
                    <SelectItem value="linkedin">LinkedIn</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                  </SelectContent>
                </Select>
                <Textarea
                  placeholder="İçerik metnini yapıştırın..."
                  value={newContent.content}
                  onChange={(e) => setNewContent((p) => ({ ...p, content: e.target.value }))}
                  rows={3}
                  className="resize-none text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    placeholder="@yazar (opsiyonel)"
                    value={newContent.sourceAuthor}
                    onChange={(e) => setNewContent((p) => ({ ...p, sourceAuthor: e.target.value }))}
                    className="h-7 text-xs flex-1"
                  />
                  <Select
                    value={newContent.sentiment}
                    onValueChange={(v) => setNewContent((p) => ({ ...p, sentiment: v }))}
                  >
                    <SelectTrigger className="h-7 text-xs w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="positive">Olumlu</SelectItem>
                      <SelectItem value="negative">Olumsuz</SelectItem>
                      <SelectItem value="neutral">Nötr</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  placeholder="Kaynak URL (opsiyonel)"
                  value={newContent.sourceUrl}
                  onChange={(e) => setNewContent((p) => ({ ...p, sourceUrl: e.target.value }))}
                  className="h-7 text-xs"
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    className="h-7 text-xs flex-1"
                    onClick={handleAddContent}
                    disabled={addingContent || !newContent.content.trim()}
                  >
                    {addingContent ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      "Ekle"
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowNewContent(false)}
                  >
                    İptal
                  </Button>
                </div>
              </CardContent>
            )}

            <CardContent className="max-h-[500px] overflow-y-auto space-y-2 pt-0">
              {feedLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : feed.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Henüz içerik yok.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={handleAddMockData}
                  >
                    Mock veri ekle
                  </Button>
                </div>
              ) : (
                feed.map((item) => (
                  <div
                    key={item.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedFeedItem?.id === item.id
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedFeedItem(item)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[item.platform] || item.platform}
                      </Badge>
                      <span
                        className={`text-xs px-1.5 py-0.5 rounded ${
                          SENTIMENT_COLORS[item.sentiment] || SENTIMENT_COLORS.neutral
                        }`}
                      >
                        {item.sentiment}
                      </span>
                      <span className="text-xs text-muted-foreground ml-auto">
                        {new Date(item.detectedAt).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{item.content}</p>
                    {item.sourceAuthor && (
                      <p className="text-xs text-muted-foreground mt-1">
                        @{item.sourceAuthor}
                      </p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Workspace Panel (3 sections) */}
        <div className="lg:col-span-9 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Source Content + AI Command */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">
                  {selectedFeedItem ? "Kaynak İçerik" : "Komut Paneli"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {selectedFeedItem && (
                  <div className="p-3 rounded-lg bg-muted/50 border text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {PLATFORM_LABELS[selectedFeedItem.platform]}
                      </Badge>
                      {selectedFeedItem.sourceAuthor && (
                        <span className="text-xs text-muted-foreground">
                          @{selectedFeedItem.sourceAuthor}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto h-6 w-6 p-0"
                        onClick={() => setSelectedFeedItem(null)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm">{selectedFeedItem.content}</p>
                  </div>
                )}

                {/* Interaction Type Selector */}
                <div className="flex flex-wrap gap-1">
                  {INTERACTION_TYPES.map((type) => (
                    <Button
                      key={type.value}
                      variant={interactionType === type.value ? "default" : "outline"}
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setInteractionType(type.value)}
                    >
                      <span className="mr-1">{type.icon}</span>
                      {type.label}
                    </Button>
                  ))}
                </div>

                {/* AI Command - only for types that need AI */}
                {requiresAI ? (
                  <Textarea
                    placeholder="AI'ya talimat verin... (ör: Bu içeriğe olumlu ve destekleyici yanıt yazın)"
                    value={aiCommand}
                    onChange={(e) => setAiCommand(e.target.value)}
                    rows={3}
                    className="resize-none"
                  />
                ) : (
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-700">
                    {interactionType === "like"
                      ? `${selectedPersonaIds.size} persona bu içeriği beğenecek.`
                      : `${selectedPersonaIds.size} persona bu içeriği repost yapacak.`}
                    {" "}AI içerik üretimi gerekmez.
                  </div>
                )}

                <div className="flex gap-2">
                  <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
                    <SelectTrigger className="w-[140px] h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twitter">Twitter/X</SelectItem>
                      <SelectItem value="instagram">Instagram</SelectItem>
                      <SelectItem value="facebook">Facebook</SelectItem>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="tiktok">TikTok</SelectItem>
                    </SelectContent>
                  </Select>

                  <Button
                    onClick={handleGenerate}
                    disabled={
                      generating ||
                      (requiresAI && !aiCommand.trim()) ||
                      selectedPersonaIds.size === 0
                    }
                    className="flex-1 h-8"
                    size="sm"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                        {requiresAI ? "Üretiliyor" : "Planlanıyor"}... ({selectedPersonaIds.size})
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-3.5 w-3.5" />
                        {requiresAI
                          ? `Üret (${selectedPersonaIds.size} persona)`
                          : `Planla (${selectedPersonaIds.size} persona)`}
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Persona Selector */}
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Persona Seçimi ({selectedPersonaIds.size}/{filteredPersonas.length})
                  </CardTitle>
                  <div className="flex items-center gap-1">
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={clearAllFilters}>
                        Temizle
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={selectAllPersonas}>
                      {filteredPersonas.length > 0 && filteredPersonas.every((p) => selectedPersonaIds.has(p.id))
                        ? "Seçimi Kaldır"
                        : "Tümünü Seç"}
                    </Button>
                  </div>
                </div>

                {/* Search */}
                <div className="relative mt-2">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Persona ara..."
                    value={personaSearch}
                    onChange={(e) => setPersonaSearch(e.target.value)}
                    className="h-7 text-xs pl-7"
                  />
                </div>

                {/* Filters Row 1: Country + Language */}
                <div className="flex gap-2 mt-2">
                  <Select value={filterCountry} onValueChange={setFilterCountry}>
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Ülke" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Ülkeler</SelectItem>
                      {filterOptions?.countries.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={filterLanguage} onValueChange={setFilterLanguage}>
                    <SelectTrigger className="h-7 text-xs flex-1">
                      <SelectValue placeholder="Dil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Diller</SelectItem>
                      {filterOptions?.languages.map((l) => (
                        <SelectItem key={l} value={l}>{l}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Filters Row 2: Tags */}
                {filterOptions?.tags && filterOptions.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {filterOptions.tags.map((tag) => (
                      <Badge
                        key={tag.id}
                        variant={filterTagIds.includes(tag.id) ? "default" : "outline"}
                        className="text-xs cursor-pointer h-5 px-1.5"
                        style={
                          filterTagIds.includes(tag.id)
                            ? { backgroundColor: tag.color, borderColor: tag.color }
                            : { borderColor: tag.color, color: tag.color }
                        }
                        onClick={() => toggleTagFilter(tag.id)}
                      >
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Filters Row 3: Roles */}
                {filterOptions?.roles && filterOptions.roles.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {filterOptions.roles.map((role) => (
                      <Badge
                        key={role.id}
                        variant={filterRoleIds.includes(role.id) ? "default" : "outline"}
                        className="text-xs cursor-pointer h-5 px-1.5"
                        onClick={() => toggleRoleFilter(role.id)}
                      >
                        {role.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardHeader>
              <CardContent className="max-h-[300px] overflow-y-auto space-y-1 pt-0">
                {personasLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : filteredPersonas.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {activeFilterCount > 0 || personaSearch
                      ? "Filtreye uygun persona bulunamadı"
                      : "Aktif persona bulunamadı"}
                  </p>
                ) : (
                  filteredPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
                        selectedPersonaIds.has(persona.id)
                          ? "bg-primary/10 border border-primary/20"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => togglePersona(persona.id)}
                    >
                      <Checkbox
                        checked={selectedPersonaIds.has(persona.id)}
                        className="pointer-events-none"
                      />
                      <Avatar className="h-7 w-7">
                        {persona.avatarUrl && (
                          <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                        )}
                        <AvatarFallback className="text-xs">
                          {getInitials(persona.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{persona.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {persona.language} {persona.country && `· ${persona.country}`}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Response Review Panel */}
          {responses.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    Yanıtlar ({responses.length})
                  </CardTitle>
                  <div className="flex gap-2">
                    {pendingCount > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handleBulkApprove}
                      >
                        <CheckCheck className="mr-1 h-3.5 w-3.5" />
                        Tümünü Onayla ({pendingCount})
                      </Button>
                    )}
                    {approvedCount > 0 && (
                      <Button
                        size="sm"
                        className="h-7 text-xs"
                        onClick={handlePublish}
                        disabled={publishing}
                      >
                        {publishing ? (
                          <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Send className="mr-1 h-3.5 w-3.5" />
                        )}
                        Yayınla ({approvedCount})
                      </Button>
                    )}
                  </div>
                </div>

                {/* Mini Stats Bar */}
                <div className="flex gap-3 mt-2">
                  {[
                    { label: "Bekleyen", count: pendingCount, color: "text-yellow-600 bg-yellow-50" },
                    { label: "Onaylı", count: approvedCount, color: "text-green-600 bg-green-50" },
                    { label: "Yayınlanan", count: publishedCount, color: "text-blue-600 bg-blue-50" },
                    { label: "Başarısız", count: failedCount, color: "text-red-600 bg-red-50" },
                  ].filter((s) => s.count > 0).map((stat) => (
                    <div key={stat.label} className={`text-xs px-2 py-1 rounded-md ${stat.color}`}>
                      {stat.count} {stat.label}
                    </div>
                  ))}
                </div>

                {/* Status Filter Tabs */}
                <div className="flex gap-1 mt-2 flex-wrap">
                  {responseStatusTabs
                    .filter((tab) => tab.count > 0 || tab.value === "all")
                    .map((tab) => (
                      <Button
                        key={tab.value}
                        variant={responseStatusFilter === tab.value ? "default" : "outline"}
                        size="sm"
                        className="h-6 text-xs px-2"
                        onClick={() => setResponseStatusFilter(tab.value)}
                      >
                        {tab.label} ({tab.count})
                      </Button>
                    ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-2 max-h-[600px] overflow-y-auto">
                {filteredResponses.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Bu filtreye uygun yanıt yok
                  </p>
                ) : (
                  filteredResponses.map((response) => (
                    <div
                      key={response.id}
                      className={`p-3 rounded-lg border ${
                        response.status === "approved"
                          ? "border-green-200 bg-green-50/50"
                          : response.status === "rejected"
                          ? "border-red-200 bg-red-50/50 opacity-60"
                          : response.status === "published"
                          ? "border-blue-200 bg-blue-50/50"
                          : response.status === "failed"
                          ? "border-red-200 bg-red-50/50"
                          : ""
                      }`}
                    >
                      {/* Response Header */}
                      <div className="flex items-center gap-2 mb-2">
                        <Avatar className="h-6 w-6">
                          {response.personaAvatar && (
                            <AvatarImage
                              src={response.personaAvatar}
                              alt={response.personaName}
                            />
                          )}
                          <AvatarFallback className="text-xs">
                            {getInitials(response.personaName)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                          {response.personaName}
                        </span>
                        {response.personaLanguage && (
                          <span className="text-xs text-muted-foreground">
                            ({response.personaLanguage})
                          </span>
                        )}
                        {response.personaCountry && (
                          <span className="text-xs text-muted-foreground">
                            · {response.personaCountry}
                          </span>
                        )}
                        <Badge
                          className={`ml-auto text-xs ${
                            STATUS_COLORS[response.status] || ""
                          }`}
                        >
                          {STATUS_LABELS[response.status] || response.status}
                        </Badge>
                      </div>

                      {/* Response Content */}
                      {editingId === response.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={3}
                            className="resize-none text-sm"
                          />
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleSaveEdit(response.id)}
                            >
                              Kaydet
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => {
                                setEditingId(null);
                                setEditContent("");
                              }}
                            >
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">
                          {response.editedContent || response.generatedContent}
                        </p>
                      )}

                      {response.errorMessage && (
                        <p className="text-xs text-red-500 mt-1">{response.errorMessage}</p>
                      )}

                      {response.scheduledAt && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(response.scheduledAt).toLocaleString("tr-TR")}
                        </p>
                      )}

                      {/* Response Actions */}
                      {response.status === "pending_review" && (
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleApprove(response.id)}
                          >
                            <Check className="mr-1 h-3 w-3" />
                            Onayla
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleReject(response.id)}
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reddet
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => {
                              setEditingId(response.id);
                              setEditContent(
                                response.editedContent || response.generatedContent
                              );
                            }}
                          >
                            <Edit3 className="mr-1 h-3 w-3" />
                            Düzenle
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
