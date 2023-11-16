-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_technologies" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "studied" BOOLEAN NOT NULL DEFAULT false,
    "deadline" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,
    CONSTRAINT "technologies_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_technologies" ("createdAt", "deadline", "id", "studied", "title", "userId") SELECT "createdAt", "deadline", "id", "studied", "title", "userId" FROM "technologies";
DROP TABLE "technologies";
ALTER TABLE "new_technologies" RENAME TO "technologies";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
