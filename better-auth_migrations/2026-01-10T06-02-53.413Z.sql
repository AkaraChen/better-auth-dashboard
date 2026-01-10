create table "apikey" ("id" text not null primary key, "name" text, "start" text, "prefix" text, "key" text not null, "userId" text not null references "user" ("id") on delete cascade, "refillInterval" integer, "refillAmount" integer, "lastRefillAt" date, "enabled" integer, "rateLimitEnabled" integer, "rateLimitTimeWindow" integer, "rateLimitMax" integer, "requestCount" integer, "remaining" integer, "lastRequest" date, "expiresAt" date, "createdAt" date not null, "updatedAt" date not null, "permissions" text, "metadata" text);

create index "apikey_key_idx" on "apikey" ("key");

create index "apikey_userId_idx" on "apikey" ("userId");