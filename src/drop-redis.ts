import Redis from "ioredis";

void (async (): Promise<void> => {
  console.log("Pruning Redis...");
  const client = new Redis("redis://localhost:6379");
  await client.flushall();
  await client.quit();
  console.log("Done.");
})();
