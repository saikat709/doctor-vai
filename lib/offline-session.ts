import type { Session } from "next-auth";
import { OFFLINE_USER_ID } from "@/lib/env";

export function getOfflineSession(): Session {
  return {
    user: {
      id: OFFLINE_USER_ID,
      name: "Field Worker",
      email: "local@offline",
    },
    expires: "2099-01-01T00:00:00.000Z",
  };
}
