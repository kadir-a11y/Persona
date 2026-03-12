"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  ArrowLeft,
  Trash2,
  Users,
  ListTodo,
  MessageSquare,
  Clock,
  BarChart3,
  AlertTriangle,
  Shield,
  Eye,
  Radio,
  Target,
  Megaphone,
  TrendingUp,
  TrendingDown,
  Activity,
  ChevronDown,
  ChevronRight,
  Plus,
  User,
  UserCog,
  FolderOpen,
  ExternalLink,
  StickyNote,
  Zap,
  CheckCircle,
  XCircle,
  CircleDot,
  Loader2,
  Filter,
  Search,
  Globe,
  Hash,
  Calendar,
  Info,
  FileText,
  Flag,
  Play,
  Pause,
  RotateCcw,
  Send,
  type LucideIcon,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ── Types ──────────────────────────────────────────────────────────────

interface Project {
  id: string;
  name: string;
  description: string | null;
  type: string;
  severity: string;
  status: string;
  clientName: string | null;
  clientInfo: Record<string, unknown>;
  languages: string[];
  keywords: string[];
  severityScore: number;
  startedAt: string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ProjectStats {
  mentionStats: { sentiment: string; count: number }[];
  platformStats: { platform: string; count: number }[];
  taskStats: { status: string; count: number }[];
  phaseStats: { phase: string; count: number }[];
  teamSize: number;
  pendingResponses: number;
  mentionTrend: { date: string; count: number }[];
}

interface TeamAssignment {
  id: string;
  projectId: string;
  assignmentType: string;
  personaId: string | null;
  roleId: string | null;
  roleCategoryId: string | null;
  teamRole: string;
  isActive: boolean;
  notes: string | null;
  persona?: {
    id: string;
    name: string;
    displayName: string | null;
    avatarUrl: string | null;
  } | null;
  role?: { id: string; name: string; color: string | null } | null;
  roleCategory?: { id: string; name: string; color: string | null } | null;
  resolvedPersonas?: {
    id: string;
    name: string;
    displayName: string | null;
    avatarUrl: string | null;
  }[];
  resolvedCount: number;
}

interface ProjectTask {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  type: string;
  phase: string;
  priority: string;
  status: string;
  assignmentType: string | null;
  assignedPersonaId: string | null;
  assignedRoleId: string | null;
  assignedRoleCategoryId: string | null;
  platform: string | null;
  deadline: string | null;
  completedAt: string | null;
  createdAt: string;
}

interface Mention {
  id: string;
  projectId: string;
  platform: string;
  sourceUrl: string | null;
  sourceAuthor: string | null;
  content: string;
  sentiment: string;
  reachEstimate: number | null;
  engagementCount: number;
  requiresResponse: boolean;
  responseStatus: string;
  assignedPersonaId: string | null;
  detectedAt: string;
}

interface TimelineEvent {
  id: string;
  projectId: string;
  eventType: string;
  title: string;
  description: string | null;
  metadata: Record<string, unknown>;
  severityAtTime: string | null;
  actorType: string;
  actorId: string | null;
  createdAt: string;
}

interface MentionStats {
  dailyTrend: { date: string; count: number }[];
  platformDistribution: { platform: string; count: number }[];
  sentimentDistribution: { sentiment: string; count: number }[];
  pendingResponseCount: number;
  sentimentTrend: { date: string; sentiment: string; count: number }[];
}

interface PersonaItem {
  id: string;
  name: string;
  displayName: string | null;
  avatarUrl: string | null;
}

interface RoleItem {
  id: string;
  name: string;
  color: string | null;
}

interface RoleCategoryItem {
  id: string;
  name: string;
  color: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────

const TYPE_LABELS: Record<string, string> = {
  crisis_management: "Kriz Yönetimi",
  reputation_defense: "İtibar Savunması",
  perception_operation: "Algı Operasyonu",
  monitoring: "İzleme",
};

const TYPE_COLORS: Record<string, string> = {
  crisis_management: "bg-red-100 text-red-700 border-red-200",
  reputation_defense: "bg-blue-100 text-blue-700 border-blue-200",
  perception_operation: "bg-purple-100 text-purple-700 border-purple-200",
  monitoring: "bg-gray-100 text-gray-700 border-gray-200",
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

const TEAM_ROLE_LABELS: Record<string, string> = {
  defender: "Savunucu",
  monitor: "İzleyici",
  amplifier: "Güçlendirici",
  reporter: "Raporcu",
  coordinator: "Koordinatör",
};

const TEAM_ROLE_COLORS: Record<string, string> = {
  defender: "bg-blue-100 text-blue-700 border-blue-200",
  monitor: "bg-gray-100 text-gray-700 border-gray-200",
  amplifier: "bg-purple-100 text-purple-700 border-purple-200",
  reporter: "bg-yellow-100 text-yellow-700 border-yellow-200",
  coordinator: "bg-green-100 text-green-700 border-green-200",
};

const TASK_TYPE_LABELS: Record<string, string> = {
  create_content: "İçerik Oluştur",
  reply: "Yanıtla",
  report: "Raporla",
  monitor: "İzle",
  escalate: "Yükselt",
  analyze: "Analiz Et",
  coordinate: "Koordine Et",
};

const PHASE_LABELS: Record<string, string> = {
  detection: "Tespit",
  analysis: "Analiz",
  response: "Müdahale",
  monitoring: "İzleme",
  resolution: "Çözüm",
};

const PHASE_KEYS = ["detection", "analysis", "response", "monitoring", "resolution"] as const;

const PRIORITY_LABELS: Record<string, string> = {
  urgent: "Acil",
  high: "Yüksek",
  medium: "Orta",
  low: "Düşük",
};

const PRIORITY_COLORS: Record<string, string> = {
  urgent: "bg-red-100 text-red-700 border-red-200",
  high: "bg-orange-100 text-orange-700 border-orange-200",
  medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
  low: "bg-green-100 text-green-700 border-green-200",
};

const TASK_STATUS_LABELS: Record<string, string> = {
  pending: "Bekliyor",
  in_progress: "Devam Ediyor",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

const SENTIMENT_LABELS: Record<string, string> = {
  positive: "Pozitif",
  negative: "Negatif",
  neutral: "Nötr",
};

const SENTIMENT_COLORS: Record<string, string> = {
  positive: "#22c55e",
  negative: "#ef4444",
  neutral: "#6b7280",
};

const RESPONSE_STATUS_LABELS: Record<string, string> = {
  not_needed: "Gerek Yok",
  pending: "Bekliyor",
  assigned: "Atandı",
  responded: "Yanıtlandı",
  ignored: "Yok Sayıldı",
};

const RESPONSE_STATUS_COLORS: Record<string, string> = {
  not_needed: "bg-gray-100 text-gray-700 border-gray-200",
  pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
  assigned: "bg-blue-100 text-blue-700 border-blue-200",
  responded: "bg-green-100 text-green-700 border-green-200",
  ignored: "bg-red-100 text-red-700 border-red-200",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
  youtube: "YouTube",
  reddit: "Reddit",
  forum: "Forum",
  news: "Haber",
  blog: "Blog",
};

const PIE_COLORS = ["#3b82f6", "#ef4444", "#22c55e", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6"];

const TIMELINE_EVENT_ICONS: Record<string, LucideIcon> = {
  incident: AlertTriangle,
  detection: Search,
  team_assigned: Users,
  task_created: ListTodo,
  content_published: Send,
  mention_detected: MessageSquare,
  severity_change: TrendingUp,
  status_change: RotateCcw,
  escalation: Zap,
  resolution: CheckCircle,
  note: StickyNote,
};

const TIMELINE_EVENT_COLORS: Record<string, string> = {
  incident: "text-red-600 bg-red-50 border-red-200",
  detection: "text-blue-600 bg-blue-50 border-blue-200",
  team_assigned: "text-purple-600 bg-purple-50 border-purple-200",
  task_created: "text-yellow-600 bg-yellow-50 border-yellow-200",
  content_published: "text-green-600 bg-green-50 border-green-200",
  mention_detected: "text-orange-600 bg-orange-50 border-orange-200",
  severity_change: "text-red-600 bg-red-50 border-red-200",
  status_change: "text-blue-600 bg-blue-50 border-blue-200",
  escalation: "text-red-600 bg-red-50 border-red-200",
  resolution: "text-green-600 bg-green-50 border-green-200",
  note: "text-gray-600 bg-gray-50 border-gray-200",
};

const TIMELINE_EVENT_LABELS: Record<string, string> = {
  incident: "Olay",
  detection: "Tespit",
  team_assigned: "Ekip Atandı",
  task_created: "Görev Oluşturuldu",
  content_published: "İçerik Yayınlandı",
  mention_detected: "Bahsetme Tespit Edildi",
  severity_change: "Şiddet Değişikliği",
  status_change: "Durum Değişikliği",
  escalation: "Yükseltme",
  resolution: "Çözüm",
  note: "Not",
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

// ── Helpers ────────────────────────────────────────────────────────────

function formatDate(dateStr: string | null) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "short",
  });
}

function formatRelativeTime(dateStr: string) {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Az önce";
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} sa önce`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  return formatDate(dateStr);
}

// ── Page Component ─────────────────────────────────────────────────────

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // Core state
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // Delete confirmation
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Status change
  const [changingStatus, setChangingStatus] = useState(false);

  // Tab data states
  const [stats, setStats] = useState<ProjectStats | null>(null);
  const [mentionStats, setMentionStats] = useState<MentionStats | null>(null);
  const [statsLoaded, setStatsLoaded] = useState(false);

  const [team, setTeam] = useState<TeamAssignment[]>([]);
  const [teamLoaded, setTeamLoaded] = useState(false);
  const [teamLoading, setTeamLoading] = useState(false);

  const [kanbanTasks, setKanbanTasks] = useState<Record<string, ProjectTask[]>>({});
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const [mentions, setMentions] = useState<Mention[]>([]);
  const [mentionsLoaded, setMentionsLoaded] = useState(false);
  const [mentionsLoading, setMentionsLoading] = useState(false);

  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [timelineLoaded, setTimelineLoaded] = useState(false);
  const [timelineLoading, setTimelineLoading] = useState(false);

  // Team dialog
  const [showTeamDialog, setShowTeamDialog] = useState(false);
  const [teamDialogMode, setTeamDialogMode] = useState<"persona" | "role" | "role_category">("persona");
  const [teamDialogLoading, setTeamDialogLoading] = useState(false);
  const [teamFormRole, setTeamFormRole] = useState("monitor");
  const [teamFormSelectedId, setTeamFormSelectedId] = useState("");
  const [teamFormNotes, setTeamFormNotes] = useState("");
  const [personas, setPersonas] = useState<PersonaItem[]>([]);
  const [roles, setRoles] = useState<RoleItem[]>([]);
  const [roleCategories, setRoleCategories] = useState<RoleCategoryItem[]>([]);
  const [expandedTeamIds, setExpandedTeamIds] = useState<Set<string>>(new Set());

  // Task dialog
  const [showTaskDialog, setShowTaskDialog] = useState(false);
  const [taskDialogLoading, setTaskDialogLoading] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    type: "monitor",
    phase: "detection",
    priority: "medium",
    platform: "",
  });

  // Mention dialog
  const [showMentionDialog, setShowMentionDialog] = useState(false);
  const [mentionDialogLoading, setMentionDialogLoading] = useState(false);
  const [mentionForm, setMentionForm] = useState({
    platform: "twitter",
    content: "",
    sourceUrl: "",
    sourceAuthor: "",
    sentiment: "neutral",
    reachEstimate: "",
    requiresResponse: false,
  });

  // Mention filters
  const [mentionFilterPlatform, setMentionFilterPlatform] = useState("all");
  const [mentionFilterSentiment, setMentionFilterSentiment] = useState("all");
  const [mentionFilterResponse, setMentionFilterResponse] = useState("all");

  // Timeline dialog
  const [showTimelineDialog, setShowTimelineDialog] = useState(false);
  const [timelineDialogLoading, setTimelineDialogLoading] = useState(false);
  const [timelineForm, setTimelineForm] = useState({ title: "", description: "" });
  const [timelineFilterType, setTimelineFilterType] = useState("all");

  // ── Fetch Project ────────────────────────────────────────────────────

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProject(data);
      } else if (res.status === 404) {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Failed to fetch project:", error);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // ── Lazy Tab Data Fetching ───────────────────────────────────────────

  const fetchStats = useCallback(async () => {
    if (statsLoaded) return;
    try {
      const [statsRes, mentionStatsRes] = await Promise.all([
        fetch(`/api/projects/${id}/stats`),
        fetch(`/api/projects/${id}/mentions/stats`),
      ]);
      if (statsRes.ok) setStats(await statsRes.json());
      if (mentionStatsRes.ok) setMentionStats(await mentionStatsRes.json());
      setStatsLoaded(true);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    }
  }, [id, statsLoaded]);

  const fetchTeam = useCallback(async () => {
    setTeamLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/team`);
      if (res.ok) {
        setTeam(await res.json());
        setTeamLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch team:", error);
    } finally {
      setTeamLoading(false);
    }
  }, [id]);

  const fetchKanbanTasks = useCallback(async () => {
    setTasksLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/tasks/kanban`);
      if (res.ok) {
        setKanbanTasks(await res.json());
        setTasksLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setTasksLoading(false);
    }
  }, [id]);

  const fetchMentions = useCallback(async () => {
    setMentionsLoading(true);
    try {
      const params = new URLSearchParams();
      if (mentionFilterPlatform !== "all") params.set("platform", mentionFilterPlatform);
      if (mentionFilterSentiment !== "all") params.set("sentiment", mentionFilterSentiment);
      if (mentionFilterResponse !== "all") params.set("responseStatus", mentionFilterResponse);
      const res = await fetch(`/api/projects/${id}/mentions?${params.toString()}`);
      if (res.ok) {
        setMentions(await res.json());
        setMentionsLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch mentions:", error);
    } finally {
      setMentionsLoading(false);
    }
  }, [id, mentionFilterPlatform, mentionFilterSentiment, mentionFilterResponse]);

  const fetchTimeline = useCallback(async () => {
    setTimelineLoading(true);
    try {
      const params = new URLSearchParams();
      if (timelineFilterType !== "all") params.set("eventType", timelineFilterType);
      const res = await fetch(`/api/projects/${id}/timeline?${params.toString()}`);
      if (res.ok) {
        setTimeline(await res.json());
        setTimelineLoaded(true);
      }
    } catch (error) {
      console.error("Failed to fetch timeline:", error);
    } finally {
      setTimelineLoading(false);
    }
  }, [id, timelineFilterType]);

  // Lazy load on tab change
  useEffect(() => {
    if (activeTab === "overview" && !statsLoaded) fetchStats();
    if (activeTab === "team" && !teamLoaded) fetchTeam();
    if (activeTab === "tasks" && !tasksLoaded) fetchKanbanTasks();
    if (activeTab === "mentions") fetchMentions();
    if (activeTab === "timeline") fetchTimeline();
  }, [activeTab, statsLoaded, teamLoaded, tasksLoaded, fetchStats, fetchTeam, fetchKanbanTasks, fetchMentions, fetchTimeline]);

  // ── Actions ──────────────────────────────────────────────────────────

  async function handleStatusChange(newStatus: string) {
    setChangingStatus(true);
    try {
      const res = await fetch(`/api/projects/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setProject(updated);
      }
    } catch (error) {
      console.error("Failed to change status:", error);
    } finally {
      setChangingStatus(false);
    }
  }

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.push("/projects");
      }
    } catch (error) {
      console.error("Failed to delete project:", error);
    } finally {
      setDeleting(false);
    }
  }

  // Team actions
  async function handleAddTeamMember() {
    if (!teamFormSelectedId) return;
    setTeamDialogLoading(true);
    try {
      const body: Record<string, unknown> = {
        assignmentType: teamDialogMode,
        teamRole: teamFormRole,
        notes: teamFormNotes || undefined,
      };
      if (teamDialogMode === "persona") body.personaId = teamFormSelectedId;
      if (teamDialogMode === "role") body.roleId = teamFormSelectedId;
      if (teamDialogMode === "role_category") body.roleCategoryId = teamFormSelectedId;

      const res = await fetch(`/api/projects/${id}/team`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowTeamDialog(false);
        resetTeamForm();
        await fetchTeam();
      }
    } catch (error) {
      console.error("Failed to add team member:", error);
    } finally {
      setTeamDialogLoading(false);
    }
  }

  async function handleRemoveTeamMember(teamId: string) {
    try {
      const res = await fetch(`/api/projects/${id}/team/${teamId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTeam((prev) => prev.filter((t) => t.id !== teamId));
      }
    } catch (error) {
      console.error("Failed to remove team member:", error);
    }
  }

  function resetTeamForm() {
    setTeamDialogMode("persona");
    setTeamFormRole("monitor");
    setTeamFormSelectedId("");
    setTeamFormNotes("");
  }

  // Task actions
  async function handleCreateTask() {
    if (!taskForm.title) return;
    setTaskDialogLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: taskForm.title,
        description: taskForm.description || undefined,
        type: taskForm.type,
        phase: taskForm.phase,
        priority: taskForm.priority,
        platform: taskForm.platform || undefined,
      };
      const res = await fetch(`/api/projects/${id}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowTaskDialog(false);
        setTaskForm({ title: "", description: "", type: "monitor", phase: "detection", priority: "medium", platform: "" });
        await fetchKanbanTasks();
      }
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setTaskDialogLoading(false);
    }
  }

  async function handleChangeTaskStatus(taskId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/projects/${id}/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "changeStatus", status: newStatus }),
      });
      if (res.ok) {
        await fetchKanbanTasks();
      }
    } catch (error) {
      console.error("Failed to change task status:", error);
    }
  }

  // Mention actions
  async function handleCreateMention() {
    if (!mentionForm.content) return;
    setMentionDialogLoading(true);
    try {
      const body: Record<string, unknown> = {
        platform: mentionForm.platform,
        content: mentionForm.content,
        sourceUrl: mentionForm.sourceUrl || undefined,
        sourceAuthor: mentionForm.sourceAuthor || undefined,
        sentiment: mentionForm.sentiment,
        reachEstimate: mentionForm.reachEstimate ? parseInt(mentionForm.reachEstimate) : undefined,
        requiresResponse: mentionForm.requiresResponse,
      };
      const res = await fetch(`/api/projects/${id}/mentions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowMentionDialog(false);
        setMentionForm({ platform: "twitter", content: "", sourceUrl: "", sourceAuthor: "", sentiment: "neutral", reachEstimate: "", requiresResponse: false });
        await fetchMentions();
      }
    } catch (error) {
      console.error("Failed to create mention:", error);
    } finally {
      setMentionDialogLoading(false);
    }
  }

  // Timeline actions
  async function handleAddNote() {
    if (!timelineForm.title) return;
    setTimelineDialogLoading(true);
    try {
      const res = await fetch(`/api/projects/${id}/timeline`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventType: "note",
          title: timelineForm.title,
          description: timelineForm.description || undefined,
        }),
      });
      if (res.ok) {
        setShowTimelineDialog(false);
        setTimelineForm({ title: "", description: "" });
        await fetchTimeline();
      }
    } catch (error) {
      console.error("Failed to add note:", error);
    } finally {
      setTimelineDialogLoading(false);
    }
  }

  // Fetch reference data for team dialog
  async function openTeamDialog() {
    setShowTeamDialog(true);
    resetTeamForm();
    try {
      const [personaRes, rolesRes, catRes] = await Promise.all([
        fetch("/api/personas"),
        fetch("/api/roles"),
        fetch("/api/role-categories"),
      ]);
      if (personaRes.ok) setPersonas(await personaRes.json());
      if (rolesRes.ok) setRoles(await rolesRes.json());
      if (catRes.ok) setRoleCategories(await catRes.json());
    } catch (error) {
      console.error("Failed to fetch reference data:", error);
    }
  }

  // ── Loading / Not Found ──────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground mr-2" />
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Proje bulunamadı.</p>
      </div>
    );
  }

  // ── Computed values ──────────────────────────────────────────────────

  const totalMentions = stats?.mentionStats.reduce((s, m) => s + m.count, 0) ?? 0;
  const negativeMentions = stats?.mentionStats.find((m) => m.sentiment === "negative")?.count ?? 0;
  const negativeRatio = totalMentions > 0 ? Math.round((negativeMentions / totalMentions) * 100) : 0;
  const activeTasks = stats?.taskStats.filter((t) => t.status === "pending" || t.status === "in_progress").reduce((s, t) => s + t.count, 0) ?? 0;
  const teamSize = stats?.teamSize ?? 0;

  // ── Render ───────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── Top Bar ──────────────────────────────────────────────────── */}
      <div>
        <Button variant="ghost" size="sm" className="mb-4" asChild>
          <Link href="/projects">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projeler
          </Link>
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
            <Badge variant="outline" className={TYPE_COLORS[project.type] || ""}>
              {TYPE_LABELS[project.type] || project.type}
            </Badge>
            <Badge variant="outline" className={SEVERITY_COLORS[project.severity] || ""}>
              {SEVERITY_LABELS[project.severity] || project.severity}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={project.status}
              onValueChange={handleStatusChange}
              disabled={changingStatus}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {project.description && (
          <p className="text-muted-foreground mt-2 max-w-3xl">{project.description}</p>
        )}
      </div>

      <Separator />

      {/* ── Tabs ─────────────────────────────────────────────────────── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Genel Bakış</span>
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Ekip</span>
          </TabsTrigger>
          <TabsTrigger value="tasks" className="gap-2">
            <ListTodo className="h-4 w-4" />
            <span className="hidden sm:inline">Görevler</span>
          </TabsTrigger>
          <TabsTrigger value="mentions" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden sm:inline">Bahsetmeler</span>
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Zaman Çizelgesi</span>
          </TabsTrigger>
        </TabsList>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 1: GENEL BAKIŞ (Overview)                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="overview" className="space-y-6">
          {!statsLoaded ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">İstatistikler yükleniyor...</p>
            </div>
          ) : (
            <>
              {/* Stat Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Toplam Bahsetme</CardTitle>
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{totalMentions}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Negatif Oran</CardTitle>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">%{negativeRatio}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Aktif Görevler</CardTitle>
                    <ListTodo className="h-4 w-4 text-blue-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{activeTasks}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ekip Büyüklüğü</CardTitle>
                    <Users className="h-4 w-4 text-purple-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{teamSize}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Severity Score */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Şiddet Skoru</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-muted overflow-hidden">
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
                          style={{ width: `${project.severityScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-2xl font-bold min-w-[3rem] text-right">
                      {project.severityScore}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Conversation Intensity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Konuşma Yoğunluğu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.mentionTrend && stats.mentionTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={stats.mentionTrend}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={formatShortDate}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip
                            labelFormatter={(label) => formatShortDate(label as string)}
                          />
                          <Area
                            type="monotone"
                            dataKey="count"
                            stroke="#3b82f6"
                            fill="#3b82f6"
                            fillOpacity={0.2}
                            name="Bahsetme"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Henüz veri yok
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Platform Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Platform Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.platformStats && stats.platformStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={stats.platformStats}
                            dataKey="count"
                            nameKey="platform"
                            cx="50%"
                            cy="50%"
                            outerRadius={80}
                            label={({ platform, count }) =>
                              `${PLATFORM_LABELS[platform] || platform}: ${count}`
                            }
                          >
                            {stats.platformStats.map((_, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number, name: string) => [
                              value,
                              PLATFORM_LABELS[name] || name,
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Henüz veri yok
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sentiment Chart & Project Info */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Sentiment Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Duygu Dağılımı</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats?.mentionStats && stats.mentionStats.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={stats.mentionStats}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="sentiment"
                            tickFormatter={(val) => SENTIMENT_LABELS[val] || val}
                            fontSize={12}
                          />
                          <YAxis fontSize={12} />
                          <Tooltip
                            labelFormatter={(label) => SENTIMENT_LABELS[label as string] || label}
                          />
                          <Legend
                            formatter={() => "Bahsetme Sayısı"}
                          />
                          <Bar dataKey="count" name="Bahsetme Sayısı">
                            {stats.mentionStats.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={SENTIMENT_COLORS[entry.sentiment] || "#6b7280"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        Henüz veri yok
                      </p>
                    )}
                  </CardContent>
                </Card>

                {/* Project Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Proje Bilgileri</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-4 w-4 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">Müşteri</p>
                        <p className="text-sm text-muted-foreground">
                          {project.clientName || "-"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Diller</p>
                        {project.languages && project.languages.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {project.languages.map((code) => (
                              <Badge key={code} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
                                {LANGUAGE_NAMES[code] || code}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Hash className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Anahtar Kelimeler</p>
                        {project.keywords && project.keywords.length > 0 ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {project.keywords.map((kw, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {kw}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">-</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Tarihler</p>
                        <p className="text-sm text-muted-foreground">
                          Başlangıç: {formatDate(project.startedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Çözüm: {formatDate(project.resolvedAt)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Oluşturma: {formatDate(project.createdAt)}
                        </p>
                      </div>
                    </div>
                    {stats?.pendingResponses !== undefined && stats.pendingResponses > 0 && (
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0" />
                        <div>
                          <p className="text-sm font-medium">Bekleyen Yanıtlar</p>
                          <p className="text-sm text-muted-foreground">
                            {stats.pendingResponses} yanıt bekleniyor
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 2: EKIP (Team)                                         */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="team" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Ekip Üyeleri</h2>
            <Button onClick={openTeamDialog} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Ekip Üyesi Ekle
            </Button>
          </div>

          {teamLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Ekip yükleniyor...</p>
            </div>
          ) : team.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz ekip üyesi eklenmemiş.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {team.map((assignment) => {
                const isExpanded = expandedTeamIds.has(assignment.id);
                const hasResolved =
                  (assignment.assignmentType === "role" || assignment.assignmentType === "role_category") &&
                  assignment.resolvedPersonas &&
                  assignment.resolvedPersonas.length > 0;

                return (
                  <Card key={assignment.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {/* Expand toggle for role/category */}
                          {hasResolved ? (
                            <button
                              onClick={() => {
                                const next = new Set(expandedTeamIds);
                                if (isExpanded) next.delete(assignment.id);
                                else next.add(assignment.id);
                                setExpandedTeamIds(next);
                              }}
                              className="p-1 hover:bg-muted rounded"
                            >
                              {isExpanded ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )}
                            </button>
                          ) : (
                            <div className="w-6" />
                          )}

                          {/* Type icon */}
                          {assignment.assignmentType === "persona" ? (
                            <User className="h-5 w-5 text-blue-500" />
                          ) : assignment.assignmentType === "role" ? (
                            <UserCog className="h-5 w-5 text-purple-500" />
                          ) : (
                            <FolderOpen className="h-5 w-5 text-orange-500" />
                          )}

                          {/* Name */}
                          <div>
                            <p className="font-medium">
                              {assignment.assignmentType === "persona"
                                ? assignment.persona?.displayName || assignment.persona?.name || "Bilinmeyen Persona"
                                : assignment.assignmentType === "role"
                                ? assignment.role?.name || "Bilinmeyen Rol"
                                : assignment.roleCategory?.name || "Bilinmeyen Kategori"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {assignment.assignmentType === "persona"
                                ? "Persona"
                                : assignment.assignmentType === "role"
                                ? "Rol"
                                : "Kategori"}
                              {assignment.resolvedCount > 0 && ` (${assignment.resolvedCount} persona)`}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge
                            variant="outline"
                            className={TEAM_ROLE_COLORS[assignment.teamRole] || ""}
                          >
                            {TEAM_ROLE_LABELS[assignment.teamRole] || assignment.teamRole}
                          </Badge>
                          {!assignment.isActive && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-500">
                              Pasif
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleRemoveTeamMember(assignment.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes */}
                      {assignment.notes && (
                        <p className="text-sm text-muted-foreground mt-2 ml-12">
                          {assignment.notes}
                        </p>
                      )}

                      {/* Expanded resolved personas */}
                      {isExpanded && hasResolved && (
                        <div className="mt-3 ml-12 space-y-2">
                          <Separator />
                          <p className="text-xs font-medium text-muted-foreground mt-2">
                            Eşleşen Personalar ({assignment.resolvedCount})
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {assignment.resolvedPersonas!.map((p) => (
                              <div
                                key={p.id}
                                className="flex items-center gap-2 p-2 rounded-md bg-muted/50"
                              >
                                {p.avatarUrl ? (
                                  <img
                                    src={p.avatarUrl}
                                    alt={p.name}
                                    className="h-6 w-6 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                                    <User className="h-3 w-3" />
                                  </div>
                                )}
                                <span className="text-sm truncate">
                                  {p.displayName || p.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 3: GÖREVLER (Tasks) - Kanban Board                     */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="tasks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Görev Panosu</h2>
            <Button onClick={() => setShowTaskDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Yeni Görev
            </Button>
          </div>

          {tasksLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Görevler yükleniyor...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {PHASE_KEYS.map((phase) => {
                const phaseTasks = kanbanTasks[phase] || [];
                return (
                  <div key={phase} className="space-y-3">
                    {/* Column header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        {PHASE_LABELS[phase]}
                      </h3>
                      <Badge variant="secondary" className="text-xs">
                        {phaseTasks.length}
                      </Badge>
                    </div>
                    <Separator />

                    {/* Task cards */}
                    <div className="space-y-2 min-h-[100px]">
                      {phaseTasks.length === 0 ? (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          Görev yok
                        </p>
                      ) : (
                        phaseTasks.map((task) => (
                          <Card key={task.id} className="shadow-sm">
                            <CardContent className="p-3 space-y-2">
                              <p className="text-sm font-medium leading-tight">
                                {task.title}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                <Badge
                                  variant="outline"
                                  className={`text-xs ${PRIORITY_COLORS[task.priority] || ""}`}
                                >
                                  {PRIORITY_LABELS[task.priority] || task.priority}
                                </Badge>
                                <Badge variant="secondary" className="text-xs">
                                  {TASK_TYPE_LABELS[task.type] || task.type}
                                </Badge>
                              </div>
                              {task.platform && (
                                <p className="text-xs text-muted-foreground">
                                  {PLATFORM_LABELS[task.platform] || task.platform}
                                </p>
                              )}
                              {/* Status buttons */}
                              <div className="flex gap-1 pt-1">
                                {task.status !== "pending" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleChangeTaskStatus(task.id, "pending")}
                                  >
                                    <Pause className="h-3 w-3 mr-1" />
                                    Bekle
                                  </Button>
                                )}
                                {task.status !== "in_progress" && task.status !== "completed" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleChangeTaskStatus(task.id, "in_progress")}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Başla
                                  </Button>
                                )}
                                {task.status === "in_progress" && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-6 px-2 text-xs text-green-600"
                                    onClick={() => handleChangeTaskStatus(task.id, "completed")}
                                  >
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Bitir
                                  </Button>
                                )}
                              </div>
                              {/* Status indicator */}
                              <div className="flex items-center gap-1">
                                <CircleDot
                                  className={`h-3 w-3 ${
                                    task.status === "completed"
                                      ? "text-green-500"
                                      : task.status === "in_progress"
                                      ? "text-blue-500"
                                      : task.status === "cancelled"
                                      ? "text-red-500"
                                      : "text-gray-400"
                                  }`}
                                />
                                <span className="text-xs text-muted-foreground">
                                  {TASK_STATUS_LABELS[task.status] || task.status}
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 4: BAHSETMELER (Mentions)                              */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="mentions" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Bahsetmeler</h2>
            <Button onClick={() => setShowMentionDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Bahsetme Ekle
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <Select value={mentionFilterPlatform} onValueChange={setMentionFilterPlatform}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Platformlar</SelectItem>
                {Object.entries(PLATFORM_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mentionFilterSentiment} onValueChange={setMentionFilterSentiment}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Duygu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Duygular</SelectItem>
                {Object.entries(SENTIMENT_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={mentionFilterResponse} onValueChange={setMentionFilterResponse}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Yanıt Durumu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Durumlar</SelectItem>
                {Object.entries(RESPONSE_STATUS_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {mentionsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Bahsetmeler yükleniyor...</p>
            </div>
          ) : mentions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz bahsetme yok.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {mentions.map((mention) => (
                <Card key={mention.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs">
                            {PLATFORM_LABELS[mention.platform] || mention.platform}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs"
                            style={{
                              borderColor: SENTIMENT_COLORS[mention.sentiment],
                              color: SENTIMENT_COLORS[mention.sentiment],
                            }}
                          >
                            {SENTIMENT_LABELS[mention.sentiment] || mention.sentiment}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={`text-xs ${RESPONSE_STATUS_COLORS[mention.responseStatus] || ""}`}
                          >
                            {RESPONSE_STATUS_LABELS[mention.responseStatus] || mention.responseStatus}
                          </Badge>
                        </div>

                        <p className="text-sm leading-relaxed line-clamp-3">
                          {mention.content}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {mention.sourceAuthor && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {mention.sourceAuthor}
                            </span>
                          )}
                          {mention.reachEstimate !== null && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" />
                              {mention.reachEstimate.toLocaleString("tr-TR")} erişim
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {mention.engagementCount} etkileşim
                          </span>
                          <span>{formatRelativeTime(mention.detectedAt)}</span>
                        </div>
                      </div>

                      {mention.sourceUrl && (
                        <a
                          href={mention.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="shrink-0"
                        >
                          <ExternalLink className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ════════════════════════════════════════════════════════════ */}
        {/* TAB 5: ZAMAN ÇİZELGESİ (Timeline)                          */}
        {/* ════════════════════════════════════════════════════════════ */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Zaman Çizelgesi</h2>
            <Button onClick={() => setShowTimelineDialog(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Not Ekle
            </Button>
          </div>

          {/* Filter */}
          <Select value={timelineFilterType} onValueChange={setTimelineFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Olay Tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm Olaylar</SelectItem>
              {Object.entries(TIMELINE_EVENT_LABELS).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {timelineLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mr-2" />
              <p className="text-sm text-muted-foreground">Zaman çizelgesi yükleniyor...</p>
            </div>
          ) : timeline.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Clock className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Henüz olay yok.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-border" />

              <div className="space-y-6">
                {timeline.map((event) => {
                  const IconComponent = TIMELINE_EVENT_ICONS[event.eventType] || Info;
                  const colorClass = TIMELINE_EVENT_COLORS[event.eventType] || "text-gray-600 bg-gray-50 border-gray-200";

                  return (
                    <div key={event.id} className="relative flex gap-4">
                      {/* Icon bubble */}
                      <div
                        className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 ${colorClass}`}
                      >
                        <IconComponent className="h-4 w-4" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 pt-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-sm">{event.title}</p>
                          {event.severityAtTime && (
                            <Badge
                              variant="outline"
                              className={`text-xs ${SEVERITY_COLORS[event.severityAtTime] || ""}`}
                            >
                              {SEVERITY_LABELS[event.severityAtTime] || event.severityAtTime}
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-xs">
                            {TIMELINE_EVENT_LABELS[event.eventType] || event.eventType}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {event.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatRelativeTime(event.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* ══════════════════════════════════════════════════════════════ */}
      {/* DIALOGS                                                       */}
      {/* ══════════════════════════════════════════════════════════════ */}

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Projeyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              &ldquo;{project.name}&rdquo; projesini silmek istediğinize emin misiniz?
              Bu işlem geri alınamaz. Tüm ekip atamaları, görevler, bahsetmeler ve
              zaman çizelgesi verileri silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Add Team Member Dialog */}
      <Dialog open={showTeamDialog} onOpenChange={setShowTeamDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Ekip Üyesi Ekle</DialogTitle>
            <DialogDescription>
              Projeye persona, rol veya kategori bazli atama yapin.
            </DialogDescription>
          </DialogHeader>

          {/* Mode tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            <button
              onClick={() => { setTeamDialogMode("persona"); setTeamFormSelectedId(""); }}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                teamDialogMode === "persona" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <User className="h-4 w-4 inline mr-1" />
              Persona
            </button>
            <button
              onClick={() => { setTeamDialogMode("role"); setTeamFormSelectedId(""); }}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                teamDialogMode === "role" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCog className="h-4 w-4 inline mr-1" />
              Rol
            </button>
            <button
              onClick={() => { setTeamDialogMode("role_category"); setTeamFormSelectedId(""); }}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                teamDialogMode === "role_category" ? "bg-background shadow-sm font-medium" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <FolderOpen className="h-4 w-4 inline mr-1" />
              Kategori
            </button>
          </div>

          <div className="space-y-4">
            {/* Selection */}
            <div className="space-y-2">
              <Label>
                {teamDialogMode === "persona" ? "Persona" : teamDialogMode === "role" ? "Rol" : "Kategori"}
              </Label>
              <Select value={teamFormSelectedId} onValueChange={setTeamFormSelectedId}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin..." />
                </SelectTrigger>
                <SelectContent>
                  {teamDialogMode === "persona" &&
                    personas.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.displayName || p.name}
                      </SelectItem>
                    ))}
                  {teamDialogMode === "role" &&
                    roles.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  {teamDialogMode === "role_category" &&
                    roleCategories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Team Role */}
            <div className="space-y-2">
              <Label>Ekip Rolü</Label>
              <Select value={teamFormRole} onValueChange={setTeamFormRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(TEAM_ROLE_LABELS).map(([val, label]) => (
                    <SelectItem key={val} value={val}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label>Notlar (opsiyonel)</Label>
              <Textarea
                value={teamFormNotes}
                onChange={(e) => setTeamFormNotes(e.target.value)}
                placeholder="Atama ile ilgili notlar..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTeamDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddTeamMember}
              disabled={!teamFormSelectedId || teamDialogLoading}
            >
              {teamDialogLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Task Dialog */}
      <Dialog open={showTaskDialog} onOpenChange={setShowTaskDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Yeni Görev</DialogTitle>
            <DialogDescription>
              Proje için yeni bir görev oluşturun.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Başlık *</Label>
              <Input
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                placeholder="Görev başlığı..."
              />
            </div>

            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={taskForm.description}
                onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                placeholder="Görev açıklaması..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tip</Label>
                <Select
                  value={taskForm.type}
                  onValueChange={(v) => setTaskForm({ ...taskForm, type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(TASK_TYPE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Faz</Label>
                <Select
                  value={taskForm.phase}
                  onValueChange={(v) => setTaskForm({ ...taskForm, phase: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PHASE_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select
                  value={taskForm.priority}
                  onValueChange={(v) => setTaskForm({ ...taskForm, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PRIORITY_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={taskForm.platform || "none"}
                  onValueChange={(v) => setTaskForm({ ...taskForm, platform: v === "none" ? "" : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Belirtilmemiş</SelectItem>
                    {Object.entries(PLATFORM_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateTask}
              disabled={!taskForm.title || taskDialogLoading}
            >
              {taskDialogLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                "Oluştur"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Mention Dialog */}
      <Dialog open={showMentionDialog} onOpenChange={setShowMentionDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Bahsetme Ekle</DialogTitle>
            <DialogDescription>
              Manuel olarak bir bahsetme kaydı ekleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Platform *</Label>
                <Select
                  value={mentionForm.platform}
                  onValueChange={(v) => setMentionForm({ ...mentionForm, platform: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PLATFORM_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duygu</Label>
                <Select
                  value={mentionForm.sentiment}
                  onValueChange={(v) => setMentionForm({ ...mentionForm, sentiment: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SENTIMENT_LABELS).map(([val, label]) => (
                      <SelectItem key={val} value={val}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>İçerik *</Label>
              <Textarea
                value={mentionForm.content}
                onChange={(e) => setMentionForm({ ...mentionForm, content: e.target.value })}
                placeholder="Bahsetme içeriği..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kaynak URL</Label>
                <Input
                  value={mentionForm.sourceUrl}
                  onChange={(e) => setMentionForm({ ...mentionForm, sourceUrl: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Yazar</Label>
                <Input
                  value={mentionForm.sourceAuthor}
                  onChange={(e) => setMentionForm({ ...mentionForm, sourceAuthor: e.target.value })}
                  placeholder="Kullanıcı adı..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tahmini Erişim</Label>
                <Input
                  type="number"
                  value={mentionForm.reachEstimate}
                  onChange={(e) => setMentionForm({ ...mentionForm, reachEstimate: e.target.value })}
                  placeholder="0"
                />
              </div>
              <div className="space-y-2 flex items-end">
                <label className="flex items-center gap-2 cursor-pointer pb-2">
                  <input
                    type="checkbox"
                    checked={mentionForm.requiresResponse}
                    onChange={(e) => setMentionForm({ ...mentionForm, requiresResponse: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">Yanıt Gerekiyor</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMentionDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleCreateMention}
              disabled={!mentionForm.content || mentionDialogLoading}
            >
              {mentionDialogLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Timeline Note Dialog */}
      <Dialog open={showTimelineDialog} onOpenChange={setShowTimelineDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Not Ekle</DialogTitle>
            <DialogDescription>
              Zaman çizelgesine bir not ekleyin.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Başlık *</Label>
              <Input
                value={timelineForm.title}
                onChange={(e) => setTimelineForm({ ...timelineForm, title: e.target.value })}
                placeholder="Not başlığı..."
              />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={timelineForm.description}
                onChange={(e) => setTimelineForm({ ...timelineForm, description: e.target.value })}
                placeholder="Detaylar..."
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTimelineDialog(false)}>
              İptal
            </Button>
            <Button
              onClick={handleAddNote}
              disabled={!timelineForm.title || timelineDialogLoading}
            >
              {timelineDialogLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Ekleniyor...
                </>
              ) : (
                "Ekle"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
