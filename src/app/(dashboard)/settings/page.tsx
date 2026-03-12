"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Lock,
  Key,
  Globe,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Info,
} from "lucide-react";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  isAdmin: boolean;
  createdAt: string;
}

const TIMEZONES = [
  { value: "Europe/Istanbul", label: "Istanbul (UTC+3)" },
  { value: "Europe/London", label: "Londra (UTC+0)" },
  { value: "Europe/Berlin", label: "Berlin (UTC+1)" },
  { value: "Europe/Moscow", label: "Moskova (UTC+3)" },
  { value: "America/New_York", label: "New York (UTC-5)" },
  { value: "America/Chicago", label: "Chicago (UTC-6)" },
  { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
  { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
  { value: "Asia/Shanghai", label: "Shanghai (UTC+8)" },
  { value: "Asia/Dubai", label: "Dubai (UTC+4)" },
  { value: "Australia/Sydney", label: "Sydney (UTC+11)" },
];

export default function SettingsPage() {
  // Profile state
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [name, setName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Preferences state
  const [language, setLanguage] = useState("tr");
  const [timezone, setTimezone] = useState("Europe/Istanbul");
  const [prefsSaving, setPrefsSaving] = useState(false);
  const [prefsMessage, setPrefsMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    try {
      const res = await fetch("/api/settings/profile");
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        setName(data.name || "");
        setAvatarUrl(data.image || "");
      }
    } catch {
      // ignore
    } finally {
      setProfileLoading(false);
    }
  }

  async function handleProfileSave() {
    setProfileSaving(true);
    setProfileMessage(null);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, image: avatarUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...data } : prev));
        setProfileMessage({ type: "success", text: "Profil guncellendi" });
      } else {
        const err = await res.json();
        setProfileMessage({
          type: "error",
          text: err.error || "Bir hata olustu",
        });
      }
    } catch {
      setProfileMessage({ type: "error", text: "Bir hata olustu" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordChange() {
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({
        type: "error",
        text: "Yeni sifreler eslesmiyor",
      });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({
        type: "error",
        text: "Yeni sifre en az 6 karakter olmalidir",
      });
      return;
    }

    setPasswordSaving(true);
    try {
      const res = await fetch("/api/settings/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      if (res.ok) {
        setPasswordMessage({
          type: "success",
          text: "Sifre basariyla degistirildi",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        const err = await res.json();
        setPasswordMessage({
          type: "error",
          text: err.error || "Bir hata olustu",
        });
      }
    } catch {
      setPasswordMessage({ type: "error", text: "Bir hata olustu" });
    } finally {
      setPasswordSaving(false);
    }
  }

  function handlePrefsSave() {
    setPrefsSaving(true);
    setPrefsMessage(null);
    // Store preferences in localStorage for now
    try {
      localStorage.setItem(
        "user-preferences",
        JSON.stringify({ language, timezone })
      );
      setPrefsMessage({ type: "success", text: "Tercihler kaydedildi" });
    } catch {
      setPrefsMessage({ type: "error", text: "Tercihler kaydedilemedi" });
    } finally {
      setPrefsSaving(false);
    }
  }

  // Load preferences from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem("user-preferences");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.language) setLanguage(parsed.language);
        if (parsed.timezone) setTimezone(parsed.timezone);
      }
    } catch {
      // ignore
    }
  }, []);

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Ayarlar</h1>
        <p className="text-muted-foreground">
          Hesap ayarlarinizi ve tercihlerinizi yonetin.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Guvenlik
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="gap-2">
            <Key className="h-4 w-4" />
            API Anahtarlari
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Globe className="h-4 w-4" />
            Tercihler
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Profil Bilgileri</CardTitle>
              <CardDescription>
                Kisisel bilgilerinizi guncelleyin.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ad Soyad</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Adiniz ve soyadiniz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-posta</Label>
                <Input
                  id="email"
                  value={profile?.email || ""}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  E-posta adresi degistirilemez.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="https://example.com/avatar.jpg"
                />
                {avatarUrl && (
                  <div className="mt-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={avatarUrl}
                      alt="Avatar onizleme"
                      className="h-16 w-16 rounded-full object-cover border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              {profileMessage && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    profileMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {profileMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {profileMessage.text}
                </div>
              )}

              <Button onClick={handleProfileSave} disabled={profileSaving}>
                {profileSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Sifre Degistir</CardTitle>
              <CardDescription>
                Hesap sifrenizi guncelleyin. En az 6 karakter olmalidir.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Mevcut Sifre</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Mevcut sifreniz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">Yeni Sifre</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yeni sifreniz"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Yeni Sifre (Tekrar)</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Yeni sifrenizi tekrarlayin"
                />
              </div>

              {passwordMessage && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    passwordMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {passwordMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {passwordMessage.text}
                </div>
              )}

              <Button onClick={handlePasswordChange} disabled={passwordSaving}>
                {passwordSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Sifreyi Degistir
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api-keys">
          <Card>
            <CardHeader>
              <CardTitle>API Anahtarlari</CardTitle>
              <CardDescription>
                Sistem tarafindan kullanilan API anahtarlarinin durumu.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">Google Gemini API</p>
                    <p className="text-sm text-muted-foreground">
                      AI icerik uretimi icin kullanilir.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {process.env.NEXT_PUBLIC_HAS_GEMINI_KEY === "true" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">
                          Yapilandirildi
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-yellow-600">
                          Yapilandirilmadi
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">Twitter / X API</p>
                    <p className="text-sm text-muted-foreground">
                      Sosyal medya izleme ve icerik paylasimi icin kullanilir.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      Yapilandirilmadi
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">Reddit API</p>
                    <p className="text-sm text-muted-foreground">
                      Reddit izleme ve icerik yonetimi icin kullanilir.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      Yapilandirilmadi
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <p className="font-medium">YouTube Data API</p>
                    <p className="text-sm text-muted-foreground">
                      YouTube izleme ve analiz icin kullanilir.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm text-yellow-600">
                      Yapilandirilmadi
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2 rounded-lg bg-muted p-4">
                <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <p>
                    API anahtarlari sunucu tarafinda ortam degiskenleri olarak
                    yapilandirilir. Anahtarlari guncellemek icin sunucu
                    yapilandirmasini duzenleyin veya sistem yoneticisiyle
                    iletisime gecin.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Tercihler</CardTitle>
              <CardDescription>
                Uygulama tercihlerinizi ozellestiriniz.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Dil</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger id="language" className="w-full max-w-xs">
                    <SelectValue placeholder="Dil secin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tr">Turkce</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Saat Dilimi</Label>
                <Select value={timezone} onValueChange={setTimezone}>
                  <SelectTrigger id="timezone" className="w-full max-w-xs">
                    <SelectValue placeholder="Saat dilimi secin" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tema</Label>
                <p className="text-sm text-muted-foreground">
                  Tema degistirme ozelligi yakin zamanda eklenecektir. Su an
                  sistem temaniz kullanilmaktadir.
                </p>
              </div>

              {prefsMessage && (
                <div
                  className={`flex items-center gap-2 text-sm ${
                    prefsMessage.type === "success"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {prefsMessage.type === "success" ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <AlertCircle className="h-4 w-4" />
                  )}
                  {prefsMessage.text}
                </div>
              )}

              <Button onClick={handlePrefsSave} disabled={prefsSaving}>
                {prefsSaving && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Kaydet
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
