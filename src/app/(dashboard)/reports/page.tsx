"use client";

import { useState } from "react";
import { FileDown, Users, Megaphone, FileText, Activity, Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface ExportCard {
  title: string;
  description: string;
  endpoint: string;
  icon: React.ComponentType<{ className?: string }>;
}

const exportCards: ExportCard[] = [
  {
    title: "Persona Raporu",
    description: "T\u00fcm persona verilerini CSV olarak indirin",
    endpoint: "/api/export/personas",
    icon: Users,
  },
  {
    title: "Kampanya Raporu",
    description: "Kampanya verilerini CSV olarak indirin",
    endpoint: "/api/export/campaigns",
    icon: Megaphone,
  },
  {
    title: "\u0130\u00e7erik Raporu",
    description: "\u0130\u00e7erik verilerini CSV olarak indirin",
    endpoint: "/api/export/content",
    icon: FileText,
  },
  {
    title: "Aktivite Raporu",
    description: "Aktivite loglar\u0131n\u0131 CSV olarak indirin",
    endpoint: "/api/export/analytics",
    icon: Activity,
  },
];

export default function ReportsPage() {
  const [loadingEndpoint, setLoadingEndpoint] = useState<string | null>(null);

  const handleDownload = async (endpoint: string) => {
    setLoadingEndpoint(endpoint);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error("Export failed");
      }
      const blob = await response.blob();
      const disposition = response.headers.get("Content-Disposition") || "";
      const filenameMatch = disposition.match(/filename=(.+)/);
      const filename = filenameMatch ? filenameMatch[1] : "export.csv";

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      console.error("Download failed");
    } finally {
      setLoadingEndpoint(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Raporlar & D\u0131\u015fa Aktar\u0131m</h1>
        <p className="text-muted-foreground mt-1">
          Verilerinizi CSV format\u0131nda d\u0131\u015fa aktar\u0131n
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {exportCards.map((card) => {
          const Icon = card.icon;
          const isLoading = loadingEndpoint === card.endpoint;

          return (
            <Card key={card.endpoint}>
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className="rounded-md bg-primary/10 p-2">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">{card.title}</CardTitle>
                  <CardDescription>{card.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => handleDownload(card.endpoint)}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <FileDown className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "\u0130ndiriliyor..." : "CSV \u0130ndir"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
