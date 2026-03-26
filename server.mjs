import fs from 'node:fs';
import http from 'node:http';
import http2 from 'node:http2';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import compression from 'compression';
import express from 'express';
import { handler } from './dist/server/entry.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDir = path.join(__dirname, 'dist', 'client');

const app = express();
app.disable('x-powered-by');

app.use(
	compression({
		threshold: 1024,
		brotli: {
			enabled: true,
		},
		filter: (req, res) => {
			const cacheControl = res.getHeader('Cache-Control');
			if (typeof cacheControl === 'string' && cacheControl.includes('no-transform')) {
				return false;
			}
			return compression.filter(req, res);
		},
	}),
);

const immutableAssetPattern = /^_astro\//;
const staticAssetPattern = /\.(?:css|js|mjs|json|svg|png|jpe?g|gif|webp|avif|ico|txt|xml|webmanifest|woff2?)$/i;

app.use(
	express.static(clientDir, {
		etag: true,
		fallthrough: true,
		setHeaders: (res, filePath) => {
			const relativePath = path.relative(clientDir, filePath).replaceAll('\\', '/');
			res.setHeader('Vary', 'Accept-Encoding');

			if (immutableAssetPattern.test(relativePath)) {
				res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
				return;
			}

			if (staticAssetPattern.test(relativePath)) {
				res.setHeader('Cache-Control', 'public, max-age=604800, stale-while-revalidate=86400');
			}
		},
	}),
);

app.use(handler);

const host = process.env.HOST || '0.0.0.0';
const port = Number(process.env.PORT || 4321);

const enableHttp2 = process.env.ENABLE_HTTP2 === 'true';
const sslKeyPath = process.env.SSL_KEY_PATH;
const sslCertPath = process.env.SSL_CERT_PATH;

if (enableHttp2) {
	if (!sslKeyPath || !sslCertPath) {
		throw new Error(
			'ENABLE_HTTP2=true requires SSL_KEY_PATH and SSL_CERT_PATH to be set to valid certificate files.',
		);
	}

	const server = http2.createSecureServer(
		{
			allowHTTP1: true,
			key: fs.readFileSync(sslKeyPath),
			cert: fs.readFileSync(sslCertPath),
		},
		app,
	);

	server.listen(port, host, () => {
		console.log(`Server listening on https://${host}:${port} (HTTP/2 + HTTP/1.1 fallback)`);
	});
} else {
	const server = http.createServer(app);
	server.listen(port, host, () => {
		console.log(`Server listening on http://${host}:${port} (HTTP/1.1)`);
	});
}
