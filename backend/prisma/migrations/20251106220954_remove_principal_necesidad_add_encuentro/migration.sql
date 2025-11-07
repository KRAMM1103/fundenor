/*
  Warnings:

  - You are about to drop the column `principalNecesidad` on the `SeguimientoMensual` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SeguimientoMensual" DROP COLUMN "principalNecesidad",
ADD COLUMN     "asistenciaEncuentroAnual" BOOLEAN;
