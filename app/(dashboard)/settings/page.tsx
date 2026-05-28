"use client";

import { useState, useRef, useEffect } from "react";
import {
  HardDrive,
  Upload,
  FileText,
  Trash2,
  RefreshCw,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type DocStatus = "Processing" | "Indexed" | "Failed";

interface KnowledgeDoc {
  id: string;
  name: string;
  size: string;
  status: DocStatus;
}

const CACHE_LIMITS = ["100 MB", "500 MB", "1 GB"];

const statusStyles: Record<DocStatus, string> = {
  Processing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 animate-pulse",
  Indexed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STORAGE_KEY = "doctor_vai_documents";
const SETTINGS_KEY = "doctor_vai_settings";

export default function SettingsPage() {
  const [cacheLimit, setCacheLimit] = useState("500 MB");
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const docsRef = useRef<KnowledgeDoc[]>([]);

  useEffect(() => {
    docsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY);
      if (savedDocs) setDocuments(JSON.parse(savedDocs));
      const savedSettings = localStorage.getItem(SETTINGS_KEY);
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        if (parsed.cacheLimit) setCacheLimit(parsed.cacheLimit);
      }
    } catch {}
  }, []);

  const persistDocs = (docs: KnowledgeDoc[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    setDocuments(docs);
    docsRef.current = docs;
  };

  // Storage meter
  const limitBytes =
    cacheLimit === "100 MB"
      ? 100 * 1024 * 1024
      : cacheLimit === "500 MB"
      ? 500 * 1024 * 1024
      : 1024 * 1024 * 1024;

  const usedBytes = documents.reduce((acc, doc) => {
    const match = doc.size.match(/([\d.]+)\s*(KB|MB|B)/);
    if (!match) return acc;
    const val = parseFloat(match[1]);
    if (match[2] === "MB") return acc + val * 1024 * 1024;
    if (match[2] === "KB") return acc + val * 1024;
    return acc + val;
  }, 0);

  const usedPercent = Math.min((usedBytes / limitBytes) * 100, 100);

  const handleCacheLimitChange = (val: string) => {
    setCacheLimit(val);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ cacheLimit: val }));
    toast.success(`Cache limit set to ${val}`);
  };

  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!["pdf", "txt", "md"].includes(ext ?? "")) {
      return `"${file.name}" rejected — only .pdf, .txt, and .md are allowed.`;
    }
    return null;
  };

  const processFile = async (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      toast.error(error);
      return;
    }
    setFileError(null);

    const newDoc: KnowledgeDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      size: formatSize(file.size),
      status: "Processing",
    };

    const withNew = [...docsRef.current, newDoc];
    persistDocs(withNew);
    toast.info(`Processing ${file.name}...`);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      const finalStatus: DocStatus = res.ok ? "Indexed" : "Failed";
      const updated = docsRef.current.map((d) =>
        d.id === newDoc.id ? { ...d, status: finalStatus } : d
      );
      persistDocs(updated);

      res.ok
        ? toast.success(`${file.name} indexed successfully.`)
        : toast.error(`Failed to index ${file.name}.`);
    } catch {
      const failed = docsRef.current.map((d) =>
        d.id === newDoc.id ? { ...d, status: "Failed" as DocStatus } : d
      );
      persistDocs(failed);
      toast.error(`Error processing ${file.name}.`);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    Array.from(e.dataTransfer.files).forEach(processFile);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(processFile);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    persistDocs(documents.filter((d) => d.id !== id));
    toast.success("Document removed.");
  };

  const handleRetry = (id: string) => {
    const updated = documents.map((d) =>
      d.id === id ? { ...d, status: "Processing" as DocStatus } : d
    );
    persistDocs(updated);
    toast.info("Re-upload the file to retry indexing.");
    setTimeout(() => {
      const reverted = docsRef.current.map((d) =>
        d.id === id ? { ...d, status: "Failed" as DocStatus } : d
      );
      persistDocs(reverted);
    }, 2000);
  };

  const handlePurge = () => {
    persistDocs([]);
    toast.success("All cached archives purged.");
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <HardDrive className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Local configuration and clinical knowledge base management
          </p>
        </div>
      </div>

      {/* Zone A: Storage */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Zone A — Local Storage & Synchronization
        </h2>

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="space-y-1.5">
            <label className="text-sm font-medium">
              Max Offline Cache Allocation
            </label>
            <Select value={cacheLimit} onValueChange={handleCacheLimitChange}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CACHE_LIMITS.map((l) => (
                  <SelectItem key={l} value={l}>
                    {l}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button variant="destructive" size="sm" onClick={handlePurge}>
            <Trash2 className="mr-2 h-4 w-4" />
            Purge All Archives
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Current Storage Footprint</span>
            <span>
              {formatSize(usedBytes)} / {cacheLimit} used
            </span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-500",
                usedPercent > 80
                  ? "bg-rose-500"
                  : usedPercent > 50
                  ? "bg-amber-500"
                  : "bg-emerald-500"
              )}
              style={{ width: `${usedPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Zone B: RAG Upload */}
      <div className="rounded-xl border bg-card p-6 space-y-5">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
          Zone B — Clinical Knowledge Base Ingestion
        </h2>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all select-none",
            isDragging
              ? "border-primary bg-primary/5"
              : "border-border hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <Upload className="mx-auto h-10 w-10 text-muted-foreground/40 mb-3" />
          <p className="text-sm font-medium text-muted-foreground">
            Drag & drop clinical protocols here
          </p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Supports{" "}
            <span className="font-mono">.pdf</span>,{" "}
            <span className="font-mono">.txt</span>,{" "}
            <span className="font-mono">.md</span>
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
          >
            Browse Device Files
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt,.md"
            multiple
            className="hidden"
            onChange={handleFileInput}
          />
        </div>

        {fileError && (
          <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 dark:bg-rose-900/20 px-4 py-3">
            <X className="h-4 w-4 text-rose-600 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-700 dark:text-rose-400">
              {fileError}
            </p>
          </div>
        )}

        {/* Document Inventory */}
        {documents.length > 0 ? (
          <div className="rounded-lg border overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/30">
              <h3 className="text-sm font-semibold">
                Active Document Inventory
              </h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>File Name</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span className="truncate max-w-[180px] text-sm font-medium">
                          {doc.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {doc.size}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          "text-xs font-semibold",
                          statusStyles[doc.status]
                        )}
                      >
                        {doc.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {doc.status === "Failed" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRetry(doc.id)}
                          >
                            <RefreshCw className="h-3 w-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-2">
            No documents ingested yet.
          </p>
        )}
      </div>
    </div>
  );
}