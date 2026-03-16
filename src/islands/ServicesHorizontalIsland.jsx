import { useEffect, useMemo, useRef } from 'react';

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
	return 1 - (1 - value) ** 3;
}

function seededNoise(seed) {
	const value = Math.sin(seed) * 10000;
	return value - Math.floor(value);
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
	const cardRefs = useRef([]);
	const glowRefs = useRef([]);
	const rafIdRef = useRef(0);
	const particles = useMemo(() => {
		return Array.from({ length: 42 }, (_, index) => ({
			id: index,
			x: seededNoise(index * 1.11 + 1) * 100,
			y: seededNoise(index * 1.31 + 2) * 100,
			size: 1.5 + seededNoise(index * 1.71 + 3) * 2.8,
			duration: 9 + seededNoise(index * 2.03 + 4) * 16,
			delay: -seededNoise(index * 2.27 + 5) * 14,
			driftX: seededNoise(index * 2.59 + 6) * 620 - 310,
			driftY: seededNoise(index * 2.83 + 7) * 380 - 190,
			opacity: 0.2 + seededNoise(index * 3.01 + 8) * 0.5,
		}));
	}, []);

	useEffect(() => {
		const getStatePositions = ({
			arrivedCount,
			count,
			slots,
			offLeft,
			offRight,
			sidePadding,
			cardWidth,
			gap,
			viewportWidth,
		}) => {
			const positions = Array(count).fill(offRight);
			const firstVisible = Math.max(0, arrivedCount - slots);
			const visibleCount = Math.min(arrivedCount, slots);
			const rightAlignOffset = slots - visibleCount;
			const shouldCenterVisible = arrivedCount === count && visibleCount > 0;
			const visibleTrackWidth = visibleCount * cardWidth + Math.max(0, visibleCount - 1) * gap;
			const centeredStart = Math.max((viewportWidth - visibleTrackWidth) * 0.5, 0);
			const rightAlignedStart = sidePadding + rightAlignOffset * (cardWidth + gap);
			const layoutStart = shouldCenterVisible ? centeredStart : rightAlignedStart;

			for (let index = 0; index < arrivedCount; index += 1) {
				if (index < firstVisible) {
					positions[index] = offLeft;
					continue;
				}

				const visibleSlotIndex = index - firstVisible;
				positions[index] = layoutStart + visibleSlotIndex * (cardWidth + gap);
			}

			return positions;
		};

		const renderFrame = () => {
			if (!containerRef.current) return;

			const viewportWidth = window.innerWidth || 1280;
			const count = Math.max(cards.length, 1);
			const slots = viewportWidth >= 1200 ? 4 : viewportWidth >= 920 ? 3 : viewportWidth >= 640 ? 2 : 1;
			const gap = viewportWidth >= 1200 ? 24 : viewportWidth >= 920 ? 20 : viewportWidth >= 640 ? 14 : 12;
			const sidePadding = viewportWidth > 980 ? 40 : viewportWidth > 720 ? 32 : 20;
			const maxCardWidth = viewportWidth >= 1200 ? 360 : viewportWidth >= 920 ? 330 : 420;
			const minCardWidth = viewportWidth >= 920 ? 210 : viewportWidth >= 640 ? 220 : 240;
			const widthFromSlots = (viewportWidth - sidePadding * 2 - gap * (slots - 1)) / slots;
			const cardWidth = clamp(widthFromSlots, minCardWidth, maxCardWidth);

			const rect = containerRef.current.getBoundingClientRect();
			const span = Math.max(rect.height - window.innerHeight, 1);
			const progress = clamp(-rect.top / span, 0, 1);
			const revealVisibility = clamp((progress - 0.01) / 0.08, 0, 1);
			containerRef.current.style.setProperty('--svcx-reveal-visibility', `${revealVisibility}`);

			const offRight = viewportWidth + cardWidth + 90;
			const offLeft = -cardWidth - 120;
			const travel = count + 0.6;
			const timeline = clamp(progress * travel, 0, count);
			const state = Math.floor(timeline);
			const alpha = state >= count ? 0 : easeOutCubic(timeline - state);
			const from = getStatePositions({
				arrivedCount: state,
				count,
				slots,
				offLeft,
				offRight,
				sidePadding,
				cardWidth,
				gap,
				viewportWidth,
			});
			const to = getStatePositions({
				arrivedCount: Math.min(state + 1, count),
				count,
				slots,
				offLeft,
				offRight,
				sidePadding,
				cardWidth,
				gap,
				viewportWidth,
			});
			const positions = from.map((x, index) => x + (to[index] - x) * alpha);
			const glowSize = Math.round(cardWidth * 1.5);

			for (let index = 0; index < cards.length; index += 1) {
				const cardNode = cardRefs.current[index];
				const glowNode = glowRefs.current[index];
				const x = positions[index] ?? viewportWidth + 200;

				if (cardNode) {
					cardNode.style.width = `${cardWidth}px`;
					cardNode.style.transform = `translate3d(${x}px, -50%, 0)`;
					cardNode.style.zIndex = `${index + 1}`;
				}

				if (glowNode) {
					const enter = clamp(timeline - index, 0, 1);
					const exit = clamp(timeline - (index + slots + 0.15), 0, 1);
					const visibility = clamp(easeOutCubic(enter) * (1 - easeOutCubic(exit)), 0, 1);
					glowNode.style.left = `${x + cardWidth * 0.5}px`;
					glowNode.style.opacity = `${visibility}`;
					glowNode.style.setProperty('--svcx-spot-scale', `${0.84 + visibility * 0.56}`);
					glowNode.style.setProperty('--svcx-spot-size', `${glowSize}px`);
				}
			}
		};

		const queueFrame = () => {
			cancelAnimationFrame(rafIdRef.current);
			rafIdRef.current = requestAnimationFrame(renderFrame);
		};

		queueFrame();
		window.addEventListener('scroll', queueFrame, { passive: true });
		window.addEventListener('resize', queueFrame);

		return () => {
			window.removeEventListener('scroll', queueFrame);
			window.removeEventListener('resize', queueFrame);
			cancelAnimationFrame(rafIdRef.current);
		};
	}, [cards.length]);

	return (
		<section ref={containerRef} className="svcx-scroll">
			<div className="svcx-sticky">
				<div className="svcx-dots" aria-hidden="true">
					{particles.map((particle) => (
						<span
							key={particle.id}
							className="svcx-dot"
							style={{
								'--svcx-dot-x': `${particle.x}%`,
								'--svcx-dot-y': `${particle.y}%`,
								'--svcx-dot-size': `${particle.size}px`,
								'--svcx-dot-duration': `${particle.duration}s`,
								'--svcx-dot-delay': `${particle.delay}s`,
								'--svcx-dot-drift-x': `${particle.driftX}px`,
								'--svcx-dot-drift-y': `${particle.driftY}px`,
								'--svcx-dot-opacity': particle.opacity,
							}}
						/>
					))}
					<div className="svcx-grid-overlay" />
				</div>

				<div className="svcx-dynamic-glow" aria-hidden="true">
					{cards.map((_, index) => (
						<span
							className="svcx-glow-spot"
							key={`svcx-glow-${index}`}
							ref={(node) => {
								glowRefs.current[index] = node;
							}}
						/>
					))}
				</div>

				<div className="svcx-track">
					{cards.map((card, index) => {
						const Icon = icons[index] ?? ZapIcon;
						return (
							<article
								className="svcx-card"
								key={`${card.title}-${index}`}
								ref={(node) => {
									cardRefs.current[index] = node;
								}}
								style={{
									transform: 'translate3d(140vw, -50%, 0)',
									zIndex: index + 1,
								}}
							>
								<div className="svcx-card-bg" />
								<div className="svcx-card-outline" />
								<div className="svcx-card-head">
									<div className="svcx-card-icon-wrap">
										<Icon />
									</div>
									<h3>{card.title}</h3>
									<p>{card.desc}</p>
								</div>
								<div className="svcx-card-foot">
									<div className="svcx-card-count-wrap">
										<div className="svcx-card-line" />
										<div className="svcx-card-count">0{index + 1}</div>
									</div>
									<div className="svcx-card-arrow" aria-hidden="true">
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
