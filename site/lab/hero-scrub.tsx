// Lab prototype (b), split: "what the camera saw" against "what the editor delivered", divided by a line the
// visitor drags. The line rests just right of the stop sign, so the still frame already shows the sign on the
// camera's side; a 3.3 s hint (once, under the 5 s that would need a pause control) sweeps it over the sign and back.
// "See the fix" turns the same line into the editor's photo against ShootAgent's, where only the sign differs.
// The markup is the finished state; reduced motion skips the hint. ?alt shows the proposed headline wording.
import { StrictMode, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./hero-scrub.css";
import { Film } from "../src/components/Film";
import { DemoButton, Nav } from "../src/components/Nav";
import { ASSETS, img } from "../src/content";
import { useInputMode, useReducedMotion } from "../src/lib/motion";

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

type Mode = "find" | "fix";
// Where the line rests in each mode, as a share of the photo's width (hero-scrub.css has the same numbers):
// right of the sign while finding (the sign shows on the camera's side), left of it for the fix.
const REST: Record<Mode, number> = { find: 30, fix: 13 };
const SIDES: Record<Mode, [string, string]> = {
  find: ["As captured", "As edited"],
  fix: ["As edited", "Fixed by ShootAgent"],
};

function HeroScrub() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState<Mode>("find");
  const [split, setSplit] = useState<number | null>(null);
  const [intro, setIntro] = useState(true);
  const [dragging, setDragging] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const box = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (reduced) setIntro(false);
  }, [reduced]);

  const at = split ?? REST[mode];
  const [left, right] = SIDES[mode];

  // A pointer's x as a share of the photo, kept inside the part of the photo the stage shows.
  const range = () => {
    const b = box.current!.getBoundingClientRect();
    const s = stage.current!.getBoundingClientRect();
    return { b, min: ((s.left - b.left) / b.width) * 100 + 2, max: ((s.right - b.left) / b.width) * 100 - 2 };
  };
  const clampTo = (v: number) => {
    const { min, max } = range();
    return Math.min(max, Math.max(min, v));
  };
  const fromX = (clientX: number) => {
    const { b } = range();
    return clampTo(((clientX - b.left) / b.width) * 100);
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    if (e.button !== 0 || target.closest("button")) return;
    // Touch drags only from the handle, so a swipe over the photo still scrolls the page.
    if (e.pointerType !== "mouse" && !target.closest(".hs-grip")) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    setIntro(false);
    setDragging(true);
    setSplit(fromX(e.clientX));
  };
  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (dragging) setSplit(fromX(e.clientX));
  };
  const endDrag = () => setDragging(false);

  const onKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    const step = e.shiftKey ? 10 : 2;
    const next =
      e.key === "ArrowLeft" || e.key === "ArrowDown"
        ? at - step
        : e.key === "ArrowRight" || e.key === "ArrowUp"
          ? at + step
          : e.key === "Home"
            ? 0
            : e.key === "End"
              ? 100
              : null;
    if (next === null) return;
    e.preventDefault();
    setIntro(false);
    setSplit(clampTo(next));
  };

  const choose = (m: Mode) => {
    setIntro(false);
    setSplit(null);
    setMode(m);
  };
  // A radio group, as in Chain.tsx: one stop in the tab order, arrow keys move the choice.
  const MODES: Mode[] = ["find", "fix"];
  const onRadioKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const i = MODES.indexOf(mode);
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: MODES.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const n = (to + MODES.length) % MODES.length;
    choose(MODES[n]!);
    e.currentTarget.querySelectorAll<HTMLButtonElement>("[role=radio]")[n]?.focus();
  };

  return (
    <section className="wrap hs" aria-labelledby="hero-title">
      <div className="hs-head">
        <h1 id="hero-title">{HEADLINE}</h1>
        <div className="hs-intro">
          <p className="lede">
            ShootAgent is an AI agent for real-estate photo shoots. It compares every edited photo with the camera’s own
            brackets, fixes what the editor got wrong, makes the customer’s changes, and delivers the listing with
            California’s AB 723 disclosures.
          </p>
          <div className="hero-actions">
            <DemoButton />
            <a className="text-link" href="#how">
              How it works
            </a>
          </div>
        </div>
      </div>

      <figure className="hs-figure">
        <div
          className="hs-stage"
          ref={stage}
          data-mode={mode}
          data-intro={intro || undefined}
          data-dragging={dragging || undefined}
          style={split === null ? undefined : ({ "--hs-split": `${split}%` } as CSSProperties)}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onAnimationEnd={(e) => e.animationName === "hs-hint" && setIntro(false)}
        >
          <div className="hs-box" aria-hidden>
            <img src={img("street-delivered.webp")} alt="" fetchPriority="high" />
            <img className="hs-fixed" src={img("street-fixed.webp")} alt="" />
          </div>
          <div className="hs-box hs-left" aria-hidden>
            <img src={img("street-captured.webp")} alt="" />
            <img className="hs-edited" src={img("street-delivered.webp")} alt="" />
          </div>
          <div className="hs-box" ref={box}>
            <div className="finding hs-marker" style={signBox} aria-hidden>
              <i />
            </div>
            <div className="hs-seam">
              <span
                className="hs-grip"
                role="slider"
                tabIndex={0}
                aria-label={`Divider: ${left.toLowerCase()} on the left, ${right.toLowerCase()} on the right`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(at)}
                aria-valuetext={`${Math.round(at)}% of the photo ${left.toLowerCase()}`}
                onKeyDown={onKeyDown}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                  <path d="M9.5 7 4.5 12l5 5M14.5 7l5 5-5 5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </div>
          </div>
          <span className="hs-chip hs-chip-left" aria-hidden>
            {left}
          </span>
          <span className="hs-chip hs-chip-right" aria-hidden>
            {right}
          </span>
          <div className="seg hs-seg" role="radiogroup" aria-label="Compare" onKeyDown={onRadioKey}>
            <button role="radio" aria-checked={mode === "find"} tabIndex={mode === "find" ? 0 : -1} onClick={() => choose("find")}>
              Find the error
            </button>
            <button role="radio" aria-checked={mode === "fix"} tabIndex={mode === "fix" ? 0 : -1} onClick={() => choose("fix")}>
              See the fix
            </button>
          </div>
        </div>
        <figcaption className="hs-status" aria-live="polite">
          {mode === "find" ? (
            <>
              <span className="hs-mark" data-tone="find">!</span>
              <span>
                <code>Removal error</code> every one of the camera’s 3 brackets shows a stop sign the edit has lost ·
                confidence {S.confidence.toFixed(2)}
              </span>
            </>
          ) : (
            <>
              <span className="hs-mark" data-tone="pass">✓</span>
              <span>
                <code>restore_from_brackets</code> {(S.maskShare * 100).toFixed(2)}% of the frame, from the brackets ·
                outside the mask {S.outside} / 255
              </span>
            </>
          )}
          <span className="hs-hint">Drag the line to compare</span>
        </figcaption>
      </figure>
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
        <HeroScrub />
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
