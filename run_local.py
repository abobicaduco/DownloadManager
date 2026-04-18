# -*- coding: utf-8 -*-
"""
Optional desktop shell: pywebview loading the local AriaQueue UI.
Requires: pip install pywebview aria2p
Requires: aria2c on PATH (https://github.com/aria2/aria2/releases)
"""
import os
import subprocess
import sys
import time

# --- AUTO-INSTALLER ---
def install_dependencies():
    required = ["pywebview", "aria2p"]
    for package in required:
        try:
            __import__(package)
        except ImportError:
            print(f"Installing {package}...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", package])


install_dependencies()

import webview  # noqa: E402
import aria2p  # noqa: E402


class AriaQueueAPI:
    def __init__(self):
        self.window = None
        self.aria2 = None
        self.aria2_process = None
        self._connect_aria2()

    def _connect_aria2(self):
        port = int(os.environ.get("ARIA2_RPC_PORT", "6800"))
        secret = os.environ.get("ARIA2_RPC_SECRET", "")
        try:
            client = aria2p.Client(
                host="http://localhost", port=port, secret=secret if secret else ""
            )
            self.aria2 = aria2p.API(client)
            self.aria2.get_downloads()
            print("Connected to aria2 RPC.")
        except Exception:
            print("Starting aria2c (sequential queue: max-concurrent-downloads=1)...")
            try:
                args = [
                    "aria2c",
                    "--enable-rpc",
                    f"--rpc-listen-port={port}",
                    "--rpc-listen-all",
                    "--rpc-allow-origin-all",
                    "--max-concurrent-downloads=1",
                    "--continue=true",
                    "--auto-file-renaming=true",
                ]
                if secret:
                    args.append(f"--rpc-secret={secret}")
                popen_kw = {
                    "stdout": subprocess.DEVNULL,
                    "stderr": subprocess.DEVNULL,
                }
                if sys.platform == "win32":
                    popen_kw["creationflags"] = subprocess.CREATE_NO_WINDOW
                self.aria2_process = subprocess.Popen(args, **popen_kw)
                time.sleep(2)
                client = aria2p.Client(
                    host="http://localhost", port=port, secret=secret if secret else ""
                )
                self.aria2 = aria2p.API(client)
            except Exception as exc:
                print(f"Could not start aria2c: {exc}. Install aria2 and ensure aria2c is on PATH.")

    def download_link(self, url, folder):
        if not self.aria2:
            return {"status": "error", "message": "aria2 is not running."}
        try:
            if folder and not os.path.exists(folder):
                os.makedirs(folder, exist_ok=True)
            opts = {}
            if folder:
                opts["dir"] = folder
            download = self.aria2.add(url, options=opts)
            return {"status": "success", "gid": download.gid}
        except Exception as exc:
            return {"status": "error", "message": str(exc)}

    def get_queue(self):
        if not self.aria2:
            return []
        try:
            downloads = self.aria2.get_downloads()
            out = []
            for dl in downloads:
                st = dl.status
                if st == "complete":
                    ui = "complete"
                elif st == "error":
                    ui = "error"
                elif st == "active":
                    ui = "active"
                elif st == "waiting":
                    ui = "waiting"
                elif st == "paused":
                    ui = "paused"
                else:
                    ui = "waiting"
                url = ""
                try:
                    if dl.files and dl.files[0].uris:
                        u0 = dl.files[0].uris[0]
                        if isinstance(u0, dict):
                            url = u0.get("uri", "") or ""
                        else:
                            url = getattr(u0, "uri", "") or ""
                except Exception:
                    url = ""
                prog = float(dl.progress or 0)
                if prog <= 1.0:
                    prog *= 100.0
                spd = "0 B/s"
                try:
                    ds = getattr(dl, "download_speed_string", None)
                    if callable(ds):
                        spd = ds()
                    elif isinstance(ds, str):
                        spd = ds
                    else:
                        spd = "0 B/s"
                except Exception:
                    spd = "0 B/s"
                out.append(
                    {
                        "gid": dl.gid,
                        "name": dl.name,
                        "url": url,
                        "progress": prog,
                        "speed": spd,
                        "status": ui,
                        "error": getattr(dl, "error_message", None) or None,
                    }
                )
            return out
        except Exception:
            return []

    def clear_history(self):
        if not self.aria2:
            return {"status": "error"}
        try:
            for dl in self.aria2.get_downloads():
                if dl.is_complete or dl.has_error:
                    self.aria2.remove([dl], force=True, files=True)
            return {"status": "success"}
        except Exception:
            return {"status": "error"}

    def minimize_app(self):
        if self.window:
            self.window.minimize()

    def close_app(self):
        if self.window:
            self.window.destroy()

    def cleanup(self):
        if self.aria2_process:
            self.aria2_process.terminate()


def run():
    api = AriaQueueAPI()
    app_url = os.environ.get("ARIA_QUEUE_URL", "http://127.0.0.1:3000").strip()

    window = webview.create_window(
        "AriaQueue",
        url=app_url,
        js_api=api,
        width=820,
        height=680,
        transparent=False,
        frame=True,
    )
    api.window = window
    window.events.closed += api.cleanup

    webview.start()


if __name__ == "__main__":
    run()
