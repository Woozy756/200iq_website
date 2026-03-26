import { defaultLang, locales, ui, type Lang, type LocaleDictionary } from './ui';

const localeSet = new Set<string>(locales);

function getByPath(target: unknown, path: string): unknown {
	return path.split('.').reduce<unknown>((value, segment) => {
		if (value && typeof value === 'object' && segment in (value as Record<string, unknown>)) {
			return (value as Record<string, unknown>)[segment];
		}
		return undefined;
	}, target);
}

export function normalizeLang(value?: string): Lang {
	if (value && localeSet.has(value)) {
		return value as Lang;
	}
	return defaultLang;
}

export function getDictionary(lang?: string): LocaleDictionary {
	return ui[normalizeLang(lang)];
}

function normalizePath(path?: string): string {
	if (!path || path === '/') {
		return '/';
	}

	const withLeadingSlash = path.startsWith('/') ? path : `/${path}`;
	const collapsed = withLeadingSlash.replace(/\/{2,}/g, '/');

	if (collapsed.length > 1 && collapsed.endsWith('/')) {
		return collapsed.slice(0, -1);
	}

	return collapsed;
}

export function getLocalizedPath(lang?: string, path = '/'): string {
	const locale = normalizeLang(lang);
	const normalizedPath = normalizePath(path);

	if (locale === defaultLang) {
		return normalizedPath;
	}

	if (normalizedPath === '/') {
		return `/${locale}/`;
	}

	return `/${locale}${normalizedPath}`;
}

export function useTranslations(lang?: string) {
	const locale = normalizeLang(lang);
	return (key: string): string => {
		const localized = getByPath(ui[locale], key);
		if (typeof localized === 'string') {
			return localized;
		}

		const fallback = getByPath(ui[defaultLang], key);
		if (typeof fallback === 'string') {
			return fallback;
		}

		return key;
	};
}
