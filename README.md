# Vulners Browser Scanner

A Chromium extension that **passively scans the websites you visit for known vulnerabilities** — it fingerprints the software a site runs from HTTP headers and page content, then checks those versions against the [Vulners](https://vulners.com) vulnerability database and flags anything with known CVEs or public exploits, without running an active scan.

![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![MUI](https://img.shields.io/badge/MUI-9-007FFF?logo=mui&logoColor=white)
![Manifest V3](https://img.shields.io/badge/Manifest-V3-4285F4?logo=googlechrome&logoColor=white)

## Features

- 🔎 **Passive fingerprinting** — detects software and library versions from response headers and static resources using the [vulnersCom/detect-rules](https://github.com/vulnersCom/detect-rules) rule set; no active probing.
- 🛡️ **Vulnerability lookup** — queries the Vulners API for CVEs, advisories, and known exploits affecting each detected version.
- 🚦 **Severity-coded badge** — the toolbar icon shows the count of vulnerable / fingerprinted components on the current host, colored by CVSS severity.
- 📋 **Per-host report** — the popup groups results by host and software, with CVSS scores and an "has exploit" indicator.
- ⚙️ **Configurable scanning** — toggle _show only vulnerable hosts_, _show all domains_, and an optional deeper scan of static resources (e.g. CDN libraries); light/dark theme.
- 🔐 **Single trust boundary** — all network calls and the API key live in the background service worker; the content script only reads page markup.

## Installation

1. Build the extension (see [Development](#development)) — the unpacked extension is written to `./build`.
2. Open **chrome://extensions/** and enable **Developer mode**.
3. Click **Load unpacked** and select the `build/` folder.
4. Open the extension, paste your **Vulners API key** (create one with the `scan` scope at [vulners.com → API keys](https://vulners.com/userinfo?tab=api-keys)), and start browsing.

## Development

```bash
npm install        # install dependencies (Node >= 22.6)
npm run watch      # esbuild watch build -> ./build (reload via chrome://extensions)
npm run build      # production build -> ./build
```

Quality gates:

```bash
npm run typecheck  # tsc --noEmit (app + tests)
npm run lint       # ESLint (flat config)
npm run format     # Prettier
npm test           # Jest
```

A Husky `pre-commit` hook runs `lint-staged` (ESLint + Prettier) on staged files.

## Architecture

```
src/
├── background.ts          # MV3 service worker — owns network + API key + scan state
├── content.ts             # content script — fingerprint-matches page markup
├── api.ts                 # typed Vulners client (retry/backoff, cache, X-Api-Key)
├── sanitize.ts            # XSS-safe color/length/URL helpers
├── types.ts               # shared domain + message-protocol types
├── Browser.ts             # popup -> worker messaging helper
├── index.tsx, App.tsx     # React popup entry + router
├── stores/                # MobX stores (Settings, Data)
├── components/            # popup UI (Header, Navbar, Settings, ApiKeyForm, …)
├── pages/                 # routed views (onboarding, search/results)
└── themes/                # MUI light/dark themes
public/                    # manifest.json, index.html, icons (copied into build/)
tests/                     # Jest unit tests
```

- **Background service worker** — the only component with network access and the API key; observes response headers, runs lookups, persists state in `chrome.storage.local`.
- **Content script** — reads page DOM to match fingerprint rules and reports matches to the worker. No network, no key.
- **Popup (React)** — receives data over internal `chrome.runtime` messaging and renders it.

## Privacy & Security

- The extension reads response headers and page content of sites you visit to fingerprint software, and sends those fingerprints (software name + version) plus your API key to the Vulners API over HTTPS.
- Page text is used only for **local regex matching** and is never transmitted.
- The API key is stored in `chrome.storage.local` and is **never bundled, committed, or logged**.
- All rendered Vulners/page data is escaped by React; inline-style colors are hex-validated and result links are URL-encoded to prevent injection.
- `host_permissions` are limited to `http`/`https`; `externally_connectable` is restricted to `https://*.vulners.com`.

## Browser Compatibility

Any **Chromium**-based browser with Manifest V3 support — Chrome, Chromium, Edge, Brave, Opera, Yandex Browser, and similar.

## Build & Distribution

`npm run build` produces a self-contained `./build` directory:

```
build/
├── manifest.json
├── index.html
├── background.js          # bundled service worker
├── content.js             # bundled content script
├── static/js/main.{js,css}# bundled popup
└── img/
```

Load it unpacked for development, or zip the `build/` folder to publish to the Chrome Web Store.

## Testing

```bash
npm test                   # run the Jest suite
npm run test:coverage      # with coverage report
```

Unit tests (jsdom + a mocked `chrome` API) cover the Vulners API client (retry/backoff, caching, `X-Api-Key` headers), the messaging helper, and the sanitization utilities, with an enforced coverage floor on those modules.

## Contributing

1. Branch from `master`.
2. Make your change and ensure all quality gates pass (`typecheck`, `lint`, `test`, `build`).
3. Keep network access and the API key inside the background worker.
4. Open a pull request.

## License

Released under the **MIT License**.

## Acknowledgments

- [Vulners](https://vulners.com) — vulnerability intelligence and API.
- [vulnersCom/detect-rules](https://github.com/vulnersCom/detect-rules) — software fingerprint rules.
- [vulnersCom/vulners-lookup](https://github.com/vulnersCom/vulners-lookup) — sibling Vulners extension and reference for this project's structure.

## Troubleshooting

- **"API Key is not valid" when saving** — ensure the key has the `scan` scope and was created at [vulners.com → API keys](https://vulners.com/userinfo?tab=api-keys). The extension sends it via the `X-Api-Key` header; keys without `scan` validate but fail lookups (error code 157).
- **No results appear** — fingerprint rules require a valid API key to load; set the key first, then reload pages so the worker can re-scan.
- **Badge not updating** — MV3 service workers are ephemeral; reopen the tab or the popup to trigger a refresh.
