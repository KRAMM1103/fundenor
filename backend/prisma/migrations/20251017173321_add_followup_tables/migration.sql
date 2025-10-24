-- CreateTable
CREATE TABLE "SeguimientoMensual" (
    "id" SERIAL NOT NULL,
    "becadaId" INTEGER NOT NULL,
    "mes" TEXT NOT NULL,
    "principalNecesidad" TEXT NOT NULL,
    "sesion1_tema" TEXT,
    "sesion2_tema" TEXT,
    "sesion3_tema" TEXT,
    "sesion4_tema" TEXT,
    "sesion5_tema" TEXT,
    "sesion6_tema" TEXT,
    "sesion7_tema" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SeguimientoMensual_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DatosFinales" (
    "id" SERIAL NOT NULL,
    "becadaId" INTEGER NOT NULL,
    "anio" INTEGER NOT NULL,
    "insumosRecibidos" TEXT,
    "estadoCiclo" TEXT NOT NULL,
    "papeleriaCompleta" BOOLEAN NOT NULL,
    "solicitudContinuidad" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DatosFinales_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SeguimientoMensual" ADD CONSTRAINT "SeguimientoMensual_becadaId_fkey" FOREIGN KEY ("becadaId") REFERENCES "becadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DatosFinales" ADD CONSTRAINT "DatosFinales_becadaId_fkey" FOREIGN KEY ("becadaId") REFERENCES "becadas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
