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
			setIsScrolled(window.scrollY > 20);
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
				<a className="brand" href={`/${currentLocale}/`}>
					<span className="brand-badge">IQ</span>
					<span>{brand}</span>
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
					<a href="#join" className="btn btn-primary desktop-only">
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
					<a href="#join" className="btn btn-primary" onClick={() => setIsOpen(false)}>
						{ctaLabel}
					</a>
				</div>
			</div>
		</header>
	);
}
