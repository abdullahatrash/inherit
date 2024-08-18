/*
  Warnings:

  - Added the required column `buildingId` to the `Pillar` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Building" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Pillar" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "score" REAL NOT NULL DEFAULT 0,
    "buildingId" TEXT NOT NULL,
    CONSTRAINT "Pillar_buildingId_fkey" FOREIGN KEY ("buildingId") REFERENCES "Building" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Pillar" ("id", "name", "score", "weight") SELECT "id", "name", "score", "weight" FROM "Pillar";
DROP TABLE "Pillar";
ALTER TABLE "new_Pillar" RENAME TO "Pillar";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
