/*
  Warnings:

  - Added the required column `achievement` to the `KPI` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_KPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "currentValue" REAL NOT NULL,
    "targetValue" REAL NOT NULL,
    "positiveContribution" BOOLEAN NOT NULL,
    "weight" REAL NOT NULL,
    "score" REAL NOT NULL,
    "achievement" REAL NOT NULL DEFAULT 0,
    "pillarId" TEXT NOT NULL,
    CONSTRAINT "KPI_pillarId_fkey" FOREIGN KEY ("pillarId") REFERENCES "Pillar" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_KPI" ("id", "name", "currentValue", "targetValue", "positiveContribution", "weight", "score", "pillarId", "achievement")
SELECT "id", "name", "currentValue", "targetValue", "positiveContribution", "weight", "score", "pillarId", 0
FROM "KPI";
DROP TABLE "KPI";
ALTER TABLE "new_KPI" RENAME TO "KPI";
CREATE INDEX "KPI_pillarId_name_idx" ON "KPI"("pillarId", "name");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

