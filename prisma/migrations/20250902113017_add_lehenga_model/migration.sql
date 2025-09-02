-- CreateTable
CREATE TABLE "lehenga_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "designName" TEXT NOT NULL,
    "image" TEXT,
    "description" TEXT,
    "price" REAL NOT NULL,
    "discount" REAL,
    "finalPrice" REAL NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
