# -*- coding: utf-8 -*-
"""
Public example: minimal Flask + APScheduler dashboard (no corporate data).

This is NOT a drop-in replacement for an internal ServidorCron — it shows the
shape of a single-file scheduler + HTTP UI you can discuss on a portfolio.

Run:  python examples/servidor-cron-public-stub.py
Open: http://127.0.0.1:5002
"""

from __future__ import annotations

import logging
import os
import sys
import webbrowser
from datetime import datetime, timezone
from pathlib import Path

logging.basicConfig(level=logging.INFO, format="%(asctime)s | %(levelname)s | %(message)s")
LOGGER = logging.getLogger("demo-cron")

try:
    from apscheduler.schedulers.background import BackgroundScheduler
    from flask import Flask, jsonify
    from waitress import serve
except ImportError:
    print("Install: pip install apscheduler flask waitress", file=sys.stderr)
    raise

PORT = int(os.environ.get("CRON_HTTP_PORT", "5002"))
TZ = os.environ.get("TZ", "America/Sao_Paulo")

app = Flask(__name__)
scheduler = BackgroundScheduler(timezone=TZ)
_tick = {"n": 0}


def job_heartbeat():
    _tick["n"] += 1
    LOGGER.info("Scheduled heartbeat #%s", _tick["n"])


@app.route("/api/health")
def health():
    return jsonify(
        ok=True,
        service="scheduler-demo",
        now=datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        heartbeats=_tick["n"],
    )


@app.route("/")
def index():
    return (
        "<!doctype html><html><head><meta charset=utf-8><title>Scheduler demo</title>"
        "<style>body{font-family:system-ui;margin:2rem;background:#111;color:#eee}"
        "code{background:#222;padding:.2rem .4rem;border-radius:4px}</style></head>"
        "<body><h1>Scheduler demo</h1><p>GET <code>/api/health</code> for JSON.</p>"
        "<p>Heartbeat job runs every minute (see server logs).</p></body></html>"
    )


def main() -> None:
    scheduler.add_job(job_heartbeat, "interval", minutes=1, id="heartbeat", replace_existing=True)
    scheduler.start()
    LOGGER.info("Waitress on http://127.0.0.1:%s (demo only)", PORT)
    if os.environ.get("OPEN_BROWSER", "1") == "1":
        webbrowser.open(f"http://127.0.0.1:{PORT}/")
    try:
        serve(app, host="0.0.0.0", port=PORT, threads=4)
    finally:
        scheduler.shutdown()


if __name__ == "__main__":
    main()
