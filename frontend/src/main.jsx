import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App.jsx";
import { initializeGoogleTag } from "./google-tag.js";
import "./styles.css";

initializeGoogleTag(import.meta.env.VITE_GOOGLE_TAG_ID);

const root = document.getElementById("root");
if (root.hasChildNodes()) {
  hydrateRoot(root, <App />);
} else {
  createRoot(root).render(<App />);
}
