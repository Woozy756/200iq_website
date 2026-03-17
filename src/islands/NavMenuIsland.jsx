import { useEffect, useState } from 'react';

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

	useEffect(() => {
		const handleScroll = () => {
			const hero = document.querySelector('.hero:not(.contact-hero)');
			if (!hero) {
				setIsScrolled(window.scrollY > 20);
				return;
			}

			const heroTop = hero.offsetTop;
			const heroTravel = Math.max(hero.offsetHeight - window.innerHeight, 0);
			const heroReleasePoint = heroTop + heroTravel + 4;

			if (heroTravel === 0) {
				setIsScrolled(window.scrollY > heroTop + 20);
				return;
			}

			setIsScrolled(window.scrollY >= heroReleasePoint);
		};

		const handleResize = () => {
			if (window.innerWidth > 980) {
				setIsOpen(false);
			}
		};

		handleScroll();
		window.addEventListener('scroll', handleScroll, { passive: true });
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('scroll', handleScroll);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return (
		<header className={`nav-shell ${isScrolled ? 'is-scrolled' : ''}`}>
			<div className="container nav-inner">
				<a className="brand brand-logo-link" href={`/${currentLocale}/`} aria-label={brand}>
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
						<a className="nav-link" href={link.href} key={link.href}>
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
							key={link.href}
							href={link.href}
							className="mobile-link"
							onClick={() => setIsOpen(false)}
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
