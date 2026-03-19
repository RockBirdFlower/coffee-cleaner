const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const rootDir = path.join(__dirname, "..");
const indexPath = path.join(rootDir, "index.html");

const requiredEnvKeys = ["APP_PASSWORD"];

for (const key of requiredEnvKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required env: ${key}`);
  }
}

const replacements = {
  "%%APP_PASSWORD_HASH%%": crypto
    .createHash("sha256")
    .update(process.env.APP_PASSWORD)
    .digest("hex"),
};

let html = fs.readFileSync(indexPath, "utf8");

for (const [token, value] of Object.entries(replacements)) {
  html = html.split(token).join(value);
}

fs.writeFileSync(indexPath, html, "utf8");
