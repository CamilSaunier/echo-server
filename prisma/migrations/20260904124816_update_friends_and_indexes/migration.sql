/*
  Warnings:

  - The `status` column on the `Friendship` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'BLOCKED');

-- AlterTable
ALTER TABLE "ConversationParticipant" ADD COLUMN     "lastReadAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Friendship" DROP COLUMN "status",
ADD COLUMN     "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING';

-- CreateIndex
CREATE INDEX "Friendship_userId_status_idx" ON "Friendship"("userId", "status");

-- CreateIndex
CREATE INDEX "Friendship_friendId_status_idx" ON "Friendship"("friendId", "status");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");
