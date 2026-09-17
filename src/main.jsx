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
import { widgetDetails, widgets } from "./data/widgets.js";
import {
  CompressorPage,
  ImageConverterPage,
  MediaMakerPage,
} from "./pages/ToolPages.jsx";
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
function WidgetDetailPage() {
  const key =
    Object.keys(widgetDetails).find((x) =>
      location.pathname.includes(`/widgets/${x}/`),
    ) || "clock";
  const [title, desc, list] = widgetDetails[key];
  return (
    <main className="collection-page">
      <header className="collection-header">
        <a className="site-logo" href="./">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>OBS / {key.toUpperCase()}</span>
      </header>
      <section className="collection-intro">
        <p className="eyebrow">OBS Widgets</p>
        <h1>{title}</h1>
        <p>{desc}</p>
      </section>
      <section className="collection-list">
        {list.map(([name, href], i) => (
          <a href={href} key={href}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{name}</strong>
            <b>↗</b>
          </a>
        ))}
      </section>
      <footer className="collection-footer">
        <a href="../../">← ウィジェット一覧</a>
        <span>REACT × VITE</span>
      </footer>
    </main>
  );
}
function CounterConfigPage() {
  const [value, setValue] = useState(0);
  return (
    <main className="counter-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>COUNTER / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Score Counter</h1>
        <p>配信中の数字をボタンやキーボードで増減できます。</p>
        <div className="counter-preview">
          <small>COUNT</small>
          <strong>{value}</strong>
          <div>
            <button onClick={() => setValue((v) => v - 1)}>DOWN</button>
            <button onClick={() => setValue(0)}>RESET</button>
            <button onClick={() => setValue((v) => v + 1)}>UP</button>
          </div>
        </div>
        <a className="back-link" href="../">
          ← カウンターデザイン一覧
        </a>
      </section>
    </main>
  );
}
function TimerConfigPage() {
  const [initial, setInitial] = useState(300);
  const [left, setLeft] = useState(300);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    if (!running) return;
    const id = setInterval(
      () =>
        setLeft((v) => {
          if (v <= 1) {
            setRunning(false);
            return 0;
          }
          return v - 1;
        }),
      1000,
    );
    return () => clearInterval(id);
  }, [running]);
  const format = (v) =>
    `${String(Math.floor(v / 60)).padStart(2, "0")}:${String(v % 60).padStart(2, "0")}`;
  return (
    <main className="counter-config timer-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>TIMER / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Countdown</h1>
        <p>指定時間から0までカウントダウンします。</p>
        <div className="counter-preview">
          <small>TIME REMAINING</small>
          <strong>{format(left)}</strong>
          <div>
            <button
              onClick={() => setRunning(true)}
              disabled={running || left === 0}
            >
              START
            </button>
            <button onClick={() => setRunning(false)}>PAUSE</button>
            <button
              onClick={() => {
                setRunning(false);
                setLeft(initial);
              }}
            >
              RESET
            </button>
          </div>
        </div>
        <label className="timer-setting">
          分
          <input
            type="number"
            min="0"
            value={Math.floor(initial / 60)}
            onChange={(e) => {
              const v = Math.max(0, Number(e.target.value) || 0) * 60;
              setInitial(v);
              setLeft(v);
            }}
          />
        </label>
        <a className="back-link" href="../">
          ← タイマーデザイン一覧
        </a>
      </section>
    </main>
  );
}
function MemoConfigPage() {
  const [text, setText] = useState("ON AIR");
  const [label, setLabel] = useState("NOTICE");
  return (
    <main className="counter-config memo-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>MEMO / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Simple Memo</h1>
        <p>文章を入力すると、配信画面用のメモとしてプレビューできます。</p>
        <div className="memo-preview">
          <small>{label}</small>
          <strong>{text || " "}</strong>
        </div>
        <label className="timer-setting">
          ラベル
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            maxLength="30"
          />
        </label>
        <label className="timer-setting">
          本文
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength="120"
            rows="3"
          />
        </label>
        <a className="back-link" href="../">
          ← メモデザイン一覧
        </a>
      </section>
    </main>
  );
}
function ClockConfigPage() {
  const [now, setNow] = useState(new Date());
  const [seconds, setSeconds] = useState(false);
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const value = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    second: seconds ? "2-digit" : undefined,
    hour12: false,
  })
    .format(now)
    .replace(/:/g, " : ");
  return (
    <main className="counter-config clock-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>CLOCK / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Digital Clock</h1>
        <p>現在時刻をブラウザ上で表示します。</p>
        <div className="clock-preview">
          <small>JST</small>
          <strong>{value}</strong>
        </div>
        <label className="timer-setting">
          <input
            type="checkbox"
            checked={seconds}
            onChange={(e) => setSeconds(e.target.checked)}
          />{" "}
          秒を表示
        </label>
        <a className="back-link" href="../">
          ← 時計デザイン一覧
        </a>
      </section>
    </main>
  );
}
function ScheduleConfigPage() {
  const [items, setItems] = useState([
    "21:00 START",
    "21:10 TALK",
    "22:00 END",
  ]);
  const [draft, setDraft] = useState("");
  return (
    <main className="counter-config schedule-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>SCHEDULE / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Flow Schedule</h1>
        <p>予定を1行ずつ入力して、配信画面用のスケジュールを作成します。</p>
        <div className="schedule-preview">
          <small>SCHEDULE</small>
          <ol>
            {items.map((item, i) => (
              <li key={`${item}-${i}`}>
                {item}
                <button
                  onClick={() => setItems((xs) => xs.filter((_, j) => j !== i))}
                  aria-label={`${item}を削除`}
                >
                  ×
                </button>
              </li>
            ))}
          </ol>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) {
              setItems((xs) => [...xs, draft.trim()]);
              setDraft("");
            }
          }}
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="22:30 END"
            aria-label="予定を追加"
          />
          <button type="submit">追加</button>
        </form>
        <a className="back-link" href="../">
          ← スケジュールデザイン一覧
        </a>
      </section>
    </main>
  );
}
function CommentConfigPage() {
  const [user, setUser] = useState("viewer_01");
  const [message, setMessage] = useState("こんばんは！");
  return (
    <main className="counter-config comment-config">
      <header className="collection-header">
        <a className="site-logo" href="../../../">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>COMMENT / DESIGN 01</span>
      </header>
      <section>
        <p className="eyebrow">OBS Widget / Design 01</p>
        <h1>Comment Stack</h1>
        <p>名前と本文を入力して、配信コメントの見た目を確認できます。</p>
        <div className="comment-preview">
          <strong>{user || " "}</strong>
          <p>{message || " "}</p>
        </div>
        <label className="timer-setting">
          名前
          <input
            value={user}
            onChange={(e) => setUser(e.target.value)}
            maxLength="40"
          />
        </label>
        <label className="timer-setting">
          コメント
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength="180"
            rows="3"
          />
        </label>
        <a className="back-link" href="../">
          ← コメントデザイン一覧
        </a>
      </section>
    </main>
  );
}
function ObsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const list = widgets.filter(
    ([, name, desc, cat]) =>
      (filter === "all" || cat === filter) && `${name}${desc}`.includes(query),
  );
  return (
    <main className="collection-page">
      <header className="collection-header">
        <a className="site-logo" href="./">
          <span className="site-logo__mark" />
          ak-2302
        </a>
        <span>OBS WIDGETS</span>
      </header>
      <section className="collection-intro">
        <p className="eyebrow">Widgets</p>
        <h1>ウィジェット一覧</h1>
        <p>すべて無料・ブラウザ完結。配信画面に使える道具を集めています。</p>
      </section>
      <div className="widget-controls">
        <input
          type="search"
          placeholder="ウィジェットを検索"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        {[
          ["all", "すべて"],
          ["info", "情報表示"],
          ["control", "操作系"],
        ].map(([v, l]) => (
          <button
            key={v}
            className={filter === v ? "is-active" : ""}
            onClick={() => setFilter(v)}
          >
            {l}
          </button>
        ))}
      </div>
      <section className="collection-list">
        {list.map(([num, name, desc, , href]) => (
          <a href={href} key={href}>
            <span>{num}</span>
            <div>
              <strong>{name}</strong>
              <small>{desc}</small>
            </div>
            <b>↗</b>
          </a>
        ))}
      </section>
      {!list.length && <p>条件に一致するウィジェットがありません。</p>}
      <footer className="collection-footer">
        <a href="./">← ak-2302</a>
        <span>REACT × VITE</span>
      </footer>
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
