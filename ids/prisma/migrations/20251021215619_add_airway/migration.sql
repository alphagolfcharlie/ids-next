-- CreateTable
CREATE TABLE "Airway" (
    "awy_code" TEXT NOT NULL,
    "fixes" TEXT[],

    CONSTRAINT "Airway_pkey" PRIMARY KEY ("awy_code")
);
