const fs = require("fs");
const path = require("path");

const sourceRoot = path.join(__dirname, "..", "node_modules", "cesium", "Build", "Cesium");
const targetRoot = path.join(__dirname, "..", "public", "cesium");
const folders = ["Assets", "ThirdParty", "Widgets", "Workers"];

if (!fs.existsSync(sourceRoot)) {
  console.warn("Cesium build assets were not found. Run npm install first.");
  process.exit(0);
}

fs.mkdirSync(targetRoot, { recursive: true });

for (const folder of folders) {
  const source = path.join(sourceRoot, folder);
  const target = path.join(targetRoot, folder);
  fs.cpSync(source, target, { recursive: true, force: true });
}

console.log("Cesium static assets copied to public/cesium.");
