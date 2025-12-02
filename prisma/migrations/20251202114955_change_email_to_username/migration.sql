/*
  Warnings:

  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- Add username column with temporary default
ALTER TABLE "User" ADD COLUMN "username" TEXT;

-- Copy email to username for existing users (extract username from email)
UPDATE "User" SET "username" = SPLIT_PART("email", '@', 1);

-- Make username NOT NULL
ALTER TABLE "User" ALTER COLUMN "username" SET NOT NULL;

-- Drop old index if exists
DROP INDEX IF EXISTS "User_email_key";

-- Drop the email column
ALTER TABLE "User" DROP COLUMN "email";

-- Create unique index on username
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
