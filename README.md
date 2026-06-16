# AriaQueue — Gerenciador de Downloads

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> Fila de downloads sequenciais via **aria2** — interface web React + backend Express. Cole vários links, um de cada vez na fila. Suporte a headers HTTP customizados para CDNs complexos.

---

## Funcionalidades

- **Fila sequencial** — aria2 com `--max-concurrent-downloads=1`, um download por vez
- **Vários links de uma vez** — um URL por linha, envio em lote
- **Headers extras** — Referer, User-Agent, Cookie e headers customizados (útil para CDNs e Cloudflare)
- **Interface bilíngue** — Português / English (troca no cabeçalho)
- **Porta automática** — detecta porta livre a partir da base configurada
- **API de caminhos** — expõe pasta Downloads do Windows, sem depender do seletor de pasta do navegador

---

## Tecnologias

| Camada | Tecnologia |
|---|---|
| Frontend | React 19 + Vite 6 + Tailwind CSS 4 |
| Backend | Express + Node 18+ |
| Download | aria2 (JSON-RPC) |
| Linguagem | TypeScript 5 |

---

## Como Usar

### Pré-requisitos

- [aria2](https://aria2.github.io/) instalado e no PATH
- Node.js 18+

```bash
git clone https://github.com/abobicaduco/DownloadManager.git
cd DownloadManager
npm install
npm run dev
```

---

## Outros Apps

| App | Descrição |
|---|---|
| [AboBI Player](https://github.com/abobicaduco/abobiplayer) | Player de vídeo local para Android |
| [AboBI Caduco](https://github.com/abobicaduco/abobi-caduco) | Baixador de vídeos e áudio para Android |
| [AboBI Video Downloader](https://github.com/abobicaduco/abobi-video-downloader) | Baixe vídeos e músicas do YouTube para o PC |
| [AboBI Ferramentas](https://abobiferramentas.com) | 90+ ferramentas online gratuitas |

---

## Apoiar

**Chave Pix (aleatória):** `f74458dc-2a36-49bd-9250-1cef4365ebb8`

Site: [abobiferramentas.com](https://abobiferramentas.com)

---

**Desenvolvido por** [Carlos Eduardo (@abobicaduco)](https://github.com/abobicaduco) · Licença MIT
