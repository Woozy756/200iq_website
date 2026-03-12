export const locales = ['en'] as const;

export type Lang = (typeof locales)[number];

export const defaultLang: Lang = 'en';

export const ui = {
	en: {
		metadata: {
			title: '200IQ | Elite Web Engineering',
			description:
				'200IQ builds high-performance websites with elite design, modern architecture, and reliable launch workflows.',
		},
		navigation: {
			brand: '200IQ',
			links: {
				vision: 'Vision',
				process: 'Process',
				tech: 'Tech',
				network: 'Network',
			},
			cta: 'Get Started',
			openMenu: 'Open menu',
			closeMenu: 'Close menu',
			languageLabel: 'Language',
			localeNames: {
				en: 'English',
			},
		},
		intro: {
			titleStart: 'Get your',
			titleHighlight: 'dream website',
			titleEnd: 'done with us.',
			kicker: 'Precision Engineering  |  Elite Design  |  Absolute Performance',
			lead: 'Based in Latvia, we craft modern websites that capture attention fast and convert with technical clarity.',
		},
		process: {
			eyebrow: 'How We Build',
			title: 'The Climb To Launch',
			description: 'A direct four-step workflow from first call to production launch.',
			steps: [
				{
					title: 'Contact',
					desc: 'You share goals, constraints, and target outcomes.',
				},
				{
					title: 'Design',
					desc: 'We shape visual direction and page architecture.',
				},
				{
					title: 'Contract',
					desc: 'Scope, timeline, and deliverables are locked clearly.',
				},
				{
					title: 'Launch',
					desc: 'We ship a fast, reliable, measurable digital asset.',
				},
			],
		},
		vision: {
			eyebrow: 'Our Vision',
			title: 'World-Class Mind',
			body1:
				'Elite engineering is not limited by geography. We build websites that meet international standards in design and delivery.',
			body2:
				'Your website is your most visible business asset. Modern architecture keeps it fast, stable, and ready for growth.',
			bullets: ['Global Engineering', 'Elite Aesthetics', 'Latvian Precision'],
		},
		services: {
			eyebrow: 'Core Services',
			title: 'High-Performance Delivery',
			cards: [
				{
					title: 'Elite Level Design',
					desc: 'Bespoke visual systems tailored for premium brands.',
				},
				{
					title: 'SEO Optimization',
					desc: 'Clean structure and metadata that support discoverability.',
				},
				{
					title: 'Payment Integration',
					desc: 'Secure and dependable transaction flows.',
				},
				{
					title: 'Custom Requests',
					desc: 'Business-specific features built to your workflow.',
				},
			],
		},
		tech: {
			eyebrow: 'The Stack',
			title: 'Digital Evolution',
			body:
				'We deliver modern front-end architecture for teams that need speed, maintainability, and confidence in production.',
			metrics: [
				{
					value: '100%',
					label: 'Modern Compliance',
				},
				{
					value: '100TB',
					label: 'Throughput',
				},
			],
		},
		stats: {
			items: [
				{ label: 'Uptime', value: '99.99%' },
				{ label: 'Latency', value: '< 2ms' },
				{ label: 'Nodes', value: '14.2k' },
				{ label: 'Security', value: 'Lvl 5' },
			],
		},
		network: {
			titleStart: 'Join the',
			titleEnd: 'Network',
			body:
				'Become part of a global community of builders, engineers, and decision makers shaping the next generation of digital products.',
			cta: 'Apply for Access',
		},
		footer: {
			titleStart: "Let's build",
			titleHighlight: 'together.',
			cta: 'Get Started',
			socialTitle: 'Social',
			legalTitle: 'Legal',
			socialLinks: ['Twitter', 'Discord', 'Github'],
			legalLinks: ['Privacy', 'Terms', 'Cookies'],
			builtFor: 'Built for the elite',
			status: 'Status: Operational',
			copyright: 'Copyright 2026 200IQ Systems. All rights reserved.',
		},
	},
} as const;

export type LocaleDictionary = (typeof ui)[Lang];
