# Mark all 7 migrations as applied without actually running them
for migration in migrations/*/; do
  npx prisma migrate resolve --applied "$(basename "$migration")"
done
