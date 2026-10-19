import { createRoot, hydrateRoot } from "react-dom/client";
import { hydrate } from "@tanstack/react-query";
import App, { createAppQueryClient } from "./App";
import { ErrorBoundary } from "@/components/error-boundary";
import "./index.css";

const queryClient = createAppQueryClient();
const snapshot = document.getElementById("query-state");
if (snapshot?.textContent)
  hydrate(queryClient, JSON.parse(snapshot.textContent));
const root = document.getElementById("root")!;
const app = (
  <ErrorBoundary>
    <App queryClient={queryClient} />
  </ErrorBoundary>
);
const options = { onCaughtError: (error: unknown) => console.error(error) };
if (root.dataset.ssr === "true") hydrateRoot(root, app, options);
else createRoot(root, options).render(app);
