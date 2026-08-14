import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { render } from "../dist/server/entry-server.js";

const indexPath = fileURLToPath(new URL("../dist/index.html", import.meta.url));
const serverPath = fileURLToPath(new URL("../dist/server", import.meta.url));

try {
  const template = readFileSync(indexPath, "utf8");
  const root = '<div id="root"></div>';
  if (!template.includes(root)) {
    throw new Error("Expected an empty root in the Vite client output");
  }

  writeFileSync(indexPath, template.replace(root, `<div id="root">${render()}</div>`));
} finally {
  rmSync(serverPath, { recursive: true, force: true });
}
