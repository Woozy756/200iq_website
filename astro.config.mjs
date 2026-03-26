// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';

// https://astro.build/config
const assetPrefix = process.env.ASSET_PREFIX;

export default defineConfig({
	site: 'https://200iq.eu',
	output: 'server',
	adapter: node({ mode: 'middleware' }),
	build: {
		inlineStylesheets: 'always',
		assetsPrefix: assetPrefix || undefined,
	},
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
