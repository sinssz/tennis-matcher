-- Tennis Matcher Database Schema (Fully synchronized with schema.prisma)
-- This script is re-runnable and handles existing types/tables safely.

-- Drop existing tables (in reverse order of dependency)
DROP TABLE IF EXISTS "MatchPlayer";
DROP TABLE IF EXISTS "Match";
DROP TABLE IF EXISTS "EventParticipant";
DROP TABLE IF EXISTS "Event";
DROP TABLE IF EXISTS "Player";

-- Create enums if they don't exist
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Gender') THEN
        CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Level') THEN
        CREATE TYPE "Level" AS ENUM ('A', 'B', 'C', 'D');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventStatus') THEN
        CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'ACTIVE', 'COMPLETED');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MatchType') THEN
        CREATE TYPE "MatchType" AS ENUM ('SINGLES', 'DOUBLES');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'MatchStatus') THEN
        CREATE TYPE "MatchStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED');
    END IF;
END $$;

-- Player table
CREATE TABLE "Player" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "level" "Level" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- Event table
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "totalRounds" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- EventParticipant table
CREATE TABLE "EventParticipant" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "gamesPlayed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventParticipant_pkey" PRIMARY KEY ("id")
);

-- Match table
CREATE TABLE "Match" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "courtNumber" INTEGER NOT NULL DEFAULT 1,
    "matchType" "MatchType" NOT NULL,
    "status" "MatchStatus" NOT NULL DEFAULT 'SCHEDULED',
    "team1Score" INTEGER,
    "team2Score" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- MatchPlayer table
CREATE TABLE "MatchPlayer" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "team" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX "Player_gender_level_idx" ON "Player"("gender", "level");
CREATE INDEX "Player_isActive_idx" ON "Player"("isActive");
CREATE INDEX "Event_date_idx" ON "Event"("date");
CREATE INDEX "Event_status_idx" ON "Event"("status");
CREATE UNIQUE INDEX "EventParticipant_eventId_playerId_key" ON "EventParticipant"("eventId", "playerId");
CREATE INDEX "EventParticipant_eventId_idx" ON "EventParticipant"("eventId");
CREATE INDEX "EventParticipant_playerId_idx" ON "EventParticipant"("playerId");
CREATE INDEX "Match_eventId_roundNumber_idx" ON "Match"("eventId", "roundNumber");
CREATE INDEX "Match_status_idx" ON "Match"("status");
CREATE UNIQUE INDEX "MatchPlayer_matchId_playerId_key" ON "MatchPlayer"("matchId", "playerId");
CREATE INDEX "MatchPlayer_matchId_idx" ON "MatchPlayer"("matchId");
CREATE INDEX "MatchPlayer_playerId_idx" ON "MatchPlayer"("playerId");

-- Add foreign keys
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "EventParticipant" ADD CONSTRAINT "EventParticipant_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ==========================================
-- Sample Data
-- ==========================================

-- 1. Players (12 total: 6 male, 6 female)
INSERT INTO "Player" ("id", "name", "gender", "level", "isActive", "createdAt", "updatedAt") VALUES
('p1', '김민준', 'MALE', 'A', true, NOW(), NOW()),
('p2', '이준호', 'MALE', 'A', true, NOW(), NOW()),
('p3', '박수진', 'MALE', 'B', true, NOW(), NOW()),
('p4', '최동욱', 'MALE', 'B', true, NOW(), NOW()),
('p5', '윤기철', 'MALE', 'C', true, NOW(), NOW()),
('p6', '정현우', 'MALE', 'D', true, NOW(), NOW()),
('p7', '김나연', 'FEMALE', 'A', true, NOW(), NOW()),
('p8', '이지은', 'FEMALE', 'A', true, NOW(), NOW()),
('p9', '박예린', 'FEMALE', 'B', true, NOW(), NOW()),
('p10', '최하나', 'FEMALE', 'B', true, NOW(), NOW()),
('p11', '윤소영', 'FEMALE', 'C', true, NOW(), NOW()),
('p12', '정유나', 'FEMALE', 'D', true, NOW(), NOW());

-- 2. Event (1 sample event)
INSERT INTO "Event" ("id", "name", "date", "status", "totalRounds", "createdAt", "updatedAt") VALUES
('e1', '주말 정기 모임', CURRENT_DATE, 'DRAFT', 0, NOW(), NOW());

-- 3. EventParticipant (Add 10 participants to the event)
INSERT INTO "EventParticipant" ("id", "eventId", "playerId", "gamesPlayed", "createdAt") VALUES
('ep1', 'e1', 'p1', 0, NOW()),
('ep2', 'e1', 'p2', 0, NOW()),
('ep3', 'e1', 'p3', 0, NOW()),
('ep4', 'e1', 'p4', 0, NOW()),
('ep5', 'e1', 'p5', 0, NOW()),
('ep6', 'e1', 'p6', 0, NOW()),
('ep7', 'e1', 'p7', 0, NOW()),
('ep8', 'e1', 'p8', 0, NOW()),
('ep9', 'e1', 'p9', 0, NOW()),
('ep10', 'e1', 'p10', 0, NOW());