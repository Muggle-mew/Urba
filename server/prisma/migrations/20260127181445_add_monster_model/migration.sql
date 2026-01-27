-- CreateTable
CREATE TABLE "Monster" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "zoneId" TEXT NOT NULL,
    "hp" INTEGER NOT NULL,
    "maxHp" INTEGER NOT NULL,
    "strength" INTEGER NOT NULL,
    "agility" INTEGER NOT NULL,
    "intuition" INTEGER NOT NULL,
    "will" INTEGER NOT NULL,
    "constitution" INTEGER NOT NULL,
    "image" TEXT,
    "expReward" INTEGER NOT NULL,
    "moneyReward" INTEGER NOT NULL
);
