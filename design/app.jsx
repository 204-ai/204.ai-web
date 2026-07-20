// app.jsx — compose the canvas with two direction artboards + Tweaks.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "theme": "mixed",
  "accent": "#c9442b",
  "showCaptions": true
}/*EDITMODE-END*/;

function App() {
  const [tweaks, setTweaks] = React.useState(TWEAK_DEFAULTS);
  const [editOn, setEditOn] = React.useState(false);

  React.useEffect(() => {
    const onMsg = (e) => {
      if (!e.data || typeof e.data !== "object") return;
      if (e.data.type === "__activate_edit_mode") setEditOn(true);
      if (e.data.type === "__deactivate_edit_mode") setEditOn(false);
    };
    window.addEventListener("message", onMsg);
    try { window.parent.postMessage({ type: "__edit_mode_available" }, "*"); } catch {}
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const patch = (edits) => {
    setTweaks((t) => ({ ...t, ...edits }));
    try { window.parent.postMessage({ type: "__edit_mode_set_keys", edits }, "*"); } catch {}
  };

  // Apply accent override at runtime via CSS var — simplest way without
  // threading it through every component.
  React.useEffect(() => {
    const id = "tweak-accent";
    let s = document.getElementById(id);
    if (!s) { s = document.createElement("style"); s.id = id; document.head.appendChild(s); }
    s.textContent = "";
  }, [tweaks.accent]);

  return (
    <>
      <DesignCanvas>
        <DCSection id="options" title="Studio site · two directions" subtitle="204 · NO-CONTENT — cinematic noir vs. editorial archive">
          <DCArtboard id="a" label="A · Night Shift — cinematic, condensed, full-bleed" width={1280} height={820}>
            <DirectionA width={1280} height={820}/>
          </DCArtboard>
          <DCArtboard id="b" label="B · Archive — editorial, serif, Swiss grid" width={1280} height={820}>
            <DirectionB width={1280} height={820}/>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>
      {editOn && <TweaksPanel tweaks={tweaks} patch={patch}/>}
    </>
  );
}

function TweaksPanel({ tweaks, patch }) {
  return (
    <div style={{
      position: "fixed", bottom: 20, right: 20, zIndex: 200,
      width: 260, background: "#1a1a1a", color: "#ececec",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4,
      fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
      boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
    }}>
      <div style={{ padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.1)", letterSpacing: 2, fontSize: 10, color: "rgba(255,255,255,0.5)" }}>
        / TWEAKS
      </div>
      <div style={{ padding: 14 }}>
        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>ACCENT</div>
        <div style={{ display: "flex", gap: 6, marginBottom: 18 }}>
          {["#c9442b","#d7ff3a","#2b4bd9","#e8e3d7","#ececec"].map(c => (
            <button key={c} onClick={() => patch({ accent: c })}
              style={{ width: 26, height: 26, border: tweaks.accent === c ? "2px solid #fff" : "1px solid rgba(255,255,255,0.2)",
                background: c, cursor: "pointer", padding: 0 }}/>
          ))}
        </div>

        <div style={{ fontSize: 10, letterSpacing: 1.5, color: "rgba(255,255,255,0.5)", marginBottom: 8 }}>NOTE</div>
        <div style={{ fontSize: 10, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
          Each direction is a full 5-page prototype. Click any artboard to focus, then navigate pages via the top nav.
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App/>);
