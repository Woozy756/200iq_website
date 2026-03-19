import { useEffect, useMemo, useRef } from 'react';
import { subscribeViewportRaf } from './viewportRaf';

const defaultPositions = [
	{ x: '8%', y: '24%' },
	{ x: '92%', y: '24%' },
	{ x: '8%', y: '76%' },
	{ x: '92%', y: '76%' },
];

const tabletPositions = [
	{ x: '25%', y: '14%' },
	{ x: '75%', y: '14%' },
	{ x: '25%', y: '86%' },
	{ x: '75%', y: '86%' },
];

const mobilePositions = [
	{ x: '26%', y: '14%' },
	{ x: '74%', y: '14%' },
	{ x: '26%', y: '86%' },
	{ x: '74%', y: '86%' },
];

const brainPaths = [
	'M502.472,256.833c-6.491-61.075-40.69-110.46-86.082-144.101c-45.887-34.04-103.296-52.724-157.675-52.76 c-56.443,0.009-91.262,7.173-114.312,17.082c-22.776,9.644-33.774,22.98-39.813,30.843c-24.68,4.029-49.262,18.348-68.77,38.697 C15.107,168.343,0.054,197.423,0,229.381c0,34.97,8.112,64.52,24.299,86.498c14.354,19.596,35.288,32.472,60.207,37.148 c1.638,9.456,5.56,20.003,13.672,29.647c8.412,10.06,19.888,17.383,33.454,22.032c13.584,4.675,29.329,6.836,47.234,6.853h75.084 c1.85,4.729,4.108,9.236,7.217,13.213c7.642,9.785,18.649,16.656,31.834,20.96c13.248,4.33,28.859,6.288,46.995,6.296 c8.909,0,17.348-0.407,24.512-0.752h0.026c5.136-0.274,9.555-0.469,12.698-0.469c9.466,0,18.526-2.302,26.318-6.819 c7.793-4.498,14.257-11.166,18.676-19.357c2.232-4.154,3.702-8.51,4.8-12.902c16.727-3.126,30.604-9.236,41.407-17.028 c12.663-9.121,21.367-20.11,27.283-30.09c11.556-19.552,16.267-41.247,16.285-61.384 C511.982,286.064,508.511,270.08,502.472,256.833z M475.862,352.849c-4.649,7.837-11.352,16.241-20.916,23.121 c-9.581,6.872-22.041,12.38-39.06,14.319l-9.519,1.072l-0.7,9.555c-0.292,4.127-1.576,8.767-3.737,12.76 c-2.506,4.578-5.835,7.962-9.918,10.335c-4.1,2.356-9.006,3.71-14.78,3.718c-4.073,0-8.714,0.24-13.858,0.496l1.922-0.088 l-1.914,0.088c-7.145,0.355-15.178,0.736-23.386,0.736c-21.943,0.035-38.299-3.356-48.747-8.864 c-5.251-2.736-9.06-5.906-11.884-9.511c-2.807-3.622-4.711-7.74-5.782-12.884l-1.904-9.218h-92.812 c-16.01,0-29.302-1.992-39.725-5.578c-10.44-3.622-17.94-8.678-23.28-15.054c-6.96-8.306-9.024-17.32-9.289-25.237l-0.31-10.077 l-10.024-1.044C72.72,328.914,55.354,318.97,42.86,302.18c-12.424-16.815-19.791-41.3-19.791-72.798 c-0.054-24.422,11.874-48.474,29.443-66.875c17.463-18.454,40.46-30.674,59.419-32.463l4.348-0.452l2.966-3.206 c1.328-1.452,2.382-2.851,3.294-4.002c5.986-7.474,12.114-15.806,31.002-24.139c18.845-8.156,50.652-15.222,105.174-15.213 c49.076-0.036,102.278,17.232,143.932,48.217c41.726,31.046,71.78,75.153,77.094,129.578l0.203,2.098l0.922,1.887 c4.844,9.776,8.094,23.608,8.066,38.414C488.932,319.776,484.992,337.451,475.862,352.849z',
	'M357.042,146.417h24.059c5.172,0,9.378-4.242,9.378-9.573c0-5.215-4.206-9.43-9.378-9.43h-24.059 c-5.331,0-9.555,4.216-9.555,9.43C347.488,142.175,351.711,146.417,357.042,146.417z',
	'M244.21,237.307c0,5.287,4.25,9.564,9.501,9.564c5.162,0,9.475-4.276,9.475-9.564v-51.82 c0-2.399,0.709-2.958,0.886-3.179c3.02-2.966,14.274-2.966,22.164-2.966l0.301,0.106h62.226c1.204,0,2.48-0.106,3.906-0.106 c5.012-0.221,11.202-0.434,13.796,2.072c1.647,1.611,2.604,5.19,2.604,9.988v31.809v1.416c-0.204,6.544-0.24,17.56,7.128,25.042 c2.869,2.958,8.2,6.464,16.896,6.464h48.89c5.136,0,9.352-4.233,9.352-9.555c0-5.198-4.216-9.519-9.352-9.519h-48.89l-3.418-0.806 c-1.736-1.797-1.621-8.332-1.621-11.467v-33.385c0-10.307-2.886-18.277-8.394-23.599c-8.484-8.138-20.022-7.801-27.629-7.483 c-1.258,0-2.302,0.045-3.268,0.045h-31.364c0.372-2.622,0.372-5.26,0.274-7.633v-27.602c0-5.189-4.268-9.476-9.448-9.476 c-5.286,0-9.43,4.286-9.43,9.476v27.752c0,2.222,0,5.738-0.47,6.65c0,0-1.301,0.832-6.314,0.832c-1.442,0-2.992,0-4.684,0 c-12.92-0.16-27.778-0.204-36.615,8.474c-2.887,2.922-6.5,8.208-6.5,16.648V237.307z',
	'M213.677,159.709c5.304,0,9.555-4.348,9.555-9.528v-13.594h15.93c5.154,0,9.413-4.268,9.413-9.554 c0-5.162-4.259-9.493-9.413-9.493h-15.93v-10.467c0-5.233-4.251-9.528-9.555-9.528c-5.154,0-9.413,4.294-9.413,9.528v43.108 C204.264,155.361,208.523,159.709,213.677,159.709z',
	'M110.841,173.682h39.468c6.438-0.229,12.565-0.229,15.452,2.807c2.559,2.498,3.967,8.111,3.967,16.17v37.051 c0,5.242,4.233,9.546,9.581,9.546c5.154,0,9.458-4.303,9.458-9.546v-7.882h14.886c5.251,0,9.44-4.277,9.44-9.51 c0-5.251-4.188-9.599-9.44-9.599h-14.886v-10.06c0-13.672-3.135-23.351-9.626-29.736c-8.421-8.448-19.8-8.368-28.877-8.288h-39.423 c-5.384,0-9.511,4.312-9.511,9.475C101.33,169.387,105.457,173.682,110.841,173.682z',
	'M135.892,229.099c0-5.251-4.365-9.555-9.483-9.555H59.791c-5.26,0-9.555,4.304-9.555,9.555 c0,5.233,4.295,9.528,9.555,9.528h24.148v17.339c0,5.286,4.188,9.519,9.386,9.519c5.402,0,9.59-4.233,9.59-9.519v-17.339h23.494 C131.527,238.627,135.892,234.331,135.892,229.099z',
	'M194.576,291.412c1.665,0,3.242,0,4.649,0h76.704c17.498,0,30.772-4.64,39.6-13.884 c13.566-14.363,12.619-35.634,11.919-49.687c-0.124-2.683-0.248-5.206-0.248-7.323c0-5.296-4.25-9.51-9.608-9.51 c-5.18,0-9.368,4.215-9.368,9.51c0,2.408,0.124,5.171,0.248,8.111c0.584,12.256,1.24,27.337-6.854,35.873 c-4.941,5.26-13.682,7.89-25.689,7.89h-76.704c-1.337,0-2.7,0-4.348,0c-15.133-0.23-40.584-0.638-56.753,15.319 c-9.068,8.944-13.681,21.545-13.681,37.396c0,5.153,4.17,9.52,9.484,9.52c5.18,0,9.51-4.366,9.51-9.52 c0-10.768,2.594-18.579,8.049-23.918C161.935,290.934,181.612,291.235,194.576,291.412z',
	'M323.96,332.616c0-5.162-4.171-9.502-9.475-9.502H194.107c-5.19,0-9.538,4.34-9.538,9.502 c0,5.268,4.348,9.519,9.538,9.519h36.81v18.985c0,5.323,4.225,9.502,9.458,9.502c5.251,0,9.493-4.179,9.493-9.502v-18.985h64.617 C319.788,342.135,323.96,337.884,323.96,332.616z',
	'M377.887,370.065h-4.471v-17.693c0-5.384-4.18-9.528-9.475-9.528c-5.26,0-9.502,4.145-9.502,9.528v17.693 h-32.941c-5.242,0-9.502,4.241-9.502,9.528c0,5.224,4.26,9.448,9.502,9.448h56.39c5.208,0,9.484-4.224,9.484-9.448 C387.371,374.305,383.095,370.065,377.887,370.065z',
	'M421.579,323.114v-15.523h3.419c5.357,0,9.599-4.17,9.599-9.43c0-5.251-4.242-9.555-9.599-9.555h-66.459 c-5.225,0-9.511,4.304-9.511,9.555c0,5.26,4.286,9.43,9.511,9.43h43.983v15.523c0,5.358,4.313,9.502,9.556,9.502 C417.311,332.616,421.579,328.472,421.579,323.114z',
	'M451.333,347.909h-24.042c-5.304,0-9.546,4.18-9.546,9.467c0,5.286,4.241,9.43,9.546,9.43h24.042 c5.33,0,9.616-4.144,9.616-9.43C460.95,352.089,456.663,347.909,451.333,347.909z',
];

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

