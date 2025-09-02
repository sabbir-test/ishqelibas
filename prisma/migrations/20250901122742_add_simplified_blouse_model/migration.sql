/*
  Warnings:

  - You are about to drop the `blouse_design_categories` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blouse_design_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `blouse_designs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `backDesignId` on the `blouse_models` table. All the data in the column will be lost.
  - You are about to drop the column `frontDesignId` on the `blouse_models` table. All the data in the column will be lost.
  - Added the required column `designName` to the `blouse_models` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "blouse_design_categories_name_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "blouse_design_categories";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "blouse_design_variants";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "blouse_designs";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "salwar_measurements" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "customOrderId" TEXT,
    "userId" TEXT,
    "bust" REAL,
    "waist" REAL,
    "hip" REAL,
    "kameezLength" REAL,
    "shoulder" REAL,
    "sleeveLength" REAL,
    "armholeRound" REAL,
    "wristRound" REAL,
    "waistTie" REAL,
    "salwarLength" REAL,
    "thighRound" REAL,
    "kneeRound" REAL,
    "ankleRound" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "salwar_measurements_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "salwar_measurements_customOrderId_fkey" FOREIGN KEY ("customOrderId") REFERENCES "custom_orders" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_blouse_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "designName" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "discount" REAL,
    "finalPrice" REAL NOT NULL,
    "stitchCost" REAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_blouse_models" ("createdAt", "description", "discount", "finalPrice", "id", "image", "isActive", "name", "price", "updatedAt") SELECT "createdAt", "description", "discount", "finalPrice", "id", "image", "isActive", "name", "price", "updatedAt" FROM "blouse_models";
DROP TABLE "blouse_models";
ALTER TABLE "new_blouse_models" RENAME TO "blouse_models";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
