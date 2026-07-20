// shared.jsx — shared data, tokens, hooks used by both directions.

const STUDIO = {
  name: "204",
  suffix: "NO-CONTENT",
  tag: "Creative studio for image, motion & interaction",
};

const WORKS = [
  { id: "w01", code: "NC·001", title: "Halide Parallax", client: "Mekano Ltd.", cat: "film", year: "2025", runtime: "02:14", note: "Short film identity & end titles.", scene: "cathedral" },
  { id: "w02", code: "NC·002", title: "Obsidian Bureau", client: "Obsidian Records", cat: "identity", year: "2025", runtime: "—", note: "Record label rebrand, 14 sleeves.", scene: "interior" },
  { id: "w03", code: "NC·003", title: "Slow Burn", client: "Atlas Coffee Co.", cat: "motion", year: "2024", runtime: "00:48", note: "Six-spot broadcast package.", scene: "interior" },
  { id: "w04", code: "NC·004", title: "Nightshade OS", client: "Nightshade Studio", cat: "interactive", year: "2024", runtime: "—", note: "Experimental reading interface.", scene: "water" },
  { id: "w05", code: "NC·005", title: "The Hollow Hour", client: "Mubi / Aperture", cat: "film", year: "2024", runtime: "04:02", note: "Title sequence, 35mm grain.", scene: "desert" },
  { id: "w06", code: "NC·006", title: "Perforated Sun", client: "Form & Forge", cat: "identity", year: "2023", runtime: "—", note: "Ceramic brand, print system.", scene: "desert" },
  { id: "w07", code: "NC·007", title: "Undercurrent", client: "Pier 14 Gallery", cat: "motion", year: "2023", runtime: "01:20", note: "Looping gallery wall piece.", scene: "water" },
  { id: "w08", code: "NC·008", title: "Graphite Bay", client: "Fieldbook Journal", cat: "interactive", year: "2023", runtime: "—", note: "Editorial reading app, issue 04.", scene: "cathedral" },
];

const CATEGORIES = ["all", "film", "motion", "identity", "interactive"];

const SERVICES = [
  { n: "01", label: "Direction", scene: "cathedral", body: "Art direction and creative leadership on single projects or sustained campaigns. We own the look and defend it." },
  { n: "02", label: "Motion & Film", scene: "desert", body: "Title sequences, broadcast packages, and short-form film. Shot, composited, graded in-house." },
  { n: "03", label: "Identity", scene: "interior", body: "Marks, type systems, editorial standards. Built to survive a long shelf life and a loud feed." },
  { n: "04", label: "Interaction", scene: "water", body: "Interfaces for reading, watching, archiving. We prototype in code, not slides." },
];

// Tiny iconographic SVG placeholder used for work thumbnails.
// Keep this stripey + monospaced — no faux photography.
function PlaceholderCard({ code, title, seed = 0, dark = true }) {
  const hues = [210, 40, 0, 140, 280];
  const h = hues[seed % hues.length];
  const bg1 = dark ? `oklch(0.14 0.02 ${h})` : `oklch(0.94 0.01 ${h})`;
  const bg2 = dark ? `oklch(0.20 0.03 ${h})` : `oklch(0.88 0.02 ${h})`;
  const stroke = dark ? "rgba(255,255,255,0.10)" : "rgba(0,0,0,0.15)";
  const text = dark ? "rgba(235,235,235,0.85)" : "rgba(20,20,20,0.85)";
  const pattern = [0,1,2,3,4,5,6,7,8,9].map((i) => (
    <rect key={i} x={0} y={i * 14 + seed*3} width="100%" height="1" fill={stroke} />
  ));
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg, ${bg1}, ${bg2})`,
      overflow: "hidden",
    }}>
      <svg width="100%" height="100%" preserveAspectRatio="none" style={{position:"absolute",inset:0}}>
        {pattern}
      </svg>
      <div style={{
        position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        justifyContent: "space-between", padding: 14,
        fontFamily: '"JetBrains Mono", monospace', fontSize: 10, color: text, letterSpacing: 0.5,
      }}>
        <div style={{display:"flex", justifyContent:"space-between"}}>
          <span>{code}</span>
          <span>PLACEHOLDER · DROP FILM FRAME HERE</span>
        </div>
        <div style={{fontSize: 11, opacity: 0.8, maxWidth: "70%"}}>{title}</div>
      </div>
    </div>
  );
}

Object.assign(window, { STUDIO, WORKS, CATEGORIES, SERVICES, PlaceholderCard });
