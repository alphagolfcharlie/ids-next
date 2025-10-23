/*
  Warnings:

  - You are about to drop the column `artcc` on the `Crossing` table. All the data in the column will be lost.
  - Added the required column `artcc_giving` to the `Crossing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `artcc_receiving` to the `Crossing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Crossing" DROP COLUMN "artcc",
ADD COLUMN     "artcc_giving" "artcc_choices" NOT NULL,
ADD COLUMN     "artcc_receiving" "artcc_choices" NOT NULL;
