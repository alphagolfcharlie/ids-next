-- CreateTable
CREATE TABLE "Fix" (
    "fix_id" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lon" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Fix_pkey" PRIMARY KEY ("fix_id")
);
