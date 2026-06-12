import { auth } from "@/auth";
import { getOfflineSession } from "@/lib/offline-session";
import { isOffline } from "@/lib/env";

export async function getSession() {
  if (isOffline) {
    return getOfflineSession();
  }

  return auth();
}
