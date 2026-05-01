import { createApp } from "./src/app.js";
import { connectDatabase } from "./src/config/db.js";
import { env } from "./src/config/env.js";

async function startServer() {
  await connectDatabase();
  const app = createApp();

  app.listen(env.port, "0.0.0.0", () => {
    console.log(`Server listening on http://localhost:${env.port}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server", error);
  process.exit(1);
});
