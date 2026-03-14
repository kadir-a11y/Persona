"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  MoreHorizontal,
  Pencil,
  Trash2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  ListTodo,
  Play,
  RotateCcw,
  CalendarDays,
  Users,
} from "lucide-react";

interface TeamTask {
  task: {
    id: string;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    assignedTo: string | null;
    createdBy: string | null;
    dueDate: string | null;
    resultNote: string | null;
    completedAt: string | null;
    sortOrder: number;
    createdAt: string;
    updatedAt: string;
  };
  assignedName: string | null;
}

interface UserItem {
  id: string;
  name: string;
  email: string;
  title: string | null;
  responsibilities: string | null;
  isAdmin: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Bekliyor", color: "bg-gray-100 text-gray-700 border-gray-200", icon: Clock },
  in_progress: { label: "Devam Ediyor", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Play },
  completed: { label: "Tamamlandı", color: "bg-green-100 text-green-700 border-green-200", icon: CheckCircle2 },
  cancelled: { label: "İptal", color: "bg-gray-100 text-gray-500 border-gray-200", icon: AlertTriangle },
};

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  low: { label: "Düşük", color: "bg-gray-50 text-gray-600 border-gray-200" },
  normal: { label: "Normal", color: "bg-blue-50 text-blue-600 border-blue-200" },
  high: { label: "Yüksek", color: "bg-orange-50 text-orange-600 border-orange-200" },
  urgent: { label: "Acil", color: "bg-red-50 text-red-600 border-red-200" },
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TeamTask[]>([]);
  const [teamUsers, setTeamUsers] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("active");
  const [assigneeFilter, setAssigneeFilter] = useState("all");

  // Create
  const [createOpen, setCreateOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createDesc, setCreateDesc] = useState("");
  const [createPriority, setCreatePriority] = useState("normal");
  const [createAssignee, setCreateAssignee] = useState("");
  const [createDueDate, setCreateDueDate] = useState("");
  const [createLoading, setCreateLoading] = useState(false);

  // Edit
  const [editOpen, setEditOpen] = useState(false);
  const [editTask, setEditTask] = useState<TeamTask | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editPriority, setEditPriority] = useState("normal");
  const [editAssignee, setEditAssignee] = useState("");
  const [editDueDate, setEditDueDate] = useState("");
  const [editResultNote, setEditResultNote] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // Complete confirmation
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeTask, setCompleteTask] = useState<TeamTask | null>(null);
  const [completeNote, setCompleteNote] = useState("");
  const [completeLoading, setCompleteLoading] = useState(false);

  // Delete
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTask, setDeleteTask] = useState<TeamTask | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/team-tasks");
      if (res.ok) setTasks(await res.json());
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) setTeamUsers(await res.json());
    } catch {}
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);
  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    if (statusFilter === "active" && ["completed", "cancelled"].includes(t.task.status)) return false;
    if (statusFilter !== "active" && statusFilter !== "all" && t.task.status !== statusFilter) return false;
    if (assigneeFilter !== "all" && t.task.assignedTo !== assigneeFilter) return false;
    return true;
  });

  // Stats
  const pendingCount = tasks.filter((t) => t.task.status === "pending").length;
  const inProgressCount = tasks.filter((t) => t.task.status === "in_progress").length;
  const completedCount = tasks.filter((t) => t.task.status === "completed").length;

  function resetCreate() {
    setCreateTitle(""); setCreateDesc(""); setCreatePriority("normal"); setCreateAssignee(""); setCreateDueDate("");
  }

  async function handleCreate() {
    if (!createTitle.trim()) return;
    setCreateLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: createTitle.trim(),
        description: createDesc.trim() || undefined,
        priority: createPriority,
        assignedTo: createAssignee || undefined,
      };
      if (createDueDate) body.dueDate = new Date(createDueDate).toISOString();
      const res = await fetch("/api/team-tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { resetCreate(); setCreateOpen(false); await fetchTasks(); }
    } catch (err) {
      console.error("Create error:", err);
    } finally {
      setCreateLoading(false);
    }
  }

  function openEdit(t: TeamTask) {
    setEditTask(t);
    setEditTitle(t.task.title);
    setEditDesc(t.task.description || "");
    setEditPriority(t.task.priority);
    setEditAssignee(t.task.assignedTo || "");
    setEditDueDate(t.task.dueDate ? new Date(t.task.dueDate).toISOString().slice(0, 16) : "");
    setEditResultNote(t.task.resultNote || "");
    setEditOpen(true);
  }

  async function handleEdit() {
    if (!editTask || !editTitle.trim()) return;
    setEditLoading(true);
    try {
      const body: Record<string, unknown> = {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        priority: editPriority,
        assignedTo: editAssignee || null,
        resultNote: editResultNote.trim() || null,
      };
      if (editDueDate) body.dueDate = new Date(editDueDate).toISOString();
      else body.dueDate = null;
      const res = await fetch(`/api/team-tasks/${editTask.task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) { setEditOpen(false); setEditTask(null); await fetchTasks(); }
    } catch (err) {
      console.error("Edit error:", err);
    } finally {
      setEditLoading(false);
    }
  }

  async function handleStatusChange(taskId: string, status: string, extra?: Record<string, unknown>) {
    try {
      await fetch(`/api/team-tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, ...extra }),
      });
      await fetchTasks();
    } catch (err) {
      console.error("Status change error:", err);
    }
  }

  function openCompleteDialog(t: TeamTask) {
    setCompleteTask(t);
    setCompleteNote(t.task.resultNote || "");
    setCompleteOpen(true);
  }

  async function handleComplete() {
    if (!completeTask) return;
    setCompleteLoading(true);
    try {
      await fetch(`/api/team-tasks/${completeTask.task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "completed",
          resultNote: completeNote.trim() || null,
        }),
      });
      setCompleteOpen(false);
      setCompleteTask(null);
      setCompleteNote("");
      await fetchTasks();
    } catch (err) {
      console.error("Complete error:", err);
    } finally {
      setCompleteLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTask) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`/api/team-tasks/${deleteTask.task.id}`, { method: "DELETE" });
      if (res.ok) { setDeleteOpen(false); setDeleteTask(null); await fetchTasks(); }
    } catch (err) {
      console.error("Delete error:", err);
    } finally {
      setDeleteLoading(false);
    }
  }

  function formatDate(d: string | null) {
    if (!d) return "";
    return new Date(d).toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
  }

  function getInitials(name: string) {
    return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  }

  const userColorMap: Record<string, string> = {};
  const colors = ["bg-blue-100 text-blue-700", "bg-green-100 text-green-700", "bg-purple-100 text-purple-700", "bg-orange-100 text-orange-700", "bg-pink-100 text-pink-700"];
  teamUsers.forEach((u, i) => { userColorMap[u.id] = colors[i % colors.length]; });

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
          <h1 className="text-3xl font-bold tracking-tight">Genel Görevler</h1>
          <p className="text-muted-foreground">Ekip görev ataması ve takibi</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Yeni Görev
        </Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teamUsers.map((user) => {
          const userTasks = tasks.filter((t) => t.task.assignedTo === user.id);
          const active = userTasks.filter((t) => ["pending", "in_progress"].includes(t.task.status)).length;
          const done = userTasks.filter((t) => t.task.status === "completed").length;
          const role = user.title || "Ekip Üyesi";

          return (
            <Card key={user.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                    <AvatarFallback className={`text-sm font-medium ${userColorMap[user.id] || ""}`}>
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{user.name}</p>
                      <Badge variant="outline" className="text-xs font-normal shrink-0">{role}</Badge>
                    </div>
                    {user.responsibilities && (
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {user.responsibilities}
                      </p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs">
                      <span className="flex items-center gap-1 text-blue-600">
                        <Clock className="h-3 w-3" /> {active} aktif
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" /> {done} bitti
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 text-sm">
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" /> {pendingCount} bekliyor
        </Badge>
        <Badge variant="outline" className="gap-1 border-blue-200 text-blue-700">
          <Play className="h-3 w-3" /> {inProgressCount} devam ediyor
        </Badge>
        <Badge variant="outline" className="gap-1 border-green-200 text-green-700">
          <CheckCircle2 className="h-3 w-3" /> {completedCount} tamamlandı
        </Badge>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif Görevler</SelectItem>
            <SelectItem value="all">Tümü</SelectItem>
            <SelectItem value="pending">Bekliyor</SelectItem>
            <SelectItem value="in_progress">Devam Ediyor</SelectItem>
            <SelectItem value="completed">Tamamlandı</SelectItem>
            <SelectItem value="cancelled">İptal</SelectItem>
          </SelectContent>
        </Select>
        <Select value={assigneeFilter} onValueChange={setAssigneeFilter}>
          <SelectTrigger className="w-[160px] h-9 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tüm Kişiler</SelectItem>
            {teamUsers.map((u) => (
              <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <ListTodo className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p className="font-medium">Görev bulunamadı</p>
            <p className="text-xs mt-1">Yeni görev ekleyerek başlayabilirsiniz.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTasks.map((t) => {
            const statusCfg = STATUS_CONFIG[t.task.status] || STATUS_CONFIG.pending;
            const priorityCfg = PRIORITY_CONFIG[t.task.priority] || PRIORITY_CONFIG.normal;
            const isCompleted = t.task.status === "completed";
            const isPending = t.task.status === "pending";
            const isInProgress = t.task.status === "in_progress";
            const isDue = t.task.dueDate && new Date(t.task.dueDate) < new Date() && !isCompleted;

            return (
              <Card key={t.task.id} className={`transition-shadow hover:shadow-sm ${isCompleted ? "opacity-60" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Checkbox for quick complete */}
                    <div className="mt-0.5">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => {
                          if (isCompleted) {
                            handleStatusChange(t.task.id, "pending");
                          } else {
                            openCompleteDialog(t);
                          }
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`font-medium text-sm ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                          {t.task.title}
                        </p>
                        <Badge variant="outline" className={`text-xs h-5 ${priorityCfg.color}`}>
                          {priorityCfg.label}
                        </Badge>
                        <Badge variant="outline" className={`text-xs h-5 ${statusCfg.color}`}>
                          {statusCfg.label}
                        </Badge>
                      </div>

                      {t.task.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.task.description}</p>
                      )}

                      {t.task.resultNote && (
                        <div className="mt-1.5 rounded-md border border-green-200 bg-green-50 px-2.5 py-1.5">
                          <p className="text-xs text-green-800"><span className="font-medium">Sonuç:</span> {t.task.resultNote}</p>
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {t.assignedName && (
                          <span className="flex items-center gap-1">
                            <Avatar className="h-4 w-4">
                              <AvatarFallback className={`text-[8px] ${userColorMap[t.task.assignedTo || ""] || ""}`}>
                                {getInitials(t.assignedName)}
                              </AvatarFallback>
                            </Avatar>
                            {t.assignedName}
                          </span>
                        )}
                        {t.task.dueDate && (
                          <span className={`flex items-center gap-1 ${isDue ? "text-red-500 font-medium" : ""}`}>
                            <CalendarDays className="h-3 w-3" />
                            {formatDate(t.task.dueDate)}
                            {isDue && " (gecikmiş)"}
                          </span>
                        )}
                        {t.task.completedAt && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle2 className="h-3 w-3" />
                            {formatDate(t.task.completedAt)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openEdit(t)}>
                          <Pencil className="mr-2 h-4 w-4" /> Düzenle
                        </DropdownMenuItem>
                        {isPending && (
                          <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "in_progress")}>
                            <Play className="mr-2 h-4 w-4" /> Başla
                          </DropdownMenuItem>
                        )}
                        {(isPending || isInProgress) && (
                          <DropdownMenuItem onClick={() => openCompleteDialog(t)}>
                            <CheckCircle2 className="mr-2 h-4 w-4" /> Tamamla
                          </DropdownMenuItem>
                        )}
                        {isCompleted && (
                          <DropdownMenuItem onClick={() => handleStatusChange(t.task.id, "pending")}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Yeniden Aç
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => { setDeleteTask(t); setDeleteOpen(true); }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Sil
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={createOpen} onOpenChange={(o) => { setCreateOpen(o); if (!o) resetCreate(); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Yeni Görev</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görev Başlığı</Label>
              <Input value={createTitle} onChange={(e) => setCreateTitle(e.target.value)} placeholder="Görev başlığını girin..." />
            </div>
            <div className="space-y-2">
              <Label>Açıklama (opsiyonel)</Label>
              <Textarea value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} rows={3} placeholder="Detaylı açıklama..." />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select value={createAssignee} onValueChange={setCreateAssignee}>
                  <SelectTrigger><SelectValue placeholder="Kişi seçin..." /></SelectTrigger>
                  <SelectContent>
                    {teamUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select value={createPriority} onValueChange={setCreatePriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Son Tarih (opsiyonel)</Label>
              <Input type="datetime-local" value={createDueDate} onChange={(e) => setCreateDueDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateOpen(false); resetCreate(); }}>İptal</Button>
            <Button onClick={handleCreate} disabled={createLoading || !createTitle.trim()}>
              {createLoading ? "Oluşturuluyor..." : "Oluştur"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={(o) => { setEditOpen(o); if (!o) setEditTask(null); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Görevi Düzenle</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Görev Başlığı</Label>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Atanan Kişi</Label>
                <Select value={editAssignee} onValueChange={setEditAssignee}>
                  <SelectTrigger><SelectValue placeholder="Kişi seçin..." /></SelectTrigger>
                  <SelectContent>
                    {teamUsers.map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select value={editPriority} onValueChange={setEditPriority}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="urgent">Acil</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Son Tarih</Label>
              <Input type="datetime-local" value={editDueDate} onChange={(e) => setEditDueDate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sonuç Notu</Label>
              <Textarea value={editResultNote} onChange={(e) => setEditResultNote(e.target.value)} rows={2} placeholder="Görev sonucu hakkında not..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); setEditTask(null); }}>İptal</Button>
            <Button onClick={handleEdit} disabled={editLoading || !editTitle.trim()}>
              {editLoading ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Confirmation */}
      <Dialog open={completeOpen} onOpenChange={(o) => { setCompleteOpen(o); if (!o) { setCompleteTask(null); setCompleteNote(""); } }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Görevi Tamamla</DialogTitle>
          </DialogHeader>
          {completeTask && (
            <div className="space-y-4 py-2">
              <div className="rounded-md border bg-muted/50 p-3">
                <p className="font-medium text-sm">{completeTask.task.title}</p>
                {completeTask.assignedName && (
                  <p className="text-xs text-muted-foreground mt-1">{completeTask.assignedName}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Sonuç Notu (opsiyonel)</Label>
                <Textarea
                  value={completeNote}
                  onChange={(e) => setCompleteNote(e.target.value)}
                  rows={3}
                  placeholder="Görev sonucu hakkında not ekleyin..."
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCompleteOpen(false); setCompleteTask(null); setCompleteNote(""); }}>
              Vazgeç
            </Button>
            <Button onClick={handleComplete} disabled={completeLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {completeLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
              Tamamla
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Görevi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu görevi silmek istediğinize emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteTask && (
            <div className="rounded-md border bg-muted/50 p-3 text-sm">
              <p className="font-medium">{deleteTask.task.title}</p>
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
