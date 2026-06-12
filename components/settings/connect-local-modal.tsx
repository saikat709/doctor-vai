"use client";

import { useMemo, useState } from "react";
import {
  Check,
  Copy,
  Loader2,
  ShieldCheck,
  SquareTerminal,
  Undo2,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type LocalConfig = {
  enabled: boolean;
  tunnelUrl: string;
  selectedModel: string;
  verifiedAt?: string | null;
};

type Props = {
  offlineRequired?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (config: LocalConfig) => void;
};

type Platform = "windows" | "linux" | null;

const PLATFORM_INSTALLS = {
  windows: "winget install --id Cloudflare.cloudflared",
  linux:
    "curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb\nsudo dpkg -i cloudflared.deb",
} as const;

const OLLAMA_COMMANDS = ["ollama serve", "ollama run llama3"];
const TUNNEL_COMMAND = "cloudflared tunnel --url http://localhost:11434";
const SUGGESTED_MODELS = ["llama3", "mistral", "phi3", "gemma", "qwen2"];

function CodeBlock({
  command,
  multiline = false,
}: {
  command: string;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-950 p-4 text-slate-100">
      <div className="flex items-start justify-between gap-3">
        <pre className={cn("text-sm whitespace-pre-wrap", multiline && "leading-6")}>
          <code>{command}</code>
        </pre>
        <button
          type="button"
          onClick={async () => {
            await navigator.clipboard.writeText(command);
            toast.success("Command copied.");
          }}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white transition hover:bg-white/10"
        >
          <Copy className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
    </div>
  );
}

export function ConnectLocalModal({
  offlineRequired,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<Platform>(null);
  const [cloudflaredDone, setCloudflaredDone] = useState(false);
  const [ollamaDone, setOllamaDone] = useState(false);
  const [tunnelDone, setTunnelDone] = useState(false);
  const [tunnelUrl, setTunnelUrl] = useState("");
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [verifySuccess, setVerifySuccess] = useState<string | null>(null);

  const canProceed = useMemo(() => {
    if (step === 1) return Boolean(platform);
    if (step === 2) return cloudflaredDone;
    if (step === 3) return ollamaDone;
    if (step === 4) return tunnelDone;
    if (step === 5) return Boolean(selectedModel);
    return false;
  }, [cloudflaredDone, ollamaDone, platform, selectedModel, step, tunnelDone]);

  function resetState() {
    setStep(1);
    setPlatform(null);
    setCloudflaredDone(false);
    setOllamaDone(false);
    setTunnelDone(false);
    setTunnelUrl("");
    setModels([]);
    setSelectedModel("");
    setVerifying(false);
    setSaving(false);
    setVerifyError(null);
    setVerifySuccess(null);
  }

  async function verifyConnection() {
    const normalized = tunnelUrl.trim().replace(/\/+$/, "");

    if (!normalized.startsWith("https://")) {
      setVerifyError("Use a public Cloudflare HTTPS URL without a trailing slash.");
      return;
    }

    setVerifying(true);
    setVerifyError(null);
    setVerifySuccess(null);
    setModels([]);
    setSelectedModel("");

    try {
      const response = await fetch("/api/settings/local-llm/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tunnelUrl: normalized }),
      });

      const data = (await response.json()) as {
        success?: boolean;
        error?: string;
        models?: string[];
      };

      if (!data.success) {
        throw new Error(data.error ?? "Tunnel not reachable");
      }

      setModels(data.models ?? []);
      setVerifySuccess(`Connected. Found ${(data.models ?? []).length} models.`);
      toast.success("Local Ollama connection verified.");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Tunnel not reachable. Make sure cloudflared is running.";
      setVerifyError(message);
    } finally {
      setVerifying(false);
    }
  }

  async function saveConfig() {
    const normalized = tunnelUrl.trim().replace(/\/+$/, "");

    setSaving(true);
    try {
      const response = await fetch("/api/settings/local-llm/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tunnelUrl: normalized,
          selectedModel,
        }),
      });

      const data = (await response.json()) as { success?: boolean };

      if (!data.success) {
        throw new Error("Failed to save Local AI configuration.");
      }

      const config = {
        enabled: true,
        tunnelUrl: normalized,
        selectedModel,
      };

      onSaved(config);
      window.dispatchEvent(new CustomEvent("doctor-vai:ollama-configured"));
      toast.success(`Local AI activated with ${selectedModel}.`);
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save Local AI configuration."
      );
    } finally {
      setSaving(false);
    }
  }

  const installCommand = platform ? PLATFORM_INSTALLS[platform] : "";

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          resetState();
        }
      }}
    >
      <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[32px] border-none p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-2xl text-slate-950">
                <ShieldCheck className="h-6 w-6 text-emerald-600" />
                Connect Local AI
              </DialogTitle>
              <DialogDescription className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Configure Ollama behind a Cloudflare tunnel so Doctor Vai can use
                your local model{offlineRequired ? " in offline mode" : ""}.
              </DialogDescription>
            </div>
          </div>
          <div className="mt-5 grid grid-cols-5 gap-2">
            {Array.from({ length: 5 }).map((_, index) => {
              const currentStep = index + 1;
              const active = currentStep <= step;

              return (
                <div key={currentStep} className="space-y-2">
                  <div
                    className={cn(
                      "h-2 rounded-full",
                      active ? "bg-emerald-500" : "bg-slate-200"
                    )}
                  />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Step {currentStep}
                  </p>
                </div>
              );
            })}
          </div>
        </DialogHeader>

        <div className="space-y-6 px-6 py-6">
          {step === 1 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Select your platform
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Choose the operating system where Ollama and Cloudflared are
                  installed.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  { value: "windows" as const, emoji: "🪟", label: "Windows" },
                  { value: "linux" as const, emoji: "🐧", label: "Linux" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setPlatform(item.value)}
                    className={cn(
                      "rounded-[28px] border p-6 text-left transition",
                      platform === item.value
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    )}
                  >
                    <div className="text-3xl">{item.emoji}</div>
                    <div className="mt-5 text-lg font-semibold text-slate-950">
                      {item.label}
                    </div>
                  </button>
                ))}
              </div>
            </section>
          ) : null}

          {step === 2 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Install Cloudflared
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Cloudflared creates a secure tunnel so your local Ollama can
                  be reached from this app.
                </p>
              </div>
              <CodeBlock command={installCommand} multiline />
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={cloudflaredDone}
                  onChange={(event) => setCloudflaredDone(event.target.checked)}
                />
                I have installed Cloudflared
              </label>
            </section>
          ) : null}

          {step === 3 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Start Ollama with a model
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Make sure Ollama is listening on port 11434. You can use any
                  model you have already pulled.
                </p>
              </div>
              {OLLAMA_COMMANDS.map((command) => (
                <CodeBlock key={command} command={command} />
              ))}
              <div className="flex flex-wrap gap-2">
                {SUGGESTED_MODELS.map((model) => (
                  <Badge key={model} variant="secondary" className="rounded-full px-3 py-1">
                    {model}
                  </Badge>
                ))}
              </div>
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={ollamaDone}
                  onChange={(event) => setOllamaDone(event.target.checked)}
                />
                Ollama is running
              </label>
            </section>
          ) : null}

          {step === 4 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Start Cloudflare Tunnel
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Run this in a new terminal. Cloudflared will print a public
                  HTTPS URL like <span className="font-medium">https://abc123.trycloudflare.com</span>.
                </p>
              </div>
              <CodeBlock command={TUNNEL_COMMAND} />
              <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={tunnelDone}
                  onChange={(event) => setTunnelDone(event.target.checked)}
                />
                Tunnel is running and I have the URL
              </label>
            </section>
          ) : null}

          {step === 5 ? (
            <section className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-950">
                  Connect and select model
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Paste the Cloudflare HTTPS URL, test the connection, then pick
                  the Ollama model Doctor Vai should use.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Input
                  value={tunnelUrl}
                  onChange={(event) => setTunnelUrl(event.target.value)}
                  placeholder="https://abc123.trycloudflare.com"
                  className="h-12 rounded-2xl"
                />
                <Button
                  type="button"
                  onClick={() => void verifyConnection()}
                  disabled={verifying}
                  className="h-12 rounded-2xl px-5"
                >
                  {verifying ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="mr-2 h-4 w-4" />
                  )}
                  {verifying ? "Testing..." : "Test Connection"}
                </Button>
              </div>

              {verifyError ? (
                <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {verifyError}
                </div>
              ) : null}

              {verifySuccess ? (
                <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  <Check className="h-4 w-4" />
                  {verifySuccess}
                </div>
              ) : null}

              {models.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-slate-700">
                    Available models
                  </p>
                  <Select value={selectedModel} onValueChange={setSelectedModel}>
                    <SelectTrigger className="h-12 rounded-2xl border-slate-200">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ) : null}
            </section>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-5">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1 || saving || verifying}
            className="rounded-2xl"
          >
            <Undo2 className="mr-2 h-4 w-4" />
            Back
          </Button>

          {step < 5 ? (
            <Button
              type="button"
              onClick={() => setStep((current) => Math.min(5, current + 1))}
              disabled={!canProceed}
              className="rounded-2xl px-5"
            >
              <SquareTerminal className="mr-2 h-4 w-4" />
              Next
            </Button>
          ) : (
            <Button
              type="button"
              onClick={() => void saveConfig()}
              disabled={!canProceed || saving}
              className="rounded-2xl px-5"
            >
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-2 h-4 w-4" />
              )}
              Save & Activate
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
