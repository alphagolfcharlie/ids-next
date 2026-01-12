/*
  Warnings:

  - You are about to drop the column `field` on the `Crossing` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."Crossing_field_idx";

-- AlterTable
ALTER TABLE "Crossing" DROP COLUMN "field";
