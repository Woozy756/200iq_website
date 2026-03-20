import type { APIRoute } from 'astro';

function getSiteOrigin(site?: URL | undefined, url?: URL): string {
	if (site) {
		return site.toString().replace(/\/$/, '');
	}
	return (url?.origin ?? 'https://200iq.eu').replace(/\/$/, '');
}

export const GET: APIRoute = ({ site, url }) => {
	const siteOrigin = getSiteOrigin(site, url);
	const body = `User-agent: *
Allow: /

Sitemap: ${siteOrigin}/sitemap.xml
`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain; charset=utf-8',
		},
	});
};
