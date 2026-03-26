import type { APIRoute } from 'astro';
import { locales } from '../i18n/ui';
import { getLocalizedPath as buildLocalizedPath } from '../i18n/utils';

const XMLNS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const XHTMLNS = 'http://www.w3.org/1999/xhtml';

type PagePattern = '/' | '/contact';

const pagePatterns: PagePattern[] = ['/', '/contact'];

function getSiteOrigin(site?: URL | undefined, url?: URL): string {
	if (site) {
		return site.toString().replace(/\/$/, '');
	}
	return (url?.origin ?? 'https://200iq.eu').replace(/\/$/, '');
}

function toAbsolute(path: string, siteOrigin: string): string {
	return new URL(path, siteOrigin).toString();
}

function renderAlternates(pattern: PagePattern, siteOrigin: string): string {
	return locales
		.map((locale) => {
			const href = toAbsolute(buildLocalizedPath(locale, pattern), siteOrigin);
			return `<xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`;
		})
		.join('');
}

function renderUrlEntries(siteOrigin: string): string {
	return pagePatterns
		.flatMap((pattern) =>
			locales.map((locale) => {
				const loc = toAbsolute(buildLocalizedPath(locale, pattern), siteOrigin);
				const alternates = renderAlternates(pattern, siteOrigin);
				return `<url><loc>${loc}</loc>${alternates}</url>`;
			})
		)
		.join('');
}

export const GET: APIRoute = ({ site, url }) => {
	const siteOrigin = getSiteOrigin(site, url);
	const body =
		`<?xml version="1.0" encoding="UTF-8"?>` +
		`<urlset xmlns="${XMLNS}" xmlns:xhtml="${XHTMLNS}">` +
		renderUrlEntries(siteOrigin) +
		`</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
		},
	});
};
