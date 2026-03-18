import { useEffect, useRef, useState } from 'react';
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
	const showLocaleLinks = Array.isArray(localeLinks) && localeLinks.length > 1;
	const boundsRef = useRef({
		releasePoint: 20,
		viewportWidth: 0,
		viewportHeight: 0,
	});

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

	const handleSectionLinkClick = (event, link) => {
		const targetId = link?.targetId;
		if (!targetId) {
			setIsOpen(false);
			return;
		}

		const url = getTargetUrl(link.href);
		if (!url || url.origin !== window.location.origin) {
			setIsOpen(false);
			return;
		}

		const isSamePage =
			url.pathname === window.location.pathname &&
			url.search === window.location.search;

		if (isSamePage) {
			event.preventDefault();
			setIsOpen(false);
			scrollToTargetId(targetId);
			return;
		}

		window.sessionStorage.setItem(PENDING_NAV_TARGET_KEY, targetId);
		window.sessionStorage.setItem(PENDING_NAV_TRANSITION_KEY, '1');
		setIsOpen(false);
	};

	const handleBrandClick = (event) => {
		const anchor = event.currentTarget;
		const url = getTargetUrl(anchor?.getAttribute('href'));
		if (!url) {
			setIsOpen(false);
			return;
		}

		const isSamePage =
			url.pathname === window.location.pathname &&
			url.search === window.location.search;

		if (!isSamePage) {
			setIsOpen(false);
			return;
		}

		event.preventDefault();
		window.sessionStorage.removeItem(PENDING_NAV_TARGET_KEY);
		window.sessionStorage.removeItem(PENDING_NAV_TRANSITION_KEY);
		setIsOpen(false);

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
					{showLocaleLinks && (
						<div className="language-links" aria-label={languageLabel}>
							{localeLinks.map((locale) => (
								<a
									key={locale.code}
									href={locale.href}
									lang={locale.code}
									className={`lang-link ${locale.code === currentLocale ? 'is-active' : ''}`}
								>
									{locale.code}
								</a>
							))}
						</div>
					)}
					<a href={`/${currentLocale}/contact`} className="btn btn-primary desktop-only">
						{ctaLabel}
					</a>
					<button
						type="button"
						className="nav-toggle"
						onClick={() => setIsOpen((prev) => !prev)}
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
