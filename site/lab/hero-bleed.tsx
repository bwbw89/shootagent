// Lab prototype (a), full bleed: the hero is one photo, edge to edge. The viewfinder crosses the editor's street
// photo, finds the stop sign the editor erased where it stands, then the restore lands through its mask. One run
// (7.4 s), then it holds. The markup is the finished state (sign restored, corners green), so reduced motion and a
// replay that has not started both read correctly. ?alt shows the proposed headline wording.
import { StrictMode, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./hero-bleed.css";
import { Mark } from "../src/components/Brand";
import { Film } from "../src/components/Film";
import { Pause, Play, Replay } from "../src/components/Icons";
import { DemoButton, Nav } from "../src/components/Nav";
import { ASSETS, img } from "../src/content";
import { useInputMode, useOnScreen, usePageVisible, useReducedMotion } from "../src/lib/motion";

const HEADLINE = new URLSearchParams(location.search).has("alt")
  ? "Every listing photo, checked against what the camera saw."
  : "Checked against what the camera saw.";

const S = ASSETS.street;
const [x0, y0, x1, y1] = S.sign as [number, number, number, number];
const pct = (v: number) => `${(v * 100).toFixed(2)}%`;
const PAD = 0.01;
const signBox: CSSProperties = {
  left: pct(x0 - PAD),
  top: pct(y0 - PAD * 1.5),
  width: pct(x1 - x0 + 2 * PAD),
  height: pct(y1 - y0 + 3 * PAD),
};
const tagAt: CSSProperties = { left: pct(x1 + PAD + 0.006), top: pct(y0 - PAD * 1.5) };
// The viewfinder settles centred on the sign: 13% of the photo's width, 22% of its height.
const cx = (x0 + x1) / 2;
const cy = (y0 + y1) / 2;
const LENS = { "--lw": "13%", "--lt": pct(cy - 0.11), "--lb": pct(1 - cy - 0.11), "--lx-end": pct(cx - 0.065) } as CSSProperties;

// Beats in ms from the start of a run; hero-bleed.css carries the same numbers.
const T = { find: 3650, restore: 5700, pass: 6600 };
const beat = (at: number, extra: Record<string, string> = {}) => ({ "--at": `${at}ms`, ...extra }) as CSSProperties;

function Row({ at, mark, tool, tone, children }: { at: number; mark: string; tool: string; tone?: string; children: ReactNode }) {
  return (
    <div className="trace-row" data-tone={tone} style={beat(at)}>
      <span className="mark">{mark}</span>
      <p>
        <code>{tool}</code> {children}
      </p>
    </div>
  );
}

function HeroBleed() {
  const reduced = useReducedMotion();
  const [run, setRun] = useState(0);
  const [mode, setMode] = useState<"playing" | "paused" | "ended">("playing");
  const media = useRef<HTMLDivElement>(null);
  const onScreen = useOnScreen(media);
  const visible = usePageVisible();
  const active = mode === "playing" && onScreen && visible;

  const control = () => {
    if (mode === "playing") setMode("paused");
    else if (mode === "paused") setMode("playing");
    else {
      setRun((r) => r + 1);
      setMode("playing");
    }
  };

  return (
    <section className="hb" aria-labelledby="hero-title" data-paused={(!active && mode !== "ended") || undefined}>
      <div
        className="hb-media"
        ref={media}
        role="img"
        aria-label="The editor's photo of a street. ShootAgent's viewfinder compares it with the camera's brackets and finds a stop sign the editor erased, then restores the sign from the brackets; nothing else in the photo changes."
      >
        <div className="hb-photo" style={LENS} aria-hidden>
          <img className="hb-layer" src={img("street-delivered.webp")} alt="" fetchPriority="high" />
          <div className="hb-scene" key={run}>
            <img className="hb-layer hb-restored beat" src={img("street-fixed.webp")} alt="" style={beat(T.restore, { "--dur": "1100ms" })} />
            <img className="hb-layer lens-view hb-lens-out" src={img("street-captured.webp")} alt="" />
            <div className="lens hb-lens-out">
              <i />
              <span className="lens-tag">As the camera saw it</span>
            </div>
            <div className="finding hb-finding" style={signBox}>
              <i />
            </div>
            <span className="tag hb-tag-missing" style={tagAt}>
              <b>Missing</b> stop sign
            </span>
            <span className="tag beat" style={{ ...tagAt, ...beat(T.pass), "--tone": "var(--pass)" } as CSSProperties}>
              <b>Restored</b> from the brackets
            </span>
            <i className="hb-clock" onAnimationEnd={() => setMode("ended")} />
          </div>
        </div>
      </div>

      <div className="hb-copy">
        <p className="hb-eyebrow">
          <Mark size={14} />
          AI agent for real-estate photo shoots
        </p>
        <h1 id="hero-title">{HEADLINE}</h1>
        <p className="lede">
          ShootAgent compares every edited photo with the camera’s own brackets, fixes what the editor got wrong, makes
          the customer’s changes, and delivers the listing with California’s AB 723 disclosures.
        </p>
        <div className="hero-actions">
          <DemoButton />
          <a className="text-link" href="#how">
            How it works
          </a>
        </div>
      </div>

      <div className="hb-side">
        <div className="hb-trace" key={`trace-${run}`} aria-label="The agent's trace" role="group">
          <Row at={300} mark="›" tool="run_qc_checks">
            compares the photo with its 3 brackets
          </Row>
          <Row at={T.find} mark="!" tool="Removal error" tone="find">
            a stop sign in every bracket is missing · {S.confidence.toFixed(2)}
          </Row>
          <Row at={T.restore} mark="›" tool="restore_from_brackets">
            {(S.maskShare * 100).toFixed(2)}% of the frame
          </Row>
          <Row at={T.pass} mark="✓" tool="Self-check" tone="pass">
            outside the mask {S.outside} / 255
          </Row>
        </div>
        {!reduced && (
          <button
            className="control hb-control"
            onClick={control}
            aria-label={mode === "playing" ? "Pause the check" : mode === "ended" ? "Play the check again" : "Play the check"}
          >
            {mode === "playing" ? <Pause /> : mode === "ended" ? <Replay /> : <Play />}
            {mode === "playing" ? "Pause" : mode === "ended" ? "Replay" : "Play"}
          </button>
        )}
      </div>
    </section>
  );
}

function Page() {
  useInputMode();
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav />
      <main id="main" tabIndex={-1}>
        <HeroBleed />
        <Film />
      </main>
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page />
  </StrictMode>,
);
