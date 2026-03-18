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
			cta: 'Get started',
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
			lead: 'You share your vision, goals, and ambitions. We create elite-level websites - defined by precision, experience, and refined, high-end animations. The result is a digital presence that not only looks exceptional, but maximizes your visibility and leaves a lasting impression on every client.',
			readyPrompt: 'Ready to get started?',
			primaryCta: 'Yes, lets go',
			secondaryCta: 'No',
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
					desc: "Bespoke visual experiences tailored for the most demanding brands. We don't just build websites; we craft digital masterpieces.",
				},
				{
					title: 'SEO Optimization',
					desc: 'Dominating search rankings with precision-engineered metadata and high-performance architecture that Google loves.',
				},
				{
					title: 'Payment Integration',
					desc: 'Seamless, secure, and lightning-fast transaction systems integrated directly into your digital ecosystem.',
				},
				{
					title: 'Individual Requests',
					desc: "Custom-built features and unique functionalities designed specifically for your business's unique digital needs.",
				},
			],
		},
		tech: {
			eyebrow: '200iq.eu',
			title: 'Digital Evolution',
			body:
				'We deliver modern front and back-end architecture for businesses that need to stand out, creating visually striking, interactive experiences with seamless effects that push beyond what typical websites feel like.',
			metrics: [
				{
					value: '100%',
					label: 'Custom Built',
				},
				{
					value: '< 30 days',
					label: 'Delivery Time',
				},
			],
		},
		stats: {
			items: [
				{ label: 'Uptime', value: '99.99%' },
				{ label: 'Latency', value: '< 2 ms' },
				{ label: 'Client Reviews', value: '5/5' },
				{ label: 'Security', value: 'Maximum' },
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
		contact: {
			eyebrow: 'Start the Process',
			titleStart: "Let's build",
			titleHighlight: 'together',
			lead: 'You share your goals, constraints, and target outcomes. We engineer the digital solution to get you there.',
			form: {
				nameLabel: 'Full Name',
				namePlaceholder: 'John Doe',
				emailLabel: 'Email Address',
				emailPlaceholder: 'john@example.com',
				projectTypeLabel: 'Project Type',
				projectTypePlaceholder: 'Select an option',
				types: {
					content: 'Content Site / Blog (No E-commerce)',
					ecommerce: 'High-Performance E-commerce',
					animated: 'High-Fidelity Animated Experience',
					custom: 'Custom Enterprise Architecture',
				},
				detailsLabel: 'Project Details',
				detailsPlaceholder: 'Share your goals, restraints, and target outcomes...',
				submitBtn: 'Apply For Access',
				submittingBtn: 'Transmitting...',
				errorMsg: 'Transmission failed. Please try again or contact us directly.',
				successTitle: 'Message Received',
				successDesc: 'Access granted. Our elite engineering team will review your project details and contact you shortly.',
				validation: {
					nameReq: 'Name is required',
					emailReq: 'Valid email is required',
					typeReq: 'Please select a project type',
					detailsReq: 'Please provide some project details'
				}
			}
		},
	},
} as const;

export type LocaleDictionary = (typeof ui)[Lang];
