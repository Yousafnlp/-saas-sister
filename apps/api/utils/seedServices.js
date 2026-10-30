import 'dotenv/config';
import { connectDB, disconnectDB } from '../config/db.js';
import { importDefaultServices } from '../controllers/serviceController.js';

// Loads the default d.Aesthetics price list into the Services collection. Safe to re-run:
// services that already exist (including edited prices) are left alone.
async function run() {
  await connectDB();
  const { added, total } = await importDefaultServices();
  console.log(`Imported ${added} new service(s) out of ${total} in the default price list`);
  await disconnectDB();
  process.exit(0);
}

run().catch((err) => {
  console.error('Service import failed:', err);
  process.exit(1);
});
