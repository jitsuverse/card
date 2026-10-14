#!/usr/bin/env python3
"""개발 서버: 저장소 폴더를 루트로 서빙하고, 브라우저가 예전 파일을 캐시하지 않도록 no-store 헤더를 붙인다.
사용법: python3 scripts/serve.py [포트]   (기본 5173) → http://localhost:5173/
"""
import http.server
import os
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5173


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    print(f"카드뉴스 메이커: http://localhost:{PORT}/")
    http.server.ThreadingHTTPServer(("", PORT), NoCacheHandler).serve_forever()
