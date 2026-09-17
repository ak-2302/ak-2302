import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import "./collection.css";
import "./idea.css";
import "./widgets.css";
import "./counter.css";
import "./memo.css";
import "./clock.css";
import "./schedule.css";
import "./comment.css";
import "./solid-background.css";
import "../tool/image_audio_to_video/style.css";
import "../tool/image_converter/style.css";
import "../tool/video_compressor/style.css";
import "../tool/video_trans/index.css";
import specimenHtml from "../idea/design_specimen/index.html?raw";
import githubPagesHtml from "../tool/github_pages_commits/index.html?raw";
import "../idea/design_specimen/style.css";
import "../tool/github_pages_commits/styles.css";
import "../ref/style/3d.css";
import "./monochrome.css";
import { useClock } from "./hooks/useClock.js";
import { LegacyReactPage, VideoTransPage } from "./pages/LegacyPages.jsx";
import {
  CompressorPage,
  ImageConverterPage,
  MediaMakerPage,
} from "./pages/ToolPages.jsx";
import {
  ClockConfigPage,
  CommentConfigPage,
  CounterConfigPage,
  MemoConfigPage,
  ObsPage,
  ScheduleConfigPage,
  TimerConfigPage,
  WidgetDetailPage,
} from "./pages/ObsPages.jsx";
import { CollectionPage, Home, IdeaPage, Modal } from "./pages/SitePages.jsx";
function App() {
  if (location.pathname.startsWith("/tool/video_compressor/"))
    return <CompressorPage />;
  if (location.pathname.startsWith("/tool/image_audio_to_video/"))
    return <MediaMakerPage />;
  if (location.pathname.startsWith("/tool/image_converter/"))
    return <ImageConverterPage />;
  if (
    location.pathname.includes("/widgets/counter/desigh_1/") ||
    location.pathname.includes("/widgets/counter/desigh_2/")
  )
    return <CounterConfigPage />;
  if (
    location.pathname.includes("/widgets/timer/desigh_1/") ||
    location.pathname.includes("/widgets/timer/desigh_2/")
  )
    return <TimerConfigPage />;
  if (
    location.pathname.includes("/widgets/memo/desigh_1/") ||
    location.pathname.includes("/widgets/memo/desigh_2/")
  )
    return <MemoConfigPage />;
  if (
    location.pathname.includes("/widgets/clock/desigh_1/") ||
    location.pathname.includes("/widgets/clock/desigh_2/") ||
    location.pathname.includes("/widgets/clock/desigh_3/")
  )
    return <ClockConfigPage />;
  if (
    location.pathname.includes("/widgets/schedule/desigh_1/") ||
    location.pathname.includes("/widgets/schedule/desigh_2/")
  )
    return <ScheduleConfigPage />;
  if (location.pathname.includes("/widgets/comment/design_"))
    return <CommentConfigPage />;
  if (
    location.pathname.match(
      /\/tool\/obs\/widgets\/(clock|counter|timer|memo|schedule|comment)\//,
    )
  )
    return <WidgetDetailPage />;
  if (location.pathname.startsWith("/tool/obs/")) return <ObsPage />;
  if (
    location.pathname.startsWith("/tool/") ||
    location.pathname.startsWith("/note/")
  )
    return <CollectionPage />;
  if (location.pathname.startsWith("/idea/")) return <IdeaPage />;
  return <Home />;
}
function FidelityHome() {
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
function ReactRouter() {
  if (location.pathname.startsWith("/tool/video_trans/"))
    return <VideoTransPage />;
  if (location.pathname.startsWith("/idea/design_specimen/"))
    return <LegacyReactPage html={specimenHtml} script="./script.js" />;
  if (location.pathname.startsWith("/tool/github_pages_commits/"))
    return (
      <LegacyReactPage html={githubPagesHtml} script="./app.js" type="module" />
    );
  if (location.pathname === "/" || location.pathname === "")
    return <FidelityHome />;
  return <App />;
}
createRoot(document.getElementById("root")).render(<ReactRouter />);
