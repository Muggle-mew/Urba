-- CreateTable
CREATE TABLE "Weapon" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "levelRequirement" INTEGER NOT NULL,
    "damageMin" INTEGER NOT NULL,
    "damageMax" INTEGER NOT NULL,
    "critChance" REAL NOT NULL,
    "critMultiplier" REAL NOT NULL,
    "accuracy" INTEGER NOT NULL,
    "durability" INTEGER NOT NULL,
    "maxDurability" INTEGER NOT NULL,
    "priceFRG" INTEGER NOT NULL,
    "specialEffect" TEXT
);

-- CreateTable
CREATE TABLE "PassiveActivity" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "duration" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "rewardFrg" INTEGER NOT NULL,
    CONSTRAINT "PassiveActivity_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Character" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "exp" INTEGER NOT NULL DEFAULT 0,
    "hp" INTEGER NOT NULL DEFAULT 100,
    "maxHp" INTEGER NOT NULL DEFAULT 100,
    "energy" INTEGER NOT NULL DEFAULT 100,
    "maxEnergy" INTEGER NOT NULL DEFAULT 100,
    "strength" INTEGER NOT NULL DEFAULT 5,
    "agility" INTEGER NOT NULL DEFAULT 5,
    "intuition" INTEGER NOT NULL DEFAULT 5,
    "will" INTEGER NOT NULL DEFAULT 5,
    "constitution" INTEGER NOT NULL DEFAULT 5,
    "faction" TEXT NOT NULL DEFAULT 'neutral',
    "inventory" TEXT NOT NULL DEFAULT '[]',
    "equipment" TEXT NOT NULL DEFAULT '{}',
    "location" TEXT NOT NULL DEFAULT '{"city": "verdis", "isTraveling": false}',
    "money" INTEGER NOT NULL DEFAULT 0,
    "frg" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Character_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Character" ("agility", "constitution", "createdAt", "energy", "equipment", "exp", "faction", "hp", "id", "intuition", "inventory", "level", "location", "maxEnergy", "maxHp", "money", "nickname", "strength", "updatedAt", "userId", "will") SELECT "agility", "constitution", "createdAt", "energy", "equipment", "exp", "faction", "hp", "id", "intuition", "inventory", "level", "location", "maxEnergy", "maxHp", "money", "nickname", "strength", "updatedAt", "userId", "will" FROM "Character";
DROP TABLE "Character";
ALTER TABLE "new_Character" RENAME TO "Character";
CREATE UNIQUE INDEX "Character_userId_key" ON "Character"("userId");
CREATE TABLE "new_Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "characterId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT NOT NULL DEFAULT '',
    "frgReward" INTEGER NOT NULL DEFAULT 0,
    "content" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 1,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    CONSTRAINT "Quest_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("characterId", "content", "createdAt", "expiresAt", "id", "isCompleted", "progress", "target", "type") SELECT "characterId", "content", "createdAt", "expiresAt", "id", "isCompleted", "progress", "target", "type" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
