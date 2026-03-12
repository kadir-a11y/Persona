"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  FileText,
  CheckCircle,
  Megaphone,
  Loader2,
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  Eye,
  TrendingUp,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ContentStatItem {
  status: string;
  count: number;
}

interface ActivityLogItem {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  createdAt: string;
}

interface ActivityStatItem {
  date: string;
  count: number;
}

interface CampaignStatItem {
  status: string;
  count: number;
}

interface AnalyticsData {
  personaCount: number;
  contentStats: ContentStatItem[];
  recentActivity: ActivityLogItem[];
  activityStats: ActivityStatItem[];
  campaignStats: CampaignStatItem[];
}

interface PlatformBreakdownItem {
  platform: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  reach: number;
}

interface TopContentItem {
  contentItemId: string;
  platform: string;
  contentText: string | null;
  personaName: string | null;
  totalEngagement: number;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  avgRate: string;
}

interface DailyTrendItem {
  date: string;
  likes: number;
  comments: number;
  shares: number;
  views: number;
  reach: number;
}

interface EngagementData {
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalViews: number;
  totalReach: number;
  avgEngagementRate: string;
  platformBreakdown: PlatformBreakdownItem[];
  topContent: TopContentItem[];
  dailyTrend: DailyTrendItem[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUS_COLORS: Record<string, string> = {
  draft: "#94a3b8",
  scheduled: "#3b82f6",
  publishing: "#f59e0b",
  published: "#22c55e",
  failed: "#ef4444",
};

const PIE_COLORS = ["#94a3b8", "#3b82f6", "#f59e0b", "#22c55e", "#ef4444", "#8b5cf6"];

const ACTION_LABELS: Record<string, string> = {
  created: "Oluşturuldu",
  updated: "Güncellendi",
  deleted: "Silindi",
  executed: "Çalıştırıldı",
  scheduled: "Zamanlanmış",
};

const ENTITY_LABELS: Record<string, string> = {
  persona: "Persona",
  content: "İçerik",
  campaign: "Kampanya",
  tag: "Etiket",
};

const PLATFORM_LABELS: Record<string, string> = {
  twitter: "Twitter / X",
  instagram: "Instagram",
  facebook: "Facebook",
  linkedin: "LinkedIn",
  tiktok: "TikTok",
};

const PLATFORM_COLORS: Record<string, string> = {
  twitter: "#1DA1F2",
  instagram: "#E4405F",
  facebook: "#1877F2",
  linkedin: "#0A66C2",
  tiktok: "#000000",
};

const ENGAGEMENT_CHART_COLORS = {
  likes: "#ef4444",
  comments: "#3b82f6",
  shares: "#22c55e",
  views: "#f59e0b",
  reach: "#8b5cf6",
};

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function StatCardSkeleton() {
  return (
    <Card className="animate-pulse">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 w-24 rounded bg-muted" />
        <div className="h-4 w-4 rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-8 w-16 rounded bg-muted" />
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------

function StatCard({
  title,
  value,
  icon: Icon,
  description,
}: {
  title: string;
  value: number | string;
  icon: React.ElementType;
  description?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Number formatter
// ---------------------------------------------------------------------------

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Engagement state
  const [engagementData, setEngagementData] = useState<EngagementData | null>(null);
  const [engagementLoading, setEngagementLoading] = useState(false);
  const [engagementError, setEngagementError] = useState("");
  const [engagementPlatform, setEngagementPlatform] = useState("all");
  const [engagementDays, setEngagementDays] = useState("30");

  const fetchAnalytics = useCallback(async () => {
    try {
      setError("");
      const res = await fetch("/api/analytics");
      if (!res.ok) throw new Error("Analitik verileri yüklenemedi.");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchEngagement = useCallback(async () => {
    try {
      setEngagementLoading(true);
      setEngagementError("");
      const params = new URLSearchParams();
      if (engagementPlatform !== "all") params.set("platform", engagementPlatform);
      params.set("days", engagementDays);
      const res = await fetch(`/api/analytics/engagement?${params.toString()}`);
      if (!res.ok) throw new Error("Etkileşim verileri yüklenemedi.");
      const json = await res.json();
      setEngagementData(json);
    } catch (err) {
      setEngagementError(err instanceof Error ? err.message : "Bir hata oluştu.");
    } finally {
      setEngagementLoading(false);
    }
  }, [engagementPlatform, engagementDays]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  useEffect(() => {
    fetchEngagement();
  }, [fetchEngagement]);

  // Derived values
  const totalContent =
    data?.contentStats.reduce((sum, s) => sum + s.count, 0) ?? 0;
  const publishedContent =
    data?.contentStats.find((s) => s.status === "published")?.count ?? 0;
  const activeCampaigns =
    data?.campaignStats.find((s) => s.status === "active")?.count ?? 0;

  // Pie chart data
  const pieData =
    data?.contentStats.map((s) => ({
      name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
      value: s.count,
      color: STATUS_COLORS[s.status] || "#8b5cf6",
    })) ?? [];

  // Bar chart data (last 30 days activity)
  const barData = data?.activityStats ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analitik</h1>
        <p className="text-sm text-muted-foreground">
          Genel bakış ve istatistikler
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
          <TabsTrigger value="engagement">Etkileşim</TabsTrigger>
        </TabsList>

        {/* ================================================================ */}
        {/* OVERVIEW TAB */}
        {/* ================================================================ */}
        <TabsContent value="overview" className="space-y-6">
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
                    fetchAnalytics();
                  }}
                >
                  Tekrar Dene
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {isLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Data loaded */}
          {!isLoading && !error && data && (
            <>
              {/* Overview cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  title="Toplam Persona"
                  value={data.personaCount}
                  icon={Users}
                />
                <StatCard
                  title="Toplam İçerik"
                  value={totalContent}
                  icon={FileText}
                />
                <StatCard
                  title="Yayınlanan İçerik"
                  value={publishedContent}
                  icon={CheckCircle}
                />
                <StatCard
                  title="Aktif Kampanya"
                  value={activeCampaigns}
                  icon={Megaphone}
                />
              </div>

              {/* Charts */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Content Status Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">İçerik Durum Dağılımı</CardTitle>
                    <CardDescription>
                      İçerik durumlarının genel dağılımı
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {pieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={pieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            label={({ name, value }) => `${name}: ${value}`}
                          >
                            {pieData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.color}
                              />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Henüz içerik verisi yok
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Activity Over Time */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Aktivite (Son 30 Gun)</CardTitle>
                    <CardDescription>
                      Günlük aktivite sayıları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {barData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                              const d = new Date(value);
                              return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                          />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            labelFormatter={(value) => {
                              const d = new Date(value as string);
                              return d.toLocaleDateString("tr-TR");
                            }}
                          />
                          <Bar
                            dataKey="count"
                            fill="#3b82f6"
                            radius={[4, 4, 0, 0]}
                            name="Aktivite"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Henüz aktivite verisi yok
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity Log */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Son Aktiviteler</CardTitle>
                  <CardDescription>
                    Son yapılan işlemler
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {data.recentActivity.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tür</TableHead>
                          <TableHead>İşlem</TableHead>
                          <TableHead>Varlık ID</TableHead>
                          <TableHead className="text-right">Tarih</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {data.recentActivity.map((activity) => (
                          <TableRow key={activity.id}>
                            <TableCell>
                              <Badge variant="outline">
                                {ENTITY_LABELS[activity.entityType] || activity.entityType}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  activity.action === "deleted"
                                    ? "destructive"
                                    : activity.action === "created"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {ACTION_LABELS[activity.action] || activity.action}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {activity.entityId.substring(0, 8)}...
                            </TableCell>
                            <TableCell className="text-right text-sm text-muted-foreground">
                              {new Date(activity.createdAt).toLocaleString("tr-TR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <BarChart3 className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Henüz aktivite kaydı yok
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ================================================================ */}
        {/* ENGAGEMENT TAB */}
        {/* ================================================================ */}
        <TabsContent value="engagement" className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Platform:</span>
              <Select value={engagementPlatform} onValueChange={setEngagementPlatform}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="twitter">Twitter / X</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Süre:</span>
              <Select value={engagementDays} onValueChange={setEngagementDays}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 Gün</SelectItem>
                  <SelectItem value="30">30 Gün</SelectItem>
                  <SelectItem value="90">90 Gün</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error state */}
          {engagementError && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-sm text-destructive">{engagementError}</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchEngagement}
                >
                  Tekrar Dene
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Loading state */}
          {engagementLoading && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <StatCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Engagement data loaded */}
          {!engagementLoading && !engagementError && engagementData && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <StatCard
                  title="Toplam Beğeni"
                  value={formatNumber(engagementData.totalLikes)}
                  icon={Heart}
                />
                <StatCard
                  title="Toplam Yorum"
                  value={formatNumber(engagementData.totalComments)}
                  icon={MessageCircle}
                />
                <StatCard
                  title="Toplam Paylaşım"
                  value={formatNumber(engagementData.totalShares)}
                  icon={Share2}
                />
                <StatCard
                  title="Toplam Erişim"
                  value={formatNumber(engagementData.totalReach)}
                  icon={Eye}
                />
                <StatCard
                  title="Ort. Etkileşim Oranı"
                  value={`%${engagementData.avgEngagementRate}`}
                  icon={TrendingUp}
                />
              </div>

              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Platform Comparison Bar Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Platform Karşılaştırması</CardTitle>
                    <CardDescription>
                      Platformlara göre etkileşim dağılımı
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {engagementData.platformBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={engagementData.platformBreakdown}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="platform"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(v) => PLATFORM_LABELS[v] || v}
                          />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            labelFormatter={(v) => PLATFORM_LABELS[v as string] || v}
                          />
                          <Legend />
                          <Bar dataKey="likes" fill={ENGAGEMENT_CHART_COLORS.likes} name="Beğeni" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="comments" fill={ENGAGEMENT_CHART_COLORS.comments} name="Yorum" radius={[2, 2, 0, 0]} />
                          <Bar dataKey="shares" fill={ENGAGEMENT_CHART_COLORS.shares} name="Paylaşım" radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Henüz platform verisi yok
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Daily Engagement Trend Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">
                      Günlük Etkileşim Trendi (Son {engagementDays} Gün)
                    </CardTitle>
                    <CardDescription>
                      Günlük beğeni, yorum ve paylaşım sayıları
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {engagementData.dailyTrend.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={engagementData.dailyTrend}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 12 }}
                            tickFormatter={(value) => {
                              const d = new Date(value);
                              return `${d.getDate()}/${d.getMonth() + 1}`;
                            }}
                          />
                          <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                          <Tooltip
                            labelFormatter={(value) => {
                              const d = new Date(value as string);
                              return d.toLocaleDateString("tr-TR");
                            }}
                          />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="likes"
                            stroke={ENGAGEMENT_CHART_COLORS.likes}
                            name="Beğeni"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="comments"
                            stroke={ENGAGEMENT_CHART_COLORS.comments}
                            name="Yorum"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="shares"
                            stroke={ENGAGEMENT_CHART_COLORS.shares}
                            name="Paylaşım"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="views"
                            stroke={ENGAGEMENT_CHART_COLORS.views}
                            name="Görüntülenme"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
                        Henüz günlük veri yok
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Top Performing Content Table */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">En İyi Performanslı İçerikler</CardTitle>
                  <CardDescription>
                    Etkileşim bazında en başarılı 10 içerik
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {engagementData.topContent.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>İçerik</TableHead>
                          <TableHead>Platform</TableHead>
                          <TableHead>Persona</TableHead>
                          <TableHead className="text-right">Beğeni</TableHead>
                          <TableHead className="text-right">Yorum</TableHead>
                          <TableHead className="text-right">Paylaşım</TableHead>
                          <TableHead className="text-right">Görüntülenme</TableHead>
                          <TableHead className="text-right">Oran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {engagementData.topContent.map((item, idx) => (
                          <TableRow key={`${item.contentItemId}-${idx}`}>
                            <TableCell className="max-w-[200px] truncate text-sm">
                              {item.contentText
                                ? item.contentText.length > 60
                                  ? `${item.contentText.substring(0, 60)}...`
                                  : item.contentText
                                : "-"}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                style={{
                                  borderColor: PLATFORM_COLORS[item.platform] || "#6b7280",
                                  color: PLATFORM_COLORS[item.platform] || "#6b7280",
                                }}
                              >
                                {PLATFORM_LABELS[item.platform] || item.platform}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.personaName || "-"}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(item.likes)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(item.comments)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(item.shares)}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {formatNumber(item.views)}
                            </TableCell>
                            <TableCell className="text-right font-medium text-primary">
                              %{item.avgRate}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                      <TrendingUp className="h-8 w-8 text-muted-foreground" />
                      <p className="mt-4 text-sm text-muted-foreground">
                        Henüz etkileşim verisi yok
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
