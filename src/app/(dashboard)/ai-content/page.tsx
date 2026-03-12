"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Copy,
  Check,
  Loader2,
  User,
  Globe,
  MessageSquare,
  RefreshCw,
} from "lucide-react";

interface Persona {
  id: string;
  name: string;
  bio: string | null;
  language: string | null;
  avatarUrl: string | null;
  personalityTraits: string[];
  interests: string[];
  isActive: boolean;
}

const LANGUAGES = [
  { value: "", label: "Persona Dili (Varsayilan)" },
  { value: "tr", label: "Turkce" },
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "de", label: "Deutsch" },
  { value: "fr", label: "Francais" },
  { value: "es", label: "Espanol" },
  { value: "pt", label: "Portugues" },
  { value: "it", label: "Italiano" },
  { value: "ru", label: "Russian" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "zh", label: "Chinese" },
  { value: "nl", label: "Nederlands" },
  { value: "pl", label: "Polski" },
];

const PLATFORMS = [
  { value: "twitter", label: "Twitter / X" },
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "tiktok", label: "TikTok" },
];

const CONTENT_TYPES = [
  { value: "post", label: "Gonderi" },
  { value: "reply", label: "Yanit" },
  { value: "comment", label: "Yorum" },
  { value: "story", label: "Hikaye" },
  { value: "reel", label: "Reel" },
];

export default function AiContentPage() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(true);

  // Form state
  const [selectedPersonaId, setSelectedPersonaId] = useState("");
  const [platform, setPlatform] = useState("twitter");
  const [contentType, setContentType] = useState("post");
  const [language, setLanguage] = useState("");
  const [topic, setTopic] = useState("");
  const [instructions, setInstructions] = useState("");
  const [count, setCount] = useState("1");

  // Results
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const fetchPersonas = useCallback(async () => {
    try {
      const res = await fetch("/api/personas");
      if (res.ok) {
        const data = await res.json();
        setPersonas(data);
      }
    } catch (error) {
      console.error("Failed to fetch personas:", error);
    } finally {
      setLoadingPersonas(false);
    }
  }, []);

  useEffect(() => {
    fetchPersonas();
  }, [fetchPersonas]);

  const selectedPersona = personas.find((p) => p.id === selectedPersonaId);

  async function handleGenerate() {
    if (!selectedPersonaId) return;
    setLoading(true);
    setResults([]);
    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId: selectedPersonaId,
          platform,
          contentType,
          language: language || undefined,
          topic: topic || undefined,
          additionalInstructions: instructions || undefined,
          count: parseInt(count),
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || []);
      } else {
        const err = await res.json();
        console.error("Generation failed:", err);
      }
    } catch (error) {
      console.error("AI generation failed:", error);
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy(text: string, index: number) {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  }

  if (loadingPersonas) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-8 w-8" />
          AI Icerik Uretici
        </h1>
        <p className="text-muted-foreground">
          Persona profiline dayali, secilen dilde AI ile icerik uretin.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Left: Form */}
        <div className="space-y-6">
          {/* Persona Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                Persona Sec
              </CardTitle>
              <CardDescription>
                Icerik uretilecek persona profilini secin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedPersonaId} onValueChange={setSelectedPersonaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Persona secin..." />
                </SelectTrigger>
                <SelectContent>
                  {personas.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} {p.language ? `(${p.language.toUpperCase()})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedPersona && (
                <div className="mt-4 space-y-2 rounded-lg border p-3 text-sm">
                  <p className="font-medium">{selectedPersona.name}</p>
                  {selectedPersona.bio && (
                    <p className="text-muted-foreground line-clamp-2">{selectedPersona.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-1">
                    {(selectedPersona.personalityTraits as string[])?.slice(0, 5).map((t, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                    {(selectedPersona.interests as string[])?.slice(0, 3).map((t, i) => (
                      <Badge key={`int-${i}`} variant="secondary" className="text-xs">
                        {t}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Icerik Ayarlari
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORMS.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          {p.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Icerik Tipi</Label>
                  <Select value={contentType} onValueChange={setContentType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTENT_TYPES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-1">
                    <Globe className="h-3 w-3" />
                    Dil
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Persona Dili" />
                    </SelectTrigger>
                    <SelectContent>
                      {LANGUAGES.map((l) => (
                        <SelectItem key={l.value || "default"} value={l.value || "default"}>
                          {l.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Adet</Label>
                  <Select value={count} onValueChange={setCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="5">5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Konu (Opsiyonel)</Label>
                <Input
                  placeholder="orn: Yapay zeka ve gelecek"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Ek Talimatlar (Opsiyonel)</Label>
                <Textarea
                  placeholder="orn: Daha resmi bir ton kullan, hashtag ekleme..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                />
              </div>

              <Button
                onClick={handleGenerate}
                disabled={loading || !selectedPersonaId}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uretiliyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Icerik Uret
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Uretilen Icerikler</h2>
            {results.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerate}
                disabled={loading}
              >
                <RefreshCw className="mr-2 h-3 w-3" />
                Yeniden Uret
              </Button>
            )}
          </div>

          {results.length === 0 && !loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Sparkles className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm text-muted-foreground">
                  Persona secip icerik uretmeye baslayin
                </p>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-sm text-muted-foreground">
                  AI icerik uretiyor...
                </p>
              </CardContent>
            </Card>
          )}

          {results.map((result, i) => (
            <Card key={i} className="relative">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    #{i + 1} - {PLATFORMS.find((p) => p.value === platform)?.label} / {CONTENT_TYPES.find((c) => c.value === contentType)?.label}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(result, i)}
                  >
                    {copiedIndex === i ? (
                      <>
                        <Check className="mr-1 h-3 w-3 text-green-500" />
                        <span className="text-green-500 text-xs">Kopyalandi</span>
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        <span className="text-xs">Kopyala</span>
                      </>
                    )}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {result}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
