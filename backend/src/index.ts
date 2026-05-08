import { config } from "./config.js";
import { createApp } from "./app.js";
import { bootstrapLogHint, connectRepositories } from "./db/context.js";

async function main() {
  await connectRepositories();
  const app = createApp();
  app.listen(config.port, () => {
    console.log(`API http://localhost:${config.port} · CouchDB: ${bootstrapLogHint()}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
