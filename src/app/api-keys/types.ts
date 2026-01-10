export interface ApiKey {
  id: string // keyId from better-auth
  name: string
  userId: string
  expiresAt: Date | null
  createdAt: Date
  updatedAt: Date
  lastUsedAt: Date | null
  enabled: boolean
  startsWith: string // "start" field from better-auth
  metadata?: any
}

// Raw type from better-auth API
export interface BetterAuthApiKey {
  permissions: { [key: string]: string[] } | null
  id: string
  name: string | null
  start: string | null
  prefix: string | null
  userId: string
  refillInterval: number | null
  refillAmount: number | null
  rateLimitTimeWindow: number | null
  rateLimitMax: number | null
  rateLimitEnabled: boolean | null
  remaining: number | null
  lastUsedAt: Date | null
  expiresAt: Date | null
  enabled: boolean
  createdAt: Date
  updatedAt: Date
  metadata: Record<string, any> | null
}

export function toApiKey(raw: BetterAuthApiKey): ApiKey {
  return {
    id: raw.id,
    name: raw.name || "Unnamed",
    userId: raw.userId,
    expiresAt: raw.expiresAt,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
    lastUsedAt: raw.lastUsedAt,
    enabled: raw.enabled,
    startsWith: raw.start || raw.prefix || "",
    metadata: raw.metadata || undefined,
  }
}
