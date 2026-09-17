import { useEffect, useState } from "react";
import { useClock } from "../hooks/useClock.js";
import { Modal } from "./SitePages.jsx";

export function FidelityHome() {
  const [open, setOpen] = useState(null);
  const clock = useClock();
  useEffect(() => {
    const urls = [
      "/ref/script/vendor/three.min.js",
      "/ref/script/vendor/physi.js",
      "/ref/script/3d.js",
    ];
    let cancelled = false;
    const load = (src) =>
      new Promise((resolve, reject) => {
        const s = document.createElement("script");
        s.src = src;
        s.onload = resolve;
        s.onerror = reject;
        document.body.append(s);
      });
    (async () => {
      for (const url of urls) {
        if (!cancelled) await load(url);
      }
    })();
    const onSelect = (e) => setOpen(e.detail.label);
    window.addEventListener("sphere-select", onSelect);
    return () => {
      cancelled = true;
      window.removeEventListener("sphere-select", onSelect);
    };
  }, []);
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="site-logo" href="./" aria-label="ak-2302 ホーム">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <p className="site-header__status">
          <span /> Interactive portfolio
        </p>
      </header>
      <section className="hero" aria-label="ak-2302 ポートフォリオ">
        <div className="hero__copy">
          <p className="eyebrow">Personal website / 2026</p>
          <p className="hero__description">
            6つの球が、それぞれの入り口です。
            <br />
            触れて、転がして、選んでください。
          </p>
        </div>
        <div className="stage-wrap">
          <div
            id="physicsStage"
            className="physics-stage"
            aria-label="物理演算で動くメニュー"
          >
            <div className="stage-loader" id="stageLoader">
              <span />
              <p>INITIALIZING PHYSICS</p>
            </div>
          </div>
          <div className="stage-hint">
            <p>Drag the box</p>
            <p>Pinch to zoom</p>
          </div>
        </div>
        <p className="hero__index">01 — 06</p>
        <p className="hero__scroll">
          SELECT A SPHERE <span>↗</span>
        </p>
      </section>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} ak-2302</p>
        <p>THREE.JS × PHYSIJS</p>
        <time>JST {clock}</time>
      </footer>
      {open && <Modal name={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
