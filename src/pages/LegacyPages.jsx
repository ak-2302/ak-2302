import { useEffect } from "react";
import * as FFmpeg from "@ffmpeg/ffmpeg";
import JSZip from "jszip";
import videoTransHtml from "../../tool/video_trans/index.html?raw";

export function VideoTransPage() {
  useEffect(() => {
    window.FFmpeg = FFmpeg;
    window.JSZip = JSZip;
    const script = document.createElement("script");
    script.src = "./index.js";
    script.defer = true;
    document.body.append(script);
    return () => {
      script.remove();
      delete window.FFmpeg;
      delete window.JSZip;
    };
  }, []);
  return <LegacyMarkup html={videoTransHtml} />;
}

export function LegacyReactPage({ html, script, type = "text/javascript" }) {
  useEffect(() => {
    const element = document.createElement("script");
    element.src = script;
    element.type = type;
    element.defer = true;
    document.body.append(element);
    return () => element.remove();
  }, [script, type]);
  return <LegacyMarkup html={html} />;
}

function LegacyMarkup({ html }) {
  const body =
    html
      .match(/<body[^>]*>([\s\S]*?)<\/body>/i)?.[1]
      ?.replace(/<script[\s\S]*?<\/script>/gi, "") || "";
  return <div dangerouslySetInnerHTML={{ __html: body }} />;
}
