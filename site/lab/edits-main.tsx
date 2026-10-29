// Lab page for the customer-requests section, on its own with the page's styles and fonts. ?below starts it under
// the screen, so its entrance plays when it scrolls into view.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./edits.css";
import { useInputMode } from "../src/lib/motion";
import { Edits } from "./Edits";

const below = new URLSearchParams(location.search).has("below");

function Lab() {
  useInputMode();
  return (
    <main id="main">
      {below && (
        <div className="wrap" style={{ minHeight: "130vh", paddingTop: 48 }}>
          <p className="muted">Lab: the page above the section. Scroll down.</p>
        </div>
      )}
      <Edits />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
