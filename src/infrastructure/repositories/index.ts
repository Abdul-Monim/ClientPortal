import { isSupabaseConfigured } from "@/infrastructure/config/env";
import { SandboxPortalRepository } from "./sandbox-repository";
import { SupabasePortalRepository } from "./supabase-repository";
import type { PortalRepository } from "./types";

let cachedRepository: PortalRepository | null = null;

export function getPortalRepository(): PortalRepository {
  if (!cachedRepository) {
    cachedRepository = isSupabaseConfigured()
      ? new SupabasePortalRepository()
      : new SandboxPortalRepository();
  }
  return cachedRepository;
}
