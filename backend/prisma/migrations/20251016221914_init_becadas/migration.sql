-- CreateTable
CREATE TABLE "becadas" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fecha_nacimiento" TIMESTAMP(3) NOT NULL,
    "grado" TEXT NOT NULL,
    "tipo_beca" TEXT NOT NULL,
    "departamento" TEXT NOT NULL,
    "municipio" TEXT NOT NULL,
    "comunidad" TEXT NOT NULL,
    "talla_playera" TEXT NOT NULL,
    "talla_zapatos" TEXT NOT NULL,
    "necesidades" TEXT,
    "fecha_registro" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "becadas_pkey" PRIMARY KEY ("id")
);
