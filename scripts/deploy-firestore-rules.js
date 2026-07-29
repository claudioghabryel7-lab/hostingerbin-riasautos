#!/usr/bin/env node
/**
 * Publica firestore.rules no projeto Firebase configurado.
 * Usa FIREBASE_TOKEN (CI) ou credenciais locais do Firebase CLI.
 */
const { spawnSync } = require("child_process");
const path = require("path");

const root = path.resolve(__dirname, "..");
const args = ["deploy", "--only", "firestore:rules", "--non-interactive", "--project", "gestorfinan-88c9c"];

if (process.env.FIREBASE_TOKEN) {
  args.push("--token", process.env.FIREBASE_TOKEN);
}

console.log("> firebase", args.join(" "));
const result = spawnSync("npx", ["firebase", ...args], {
  cwd: root,
  stdio: "inherit",
  env: process.env,
  shell: true,
});

process.exit(result.status ?? 1);
