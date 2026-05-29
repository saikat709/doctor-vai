"use client";

import { useEffect } from "react";
import { WifiOff } from "lucide-react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/use-network-status";

export function NetworkStatusBanner() {
  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (!isOnline) {
      toast.warning(
        "Network disconnected. Switched to offline cache mode.",
        { id: "offline-toast", duration: Infinity }
      );
    } else {
      toast.dismiss("offline-toast");
      toast.success(
        "Connectivity restored. Field records synced with server.",
        { id: "online-toast", duration: 4000 }
      );
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <div className="w-full bg-amber-500 text-white text-xs font-medium px-4 py-2 flex items-center gap-2 justify-center z-50">
      <WifiOff className="h-3.5 w-3.5 shrink-0" />
      Offline Mode Active — Work is safely cached on-device
    </div>
  );
}