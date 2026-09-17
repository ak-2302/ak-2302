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
import { CollectionPage, Home, IdeaPage } from "./pages/SitePages.jsx";
import { VideoTransPage, LegacyReactPage } from "./pages/LegacyPages.jsx";
import { FidelityHome } from "./pages/HomePage.jsx";
import specimenHtml from "../idea/design_specimen/index.html?raw";
import githubPagesHtml from "../tool/github_pages_commits/index.html?raw";

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

export function ReactRouter() {
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
