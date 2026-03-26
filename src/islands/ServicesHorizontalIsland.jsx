import { useEffect, useRef } from 'react';
import { subscribeViewportRaf } from './viewportRaf';

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function easeOutCubic(value) {
	return 1 - (1 - value) ** 3;
}

function easeInOutCubic(value) {
	if (value < 0.5) {
		return 4 * value * value * value;
	}

	return 1 - ((-2 * value + 2) ** 3) / 2;
}

const MOBILE_TIMELINE_DAMPING = 0.26;
const MOBILE_TIMELINE_TRAVEL_PADDING = 0.08;

function createSeededRng(seed) {
	let state = seed >>> 0;

	return function next() {
		state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
		return state / 4294967296;
	};
}

function formatFixed(value, digits = 3) {
	return value.toFixed(digits).replace(/\.?0+$/, '');
}

function createParticles(count) {
	const next = createSeededRng(0x2001e);

	return Array.from({ length: count }, (_, index) => ({
		id: index,
		x: `${formatFixed(next() * 100)}%`,
		y: `${formatFixed(next() * 100)}%`,
		size: `${formatFixed(1.6 + next() * 2.4)}px`,
		duration: `${formatFixed(10 + next() * 12)}s`,
		delay: `${formatFixed(-next() * 12)}s`,
		driftX: `${formatFixed(next() * 420 - 210)}px`,
		driftY: `${formatFixed(next() * 260 - 130)}px`,
		opacity: formatFixed(0.2 + next() * 0.36, 4),
	}));
}

