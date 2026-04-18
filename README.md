<div align="center">

# AriaQueue

### Web download queue powered by **aria2**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

**EN** · [**PT-BR**](#-português-brasil)

*Paste many URLs — only **one** active download; the rest wait in line. Optional HTTP headers for tricky CDNs.*

[Features](#-features) · [Quick start](#-quick-start) · [Stack](#-stack) · [Repo layout](#-repository-layout)

</div>

---

## English (US)

### Why this project

**AriaQueue** is a small **full-stack** tool: a **React + TypeScript** UI on top of **Express**, driving **[aria2](https://github.com/aria2/aria2)** over JSON-RPC. It’s a solid fit for a portfolio or LinkedIn post: clear architecture, real-world problem (queued downloads), and a polished dark UI.

### Features

| | |
|---|---|
| **Sequential queue** | aria2 runs with `--max-concurrent-downloads=1` — strict one-by-one downloads |
| **Bulk URLs** | One URL per line; add a whole batch at once |
| **Bilingual UI** | English / Português (header toggle) |
| **HTTP extras** | Optional Referer, User-Agent, Cookie, custom headers (e.g. CDN / Cloudflare scenarios) |
| **Smart ports** | Picks a free HTTP port from your base; optional auto-open Chrome in dev |
| **Paths API** | Server exposes your Windows **Downloads** path — no broken browser folder picker |

### Stack

React 19 · Vite 6 · Express · Tailwind CSS 4 · Motion · aria2 (`aria2c`)

### Quick start

**Prerequisites:** [Node.js](https://nodejs.org/) 18+ (20+ recommended), [aria2](https://github.com/aria2/aria2) on `PATH` (`winget install aria2` on Windows).

```bash
git clone <your-fork-url> aria-queue
cd aria-queue
npm install
npm run dev
```

Open the URL printed in the terminal (default **http://localhost:3000**). Build for production:

```bash
npm run build
$env:NODE_ENV="production"; npx tsx server.ts   # Windows PowerShell
```

See `.env.example` for `PORT`, `ARIA2_RPC_PORT`, `DOWNLOAD_DIR`, `OPEN_BROWSER`.

### Repository layout

| Path | On GitHub |
|------|-----------|
| `src/`, `server.ts`, aria2 integration | **Yes** — this app |
| `examples/servidor-cron-public-stub.py` | **Yes** — tiny scheduler demo, no secrets |
| `docs/PRIVATE-FILES.md` | **Yes** — what to keep private |
| Internal `ServidorCron.py`, `DownloadManager.py`, company HTML | **No** — listed in `.gitignore` |

Do **not** commit employer-specific URLs, credentials, or BigQuery tables. Use a **private** copy or `private/` for those files.

### License

**MIT** — see [`LICENSE`](LICENSE) (English). Portuguese reference: [`LICENSE.pt-BR.md`](LICENSE.pt-BR.md).

---

## Português (Brasil)

### Por que postar no LinkedIn

O **AriaQueue** é um projeto **full-stack** enxuto: interface **React + TypeScript** com **Express** no backend, usando **aria2** por JSON-RPC. Bom para mostrar arquitetura, fila de trabalhos e UI moderna — sem expor dados confidenciais se você seguir o `.gitignore`.

### Funcionalidades

| | |
|---|---|
| **Fila sequencial** | Só **um** download ativo; o restante aguarda |
| **Várias URLs** | Uma por linha; envio em lote |
| **UI bilíngue** | Inglês / português |
| **Opções HTTP** | Referer, User-Agent, Cookie e headers extras (CDNs / proteções) |
| **Portas** | Escolhe porta HTTP livre; Chrome pode abrir sozinho em dev |
| **Caminho de Downloads** | API no servidor informa a pasta correta no Windows |

### Início rápido

**Requisitos:** [Node.js](https://nodejs.org/) 18+, [aria2](https://github.com/aria2/aria2) no `PATH`.

```bash
git clone <sua-url> aria-queue
cd aria-queue
npm install
npm run dev
```

Abra o endereço que aparecer no terminal (geralmente **http://localhost:3000**).

### O que sobe no GitHub x o que fica no PC

- **Sobe:** código do AriaQueue, exemplo em `examples/`, documentação.
- **Não sobe:** versões internas de `ServidorCron`, `DownloadManager`, HTML da empresa — veja [`.gitignore`](.gitignore) e [`docs/PRIVATE-FILES.md`](docs/PRIVATE-FILES.md).

**Não commite** URLs internas, credenciais ou identificadores de cliente.

### Licença

**MIT** — texto oficial em inglês: [`LICENSE`](LICENSE). Referência em português: [`LICENSE.pt-BR.md`](LICENSE.pt-BR.md).

---

## Credits

- Icons: [Lucide](https://lucide.dev/)
- Engine: [aria2](https://aria2.github.io/)