function seededNoise(seed) {
	const value = Math.sin(seed) * 10000;
	return value - Math.floor(value);
}

const PROCESS_SNAP_KEY = '__forceProcessSnap';

export default function MountainProcessIsland({ steps = [] }) {
	const containerRef = useRef(null);
	const dotsRef = useRef(null);
	const brainGlowRef = useRef(null);
	const brainGlowSvgRef = useRef(null);
	const needsNodeRebindRef = useRef(true);
	const prefersReducedMotionRef = useRef(false);
	const cardRefs = useRef([]);
	const targetProgressRef = useRef(0);
	const currentProgressRef = useRef(0);
	const rafIdRef = useRef(0);
	const boundsRef = useRef({ start: 0, span: 1 });
	const cardLayoutRef = useRef({ mode: '', entries: [] });
	const renderCacheRef = useRef({
		coreDashOffset: '',
		glowDashOffset: '',
		revealVisibility: '',
		cardState: [],
		lastRenderedProgress: -1,
	});

	const ranges = useMemo(() => {
		const defaults = [
			[0, 0.2],
			[0.25, 0.45],
			[0.5, 0.7],
			[0.75, 0.95],
		];
		return steps.map((_, index) => {
			if (defaults[index]) {
				return defaults[index];
			}
			const start = index / steps.length;
			const end = Math.min(1, start + 1 / steps.length);
			return [start, end];
		});
	}, [steps]);
	const particles = useMemo(() => {
		return Array.from({ length: 54 }, (_, index) => ({
			id: index,
			x: seededNoise(index * 1.17 + 1) * 100,
			y: seededNoise(index * 1.31 + 2) * 100,
			size: 1.6 + seededNoise(index * 1.57 + 3) * 3.2,
			duration: 9 + seededNoise(index * 1.79 + 4) * 18,
			delay: -seededNoise(index * 2.03 + 5) * 18,
			driftX: seededNoise(index * 2.29 + 6) * 720 - 360,
			driftY: seededNoise(index * 2.41 + 7) * 460 - 230,
			opacity: 0.26 + seededNoise(index * 2.67 + 8) * 0.62,
		}));
	}, []);

	useEffect(() => {
		cardLayoutRef.current = { mode: '', entries: [] };
		renderCacheRef.current = {
			coreDashOffset: '',
			glowDashOffset: '',
			revealVisibility: '',
			cardState: [],
			lastRenderedProgress: -1,
		};

		const getViewportMode = (viewportWidth) => {
			if (viewportWidth <= 720) return 'mobile';
			if (viewportWidth <= 980) return 'tablet';
			return 'desktop';
		};

		const getProgressGain = (viewportWidth) => {
			const mode = getViewportMode(viewportWidth);
			if (mode === 'desktop') return 1.1;
			if (mode === 'tablet') return 1.02;
			return 0.96;
		};

		const getScrollY = () => window.scrollY || document.documentElement.scrollTop || 0;
		let viewportWidth = 0;
		let viewportHeight = 0;

		const hasConnectedNode = (node) => Boolean(node && document.contains(node));

		const invalidateRenderCache = () => {
			renderCacheRef.current.coreDashOffset = '';
			renderCacheRef.current.glowDashOffset = '';
			renderCacheRef.current.revealVisibility = '';
			renderCacheRef.current.cardState = [];
			renderCacheRef.current.lastRenderedProgress = -1;
			cardLayoutRef.current = { mode: '', entries: [] };
		};

		const resolveLiveNodes = () => {
			const currentContainer = containerRef.current;
			const hasLiveContainer = hasConnectedNode(currentContainer);

			if (!needsNodeRebindRef.current && hasLiveContainer) {
				return true;
			}

			if (hasLiveContainer) {
				let shouldInvalidate = false;
				if (!hasConnectedNode(dotsRef.current)) {
					dotsRef.current = currentContainer.querySelector('.process-dots');
					shouldInvalidate = true;
				}
				if (!hasConnectedNode(brainGlowRef.current)) {
					brainGlowRef.current = currentContainer.querySelector('.process-brain-glow');
					shouldInvalidate = true;
				}
				if (!hasConnectedNode(brainGlowSvgRef.current)) {
					brainGlowSvgRef.current = currentContainer.querySelector('.process-brain-svg-glow');
					shouldInvalidate = true;
				}
				const hasValidCards =
					cardRefs.current.length === steps.length &&
					cardRefs.current.every((node) => hasConnectedNode(node));
				if (!hasValidCards) {
					cardRefs.current = Array.from(currentContainer.querySelectorAll('.process-step'));
					shouldInvalidate = true;
				}
				if (shouldInvalidate) {
					invalidateRenderCache();
				}
				needsNodeRebindRef.current = false;
				return true;
			}

			const candidates = document.querySelectorAll('.process-scroll');
			let liveContainer = null;
			for (let index = candidates.length - 1; index >= 0; index -= 1) {
				const node = candidates[index];
				if (hasConnectedNode(node)) {
					liveContainer = node;
					break;
				}
			}

			if (!liveContainer) {
				containerRef.current = null;
				dotsRef.current = null;
				brainGlowRef.current = null;
				brainGlowSvgRef.current = null;
				cardRefs.current = [];
				needsNodeRebindRef.current = true;
				return false;
			}

			const wasDifferentContainer = containerRef.current !== liveContainer;
			containerRef.current = liveContainer;
			dotsRef.current = liveContainer.querySelector('.process-dots');
			brainGlowRef.current = liveContainer.querySelector('.process-brain-glow');
			brainGlowSvgRef.current = liveContainer.querySelector('.process-brain-svg-glow');
			cardRefs.current = Array.from(liveContainer.querySelectorAll('.process-step'));
			if (wasDifferentContainer) {
				invalidateRenderCache();
			}
			needsNodeRebindRef.current = false;
			return true;
		};

		const startTick = () => {
			if (!rafIdRef.current) {
				rafIdRef.current = requestAnimationFrame(tick);
			}
		};

		const setPathDashoffset = (progress, viewportWidth) => {
			const isDesktop = viewportWidth > 980;
			const coreDashOffset = `${(1 - progress).toFixed(3)}`;
			const glowDashOffset = `${(1 - progress).toFixed(2)}`;

			if (renderCacheRef.current.coreDashOffset !== coreDashOffset) {
				renderCacheRef.current.coreDashOffset = coreDashOffset;
				if (brainGlowSvgRef.current) {
					brainGlowSvgRef.current.style.setProperty('--process-core-dashoffset', coreDashOffset);
				}
			}

			if (!isDesktop) {
				if (renderCacheRef.current.glowDashOffset !== '1') {
					renderCacheRef.current.glowDashOffset = '1';
					if (brainGlowSvgRef.current) {
						brainGlowSvgRef.current.style.setProperty('--process-glow-dashoffset', '1');
					}
				}
				return;
			}

			if (renderCacheRef.current.glowDashOffset !== glowDashOffset) {
				renderCacheRef.current.glowDashOffset = glowDashOffset;
				if (brainGlowSvgRef.current) {
					brainGlowSvgRef.current.style.setProperty('--process-glow-dashoffset', glowDashOffset);
				}
			}
		};

		const getCardLayout = (viewportWidth) => {
			const mode = getViewportMode(viewportWidth);
			const cached = cardLayoutRef.current;
			if (cached.mode === mode && cached.entries.length === steps.length) {
				return cached;
			}

			const source = mode === 'mobile' ? mobilePositions : mode === 'tablet' ? tabletPositions : defaultPositions;
			const entries = steps.map((_, index) => {
				const position = source[index % source.length];
				const sideDirection = Number.parseFloat(position.x) <= 50 ? -1 : 1;
				return {
					left: mode === 'desktop' ? `clamp(8rem, ${position.x}, calc(100% - 8rem))` : position.x,
					top: position.y,
					sideDirection,
				};
			});

			cardLayoutRef.current = { mode, entries };
			return cardLayoutRef.current;
		};

		const updateCards = (progress, viewportWidth) => {
			const { mode, entries } = getCardLayout(viewportWidth);
			const isMobile = mode === 'mobile';
			const isTablet = mode === 'tablet';
			const shiftBase = isMobile ? 12 : isTablet ? 14 : 20;

			for (let index = 0; index < steps.length; index += 1) {
				const cardNode = cardRefs.current[index];
				if (!cardNode) continue;
				const cardState = renderCacheRef.current.cardState[index] || {};

				const [start, end] = ranges[index];
				const isActive = progress >= start && (progress <= end || index === steps.length - 1);
				const fadeStart = Math.max(0, start - 0.06);
				const opacity = clamp((progress - fadeStart) / Math.max(start - fadeStart, 0.01), 0, 1);
				const opacityValue = opacity.toFixed(3);
				const position = entries[index];
				const leftPosition = position.left;
				const topPosition = position.top;
				const sideDirection = position.sideDirection;
				const xShift = sideDirection * (shiftBase - shiftBase * opacity);
				const yShiftFromTop = -(shiftBase - shiftBase * opacity);
				const cardTransform = isMobile || isTablet
					? `translate3d(-50%, calc(-50% + ${yShiftFromTop.toFixed(2)}px), 0)`
					: `translate3d(calc(-50% + ${xShift.toFixed(2)}px), -50%, 0)`;

				if (cardState.left !== leftPosition) {
					cardNode.style.left = leftPosition;
					cardState.left = leftPosition;
				}
				if (cardState.top !== topPosition) {
					cardNode.style.top = topPosition;
					cardState.top = topPosition;
				}
				if (cardState.opacity !== opacityValue) {
					cardNode.style.opacity = opacityValue;
					cardState.opacity = opacityValue;
				}
				if (cardState.transform !== cardTransform) {
					cardNode.style.transform = cardTransform;
					cardState.transform = cardTransform;
				}
				if (cardState.isActive !== isActive) {
					cardNode.classList.toggle('is-active', isActive);
					cardState.isActive = isActive;
				}

				renderCacheRef.current.cardState[index] = cardState;
			}
		};

		const renderProgress = (progress) => {
			if (!resolveLiveNodes()) {
				return;
			}

			const revealVisibility = clamp((progress - 0.01) / 0.06, 0, 1);
			const revealValue = revealVisibility.toFixed(3);
			const viewportWidth = window.innerWidth || 1280;

			if (renderCacheRef.current.revealVisibility !== revealValue) {
				renderCacheRef.current.revealVisibility = revealValue;
				if (dotsRef.current) {
					dotsRef.current.style.setProperty('--dot-visibility', revealValue);
				}
				if (brainGlowRef.current) {
					brainGlowRef.current.style.setProperty('--process-reveal-visibility', revealValue);
				}
			}

			setPathDashoffset(progress, viewportWidth);
			updateCards(progress, viewportWidth);
		};

		const measureBounds = () => {
			if (!resolveLiveNodes()) {
				return;
			}
			if (!containerRef.current) {
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const start = rect.top + getScrollY();
			const span = Math.max(containerRef.current.offsetHeight - window.innerHeight, 1);
			boundsRef.current = { start, span };
		};

		const shouldSnapToProgress = () => {
			if (typeof window === 'undefined' || !window[PROCESS_SNAP_KEY]) {
				return false;
			}

			delete window[PROCESS_SNAP_KEY];
			return true;
		};

		const readTarget = () => {
			const scrollY = getScrollY();
			const { start, span } = boundsRef.current;
			const viewportWidth = window.innerWidth || 1280;
			const progressGain = getProgressGain(viewportWidth);
			const raw = ((scrollY - start) / span) * progressGain;
			const nextTarget = clamp(raw, 0, 1);

			if (shouldSnapToProgress() || prefersReducedMotionRef.current) {
				targetProgressRef.current = nextTarget;
				currentProgressRef.current = nextTarget;
				renderCacheRef.current.lastRenderedProgress = nextTarget;
				renderProgress(nextTarget);
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = 0;
				return;
			}

			if (Math.abs(nextTarget - targetProgressRef.current) < 0.0005) {
				return;
			}
			targetProgressRef.current = nextTarget;
			startTick();
		};

		const tick = () => {
			rafIdRef.current = 0;
			if (prefersReducedMotionRef.current) {
				return;
			}
			if (!resolveLiveNodes()) {
				return;
			}

			const target = targetProgressRef.current;
			const current = currentProgressRef.current;
			const next = current + (target - current) * 0.2;
			const settled = Math.abs(target - next) < 0.0008;
			const progress = settled ? target : next;
			const delta = Math.abs(progress - renderCacheRef.current.lastRenderedProgress);

			if (!settled && delta < 0.0007) {
				currentProgressRef.current = progress;
				startTick();
				return;
			}

			currentProgressRef.current = progress;
			renderCacheRef.current.lastRenderedProgress = progress;
			renderProgress(progress);

			if (!settled) {
				startTick();
			}
		};

		const handleViewport = () => {
			if (!resolveLiveNodes()) {
				return;
			}

			const nextWidth = window.innerWidth || 0;
			const nextHeight = window.innerHeight || 0;
			const viewportChanged = nextWidth !== viewportWidth || nextHeight !== viewportHeight;
			if (viewportChanged) {
				viewportWidth = nextWidth;
				viewportHeight = nextHeight;
				cardLayoutRef.current = { mode: '', entries: [] };
				measureBounds();
			}

			if (!isNearViewport()) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = 0;
				return;
			}

			readTarget();
		};

		const isNearViewport = () => {
			if (!resolveLiveNodes()) {
				return false;
			}
			if (!containerRef.current) {
				return false;
			}
			const rect = containerRef.current.getBoundingClientRect();
			const viewportHeight = window.innerHeight || 0;
			return rect.bottom > -viewportHeight * 0.25 && rect.top < viewportHeight * 1.25;
		};

		const applyReducedMotion = (matches) => {
			prefersReducedMotionRef.current = matches;
			if (isNearViewport()) {
				readTarget();
			}
		};

		let removeReducedMotionListener = () => {};
		if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
			const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
			applyReducedMotion(reducedMotionQuery.matches);
			const onReducedMotionChange = (event) => {
				applyReducedMotion(event.matches);
			};

			if (typeof reducedMotionQuery.addEventListener === 'function') {
				reducedMotionQuery.addEventListener('change', onReducedMotionChange);
				removeReducedMotionListener = () => {
					reducedMotionQuery.removeEventListener('change', onReducedMotionChange);
				};
			} else if (typeof reducedMotionQuery.addListener === 'function') {
				reducedMotionQuery.addListener(onReducedMotionChange);
				removeReducedMotionListener = () => {
					reducedMotionQuery.removeListener(onReducedMotionChange);
				};
			}
		}

		const syncAfterTransition = () => {
			needsNodeRebindRef.current = true;
			resolveLiveNodes();
			measureBounds();
			if (!isNearViewport()) {
				cancelAnimationFrame(rafIdRef.current);
				rafIdRef.current = 0;
				return;
			}
			window[PROCESS_SNAP_KEY] = true;
			handleViewport();
		};

		const resyncAfterTransition = () => {
			syncAfterTransition();
			requestAnimationFrame(() => {
				syncAfterTransition();
				requestAnimationFrame(() => {
					syncAfterTransition();
				});
			});
		};
		measureBounds();
		handleViewport();

		const unsubscribe = subscribeViewportRaf(handleViewport);

		document.addEventListener('astro:after-swap', resyncAfterTransition);
		document.addEventListener('astro:page-load', resyncAfterTransition);
		window.addEventListener('pageshow', resyncAfterTransition);

		return () => {
			unsubscribe();
			document.removeEventListener('astro:after-swap', resyncAfterTransition);
			document.removeEventListener('astro:page-load', resyncAfterTransition);
			window.removeEventListener('pageshow', resyncAfterTransition);
			removeReducedMotionListener();
			cancelAnimationFrame(rafIdRef.current);
		};
	}, [ranges, steps.length]);

	return (
		<div ref={containerRef} className="process-scroll">
			<div className="process-stage">
				<div
					className="process-dots"
					aria-hidden="true"
					ref={dotsRef}
					style={{ '--dot-visibility': 0 }}
				>
					{particles.map((particle) => (
						<span
							key={particle.id}
							className="process-dot"
							style={{
								'--dot-x': `${particle.x}%`,
								'--dot-y': `${particle.y}%`,
								'--dot-size': `${particle.size}px`,
								'--dot-duration': `${particle.duration}s`,
								'--dot-delay': `${particle.delay}s`,
								'--dot-drift-x': `${particle.driftX}px`,
								'--dot-drift-y': `${particle.driftY}px`,
								'--dot-opacity': particle.opacity,
							}}
						/>
					))}
					<div className="process-grid-overlay" />
				</div>

				<div className="process-brain-base" aria-hidden="true">
					<svg className="process-brain-svg process-brain-svg-base" viewBox="0 0 512 512">
						{brainPaths.map((path, index) => (
							<path className="process-brain-path-base" d={path} key={`brain-base-${index}`} />
						))}
					</svg>
				</div>

				<div
					className="process-brain-glow"
					aria-hidden="true"
					ref={brainGlowRef}
					style={{
						'--process-reveal-visibility': 0,
					}}
				>
					<svg
						className="process-brain-svg process-brain-svg-glow"
						viewBox="-96 -96 704 704"
						ref={brainGlowSvgRef}
						style={{
							'--process-core-dashoffset': 1,
							'--process-glow-dashoffset': 1,
						}}
					>
						{brainPaths.map((path, index) => (
							<path
								className="process-brain-path-glow process-brain-path-glow-wide"
								d={path}
								key={`brain-wide-${index}`}
								pathLength="1"
								strokeDasharray="1"
								strokeDashoffset="1"
							/>
						))}
						{brainPaths.map((path, index) => (
							<path
								className="process-brain-path-glow process-brain-path-glow-mid"
								d={path}
								key={`brain-mid-${index}`}
								pathLength="1"
								strokeDasharray="1"
								strokeDashoffset="1"
							/>
						))}
						{brainPaths.map((path, index) => (
							<path
								className="process-brain-path-glow process-brain-path-glow-core"
								d={path}
								key={`brain-core-${index}`}
								pathLength="1"
								strokeDasharray="1"
								strokeDashoffset="1"
							/>
						))}
						{brainPaths.map((path, index) => (
							<path
								className="process-brain-path-progress"
								d={path}
								key={`brain-progress-${index}`}
								pathLength="1"
								strokeDasharray="1"
								strokeDashoffset="1"
							/>
						))}
					</svg>
				</div>

				<div className="process-cards">
					{steps.map((step, index) => {
						return (
							<article
								className="process-step"
								ref={(node) => {
									cardRefs.current[index] = node;
								}}
								style={{
									left: '50%',
									top: '50%',
									opacity: 0,
									transform: 'translate(-50%, -50%)',
								}}
								key={`${step.title}-${index}`}
							>
								<div className="process-step-head">
									<span className="process-step-index">{index + 1}</span>
									<h3 className="process-step-title">{step.title}</h3>
								</div>
								<p className="process-step-text">{step.desc}</p>
							</article>
						);
					})}
				</div>
			</div>
		</div>
	);
}
