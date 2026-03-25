import type { APIRoute } from 'astro';
import { Resend } from 'resend';

export const prerender = false;

const PROJECT_TYPE_LABELS: Record<string, string> = {
	content: 'Content Site / Blog (No E-commerce)',
	ecommerce: 'High-Performance E-commerce',
	animated: 'High-Fidelity Animated Experience',
	custom: 'Custom Enterprise Architecture',
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 5;
const contactRateLimitStore = new Map<string, { count: number; windowStart: number }>();

function getClientIp(request: Request): string {
	const xForwardedFor = request.headers.get('x-forwarded-for');
	if (xForwardedFor) {
		const firstIp = xForwardedFor.split(',')[0]?.trim();
		if (firstIp) return firstIp;
	}

	return (
		request.headers.get('cf-connecting-ip') ||
		request.headers.get('x-real-ip') ||
		'unknown'
	);
}

function checkRateLimit(clientIp: string, now = Date.now()) {
	// Trim expired entries to keep memory bounded for long-running processes.
	for (const [key, entry] of contactRateLimitStore) {
		if (now - entry.windowStart >= RATE_LIMIT_WINDOW_MS) {
			contactRateLimitStore.delete(key);
		}
	}

	const current = contactRateLimitStore.get(clientIp);

	if (!current || now - current.windowStart >= RATE_LIMIT_WINDOW_MS) {
		contactRateLimitStore.set(clientIp, { count: 1, windowStart: now });
		return { allowed: true as const, retryAfterSeconds: 0 };
	}

	if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
		const retryAfterSeconds = Math.max(
			1,
			Math.ceil((RATE_LIMIT_WINDOW_MS - (now - current.windowStart)) / 1000),
		);
		return { allowed: false as const, retryAfterSeconds };
	}

	current.count += 1;
	contactRateLimitStore.set(clientIp, current);
	return { allowed: true as const, retryAfterSeconds: 0 };
}

export const POST: APIRoute = async ({ request }) => {
	try {
		const clientIp = getClientIp(request);
		const rateLimitResult = checkRateLimit(clientIp);

		if (!rateLimitResult.allowed) {
			return new Response(
				JSON.stringify({ success: false, error: 'Too many requests. Please try again later.' }),
				{
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						'Retry-After': String(rateLimitResult.retryAfterSeconds),
					},
				}
			);
		}

		const body = await request.json();
		const { name, email, projectType, details } = body;

		// Server-side validation
		if (!name?.trim() || !email?.trim() || !projectType || !details?.trim()) {
			return new Response(
				JSON.stringify({ success: false, error: 'All fields are required.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		if (!/^\S+@\S+\.\S+$/.test(email)) {
			return new Response(
				JSON.stringify({ success: false, error: 'Invalid email address.' }),
				{ status: 400, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const apiKey = process.env.RESEND_API_KEY;
		const isProd = import.meta.env.PROD;
		const toEmail = process.env.CONTACT_TO_EMAIL || '200iqservices@gmail.com';
		const fromEmail = process.env.RESEND_FROM_EMAIL;

		if (!apiKey || apiKey === 're_YOUR_API_KEY_HERE') {
			if (isProd) {
				console.error('CONTACT CONFIG ERROR: RESEND_API_KEY is missing in production.');
				return new Response(
					JSON.stringify({ success: false, error: 'Email service is not configured.' }),
					{ status: 500, headers: { 'Content-Type': 'application/json' } }
				);
			}

			// Development fallback — log to console instead of sending
			console.log('──────────────────────────────────────');
			console.log('📧 CONTACT FORM SUBMISSION (dev mode)');
			console.log(`   Name:         ${name}`);
			console.log(`   Email:        ${email}`);
			console.log(`   Project Type: ${PROJECT_TYPE_LABELS[projectType] ?? projectType}`);
			console.log(`   Details:      ${details}`);
			console.log('──────────────────────────────────────');

			return new Response(
				JSON.stringify({ success: true }),
				{ status: 200, headers: { 'Content-Type': 'application/json' } }
			);
		}

		if (isProd && !fromEmail) {
			console.error('CONTACT CONFIG ERROR: RESEND_FROM_EMAIL is missing in production.');
			return new Response(
				JSON.stringify({ success: false, error: 'Email sender is not configured.' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}

		const sender = fromEmail || 'Contact Form <onboarding@resend.dev>';

		const resend = new Resend(apiKey);

		const typeName = PROJECT_TYPE_LABELS[projectType] ?? projectType;

		const { error } = await resend.emails.send({
			from: sender,
			to: toEmail,
			subject: `New Project Inquiry — ${typeName}`,
			replyTo: email,
			html: `
				<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0d0503; color: #f4e7d5; border-radius: 12px; overflow: hidden; border: 1px solid rgba(225,161,64,0.2);">
					<div style="background: linear-gradient(135deg, #1a0b05, #120703); padding: 32px 28px 20px; border-bottom: 1px solid rgba(225,161,64,0.18);">
						<h1 style="margin: 0; font-size: 22px; color: #EFCFA0; letter-spacing: 0.03em;">New Project Inquiry</h1>
						<p style="margin: 8px 0 0; color: rgba(255,255,255,0.6); font-size: 13px;">via 200IQ Contact Form</p>
					</div>
					<div style="padding: 28px;">
						<table style="width: 100%; border-collapse: collapse;">
							<tr>
								<td style="padding: 10px 0; color: #E1A140; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; vertical-align: top; width: 130px;">Name</td>
								<td style="padding: 10px 0; color: #f4e7d5; font-size: 15px;">${name}</td>
							</tr>
							<tr>
								<td style="padding: 10px 0; color: #E1A140; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; vertical-align: top;">Email</td>
								<td style="padding: 10px 0; font-size: 15px;"><a href="mailto:${email}" style="color: #EFCFA0; text-decoration: none;">${email}</a></td>
							</tr>
							<tr>
								<td style="padding: 10px 0; color: #E1A140; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700; vertical-align: top;">Project Type</td>
								<td style="padding: 10px 0; color: #f4e7d5; font-size: 15px;">${typeName}</td>
							</tr>
							<tr>
								<td colspan="2" style="padding: 18px 0 6px; color: #E1A140; font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 700;">Project Details</td>
							</tr>
							<tr>
								<td colspan="2" style="padding: 0; color: #cfb18a; font-size: 14px; line-height: 1.7; white-space: pre-wrap;">${details}</td>
							</tr>
						</table>
					</div>
					<div style="padding: 16px 28px; background: rgba(225,161,64,0.06); border-top: 1px solid rgba(225,161,64,0.12); text-align: center;">
						<p style="margin: 0; color: rgba(255,255,255,0.4); font-size: 11px;">200IQ Systems — Elite Web Engineering</p>
					</div>
				</div>
			`,
		});

		if (error) {
			console.error('Resend error:', error);
			return new Response(
				JSON.stringify({ success: false, error: 'Failed to send email.' }),
				{ status: 500, headers: { 'Content-Type': 'application/json' } }
			);
		}

		return new Response(
			JSON.stringify({ success: true }),
			{ status: 200, headers: { 'Content-Type': 'application/json' } }
		);
	} catch (err) {
		console.error('Contact endpoint error:', err);
		return new Response(
			JSON.stringify({ success: false, error: 'Internal server error.' }),
			{ status: 500, headers: { 'Content-Type': 'application/json' } }
		);
	}
};
