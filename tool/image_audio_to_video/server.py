"""画像＋音声動画化ツール用のSharedArrayBuffer対応ローカルサーバー。"""
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from functools import partial
from pathlib import Path


class IsolatedHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cross-Origin-Opener-Policy", "same-origin")
        self.send_header("Cross-Origin-Embedder-Policy", "require-corp")
        super().end_headers()


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[2]
    handler = partial(IsolatedHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", 4173), handler)
    print("http://127.0.0.1:4173/tool/image_audio_to_video/")
    server.serve_forever()
