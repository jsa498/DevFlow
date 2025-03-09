// This script seeds the production database
const { execSync } = require('child_process');

// Replace this with your actual Neon database URL from Vercel
const productionDatabaseUrl = process.env.PRODUCTION_DB_URL;

if (!productionDatabaseUrl) {
  console.error('Please provide the production database URL as an environment variable:');
  console.error('PRODUCTION_DB_URL="your-neon-db-url" node seed-production.js');
  process.exit(1);
}

console.log('Seeding production database...');

try {
  // Run the Prisma seed command with the production database URL
  execSync(`DATABASE_URL="${productionDatabaseUrl}" npx prisma db seed`, {
    stdio: 'inherit',
  });
  
  console.log('Production database seeded successfully!');
} catch (error) {
  console.error('Error seeding production database:', error);
  process.exit(1);
} 