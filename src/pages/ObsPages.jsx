import { useState } from "react";
import { widgetDetails, widgets } from "../data/widgets.js";

export function WidgetDetailPage() {
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
export function CounterConfigPage() {
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
export function TimerConfigPage() {
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
export function MemoConfigPage() {
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
export function ClockConfigPage() {
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
export function ScheduleConfigPage() {
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
export function CommentConfigPage() {
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
export function ObsPage() {
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
