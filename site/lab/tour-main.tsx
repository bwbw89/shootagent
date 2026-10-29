// Lab preview of the "Watch a real run" section on its own. ?scroll puts a screen of space above and below it, to
// check that nothing loads until it is near, that autoplay waits for it, and that it pauses when scrolled away.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./tour.css";
import { useInputMode } from "../src/lib/motion";
import { Tour } from "./Tour";

const spaced = new URLSearchParams(location.search).has("scroll");
const spacer = { height: "260vh" };

function Lab() {
  useInputMode();
  return (
    <main id="main">
      {spaced && <div style={spacer} />}
      <Tour />
      {spaced && <div style={spacer} />}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Lab />
  </StrictMode>,
);