const PARTICLES = createParticles(28);

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
	const mobileTimelineRef = useRef({
		value: 0,
		primed: false,
	});
	const geometryRef = useRef({
		start: 0,
		span: 1,
		frameWidth: 0,
		viewportWidth: 0,
		viewportHeight: 0,
		needsMeasure: true,
	});
	const layoutRef = useRef({
		cardWidth: 0,
		glowSize: 0,
		cardHeight: 0,
		cardCount: 0,
	});

	useEffect(() => {
			const resolveLiveNodes = () => {
				const currentContainer = containerRef.current;
				const candidates = document.querySelectorAll('.svcx-scroll');
				let newestContainer = null;
			for (let index = candidates.length - 1; index >= 0; index -= 1) {
				const node = candidates[index];
				if (node && document.contains(node)) {
					newestContainer = node;
					break;
				}
			}
			const hasLiveContainer = currentContainer && document.contains(currentContainer);
			const containerNode = newestContainer || (hasLiveContainer ? currentContainer : null);

			if (!containerNode) {
				return { containerNode: null, cardNodes: [], glowNodes: [] };
			}

				if (containerRef.current !== containerNode) {
					containerRef.current = containerNode;
					geometryRef.current.needsMeasure = true;
				}

			const cardNodes = Array.from(containerNode.querySelectorAll('.svcx-card'));
			const glowNodes = Array.from(containerNode.querySelectorAll('.svcx-glow-spot'));
			cardRefs.current = cardNodes;
			glowRefs.current = glowNodes;

				return { containerNode, cardNodes, glowNodes };
			};

			const readScrollY = () => window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;

			const measureGeometry = (containerNode, viewportWidth, viewportHeight) => {
				if (!containerNode) return;
				const scrollY = readScrollY();
				const rect = containerNode.getBoundingClientRect();
				const frameWidth = Math.max(1, containerNode.clientWidth || viewportWidth);
				const span = Math.max(containerNode.offsetHeight - viewportHeight, 1);

				geometryRef.current.start = rect.top + scrollY;
				geometryRef.current.span = span;
				geometryRef.current.frameWidth = frameWidth;
				geometryRef.current.viewportWidth = viewportWidth;
				geometryRef.current.viewportHeight = viewportHeight;
				geometryRef.current.needsMeasure = false;
			};

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
			const shouldCenterVisible =
				(arrivedCount === count && visibleCount > 0) || slots === 1;
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
				const { containerNode, cardNodes, glowNodes } = resolveLiveNodes();
				if (!containerNode) return;

				const viewportWidth = window.innerWidth || 1280;
				const viewportHeight = window.innerHeight || 0;
				const geometry = geometryRef.current;
				const viewportChanged =
					geometry.viewportWidth !== viewportWidth || geometry.viewportHeight !== viewportHeight;
				if (viewportChanged || geometry.needsMeasure) {
					measureGeometry(containerNode, viewportWidth, viewportHeight);
				}

				const frameWidth = Math.max(1, geometryRef.current.frameWidth || viewportWidth);
				const count = Math.max(cards.length, cardNodes.length, 1);
			const slots = frameWidth >= 1200 ? 4 : frameWidth >= 920 ? 3 : frameWidth >= 640 ? 2 : 1;
			const gap = frameWidth >= 1200 ? 24 : frameWidth >= 920 ? 20 : frameWidth >= 640 ? 14 : 12;
			const sidePadding = frameWidth > 980 ? 40 : frameWidth > 720 ? 32 : 20;
			const maxCardWidth = frameWidth >= 1200 ? 360 : frameWidth >= 920 ? 330 : 420;
			const minCardWidth = frameWidth >= 920 ? 210 : frameWidth >= 640 ? 220 : 240;
			const widthFromSlots = (frameWidth - sidePadding * 2 - gap * (slots - 1)) / slots;
			const cardWidth = clamp(widthFromSlots, minCardWidth, maxCardWidth);

				const scrollY = readScrollY();
				const sectionTop = geometryRef.current.start - scrollY;
				const span = geometryRef.current.span;
				const isTouchSingleColumn =
					slots === 1 && window.matchMedia('(pointer: coarse)').matches;
				const desktopProgress = clamp((scrollY - geometryRef.current.start) / span, 0, 1);
				const mobileEntryProgress = clamp(
					(viewportHeight - sectionTop) / Math.max(span + viewportHeight, 1),
					0,
					1,
				);
			const progress = isTouchSingleColumn ? mobileEntryProgress : desktopProgress;
			const revealVisibility = clamp((progress - 0.01) / 0.08, 0, 1);
			containerNode.style.setProperty('--svcx-reveal-visibility', `${revealVisibility}`);

			const offRight = frameWidth + cardWidth + 90;
			const offLeft = -cardWidth - 120;
			const travel = isTouchSingleColumn ? count + MOBILE_TIMELINE_TRAVEL_PADDING : count + 0.6;
			const rawTimeline = clamp(progress * travel, 0, count);
			let timeline = rawTimeline;

			if (isTouchSingleColumn) {
				const mobileTimeline = mobileTimelineRef.current;
				if (!mobileTimeline.primed) {
					mobileTimeline.value = rawTimeline;
					mobileTimeline.primed = true;
				} else {
					mobileTimeline.value += (rawTimeline - mobileTimeline.value) * MOBILE_TIMELINE_DAMPING;
				}

				timeline = clamp(mobileTimeline.value, 0, count);
			} else {
				const mobileTimeline = mobileTimelineRef.current;
				mobileTimeline.value = 0;
				mobileTimeline.primed = false;
			}

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
				viewportWidth: frameWidth,
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
				viewportWidth: frameWidth,
			});
			const positions = from.map((x, index) => x + (to[index] - x) * alpha);
			const glowSize = Math.round(cardWidth * 1.5);
			const layout = layoutRef.current;
			const cardWidthChanged = layout.cardWidth !== cardWidth;
			const glowSizeChanged = layout.glowSize !== glowSize;
			let tallestCardHeight = layout.cardHeight;

			if (cardWidthChanged) {
				layout.cardWidth = cardWidth;
			}

			if (glowSizeChanged) {
				layout.glowSize = glowSize;
			}

			const cardCount = Math.min(cardNodes.length, cards.length || cardNodes.length);
			const needsHeightRecalc =
				cardWidthChanged || layout.cardHeight <= 0 || layout.cardCount !== cardCount;

				if (needsHeightRecalc) {
					tallestCardHeight = 0;
					const widthValue = `${cardWidth}px`;

					// Batch writes first.
					for (let index = 0; index < cardCount; index += 1) {
						const cardNode = cardNodes[index];
						if (!cardNode) continue;

						if (cardNode.style.width !== widthValue) {
							cardNode.style.width = widthValue;
						}
						cardNode.style.height = '';
					}

					// Then batch reads to avoid write/read interleaving reflow inside the loop.
					for (let index = 0; index < cardCount; index += 1) {
						const cardNode = cardNodes[index];
						if (!cardNode) continue;
						const naturalHeight = Math.max(
							cardNode.getBoundingClientRect().height,
							cardNode.scrollHeight,
						);
						tallestCardHeight = Math.max(tallestCardHeight, naturalHeight);
				}

				layout.cardHeight = Math.ceil(tallestCardHeight);
				layout.cardCount = cardCount;
			}

			for (let index = 0; index < cardCount; index += 1) {
				const cardNode = cardNodes[index];
				const rawX = positions[index] ?? frameWidth + 200;
				const x = isTouchSingleColumn ? Math.round(rawX) : rawX;

				if (cardNode) {
					const widthValue = `${cardWidth}px`;
					if (cardNode.style.width !== widthValue) {
						cardNode.style.width = widthValue;
					}
					if (isTouchSingleColumn) {
						const enterProgress = clamp(timeline - index, 0, 1);
						cardNode.style.opacity = `${easeInOutCubic(enterProgress)}`;
					} else if (cardNode.style.opacity) {
						cardNode.style.opacity = '';
					}
					const heightValue = `${layout.cardHeight}px`;
					if (cardNode.style.height !== heightValue) {
						cardNode.style.height = heightValue;
					}
					cardNode.style.transform = `translate3d(${x}px, -50%, 0)`;
				}
			}

			const glowCount = Math.min(glowNodes.length, cardCount);

			for (let index = 0; index < glowCount; index += 1) {
				const glowNode = glowNodes[index];
				const rawX = positions[index] ?? frameWidth + 200;
				const x = isTouchSingleColumn ? Math.round(rawX) : rawX;

				if (glowNode) {
					const enter = clamp(timeline - index, 0, 1);
					const exit = clamp(timeline - (index + slots + 0.15), 0, 1);
					const visibility = clamp(easeOutCubic(enter) * (1 - easeOutCubic(exit)), 0, 1);
					const scale = 0.84 + visibility * 0.56;
					const glowCenterX = x + cardWidth * 0.5;
					glowNode.style.opacity = `${visibility}`;
					glowNode.style.transform = `translate3d(calc(${glowCenterX}px - 50%), -50%, 0) scale(${scale})`;
					if (glowSizeChanged) {
						glowNode.style.setProperty('--svcx-spot-size', `${glowSize}px`);
					}
				}
			}
		};

			let resyncFrame = 0;
			let settleFrame = 0;

			const cancelResyncFrames = () => {
				if (resyncFrame) {
					cancelAnimationFrame(resyncFrame);
					resyncFrame = 0;
				}
				if (settleFrame) {
					cancelAnimationFrame(settleFrame);
					settleFrame = 0;
				}
			};

			const resyncAfterTransition = () => {
				geometryRef.current.needsMeasure = true;
				cancelResyncFrames();
				resyncFrame = requestAnimationFrame(() => {
					resyncFrame = 0;
					renderFrame();
					settleFrame = requestAnimationFrame(() => {
						settleFrame = 0;
						renderFrame();
					});
				});
			};

		document.addEventListener('astro:after-swap', resyncAfterTransition);
		document.addEventListener('astro:page-load', resyncAfterTransition);
		window.addEventListener('pageshow', resyncAfterTransition);

		const unsubscribe = subscribeViewportRaf(renderFrame);

			return () => {
				document.removeEventListener('astro:after-swap', resyncAfterTransition);
				document.removeEventListener('astro:page-load', resyncAfterTransition);
				window.removeEventListener('pageshow', resyncAfterTransition);
				cancelResyncFrames();
				unsubscribe();
			};
	}, [cards.length]);

	return (
		<section ref={containerRef} className="svcx-scroll">
			<div className="svcx-sticky">
				<div className="svcx-dots" aria-hidden="true">
					{PARTICLES.map((particle) => (
						<span
							key={particle.id}
							className="svcx-dot"
							style={{
								'--svcx-dot-x': particle.x,
								'--svcx-dot-y': particle.y,
								'--svcx-dot-size': particle.size,
								'--svcx-dot-duration': particle.duration,
								'--svcx-dot-delay': particle.delay,
								'--svcx-dot-drift-x': particle.driftX,
								'--svcx-dot-drift-y': particle.driftY,
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
