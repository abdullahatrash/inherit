-- CreateTable
CREATE TABLE "Pillar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "score" REAL NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "KPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "targetValue" REAL NOT NULL,
    "positiveContribution" BOOLEAN NOT NULL,
    "weight" REAL NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "pillarId" TEXT NOT NULL,
    CONSTRAINT "KPI_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
