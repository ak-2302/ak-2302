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
import {
  ActionLink,
  BackLink,
  SectionHeading,
  TextButton,
} from "./components/ui.jsx";
import {
  endpoint,
  ideas,
  navigationItems as items,
  tools,
} from "./data/site.js";
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
function Links({ links }) {
  const entries = links[0]?.[0] === "Web tools" ? tools : links;
  return (
    <div className="feature-list">
      {entries.map(([label, href]) => (
        <ActionLink href={href} key={href}>
          {label}
        </ActionLink>
      ))}
    </div>
  );
}
function Modal({ name, onClose }) {
  const [status, setStatus] = useState("");
  const [notes, setNotes] = useState([]);
  const [closing, setClosing] = useState(false);
  const number = items.findIndex((x) => x[0] === name) + 1;
  const requestClose = () => {
    if (!closing) setClosing(true);
  };
  useEffect(() => {
    if (name === "NOTE")
      fetch("./note/index.json", { cache: "no-store" })
        .then((r) => r.json())
        .then(setNotes)
        .catch(() => setStatus("ノート一覧を読み込めませんでした。"));
  }, [name]);
  useEffect(() => {
    const f = (e) => e.key === "Escape" && requestClose();
    document.addEventListener("keydown", f);
    return () => document.removeEventListener("keydown", f);
  }, [closing]);
  const submit = async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    if (!data.name || !data.email || !data.message)
      return setStatus("すべての項目を入力してください。");
    setStatus("送信中...");
    try {
      const r = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!r.ok) throw Error();
      e.currentTarget.reset();
      setStatus("送信しました。");
    } catch {
      setStatus("送信できませんでした。時間をおいて再度お試しください。");
    }
  };
  return (
    <div
      className={`modal is-open${closing ? " is-closing" : ""}`}
      onAnimationEnd={(e) => {
        if (closing && e.target === e.currentTarget) onClose();
      }}
    >
      <button
        className="modal__backdrop"
        onClick={requestClose}
        aria-label="閉じる"
      />
      <section
        className="modal__panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal__header">
          <p>{String(number).padStart(2, "0")} / 06</p>
          <button
            className="modal__close"
            onClick={requestClose}
            aria-label="閉じる"
          >
            ×
          </button>
        </div>
        <div className="modal__body">
          <p className="modal__label">{items[number - 1][1]}</p>
          <h2 id="modal-title">{name}</h2>
          {name === "PROFILE" && (
            <>
              <p className="modal__lead">
                Webの技術を使って、日常で役立つものや面白い体験をつくっています。
              </p>
              <div className="profile-grid">
                <dl>
                  <dt>Name</dt>
                  <dd>ak-2302</dd>
                </dl>
                <dl>
                  <dt>Location</dt>
                  <dd>Japan</dd>
                </dl>
                <dl>
                  <dt>Focus</dt>
                  <dd>Web Development</dd>
                </dl>
              </div>
            </>
          )}
          {name === "TOOL" && (
            <>
              <p className="modal__lead">手軽に使える道具をつくっています。</p>
              <Links links={[["Web tools", "./tool/"]]} />
            </>
          )}
          {name === "NOTE" && (
            <Links links={notes.map((n) => [n.title, n.url])} />
          )}{" "}
          {name === "IDEA" && (
            <>
              <p className="modal__lead">
                まだ形になっていない、ユニークなアイデアを集める場所です。
              </p>
              <Links links={ideas} />
            </>
          )}
          {name === "LINK" && (
            <nav className="social-links">
              {[
                ["GitHub", "https://github.com/ak-2302"],
                ["Qiita", "https://qiita.com/ak-2302"],
                ["Zenn", "https://zenn.dev/ak2302"],
                ["X", "https://x.com/ak_2302x"],
              ].map(([x, h]) => (
                <a href={h} target="_blank" rel="noreferrer" key={h}>
                  <span>{x}</span>
                  <b>↗</b>
                </a>
              ))}
            </nav>
          )}
          {name === "CONTACT" && (
            <form className="contact-form" onSubmit={submit}>
              <label>
                Name
                <input name="name" required maxLength="80" />
              </label>
              <label>
                Email
                <input name="email" type="email" required maxLength="254" />
              </label>
              <label>
                Message
                <textarea name="message" rows="4" required maxLength="1800" />
              </label>
              <div className="contact-form__footer">
                <p aria-live="polite">{status}</p>
                <button type="submit">
                  SEND MESSAGE <span>↗</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
function Home() {
  const [open, setOpen] = useState(null);
  const clock = useClock();
  return (
    <main className="site-shell">
      <header className="site-header">
        <a className="site-logo" href="./">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <p className="site-header__status">
          <span /> Interactive portfolio
        </p>
      </header>
      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Personal website / 2026</p>
          <p className="hero__description">
            6つの入り口を、触れて選んでください。
          </p>
        </div>
        <div className="stage-wrap">
          <div className="sphere-stage" aria-label="コンテンツメニュー">
            {items.map(([label, type], i) => (
              <button
                className={`sphere sphere--${i + 1}`}
                key={label}
                onClick={() => setOpen(label)}
              >
                <strong>{label}</strong>
                <small>AK / 2302</small>
                <em>{type}</em>
              </button>
            ))}
          </div>
          <div className="stage-hint">CLICK A SPHERE</div>
        </div>
        <p className="hero__index">01 — 06</p>
      </section>
      <footer className="site-footer">
        <p>© {new Date().getFullYear()} ak-2302</p>
        <p>REACT × VITE</p>
        <time>{clock}</time>
      </footer>
      {open && <Modal name={open} onClose={() => setOpen(null)} />}
    </main>
  );
}
function CollectionPage() {
  const [notes, setNotes] = useState([]);
  const isNote = location.pathname.startsWith("/note");
  useEffect(() => {
    if (isNote)
      fetch("./index.json")
        .then((r) => r.json())
        .then(setNotes)
        .catch(() => setNotes([]));
  }, [isNote]);
  const list = isNote
    ? notes.map((n) => [n.title, n.url.replace("./note/", "./")])
    : tools;
  return (
    <main className="collection-page">
      <header className="collection-header">
        <a className="site-logo" href="./">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>{isNote ? "NOTE" : "TOOLS"}</span>
      </header>
      <section className="collection-intro">
        <p className="eyebrow">{isNote ? "Writing" : "Web tools"}</p>
        <h1>{isNote ? "Notes" : "Tools"}</h1>
        <p>
          {isNote
            ? "思考のメモや、制作の記録を綴っています。"
            : "日常で役立つ、手軽なWebツールをまとめています。"}
        </p>
      </section>
      <section className="collection-list">
        {list.map(([label, href], i) => (
          <a href={href} key={href}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{label}</strong>
            <b>↗</b>
          </a>
        ))}
      </section>
      <footer className="collection-footer">
        <a href="./">← ak-2302</a>
        <span>REACT × VITE</span>
      </footer>
    </main>
  );
}
const ideaMeta = {
  bottom_to_top: [
    "a little walk",
    "足あとをたどって。",
    "scroll up to explore",
  ],
  fuwafuwa: ["ふわふわ", "泡のあつまる場所", "泡を出す"],
  neko: [
    "ねこのあとを追って",
    "好奇心のままに、気になる場所へ。",
    "プロフィールや制作物を置いています。",
  ],
  terminal: [
    "terminal://ak-2302",
    "welcome to my corner of the internet",
    "help",
  ],
};
function IdeaPage() {
  const key = location.pathname.includes("fuwafuwa")
    ? "fuwafuwa"
    : location.pathname.includes("neko")
      ? "neko"
      : location.pathname.includes("terminal")
        ? "terminal"
        : "bottom_to_top";
  const meta = ideaMeta[key];
  const [count, setCount] = useState(18);
  const [command, setCommand] = useState("");
  const [output, setOutput] = useState("");
  const run = (e) => {
    e.preventDefault();
    setOutput(
      command === "help"
        ? "about  works  contact  clear"
        : command === "clear"
          ? ""
          : "command not found",
    );
    setCommand("");
  };
  return (
    <main className={`idea-page idea-${key}`}>
      <header className="idea-header">
        <a href="./">← ak-2302</a>
        <span>REACT EXPERIMENT</span>
      </header>
      <section className="idea-content">
        <p className="eyebrow">{meta[0]}</p>
        <h1>{meta[1]}</h1>
        <p>{meta[2]}</p>
        {key === "fuwafuwa" && (
          <>
            <button
              className="idea-action"
              onClick={() => setCount((c) => c + 1)}
            >
              ＋ 泡を出す
            </button>
            <div className="bubble-field">
              {Array.from({ length: count }, (_, i) => (
                <i key={i} style={{ "--i": i }} />
              ))}
            </div>
            <small>{count} 個の泡が漂っています</small>
          </>
        )}
        {key === "bottom_to_top" && (
          <div className="walk-trail">
            <button
              className="idea-action"
              onClick={() =>
                window.scrollTo({
                  top: document.body.scrollHeight,
                  behavior: "smooth",
                })
              }
            >
              SCROLL UP ↑
            </button>
            <p>下から上へ、足あとをたどって。</p>
          </div>
        )}
        {key === "neko" && (
          <nav className="paw-nav">
            <a href="#profile">01　プロフィール</a>
            <a href="#tools">02　ツール</a>
            <a href="#notes">03　ノート</a>
            <a href="#links">04　リンク</a>
          </nav>
        )}
        {key === "terminal" && (
          <div className="terminal-box">
            <p>ak@studio:~$ {output || "_"}</p>
            <form onSubmit={run}>
              <input
                value={command}
                onChange={(e) => setCommand(e.target.value)}
                placeholder="help"
                aria-label="コマンド入力"
              />
              <button>↵</button>
            </form>
          </div>
        )}
      </section>
    </main>
  );
}
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
