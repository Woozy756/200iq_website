import { useEffect, useId, useRef, useState } from 'react';
import { subscribeViewportRaf } from './viewportRaf';

const PENDING_NAV_TARGET_KEY = '__pendingNavTarget';
const PENDING_NAV_TRANSITION_KEY = '__pendingNavTransition';

function getTargetUrl(href) {
	if (!href) return null;

	try {
		return new URL(href, window.location.href);
	} catch {
		return null;
	}
}

function scrollToTargetId(targetId) {
	if (!targetId) return false;

	const target = document.getElementById(targetId);
	if (!target) return false;

	if (typeof window.__jumpToTargetWithTransition === 'function') {
		window.__jumpToTargetWithTransition(target);
		return true;
	}

	const targetY = target.getBoundingClientRect().top + (window.scrollY || window.pageYOffset || 0);
	window.scrollTo(0, targetY);
	return true;
}

export default function NavMenuIsland({
	brand,
	links,
	localeLinks,
	currentLocale,
	ctaLabel,
	openMenuLabel,
	closeMenuLabel,
	languageLabel,
}) {
	const [isOpen, setIsOpen] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);
	const [isLocaleMenuOpen, setIsLocaleMenuOpen] = useState(false);
	const localeMenuId = useId();
	const availableLocales = Array.isArray(localeLinks) ? localeLinks : [];
	const showLocaleLinks = availableLocales.length > 1;
	const boundsRef = useRef({
		releasePoint: 20,
		viewportWidth: 0,
		viewportHeight: 0,
	});
	const localeMenuRef = useRef(null);
	const defaultLocaleOption = (
		availableLocales.find((locale) => locale.code === currentLocale)
		|| availableLocales[0]
		|| null
	);
	const selectedLocale = defaultLocaleOption;

	useEffect(() => {
		const measureBounds = () => {
			const hero = document.querySelector('.hero:not(.contact-hero)');
			if (!hero) {
				boundsRef.current.releasePoint = 20;
				return;
			}

			const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
			const rect = hero.getBoundingClientRect();
			const heroTop = rect.top + scrollY;
			const heroTravel = Math.max(hero.offsetHeight - window.innerHeight, 0);
			boundsRef.current.releasePoint = heroTravel === 0 ? heroTop + 20 : heroTop + heroTravel + 4;
		};

		const update = () => {
			const viewportWidth = window.innerWidth || 0;
			const viewportHeight = window.innerHeight || 0;
			const viewportChanged = (
				viewportWidth !== boundsRef.current.viewportWidth
				|| viewportHeight !== boundsRef.current.viewportHeight
			);

			if (viewportChanged) {
				boundsRef.current.viewportWidth = viewportWidth;
				boundsRef.current.viewportHeight = viewportHeight;
				measureBounds();
			}

			const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
			const nextScrolled = scrollY >= boundsRef.current.releasePoint;
			setIsScrolled((prev) => (prev === nextScrolled ? prev : nextScrolled));

			if (viewportWidth > 980) {
				setIsOpen(false);
			}
		};

		return subscribeViewportRaf(update);
	}, []);

	useEffect(() => {
		if (!isLocaleMenuOpen) {
			return undefined;
		}

		const handlePointerDown = (event) => {
			if (!localeMenuRef.current?.contains(event.target)) {
				setIsLocaleMenuOpen(false);
			}
		};

		const handleKeyDown = (event) => {
			if (event.key === 'Escape') {
				setIsLocaleMenuOpen(false);
			}
		};

		document.addEventListener('pointerdown', handlePointerDown);
		document.addEventListener('keydown', handleKeyDown);

		return () => {
			document.removeEventListener('pointerdown', handlePointerDown);
			document.removeEventListener('keydown', handleKeyDown);
		};
	}, [isLocaleMenuOpen]);

	const handleLocaleSelect = (event, locale) => {
		setIsLocaleMenuOpen(false);

		if (!locale?.href) {
			return;
		}

		const targetUrl = getTargetUrl(locale.href);
		if (!targetUrl) {
			return;
		}

		const isSamePage =
			targetUrl.pathname === window.location.pathname &&
			targetUrl.search === window.location.search &&
			targetUrl.hash === window.location.hash;

		if (isSamePage) {
			event.preventDefault();
			return;
		}
	};

	const handleSectionLinkClick = (event, link) => {
		const targetId = link?.targetId;
		if (!targetId) {
			setIsOpen(false);
			setIsLocaleMenuOpen(false);
			return;
		}

		const url = getTargetUrl(link.href);
		if (!url || url.origin !== window.location.origin) {
			setIsOpen(false);
			setIsLocaleMenuOpen(false);
			return;
		}

		const isSamePage =
			url.pathname === window.location.pathname &&
			url.search === window.location.search;

		if (isSamePage) {
			event.preventDefault();
			setIsOpen(false);
			setIsLocaleMenuOpen(false);
			scrollToTargetId(targetId);
			return;
		}

		window.sessionStorage.setItem(PENDING_NAV_TARGET_KEY, targetId);
		window.sessionStorage.setItem(PENDING_NAV_TRANSITION_KEY, '1');
		setIsOpen(false);
		setIsLocaleMenuOpen(false);
	};

	const handleBrandClick = (event) => {
		const anchor = event.currentTarget;
		const url = getTargetUrl(anchor?.getAttribute('href'));
		if (!url) {
			setIsOpen(false);
			setIsLocaleMenuOpen(false);
			return;
		}

		const isSamePage =
			url.pathname === window.location.pathname &&
			url.search === window.location.search;

		if (!isSamePage) {
			setIsOpen(false);
			setIsLocaleMenuOpen(false);
			return;
		}

		event.preventDefault();
		window.sessionStorage.removeItem(PENDING_NAV_TARGET_KEY);
		window.sessionStorage.removeItem(PENDING_NAV_TRANSITION_KEY);
		setIsOpen(false);
		setIsLocaleMenuOpen(false);

		if (window.__lenis && typeof window.__lenis.scrollTo === 'function') {
			window.__lenis.scrollTo(0, { immediate: true, force: true });
			return;
		}

		window.scrollTo(0, 0);
	};

	return (
		<header className={`nav-shell ${isScrolled ? 'is-scrolled' : ''}`}>
			<div className="container nav-inner">
				<a
					className="brand brand-logo-link"
					href={`/${currentLocale}/`}
					aria-label={brand}
					onClick={handleBrandClick}
				>
					<span className="brand-logo-frame">
						<img
							className="brand-logo-image"
							src="/200iq_logo.png"
							alt={brand}
							width="2048"
							height="597"
						/>
					</span>
				</a>

				<nav className="nav-links" aria-label="Primary">
					{links.map((link) => (
						<a
							className="nav-link"
							href={link.href}
							key={link.targetId || link.href}
							onClick={(event) => handleSectionLinkClick(event, link)}
						>
							{link.label}
						</a>
					))}
				</nav>

				<div className="nav-actions">
					<a href={`/${currentLocale}/contact`} className="btn btn-primary desktop-only">
						{ctaLabel}
					</a>
					{showLocaleLinks && selectedLocale && (
						<div className="locale-menu" ref={localeMenuRef}>
							<button
								type="button"
								className={`locale-trigger ${isLocaleMenuOpen ? 'is-open' : ''}`}
								aria-label={languageLabel}
								aria-haspopup="listbox"
								aria-expanded={isLocaleMenuOpen}
								aria-controls={localeMenuId}
								onClick={() => setIsLocaleMenuOpen((prev) => !prev)}
							>
								<span
									className={`locale-flag fi fi-${selectedLocale.flagCode}`}
									aria-hidden="true"
								/>
								<span className="locale-trigger-chevron" aria-hidden="true" />
							</button>

							<div
								id={localeMenuId}
								className={`locale-popover ${isLocaleMenuOpen ? 'is-open' : ''}`}
								role="listbox"
								aria-label={languageLabel}
							>
								{availableLocales.map((locale) => (
									<a
										key={locale.code}
										href={locale.href}
										role="option"
										aria-selected={locale.code === selectedLocale.code}
										className={`locale-option ${locale.code === selectedLocale.code ? 'is-active' : ''}`}
										onClick={(event) => handleLocaleSelect(event, locale)}
									>
										<span
											className={`locale-option-flag fi fi-${locale.flagCode}`}
											aria-hidden="true"
										/>
										<span className="locale-option-label">{locale.label}</span>
									</a>
								))}
							</div>
						</div>
					)}
					<button
						type="button"
						className="nav-toggle"
						onClick={() => {
							setIsLocaleMenuOpen(false);
							setIsOpen((prev) => !prev);
						}}
						aria-expanded={isOpen}
						aria-label={isOpen ? closeMenuLabel : openMenuLabel}
					>
						{isOpen ? 'x' : '='}
					</button>
				</div>
			</div>

			<div className={`mobile-panel ${isOpen ? 'is-open' : ''}`}>
				<div className="container mobile-panel-inner">
					{links.map((link) => (
						<a
							key={link.targetId || link.href}
							href={link.href}
							className="mobile-link"
							onClick={(event) => handleSectionLinkClick(event, link)}
						>
							{link.label}
						</a>
					))}
					<a href={`/${currentLocale}/contact`} className="btn btn-primary" onClick={() => setIsOpen(false)}>
						{ctaLabel}
					</a>
				</div>
			</div>
		</header>
	);
}
