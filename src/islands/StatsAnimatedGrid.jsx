import { useEffect, useRef } from 'react';

const RANDOM_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

function parseTarget(rawValue) {
	const raw = String(rawValue || '').trim();
	const match = raw.match(/-?\d+(?:[.,]\d+)?/);
	if (!match) return null;

	const numberText = match[0];
	const numberIndex = match.index || 0;
	const prefix = raw.slice(0, numberIndex);
	const suffix = raw.slice(numberIndex + numberText.length);
	const decimalSeparator = numberText.includes(',') ? ',' : '.';
	const decimalPart = numberText.includes('.') ? numberText.split('.')[1] : numberText.split(',')[1];
	const decimals = decimalPart ? decimalPart.length : 0;
	const target = Number.parseFloat(numberText.replace(',', '.'));

	if (!Number.isFinite(target)) return null;

	return { raw, target, prefix, suffix, decimals, decimalSeparator };
}

function formatValue(value, decimals, decimalSeparator) {
	const fixed = value.toFixed(decimals);
	return decimalSeparator === ',' ? fixed.replace('.', ',') : fixed;
}

function easeOut(t) {
	return 1 - (1 - t) ** 3;
}

export default function StatsAnimatedGrid({ items }) {
	const gridRef = useRef(null);
	const valueRefs = useRef([]);

	useEffect(() => {
		const gridEl = gridRef.current;
		const [uptimeEl, latencyEl, reviewsEl, shuffleEl] = valueRefs.current;
		if (!gridEl || !uptimeEl || !latencyEl || !reviewsEl || !shuffleEl) return;

		const uptimeTarget = items[0]?.value ?? '';
		const latencyTarget = items[1]?.value ?? '';
		const reviewsTarget = items[2]?.value ?? '';
		const shuffleTarget = items[3]?.value ?? '';

		const uptimeParsed = parseTarget(uptimeTarget);
		const latencyParsed = parseTarget(latencyTarget);
		const reviewsParsed = parseTarget(reviewsTarget);
		if (!uptimeParsed || !latencyParsed || !reviewsParsed) return;

		uptimeEl.textContent = uptimeTarget;
		latencyEl.textContent = latencyTarget;
		reviewsEl.textContent = reviewsTarget;
		shuffleEl.textContent = shuffleTarget;

		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
			return;
		}

		const durationMs = 1320;
		const startDelayMs = 140;

		let rafId = 0;
		let timeoutId = 0;

		const renderNumeric = (element, parsed, startValue, progress) => {
			const numericValue = startValue + (parsed.target - startValue) * progress;
			const roundedValue = parsed.decimals === 0 ? Math.round(numericValue) : numericValue;
			element.textContent = `${parsed.prefix}${formatValue(roundedValue, parsed.decimals, parsed.decimalSeparator)}${parsed.suffix}`;
		};

		const renderShuffle = (element, targetRaw, progress) => {
			if (progress >= 1) {
				element.textContent = targetRaw;
				return;
			}

			const revealedCount = Math.floor(targetRaw.length * progress);
			let nextText = '';

			for (let index = 0; index < targetRaw.length; index += 1) {
				const character = targetRaw[index];

				if (character === ' ') {
					nextText += ' ';
					continue;
				}

				if (index < revealedCount || !/[A-Za-z0-9]/.test(character)) {
					nextText += character;
					continue;
				}

				nextText += RANDOM_POOL[Math.floor(Math.random() * RANDOM_POOL.length)];
			}

			element.textContent = nextText;
		};

		const finish = () => {
			uptimeEl.textContent = uptimeTarget;
			latencyEl.textContent = latencyTarget;
			reviewsEl.textContent = reviewsTarget;
			shuffleEl.textContent = shuffleTarget;
		};

		const startAnimation = () => {
			const startedAt = performance.now();

			const tick = (time) => {
				const progress = Math.min((time - startedAt) / durationMs, 1);
				const eased = easeOut(progress);

				renderNumeric(uptimeEl, uptimeParsed, 0, eased);
				renderNumeric(latencyEl, latencyParsed, 50, eased);
				renderNumeric(reviewsEl, reviewsParsed, 0, eased);
				renderShuffle(shuffleEl, shuffleTarget, eased);

				if (progress < 1) {
					rafId = requestAnimationFrame(tick);
					return;
				}

				finish();
			};

			rafId = requestAnimationFrame(tick);
		};

		timeoutId = window.setTimeout(startAnimation, startDelayMs);

		return () => {
			if (timeoutId) clearTimeout(timeoutId);
			if (rafId) cancelAnimationFrame(rafId);
		};
	}, [items]);

	return (
		<div ref={gridRef} className="container stats-grid">
			{items.map((item, index) => (
				<div key={`${item.label}-${index}`} className={`stat stat-${index + 1}`}>
					<p className="stat-value">
						<span
							ref={(node) => {
								valueRefs.current[index] = node;
							}}
							className={`stat-value-text${index === 0 ? ' stat-value-uptime' : ''}`}
						>
							{item.value}
						</span>
						{index === 2 && (
							<span className="stat-star" aria-hidden="true">
								★
							</span>
						)}
					</p>
					<p className="stat-label">{item.label}</p>
				</div>
			))}
		</div>
	);
}
