// One-command local setup: `npm run local`
// Creates .env (with a random secret) if missing, starts the Docker database,
// applies migrations, loads the catalogue and starts the dev server.
import { execSync, spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { copyFileSync, existsSync, readFileSync, writeFileSync } from "node:fs";

const run = (cmd) => execSync(cmd, { stdio: "inherit", shell: true });
const step = (msg) => console.log(`\n>>> ${msg}\n`);

if (!existsSync(".env")) {
  step("Creating .env");
  copyFileSync(".env.example", ".env");
  let env = readFileSync(".env", "utf8");
  env = env
    .replace(/^AUTH_SECRET=""/m, `AUTH_SECRET="${randomBytes(48).toString("base64")}"`)
    .replace(/^ADMIN_PASSWORD=""/m, 'ADMIN_PASSWORD="RedBetta@2026"');
  writeFileSync(".env", env);
}

if (process.env.SKIP_DOCKER !== "true") {
  step("Starting the database (Docker Desktop must be open)");
  try {
    run("docker compose up -d db");
  } catch {
    console.error("\nDocker is not running. Open Docker Desktop, wait until it says 'running', then run: npm run local\n");
    process.exit(1);
  }
  step("Waiting for the database");
  let ready = false;
  for (let i = 0; i < 30 && !ready; i++) {
    try {
      execSync("docker compose exec -T db pg_isready -U redbetta", { stdio: "ignore", shell: true });
      ready = true;
    } catch {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  if (!ready) {
    console.error("\nThe database did not start. Restart Docker Desktop and try again.\n");
    process.exit(1);
  }
}

step("Setting up tables");
run("npx prisma migrate deploy");
step("Loading products, coupons and admin account");
run("npx prisma db seed");

const adminLine = readFileSync(".env", "utf8").match(/^ADMIN_PASSWORD="(.*)"/m);
console.log("\n==============================================");
console.log(" Store:  http://localhost:3000");
console.log(" Admin:  http://localhost:3000/admin");
console.log(" Login:  admin@redbetta.in");
console.log(` Pass:   ${adminLine?.[1] || "(see ADMIN_PASSWORD in .env)"}`);
console.log(" Stop:   press Ctrl + C in this window");
console.log("==============================================\n");

spawn("npx", ["next", "dev"], { stdio: "inherit", shell: true });
