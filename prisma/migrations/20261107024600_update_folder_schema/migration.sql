DROP INDEX "File_name_key";

DROP INDEX "Folder_name_key";

CREATE INDEX "File_ownerId_folderId_name_idx" ON "File"("ownerId", "folderId", "name");

CREATE INDEX "Folder_ownerId_parentId_name_idx" ON "Folder"("ownerId", "parentId", "name");
