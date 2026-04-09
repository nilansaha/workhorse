#!/usr/bin/env bun
const cmd = Bun.argv[2];
const port = Bun.argv[3] ?? "4567";

const usage = `Usage:
  workhorse dashboard [port]    Boot the Workhorse dashboard (default port 4567)
`;

if (!cmd || cmd === "--help" || cmd === "-h") {
  console.log(usage);
  process.exit(cmd ? 0 : 1);
}

if (cmd !== "dashboard") {
  console.error(`Unknown command: ${cmd}\n\n${usage}`);
  process.exit(1);
}

if (!process.env.DB_URL) {
  console.error("Error: DB_URL is not set. Set it before running the dashboard.");
  process.exit(1);
}

// The package directory — `next dev` runs from here so it finds app/, next.config.ts, etc.
const packageDir = new URL(".", import.meta.url).pathname;

console.log(`workhorse dashboard → http://localhost:${port}`);

const proc = Bun.spawn(
  ["bun", "x", "next", "dev", "--turbopack", "--port", port],
  {
    cwd: packageDir,
    stdio: ["inherit", "inherit", "inherit"],
    env: process.env,
  },
);

await proc.exited;
process.exit(proc.exitCode ?? 0);
