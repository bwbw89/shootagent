// Lab prototype (c'), three frames of proof: the same corner of the street as the camera saw it, as the editor
// delivered it, and as ShootAgent delivers it. The argument is readable without playing anything; the only motion
// is a 2.7 s entrance (once, under the 5 s that would need a pause control): the frames rise, then each finding
// marks its frame in order and the restore lands in the third. The markup is the finished state, so reduced
// motion shows it at once. ?alt shows the proposed headline wording.
import { StrictMode, type CSSProperties } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/instrument-sans/wdth.css";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import "../src/styles.css";
import "./hero-proof.css";
import { Film } from "../src/components/Film";
import { DemoButton, Nav } from "../src/components/Nav";
import { ASSETS, img, zoomTo } from "../src/content";
import { useInputMode } from "../src/lib/motion";

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
const tagAt: CSSProperties = { left: pct(x1 + PAD + 0.008), top: pct((y0 + y1) / 2) };

// Square cells show 24% of the photo's width around the sign; the phone's strips (354 x 120) show 34%.
const suffix = (vars: CSSProperties, end: string) =>
  Object.fromEntries(Object.entries(vars).map(([k, v]) => [`${k}${end}`, v])) as CSSProperties;
const PLACE: CSSProperties = { ...zoomTo(S.sign, S.size, 0.24, 1), ...suffix(zoomTo(S.sign, S.size, 0.34, 120 / 354), "-m") };

const FRAMES = [
  {
    tone: "seen",
    chip: "As captured",
    title: "What the camera saw",
    src: "street-captured.webp",
    tag: "Stop sign",
    at: 700,
    mark: "›",
    tool: "run_qc_checks",
    text: "all 3 brackets show the sign",
    alt: "Close-up of the street corner as the camera captured it: a stop sign on its pole.",
  },
  {
    tone: "find",
    chip: "As edited",
    title: "What the editor delivered",
    src: "street-delivered.webp",
    tag: "Missing",
    at: 1250,
    mark: "!",
    tool: "Removal error",
    text: `the sign is gone · confidence ${S.confidence.toFixed(2)}`,
    alt: "The same corner in the editor's photo: the pole stands there, but the stop sign has been erased.",
  },
  {
    tone: "pass",
    chip: "Fixed",
    title: "What ShootAgent delivers",
    src: "street-delivered.webp",
    tag: "Restored",
    at: 2300,
    mark: "✓",
    tool: "restore_from_brackets",
    text: `${(S.maskShare * 100).toFixed(2)}% of the frame · outside the mask ${S.outside} / 255`,
    alt: "The same corner after ShootAgent: the stop sign is back, restored from the brackets.",
  },
] as const;

function HeroProof() {
  return (
    <section className="wrap hp" aria-labelledby="hero-title">
      <div className="hp-head">
        <p className="hp-eyebrow">AI agent for real-estate photo shoots</p>
        <h1 id="hero-title">{HEADLINE}</h1>
        <div className="hp-row">
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
      </div>

      <ol className="hp-frames" aria-label="One corner of a listing photo, three times">
        {FRAMES.map((f, i) => (
          <li className="hp-frame" key={f.tone} data-tone={f.tone} style={{ "--i": i, "--at": `${f.at}ms` } as CSSProperties}>
            <div className="hp-cell" role="img" aria-label={f.alt}>
              <div className="hp-photo" style={PLACE} aria-hidden>
                <img src={img(f.src)} alt="" />
                {f.tone === "pass" && <img className="hp-restored" src={img("street-fixed.webp")} alt="" />}
                <div className="finding hp-mark" style={signBox}>
                  <i />
                </div>
                <span className="tag hp-tag" style={tagAt}>
                  <b>{f.tag}</b>
                </span>
              </div>
              <span className="hp-chip" aria-hidden>
                <span className="hp-n">{i + 1}</span>
                {f.chip}
              </span>
            </div>
            <div className="hp-caption">
              <p className="hp-title">{f.title}</p>
              <p className="hp-trace">
                <span className="mark">{f.mark}</span>
                <span>
                  <code>{f.tool}</code> {f.text}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>
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
        <HeroProof />
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
