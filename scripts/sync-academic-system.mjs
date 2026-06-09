import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const ROOT = process.cwd();
const sourceDist = resolve(ROOT, "systems", "upg-systeme", "dist");
const targetDir = resolve(ROOT, "public", "systeme-academique");

async function run() {
  await rm(targetDir, { recursive: true, force: true });
  await mkdir(targetDir, { recursive: true });
  await cp(sourceDist, targetDir, { recursive: true, force: true });
  console.log("Systeme academique synchronise vers public/systeme-academique");
}

run().catch((error) => {
  console.error("Echec de synchronisation du systeme academique:", error);
  process.exit(1);
});
