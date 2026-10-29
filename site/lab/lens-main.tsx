import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./lens.css";
import { Film } from "../src/components/Film";
import { Hero } from "../src/components/Hero";
import { Nav } from "../src/components/Nav";
import { useInputMode } from "../src/lib/motion";
import { LensDemo } from "./LensDemo";

// The "Try the viewfinder" prototype, shown where it is proposed to go: straight after the hero, before the film.
// /lab/lens.html?solo shows the section on its own.
function Lab() {
  useInputMode();
  const solo = new URLSearchParams(window.location.search).has("solo");
  return (
    <>
      <p
        style={{
          margin: 0,
          padding: "6px 16px",
          background: "#1d1a2e",
          color: "var(--agent-ink)",
          font: "500 12.5px/1.5 var(--mono)",
          textAlign: "center",
        }}
      >
        Lab prototype: “Try the viewfinder”{solo ? ", on its own" : ", between the hero and the film"}
      </p>
      <Nav />
      <main id="main" tabIndex={-1}>
        {!solo && <Hero />}
        <LensDemo />
        {!solo && <Film />}
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
