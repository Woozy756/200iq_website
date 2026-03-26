# Astro Starter Kit: Basics

```sh
npm create astro@latest -- --template basics
```

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── public/
│   └── favicon.svg
├── src
│   ├── assets
│   │   └── astro.svg
│   ├── components
│   │   └── Welcome.astro
│   ├── layouts
│   │   └── Layout.astro
│   └── pages
│       └── index.astro
└── package.json
```

To learn more about the folder structure of an Astro project, refer to [our guide on project structure](https://docs.astro.build/en/basics/project-structure/).

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run start`           | Start production server with Brotli/Gzip         |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## Production Delivery

- Response compression is enabled in `server.mjs` using `compression` middleware.
- Brotli is preferred automatically; Gzip is used as fallback by the same middleware.
- Optional CDN asset prefix is supported via `ASSET_PREFIX` (for generated `/_astro/*` assets).
- Static assets are served with cache headers:
  - `/_astro/*` => `public, max-age=31536000, immutable`
  - other static assets => `public, max-age=604800, stale-while-revalidate=86400`
- Optional HTTP/2 can be enabled:
  - `ENABLE_HTTP2=true`
  - `SSL_KEY_PATH=/path/to/privkey.pem`
  - `SSL_CERT_PATH=/path/to/fullchain.pem`

Example:

```sh
ENABLE_HTTP2=true SSL_KEY_PATH=/etc/ssl/private/key.pem SSL_CERT_PATH=/etc/ssl/cert.pem npm run start
```

CDN example build:

```sh
ASSET_PREFIX=https://cdn.example.com npm run build
```

For HTTP/3 and globally distributed edge delivery, terminate TLS and serve through a CDN/proxy (for example Cloudflare, Fastly, or AWS CloudFront) in front of this Node server.

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).
