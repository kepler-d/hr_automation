require('dotenv').config();
const { getDb } = require('./web-app/backend/db');

async function debug() {
  const db = await getDb();
  const rows = await db('dashboard_candidates').orderBy('id', 'desc').limit(2);
  
  for (const row of rows) {
    printRow(row);
  }
  process.exit(0);
}

function printRow(row) {
  console.log('--- Candidate ---');
  console.log(`ID: ${row.id}`);
  console.log(`Name: ${row.name}`);
  console.log(`Score: ${row.score}`);
  console.log(`Reason: ${row.reason}`);
  console.log(`Resume Text Length: ${row.resume_text ? row.resume_text.length : 0} chars`);
  console.log(`Resume Text Prefix: ${row.resume_text ? row.resume_text.substring(0, 100).replace(/\n/g, ' ') : 'N/A'}`);
}

debug();
