export const widgets = [
  [
    "01",
    "時計・カレンダー",
    "時刻、日付、曜日を表示します。",
    "info",
    "./widgets/clock/",
  ],
  [
    "02",
    "カウンター",
    "キー操作で数字を増減します。",
    "control",
    "./widgets/counter/",
  ],
  [
    "03",
    "タイマー",
    "配信用カウントダウンです。",
    "control",
    "./widgets/timer/",
  ],
  ["04", "メモ", "自由なテキストを表示します。", "info", "./widgets/memo/"],
  [
    "05",
    "スケジュール",
    "進行予定を縦に並べます。",
    "info",
    "./widgets/schedule/",
  ],
  [
    "06",
    "コメント表示",
    "配信コメントを表示します。",
    "info",
    "./widgets/comment/",
  ],
];

export const widgetDetails = {
  clock: [
    "時計・カレンダー",
    "時刻、日付、曜日を表示するウィジェットです。",
    [
      ["Digital Clock", "./desigh_1/"],
      ["Date Card", "./desigh_2/"],
      ["Week Line", "./desigh_3/"],
    ],
  ],
  counter: [
    "カウンター",
    "配信中の数字をキーボードやボタンで増減できます。",
    [
      ["Score Counter", "./desigh_1/"],
      ["Inline Counter", "./desigh_2/"],
    ],
  ],
  timer: [
    "タイマー",
    "指定時間から0までカウントダウンします。",
    [
      ["Countdown", "./desigh_1/"],
      ["Minimal Timer", "./desigh_2/"],
    ],
  ],
  memo: [
    "メモ",
    "お知らせや配信タイトルなどの短い文章を表示します。",
    [
      ["Simple Memo", "./desigh_1/"],
      ["Label Note", "./desigh_2/"],
    ],
  ],
  schedule: [
    "スケジュール",
    "配信の進行予定を表示します。",
    [
      ["Flow Schedule", "./desigh_1/"],
      ["Timeline", "./desigh_2/"],
    ],
  ],
  comment: [
    "コメント表示",
    "配信コメントをカードや吹き出しで表示します。",
    [["Comment designs", "./"]],
  ],
};
