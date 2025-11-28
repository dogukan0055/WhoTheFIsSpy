import { useEffect, useState } from "react";
import type { OnlineProfile } from "@/lib/online-api";

const STORAGE_KEY = "spy-online-profile";

function readProfile(): OnlineProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.playerId && parsed?.name) {
      return parsed as OnlineProfile;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function useOnlineProfile() {
  const [profile, setProfile] = useState<OnlineProfile | null>(readProfile);

  useEffect(() => {
    if (profile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [profile]);

  return { profile, setProfile };
}
