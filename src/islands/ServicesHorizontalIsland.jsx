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

function createSteppedTimeline(timeline, count, holdRatio = 0.72) {
	const bounded = clamp(timeline, 0, count);
	const state = Math.floor(bounded);

	if (state >= count) {
		return count;
	}

	const phase = bounded - state;

	if (phase <= holdRatio) {
		return state;
	}

	const transition = clamp((phase - holdRatio) / (1 - holdRatio), 0, 1);
	return state + easeInOutCubic(transition);
}

const MOBILE_SINGLE_COLUMN_START = 0;
const MOBILE_SINGLE_COLUMN_END_HOLD = 0.16;
const MOBILE_SINGLE_COLUMN_HOLD_RATIO = 0.34;
const MOBILE_SINGLE_COLUMN_FIRST_CARD_BOOST = 0.5;
const MOBILE_SINGLE_COLUMN_PROGRESS_CURVE = 1.35;

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
	const layoutRef = useRef({
		cardWidth: 0,
		glowSize: 0,
		cardHeight: 0,
	});
	const runtimeRef = useRef({
		containerNode: null,
		cardNodes: [],
		glowNodes: [],
		needsMeasure: true,
	});

	useEffect(() => {
		const refreshLiveNodes = () => {
			const runtime = runtimeRef.current;
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
				runtime.containerNode = null;
				runtime.cardNodes = [];
				runtime.glowNodes = [];
				runtime.needsMeasure = true;
				cardRefs.current = [];
				glowRefs.current = [];
				return;
			}

			if (containerRef.current !== containerNode) {
				containerRef.current = containerNode;
			}

			const cardNodes = Array.from(containerNode.querySelectorAll('.svcx-card'));
			const glowNodes = Array.from(containerNode.querySelectorAll('.svcx-glow-spot'));
			runtime.containerNode = containerNode;
			runtime.cardNodes = cardNodes;
			runtime.glowNodes = glowNodes;
			runtime.needsMeasure = true;
			cardRefs.current = cardNodes;
			glowRefs.current = glowNodes;
		};

		const getLiveNodes = () => {
			const runtime = runtimeRef.current;
			if (!runtime.containerNode || !document.contains(runtime.containerNode)) {
				refreshLiveNodes();
			}
			return runtimeRef.current;
		};

		const measureCards = (cardNodes, cardWidth) => {
			const runtime = runtimeRef.current;
			const layout = layoutRef.current;
			const widthValue = `${cardWidth}px`;

			for (let index = 0; index < cardNodes.length; index += 1) {
				const cardNode = cardNodes[index];
				if (!cardNode) continue;

				if (cardNode.style.width !== widthValue) {
					cardNode.style.width = widthValue;
				}
				cardNode.style.height = '';
			}

			let tallestCardHeight = 0;
			for (let index = 0; index < cardNodes.length; index += 1) {
				const cardNode = cardNodes[index];
				if (!cardNode) continue;

				const naturalHeight = Math.max(
					cardNode.getBoundingClientRect().height,
					cardNode.scrollHeight,
				);
				tallestCardHeight = Math.max(tallestCardHeight, naturalHeight);
			}

			const nextCardHeight = Math.ceil(tallestCardHeight);
			if (layout.cardHeight !== nextCardHeight) {
				layout.cardHeight = nextCardHeight;
			}

			runtime.needsMeasure = false;
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
			const { containerNode, cardNodes, glowNodes } = getLiveNodes();
			if (!containerNode) return;

			const viewportWidth = window.innerWidth || 1280;
			const count = Math.max(cards.length, cardNodes.length, 1);
			const slots = viewportWidth >= 1200 ? 4 : viewportWidth >= 920 ? 3 : viewportWidth >= 640 ? 2 : 1;
			const gap = viewportWidth >= 1200 ? 24 : viewportWidth >= 920 ? 20 : viewportWidth >= 640 ? 14 : 12;
			const sidePadding = viewportWidth > 980 ? 40 : viewportWidth > 720 ? 32 : 20;
			const maxCardWidth = viewportWidth >= 1200 ? 360 : viewportWidth >= 920 ? 330 : 420;
			const minCardWidth = viewportWidth >= 920 ? 210 : viewportWidth >= 640 ? 220 : 240;
			const widthFromSlots = (viewportWidth - sidePadding * 2 - gap * (slots - 1)) / slots;
			const cardWidth = clamp(widthFromSlots, minCardWidth, maxCardWidth);

			const rect = containerNode.getBoundingClientRect();
			const span = Math.max(rect.height - window.innerHeight, 1);
			const entryOffset = window.innerHeight;
			const progress = clamp(
				(entryOffset - rect.top) / Math.max(span + entryOffset, 1),
				0,
				1,
			);
			const revealVisibility = clamp((progress - 0.01) / 0.08, 0, 1);
			containerNode.style.setProperty('--svcx-reveal-visibility', `${revealVisibility}`);

			const offRight = viewportWidth + cardWidth + 90;
			const offLeft = -cardWidth - 120;
			const isTouchSingleColumn =
				slots === 1 && window.matchMedia('(pointer: coarse)').matches;
			let timeline = clamp(progress * (count + 0.6), 0, count);

			if (isTouchSingleColumn) {
				const mobileProgressRange = Math.max(
					0.001,
					1 - MOBILE_SINGLE_COLUMN_START - MOBILE_SINGLE_COLUMN_END_HOLD,
				);
				const normalizedMobileProgress = clamp(
					(progress - MOBILE_SINGLE_COLUMN_START) / mobileProgressRange,
					0,
					1,
				);
				const curvedMobileProgress =
					normalizedMobileProgress ** MOBILE_SINGLE_COLUMN_PROGRESS_CURVE;
				const mobileTimeline = curvedMobileProgress * count;
				timeline = createSteppedTimeline(
					mobileTimeline,
					count,
					MOBILE_SINGLE_COLUMN_HOLD_RATIO,
				);
			}

			const renderTimeline = isTouchSingleColumn
				? Math.min(
					count,
					timeline
						+ MOBILE_SINGLE_COLUMN_FIRST_CARD_BOOST
							* (1 - clamp(timeline, 0, 1)),
				)
				: timeline;

			const state = Math.floor(renderTimeline);
			const alpha = state >= count
				? 0
				: isTouchSingleColumn
					? clamp(renderTimeline - state, 0, 1)
					: easeOutCubic(renderTimeline - state);
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
			const runtime = runtimeRef.current;
			const layout = layoutRef.current;
			const cardWidthChanged = layout.cardWidth !== cardWidth;
			const glowSizeChanged = layout.glowSize !== glowSize;

			if (cardWidthChanged) {
				layout.cardWidth = cardWidth;
				runtime.needsMeasure = true;
			}

			if (glowSizeChanged) {
				layout.glowSize = glowSize;
			}

			const cardCount = Math.min(cardNodes.length, cards.length || cardNodes.length);
			const activeCardNodes = cardNodes.slice(0, cardCount);
			if (runtime.needsMeasure || layout.cardHeight <= 0) {
				measureCards(activeCardNodes, cardWidth);
			}

			for (let index = 0; index < cardCount; index += 1) {
				const cardNode = cardNodes[index];
				const x = positions[index] ?? viewportWidth + 200;

				if (cardNode) {
					if (isTouchSingleColumn) {
						const enterProgress = clamp((renderTimeline - index) / 0.86, 0, 1);
						cardNode.style.opacity = `${easeInOutCubic(enterProgress)}`;
					} else if (cardNode.style.opacity) {
						cardNode.style.opacity = '';
					}
					cardNode.style.height = `${layout.cardHeight}px`;
					cardNode.style.transform = `translate3d(${x}px, -50%, 0)`;
				}
			}

			const glowCount = Math.min(glowNodes.length, cardCount);

			for (let index = 0; index < glowCount; index += 1) {
				const glowNode = glowNodes[index];
				const x = positions[index] ?? viewportWidth + 200;

				if (glowNode) {
					const enter = clamp(renderTimeline - index, 0, 1);
					const exit = clamp(renderTimeline - (index + slots + 0.15), 0, 1);
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

		const resyncAfterTransition = () => {
			refreshLiveNodes();
			renderFrame();
			requestAnimationFrame(() => {
				renderFrame();
				requestAnimationFrame(() => {
					renderFrame();
				});
			});
		};

		const handleResize = () => {
			refreshLiveNodes();
		};

		refreshLiveNodes();

		document.addEventListener('astro:after-swap', resyncAfterTransition);
		document.addEventListener('astro:page-load', resyncAfterTransition);
		window.addEventListener('pageshow', resyncAfterTransition);
		window.addEventListener('resize', handleResize);
		window.addEventListener('orientationchange', handleResize);

		const unsubscribe = subscribeViewportRaf(renderFrame);

		return () => {
			document.removeEventListener('astro:after-swap', resyncAfterTransition);
			document.removeEventListener('astro:page-load', resyncAfterTransition);
			window.removeEventListener('pageshow', resyncAfterTransition);
			window.removeEventListener('resize', handleResize);
			window.removeEventListener('orientationchange', handleResize);
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
