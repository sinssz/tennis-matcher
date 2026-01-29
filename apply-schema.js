const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function applySchema() {
  try {
    console.log('📊 Reading schema SQL...');
    const sql = fs.readFileSync('./create-schema.sql', 'utf8');

    console.log('🔧 Applying schema to database...');
    await prisma.$executeRawUnsafe(sql);

    console.log('✅ Schema applied successfully!');

    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error applying schema:', error.message);
    await prisma.$disconnect();
    process.exit(1);
  }
}

applySchema();
