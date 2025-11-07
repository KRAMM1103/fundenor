/*
  Warnings:

  - You are about to drop the column `nombre` on the `becadas` table. All the data in the column will be lost.
  - Added the required column `nombres` to the `becadas` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "becadas" DROP COLUMN "nombre",
ADD COLUMN     "apellidos" TEXT,
ADD COLUMN     "nombres" TEXT NOT NULL;
