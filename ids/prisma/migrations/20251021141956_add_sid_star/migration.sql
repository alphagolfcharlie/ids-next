-- CreateTable
CREATE TABLE "Sid" (
    "sid_code" TEXT NOT NULL,
    "fixes" TEXT[],

    CONSTRAINT "Sid_pkey" PRIMARY KEY ("sid_code")
);

-- CreateTable
CREATE TABLE "Star" (
    "star_code" TEXT NOT NULL,
    "fixes" TEXT[],

    CONSTRAINT "Star_pkey" PRIMARY KEY ("star_code")
);

-- CreateTable
CREATE TABLE "_SidAirports" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SidAirports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_StarAirports" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_StarAirports_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_SidAirports_B_index" ON "_SidAirports"("B");

-- CreateIndex
CREATE INDEX "_StarAirports_B_index" ON "_StarAirports"("B");

-- AddForeignKey
ALTER TABLE "_SidAirports" ADD CONSTRAINT "_SidAirports_A_fkey" FOREIGN KEY ("A") REFERENCES "Airport"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SidAirports" ADD CONSTRAINT "_SidAirports_B_fkey" FOREIGN KEY ("B") REFERENCES "Sid"("sid_code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StarAirports" ADD CONSTRAINT "_StarAirports_A_fkey" FOREIGN KEY ("A") REFERENCES "Airport"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_StarAirports" ADD CONSTRAINT "_StarAirports_B_fkey" FOREIGN KEY ("B") REFERENCES "Star"("star_code") ON DELETE CASCADE ON UPDATE CASCADE;
