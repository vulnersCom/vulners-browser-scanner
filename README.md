# Vulners Browser Scanner

Web-extension based on vulners Vulnerability scanner API

## Requirements

**Chromium** - based browser (Chrome, Chromium, Canary, YaBrowser...)

## Installation

1.  in browser go to **chrome://extensions/**
2.  "Load unpacked extension"
3.  Surf internet and scan!

---

## Development

### Dev (watch build)

```shell
npm install
npm run watch
```

esbuild rebuilds the unpacked extension into `./build` on every change — load
that folder via **chrome://extensions/** → "Load unpacked".

### Build

```shell
npm run build
```

Extension will be packaged into `./build` folder.

### Quality gates

```shell
npm run typecheck   # tsc --noEmit (app + tests)
npm run lint        # ESLint (flat config)
npm run format      # Prettier
npm test            # Jest
```
