import type { APIRoute } from 'astro';

export const GET: APIRoute = () => {
	return Response.redirect('/favicon.svg', 302);
};
