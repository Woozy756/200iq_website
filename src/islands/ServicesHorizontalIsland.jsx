import { useEffect, useMemo, useRef, useState } from 'react';

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
	return 1 - (1 - value) ** 3;
}

function CpuIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<rect x="7" y="7" width="10" height="10" rx="2" />
			<path d="M4 10h3M4 14h3M17 10h3M17 14h3M10 4v3M14 4v3M10 17v3M14 17v3" />
		</svg>
	);
}

function GlobeIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="9" />
			<path d="M3 12h18M12 3a13 13 0 0 1 0 18M12 3a13 13 0 0 0 0 18M5.5 7.5h13M5.5 16.5h13" />
		</svg>
	);
}

function TargetIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="8" />
			<circle cx="12" cy="12" r="4" />
			<circle cx="12" cy="12" r="1.4" />
		</svg>
	);
}

function ZapIcon() {
	return (
		<svg viewBox="0 0 24 24" aria-hidden="true">
			<path d="M13 2 5 14h6l-1 8 9-13h-6l0-7Z" />
		</svg>
	);
}

const icons = [CpuIcon, GlobeIcon, TargetIcon, ZapIcon];

export default function ServicesHorizontalIsland({ cards = [] }) {
	const containerRef = useRef(null);
	const [progress, setProgress] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(1280);
	const progressRef = useRef(0);

	useEffect(() => {
		const onResize = () => {
			setViewportWidth(window.innerWidth);
		};

		onResize();
		window.addEventListener('resize', onResize);
		return () => {
			window.removeEventListener('resize', onResize);
		};
	}, []);

	useEffect(() => {
		let rafId = 0;

		const update = () => {
			if (!containerRef.current) {
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const span = Math.max(rect.height - window.innerHeight, 1);
			const raw = -rect.top / span;
			const next = clamp(raw, 0, 1);
			if (Math.abs(next - progressRef.current) < 0.0015) {
				return;
			}
			progressRef.current = next;
			setProgress(next);
		};

		const onScroll = () => {
			if (rafId) {
				return;
			}
			rafId = window.requestAnimationFrame(() => {
				rafId = 0;
				update();
			});
		};

		update();
		window.addEventListener('scroll', onScroll, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', onScroll);
			window.removeEventListener('resize', update);
			if (rafId) {
				window.cancelAnimationFrame(rafId);
			}
		};
	}, []);

	const layout = useMemo(() => {
		const count = Math.max(cards.length, 1);
		const slots =
			viewportWidth >= 1200 ? 4 : viewportWidth >= 920 ? 3 : viewportWidth >= 640 ? 2 : 1;
		const gap = viewportWidth >= 1200 ? 24 : viewportWidth >= 920 ? 20 : viewportWidth >= 640 ? 14 : 12;
		const sidePadding = viewportWidth >= 920 ? 40 : 16;
		const maxCardWidth = viewportWidth >= 1200 ? 360 : viewportWidth >= 920 ? 330 : 420;
		const minCardWidth = viewportWidth >= 920 ? 210 : viewportWidth >= 640 ? 220 : 240;
		const widthFromSlots = (viewportWidth - sidePadding * 2 - gap * (slots - 1)) / slots;
		const cardWidth = clamp(widthFromSlots, minCardWidth, maxCardWidth);
		const offRight = viewportWidth + cardWidth + 90;
		const offLeft = -cardWidth - 120;
		const travel = count + 0.6;
		const timeline = clamp(progress * travel, 0, count);
		const state = Math.floor(timeline);
		const alpha = state >= count ? 0 : easeOutCubic(timeline - state);

		const getStatePositions = (arrivedCount) => {
			const positions = Array(count).fill(offRight);
			const firstVisible = Math.max(0, arrivedCount - slots);
			const visibleCount = Math.min(arrivedCount, slots);
			const rightAlignOffset = slots - visibleCount;

			for (let i = 0; i < arrivedCount; i += 1) {
				if (i < firstVisible) {
					positions[i] = offLeft;
					continue;
				}

				const slotIndex = i - firstVisible + rightAlignOffset;
				positions[i] = sidePadding + slotIndex * (cardWidth + gap);
			}

			return positions;
		};

		const from = getStatePositions(state);
		const to = getStatePositions(Math.min(state + 1, count));
		const positions = from.map((x, index) => x + (to[index] - x) * alpha);

		return {
			cardWidth,
			positions,
			stageHeight: viewportWidth >= 920 ? 'min(78vh, 34.375rem)' : 'min(76vh, 31rem)',
		};
	}, [cards.length, progress, viewportWidth]);

	const backgroundGlowStyle = useMemo(() => {
		const viewport = Math.max(viewportWidth, 1);
		const samples = cards.map((_, index) => {
			const left = layout.positions[index] ?? viewport + 100;
			const right = left + layout.cardWidth;
			const overlap = clamp((Math.min(right, viewport) - Math.max(left, 0)) / layout.cardWidth, 0, 1);
			const centerX = clamp(left + layout.cardWidth / 2, 0, viewport);
			return {
				strength: overlap,
				xPercent: (centerX / viewport) * 100,
			};
		});
		const energy = samples.reduce((sum, item) => sum + item.strength, 0);
		const softEnergy = clamp(energy / 2.4, 0, 1);
		const fallbackX = 66 - progress * 20;
		const getSample = (index) => samples[index] ?? { strength: 0, xPercent: fallbackX };
		const smooth = (value) => value ** 0.88;
		const perCardGlow = (sample) => (smooth(sample.strength) * (0.11 + softEnergy * 0.025)).toFixed(3);

		return {
			'--svc-grid-alpha': (0.014 + softEnergy * 0.006).toFixed(3),
			'--svc-wash-a': (0.012 + softEnergy * 0.02).toFixed(3),
			'--svc-g1-x': `${getSample(0).xPercent.toFixed(2)}%`,
			'--svc-g2-x': `${getSample(1).xPercent.toFixed(2)}%`,
			'--svc-g3-x': `${getSample(2).xPercent.toFixed(2)}%`,
			'--svc-g4-x': `${getSample(3).xPercent.toFixed(2)}%`,
			'--svc-g1-a': perCardGlow(getSample(0)),
			'--svc-g2-a': perCardGlow(getSample(1)),
			'--svc-g3-a': perCardGlow(getSample(2)),
			'--svc-g4-a': perCardGlow(getSample(3)),
		};
	}, [cards, layout.cardWidth, layout.positions, progress, viewportWidth]);

	return (
		<section ref={containerRef} className="services-scroll">
			<div className="services-sticky">
				<div className="services-bg" style={backgroundGlowStyle} aria-hidden="true" />
				<div className="services-stage" style={{ height: layout.stageHeight }}>
					{cards.map((card, index) => {
						const Icon = icons[index] ?? ZapIcon;
						const x = layout.positions[index] ?? viewportWidth + 200;

						return (
							<article
								className="service-slide"
								key={`${card.title}-${index}`}
								style={{
									width: `${layout.cardWidth}px`,
									transform: `translate3d(${x}px, -50%, 0)`,
									zIndex: index + 1,
								}}
							>
								<div className="service-slide-bg" />
								<div className="service-slide-corner service-slide-corner-right" />
								<div className="service-slide-corner service-slide-corner-left" />
								<div className="service-slide-outline" />
								<div className="service-slide-glow" />

								<div className="service-slide-head">
									<div className="service-slide-icon-wrap">
										<Icon />
									</div>
									<h3>{card.title}</h3>
									<p>{card.desc}</p>
								</div>

								<div className="service-slide-foot">
									<div className="service-slide-count-wrap">
										<div className="service-slide-line" />
										<div className="service-slide-count">0{index + 1}</div>
									</div>
									<div className="service-slide-arrow" aria-hidden="true">
										↗
									</div>
								</div>
							</article>
						);
					})}
				</div>
			</div>
		</section>
	);
}
