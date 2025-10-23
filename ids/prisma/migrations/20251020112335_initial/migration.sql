-- CreateEnum
CREATE TYPE "artcc_choices" AS ENUM ('ZSE', 'ZOA', 'ZLA', 'ZLC', 'ZDV', 'ZAB', 'ZHU', 'ZFW', 'ZKC', 'ZMP', 'ZAU', 'ZOB', 'ZID', 'ZME', 'ZTL', 'ZJX', 'ZMA', 'ZDC', 'ZNY', 'ZBW', 'ZSU', 'ZVR', 'ZEG', 'ZWG', 'ZYZ', 'ZQM');

-- CreateEnum
CREATE TYPE "route_source_choices" AS ENUM ('custom', 'faa');

-- CreateTable
CREATE TABLE "Airport" (
    "code" TEXT NOT NULL,
    "lat" DECIMAL(65,30) NOT NULL,
    "lon" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "Airport_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "Crossing" (
    "id" SERIAL NOT NULL,
    "field" TEXT NOT NULL,
    "fix" TEXT,
    "restriction" TEXT NOT NULL,
    "notes" TEXT,
    "artcc" "artcc_choices" NOT NULL,

    CONSTRAINT "Crossing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Enroute" (
    "id" SERIAL NOT NULL,
    "fields" TEXT[],
    "qualifier" TEXT,
    "areas" INTEGER[],
    "rule" TEXT NOT NULL,

    CONSTRAINT "Enroute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" SERIAL NOT NULL,
    "dep" TEXT NOT NULL,
    "dest" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "altitude" TEXT,
    "source" "route_source_choices" NOT NULL,
    "notes" TEXT,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);
