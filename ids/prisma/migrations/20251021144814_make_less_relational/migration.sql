/*
  Warnings:

  - You are about to drop the `_SidAirports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_StarAirports` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "public"."_SidAirports" DROP CONSTRAINT "_SidAirports_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_SidAirports" DROP CONSTRAINT "_SidAirports_B_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StarAirports" DROP CONSTRAINT "_StarAirports_A_fkey";

-- DropForeignKey
ALTER TABLE "public"."_StarAirports" DROP CONSTRAINT "_StarAirports_B_fkey";

-- AlterTable
ALTER TABLE "Sid" ADD COLUMN     "apts" TEXT[];

-- AlterTable
ALTER TABLE "Star" ADD COLUMN     "apts" TEXT[];

-- DropTable
DROP TABLE "public"."_SidAirports";

-- DropTable
DROP TABLE "public"."_StarAirports";
