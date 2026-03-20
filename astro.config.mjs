// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
	site: 'https://200iq.eu',
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [react()],
	i18n: {
		defaultLocale: 'lv',
		locales: ['en', 'lv', 'ru', 'et'],
		routing: {
			prefixDefaultLocale: true,
			redirectToDefaultLocale: false,
		},
	},
});
