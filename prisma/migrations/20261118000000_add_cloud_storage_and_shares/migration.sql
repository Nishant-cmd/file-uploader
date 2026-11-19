ALTER TABLE "File" ADD COLUMN "storageKey" TEXT;

CREATE TABLE "FolderShare" (
    "id" TEXT NOT NULL,
    "folderId" INTEGER NOT NULL,
    "ownerId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FolderShare_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FolderShare_folderId_idx" ON "FolderShare"("folderId");
CREATE INDEX "FolderShare_expiresAt_idx" ON "FolderShare"("expiresAt");

ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_folderId_fkey"
  FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FolderShare" ADD CONSTRAINT "FolderShare_ownerId_fkey"
  FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
