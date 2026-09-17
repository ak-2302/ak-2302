import { MediaMakerPage } from "./pages/ToolPages.jsx";
import { CollectionPage, Home, IdeaPage } from "./pages/SitePages.jsx";
import { VideoTransPage, GithubPagesCommitsPage } from "./pages/LegacyPages.jsx";
import { FidelityHome } from "./pages/HomePage.jsx";
import specimenHtml from "../idea/design_specimen/index.html?raw";
function App() {
  if (location.pathname.startsWith("/tool/image_audio_to_video/"))
    return <MediaMakerPage />;
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
      <GithubPagesCommitsPage />
    );
  if (location.pathname === "/" || location.pathname === "")
    return <FidelityHome />;
  return <App />;
}
