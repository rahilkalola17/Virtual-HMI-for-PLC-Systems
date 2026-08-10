/*
 * File: src/main.tsx
 * Purpose: Application entry point. Renders the root React component.
 * Documentation header only — no logic changes.
 */
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
