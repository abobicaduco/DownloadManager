# Files to keep private (do not push to GitHub)

This repository is designed so **internal / company-specific** artifacts stay on your machine.

| Pattern (see root `.gitignore`) | Purpose |
|----------------------------------|---------|
| `ServidorCron.py`, `ServerCron.py` | Full internal scheduler + dashboard (your real code) |
| `ServidorCron.html`, `ServidorCron*.html` | Internal HTML dashboards |
| `DownloadManager.py` | Internal scripts you do not want public |
| `private/` | Drop any extra confidential assets here |

**Workflow:** keep the public repo clean; symlink or copy internal files into this folder locally without committing them.

The **`examples/`** folder contains **sanitized stubs** you can fork for demos or documentation.
