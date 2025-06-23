/*
  Warnings:

  - You are about to drop the `Track` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `telegramId` on the `User` table. All the data in the column will be lost.
  - Added the required column `telegram_id` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Track";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Audio" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Audio_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegram_id" TEXT NOT NULL,
    "username" TEXT,
    "vibeCoins" INTEGER NOT NULL DEFAULT 0
);
INSERT INTO "new_User" ("id", "username", "vibeCoins") SELECT "id", "username", "vibeCoins" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegram_id_key" ON "User"("telegram_id");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
