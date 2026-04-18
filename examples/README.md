# Examples

| File | Description |
|------|-------------|
| `servidor-cron-public-stub.py` | Minimal Flask + APScheduler + Waitress demo on port **5002**. Safe to share; contains **no** BigQuery, Outlook, or internal URLs. |

**Internal production code** (e.g. full `ServidorCron.py`) should stay **out of git** — see [`docs/PRIVATE-FILES.md`](../docs/PRIVATE-FILES.md).

```bash
pip install apscheduler flask waitress
python examples/servidor-cron-public-stub.py
```
