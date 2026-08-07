-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "scope" TEXT,
    "expires" DATETIME,
    "accessToken" TEXT NOT NULL,
    "userId" BIGINT,
    "firstName" TEXT,
    "lastName" TEXT,
    "email" TEXT,
    "accountOwner" BOOLEAN NOT NULL DEFAULT false,
    "locale" TEXT,
    "collaborator" BOOLEAN DEFAULT false,
    "emailVerified" BOOLEAN DEFAULT false,
    "refreshToken" TEXT,
    "refreshTokenExpires" DATETIME
);

-- CreateTable
CREATE TABLE "ShopSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "plusEnabled" BOOLEAN NOT NULL DEFAULT false,
    "plusTrialEnds" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Section" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" INTEGER NOT NULL DEFAULT 0,
    "isPro" BOOLEAN NOT NULL DEFAULT false,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "groups" TEXT NOT NULL DEFAULT '',
    "shopifyUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "handle" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 99
);

-- CreateTable
CREATE TABLE "SectionPurchase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "chargeId" TEXT,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" TEXT NOT NULL DEFAULT 'paid',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SectionPurchase_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InstalledSection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    "themeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "InstalledSection_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Bundle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shop" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "discountPct" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BundleItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bundleId" TEXT NOT NULL,
    "sectionId" TEXT NOT NULL,
    CONSTRAINT "BundleItem_bundleId_fkey" FOREIGN KEY ("bundleId") REFERENCES "Bundle" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BundleItem_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ShopSettings_shop_key" ON "ShopSettings"("shop");

-- CreateIndex
CREATE UNIQUE INDEX "Section_handle_key" ON "Section"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "Category_handle_key" ON "Category"("handle");

-- CreateIndex
CREATE UNIQUE INDEX "InstalledSection_shop_sectionId_key" ON "InstalledSection"("shop", "sectionId");
