"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  HardDrive,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  X,
  Database,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Plus,
} from "lucide-react";

import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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

type DocStatus = "Processing" | "Indexed" | "Failed";

interface KnowledgeDoc {
  id: string;
  name: string;
  size: string;
  status: DocStatus;
  progress?: number;
  stage?: string;
}

const CACHE_LIMITS = ["100 MB", "500 MB", "1 GB"];

const STORAGE_KEY = "doctor_vai_documents";
const SETTINGS_KEY = "doctor_vai_settings";

const statusStyles: Record<DocStatus, string> = {
  Processing:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Indexed:
    "bg-gray-600 text-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  Failed:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`;

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getLimitBytes(limit: string) {
  if (limit === "100 MB") return 100 * 1024 * 1024;
  if (limit === "500 MB") return 500 * 1024 * 1024;

  return 1024 * 1024 * 1024;
}

export default function SettingsPage() {
  const [cacheLimit, setCacheLimit] = useState("500 MB");
  const [documents, setDocuments] = useState<KnowledgeDoc[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const docsRef = useRef<KnowledgeDoc[]>([]);

  useEffect(() => {
    docsRef.current = documents;
  }, [documents]);

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem(STORAGE_KEY);

      if (savedDocs) {
        setDocuments(JSON.parse(savedDocs));
      }

      const savedSettings = localStorage.getItem(SETTINGS_KEY);

      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);

        if (parsed.cacheLimit) {
          setCacheLimit(parsed.cacheLimit);
        }
      }
    } catch {
      toast.error("Unable to load local settings.");
    }
  }, []);

  const persistDocs = (docs: KnowledgeDoc[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(docs));
    setDocuments(docs);
    docsRef.current = docs;
  };

  const usedBytes = useMemo(() => {
    return documents.reduce((accumulator, doc) => {
      const match = doc.size.match(/([\d.]+)\s*(KB|MB|B)/);

      if (!match) return accumulator;

      const value = Number(match[1]);

      if (match[2] === "MB") {
        return accumulator + value * 1024 * 1024;
      }

      if (match[2] === "KB") {
        return accumulator + value * 1024;
      }

      return accumulator + value;
    }, 0);
  }, [documents]);

  const indexedCount = documents.filter(
    (doc) => doc.status === "Indexed"
  ).length;

  const processingCount = documents.filter(
    (doc) => doc.status === "Processing"
  ).length;

  const failedCount = documents.filter(
    (doc) => doc.status === "Failed"
  ).length;

  const usedPercent = Math.min(
    (usedBytes / getLimitBytes(cacheLimit)) * 100,
    100
  );

  const handleCacheLimitChange = (value: string) => {
    setCacheLimit(value);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({
        cacheLimit: value,
      })
    );

    toast.success(`Cache limit updated to ${value}`);
  };

  const validateFile = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (!ext || !["pdf", "txt", "md"].includes(ext)) {
      return `"${file.name}" rejected. Only .pdf, .txt and .md are allowed.`;
    }

    return null;
  };

  const updateDoc = (
    id: string,
    updates: Partial<KnowledgeDoc>
  ) => {
    const updated = docsRef.current.map((doc) =>
      doc.id === id ? { ...doc, ...updates } : doc
    );

    persistDocs(updated);
  };

  // Removed simulated upload stages — UI now shows honest states

  const processFile = async (file: File) => {
    const validationError = validateFile(file);

    if (validationError) {
      setFileError(validationError);
      toast.error(validationError);
      return;
    }

    setFileError(null);

    const newDoc: KnowledgeDoc = {
      id: crypto.randomUUID(),
      name: file.name,
      size: formatSize(file.size),
      status: "Processing",
      progress: 0,
      stage: "Uploading",
    };

    persistDocs([...docsRef.current, newDoc]);

    // Honest UI: show Uploading while request is in-flight.
    const timeoutId = window.setTimeout(() => {
      updateDoc(newDoc.id, {
        status: "Failed",
        progress: 100,
        stage: "Upload timed out",
      });
      toast.error(`Upload timed out for ${file.name}.`);
    }, 120000);
    let finished = false;

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch("/api/rag/upload", {
        method: "POST",
        body: formData,
      });

      finished = true;
      window.clearTimeout(timeoutId);
      if (response.ok) {
        updateDoc(newDoc.id, {
          status: "Indexed",
          progress: 100,
          stage: "Indexed successfully",
        });

        toast.success(`${file.name} indexed successfully.`);
      } else {
        updateDoc(newDoc.id, {
          status: "Failed",
          progress: 100,
          stage: "Upload failed",
        });

        toast.error(`Failed to index ${file.name}.`);
      }
    } catch {
      if (!finished) {
        window.clearTimeout(timeoutId);
      }

      updateDoc(newDoc.id, {
        status: "Failed",
        progress: 100,
        stage: "Upload failed",
      });

      toast.error(`Error processing ${file.name}.`);
    }
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>
  ) => {
    event.preventDefault();

    setIsDragging(false);

    Array.from(event.dataTransfer.files).forEach((file) =>
      void processFile(file)
    );
  };

  const handleFileInput = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    Array.from(event.target.files ?? []).forEach((file) =>
      void processFile(file)
    );

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }

    setUploadModalOpen(false);
  };

  const handleDelete = (id: string) => {
    persistDocs(documents.filter((doc) => doc.id !== id));

    toast.success("Document removed.");
  };

  const handleRetry = (id: string) => {
    updateDoc(id, {
      status: "Processing",
      progress: 0,
      stage: "Uploading",
    });

    toast.info("Please upload the document again.");
  };

  const handlePurge = () => {
    persistDocs([]);

    toast.success("All documents removed.");
  };

  return (
    <div className="mx-auto max-w-7xl px-3 py-4 lg:px-4">
      <div className="space-y-4">
        {/* HEADER */}
        <section className="overflow-hidden rounded-[32px] border border-slate-200 bg-linear-to-br from-slate-950 via-slate-900 to-slate-800 p-4 text-white shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-sky-200 backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                AI Knowledge Workspace
              </div>

              <h1 className="text-3xl font-bold tracking-tight">
                Manage your indexed documents
              </h1>

              {/* <p className="mt-3 text-sm leading-7 text-slate-300">
                Upload files, monitor indexing progress, manage local
                storage usage, and maintain your searchable knowledge
                base.
              </p> */}
            </div>

            <div className="grid w-full max-w-md grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Indexed
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {indexedCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Processing
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {processingCount}
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Failed
                </p>

                <p className="mt-2 text-3xl font-semibold">
                  {failedCount}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* MAIN */}
        <section className="grid gap-6 xl:grid-cols-[340px_1fr]">
          {/* SIDEBAR */}
          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-sky-100 p-2 text-sky-700">
                  <Database className="h-4 w-4" />
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Storage Settings
                  </h2>

                  <p className="text-xs text-slate-500">
                    Configure local cache
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <label className="text-sm font-medium text-slate-700">
                  Cache limit
                </label>

                <Select
                  value={cacheLimit}
                  onValueChange={handleCacheLimitChange}
                >
                  <SelectTrigger className="h-11 rounded-2xl border-slate-200">
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    {CACHE_LIMITS.map((limit) => (
                      <SelectItem key={limit} value={limit}>
                        {limit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
                  <span>Storage used</span>

                  <span>
                    {formatSize(usedBytes)} / {cacheLimit}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-500",
                      usedPercent > 80
                        ? "bg-rose-500"
                        : usedPercent > 50
                        ? "bg-amber-500"
                        : "bg-emerald-500"
                    )}
                    style={{
                      width: `${usedPercent}%`,
                    }}
                  />
                </div>
              </div>

              <Button
                variant="destructive"
                className="mt-6 h-11 w-full rounded-2xl"
                onClick={handlePurge}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear all documents
              </Button>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2 shadow-sm">
                  <HardDrive className="h-4 w-4 text-slate-700" />
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-900">
                    Supported formats
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    PDF, Markdown and plain text files are supported
                    for indexing and retrieval.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* DOCUMENTS */}
          <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">
                  Knowledge Base
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Upload and manage searchable documents.
                </p>
              </div>

              <Dialog
                open={uploadModalOpen}
                onOpenChange={setUploadModalOpen}
              >
                <DialogTrigger asChild>
                  <Button className="h-11 rounded-2xl px-5">
                    <Plus className="mr-2 h-4 w-4" />
                    Upload Documents
                  </Button>
                </DialogTrigger>

                <DialogContent className="rounded-[28px] border-none p-0 sm:max-w-xl">
                  <DialogHeader className="border-b border-slate-100 px-6 py-5">
                    <DialogTitle className="text-xl">
                      Upload documents
                    </DialogTitle>

                    <DialogDescription>
                      Add files to your searchable knowledge base.
                    </DialogDescription>
                  </DialogHeader>

                  <div className="p-6">
                    <div
                      onDragOver={(event) => {
                        event.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "cursor-pointer rounded-[28px] border-2 border-dashed p-10 text-center transition-all",
                        isDragging
                          ? "border-sky-400 bg-sky-50"
                          : "border-slate-200 bg-slate-50 hover:border-sky-300 hover:bg-sky-50/60"
                      )}
                    >
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm">
                        <Upload className="h-7 w-7 text-slate-500" />
                      </div>

                      <h3 className="text-base font-semibold text-slate-900">
                        Drag and drop files
                      </h3>

                      <p className="mt-2 text-sm text-slate-500">
                        or click to browse from your device
                      </p>

                      <div className="mt-5 flex justify-center gap-2">
                        <Badge variant="secondary">PDF</Badge>
                        <Badge variant="secondary">TXT</Badge>
                        <Badge variant="secondary">MD</Badge>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept=".pdf,.txt,.md"
                        className="hidden"
                        onChange={handleFileInput}
                      />
                    </div>

                    {fileError && (
                      <div className="mt-4 flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-700">
                        <X className="mt-0.5 h-4 w-4 shrink-0" />

                        <p className="text-sm">{fileError}</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {documents.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="py-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl bg-slate-100 p-2">
                            <FileText className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {doc.name}
                            </p>

                            {doc.status === "Processing" && (
                              <div className="mt-3">
                                <div className="mb-1 flex items-center justify-between text-[11px] text-slate-200">
                                  <span>{doc.stage ?? "Processing..."}</span>

                                  <span>
                                    {doc.progress ?? 0}%
                                  </span>
                                </div>

                                <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-sky-500 transition-all duration-300"
                                    style={{
                                      width: `${doc.progress ?? 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={cn(
                            "gap-1 rounded-full px-3 py-1 text-xs font-semibold",
                            statusStyles[doc.status]
                          )}
                        >
                          {doc.status === "Processing" && (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          )}

                          {doc.status === "Indexed" && (
                            <CheckCircle2 className="h-3 w-3" />
                          )}

                          {doc.status === "Failed" && (
                            <AlertCircle className="h-3 w-3" />
                          )}

                          {doc.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-sm text-slate-500">
                        {doc.size}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {doc.status === "Failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl"
                              onClick={() => handleRetry(doc.id)}
                            >
                              <RefreshCw className="mr-1 h-3.5 w-3.5" />
                              Retry
                            </Button>
                          )}

                          <Button
                            size="icon"
                            variant="ghost"
                            className="rounded-xl"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4 text-rose-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
                <div className="mb-5 rounded-3xl bg-slate-100 p-5">
                  <Upload className="h-10 w-10 text-slate-400" />
                </div>

                <h3 className="text-lg font-semibold text-slate-900">
                  No documents uploaded
                </h3>

                <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
                  Upload your first PDF, markdown, or text document
                  to start building a searchable AI knowledge base.
                </p>

                <Button
                  className="mt-6 rounded-2xl"
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload documents
                </Button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}