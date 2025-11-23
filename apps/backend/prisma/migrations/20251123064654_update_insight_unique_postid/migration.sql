/*
  Warnings:

  - You are about to drop the column `timestamp` on the `Insight` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[postId]` on the table `Insight` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Insight` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Insight" DROP COLUMN "timestamp",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Insight_postId_key" ON "Insight"("postId");
