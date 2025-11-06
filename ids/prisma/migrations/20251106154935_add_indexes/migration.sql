-- CreateIndex
CREATE INDEX "Crossing_field_idx" ON "Crossing"("field");

-- CreateIndex
CREATE INDEX "Enroute_fields_idx" ON "Enroute"("fields");

-- CreateIndex
CREATE INDEX "Enroute_fields_areas_idx" ON "Enroute"("fields", "areas");

-- CreateIndex
CREATE INDEX "Route_dep_dest_idx" ON "Route"("dep", "dest");
