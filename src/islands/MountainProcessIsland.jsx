import { useEffect, useMemo, useRef, useState } from 'react';

const defaultPositions = [
	{ x: '12%', y: '45%' },
	{ x: '38%', y: '35%' },
	{ x: '62%', y: '28%' },
	{ x: '88%', y: '18%' },
];

const tabletPositions = [
	{ x: '27%', y: '82%' },
	{ x: '73%', y: '63%' },
	{ x: '27%', y: '44%' },
	{ x: '73%', y: '26%' },
];

const mobilePositions = [
	{ x: '26%', y: '84%' },
	{ x: '26%', y: '47%' },
	{ x: '74%', y: '66%' },
	{ x: '74%', y: '29%' },
];

const desktopPath = 'M 0 480 L 200 420 L 400 460 L 600 350 L 800 400 L 1000 250';
const tabletPath = 'M 0 486 L 160 448 L 300 462 L 440 365 L 590 392 L 760 250 L 900 286 L 1000 150';
const mobilePath = 'M 0 492 L 130 458 L 250 472 L 380 378 L 520 404 L 680 278 L 830 304 L 1000 150';

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export default function MountainProcessIsland({ steps = [] }) {
	const containerRef = useRef(null);
	const [progress, setProgress] = useState(0);
	const [viewportWidth, setViewportWidth] = useState(1280);
	const isMobile = viewportWidth <= 720;
	const isTablet = viewportWidth > 720 && viewportWidth <= 980;
	const mountainPath = isMobile ? mobilePath : isTablet ? tabletPath : desktopPath;
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
		return Array.from({ length: 30 }, (_, index) => ({
			id: index,
			x: Math.random() * 100,
			y: Math.random() * 100,
			size: 1 + Math.random() * 2,
			duration: 10 + Math.random() * 20,
			delay: -Math.random() * 18,
			driftX: Math.random() * 900 - 450,
			driftY: Math.random() * 520 - 260,
			opacity: 0.12 + Math.random() * 0.4,
		}));
	}, []);

	const cardPositions = useMemo(() => {
		const source = isMobile ? mobilePositions : isTablet ? tabletPositions : defaultPositions;
		return steps.map((_, index) => source[index] ?? source[source.length - 1]);
	}, [isMobile, isTablet, steps]);

	useEffect(() => {
		const updateViewport = () => setViewportWidth(window.innerWidth || 1280);
		updateViewport();
		window.addEventListener('resize', updateViewport);
		return () => {
			window.removeEventListener('resize', updateViewport);
		};
	}, []);

	useEffect(() => {
		const update = () => {
			if (!containerRef.current) {
				return;
			}

			const rect = containerRef.current.getBoundingClientRect();
			const span = Math.max(rect.height - window.innerHeight, 1);
			const raw = -rect.top / span;
			setProgress(clamp(raw, 0, 1));
		};

		update();
		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', update);
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, []);

	return (
		<div ref={containerRef} className="process-scroll">
			<div className="process-stage">
				<div className="process-dots" aria-hidden="true">
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

				<div className="process-mountain-base" aria-hidden="true">
					<svg className="process-svg" viewBox="0 0 1000 500">
						<path className="process-path-base" d={mountainPath} />
					</svg>
				</div>

				<div className="process-mountain-glow" aria-hidden="true">
					<svg className="process-svg" viewBox="0 0 1000 500">
						<path
							className="process-path-glow process-path-glow-wide"
							d={mountainPath}
							pathLength="1"
							strokeDasharray="1"
							strokeDashoffset={1 - progress}
						/>
						<path
							className="process-path-glow process-path-glow-mid"
							d={mountainPath}
							pathLength="1"
							strokeDasharray="1"
							strokeDashoffset={1 - progress}
						/>
						<path
							className="process-path-glow process-path-glow-core"
							d={mountainPath}
							pathLength="1"
							strokeDasharray="1"
							strokeDashoffset={1 - progress}
						/>
						<path
							className="process-path-progress"
							d={mountainPath}
							pathLength="1"
							strokeDasharray="1"
							strokeDashoffset={1 - progress}
						/>
					</svg>
				</div>

				<div className="process-cards">
					{steps.map((step, index) => {
						const [start, end] = ranges[index];
						const isActive = progress >= start && (progress <= end || index === steps.length - 1);
						const fadeStart = Math.max(0, start - 0.06);
						const opacity = clamp((progress - fadeStart) / Math.max(start - fadeStart, 0.01), 0, 1);
						const shiftBase = isMobile ? 12 : isTablet ? 14 : 20;
						const yShift = shiftBase - shiftBase * opacity;
						const position = cardPositions[index];

						return (
							<article
								className={`process-step ${isActive ? 'is-active' : ''}`}
								style={{
									left: position.x,
									top: position.y,
									opacity,
									transform: `translate(-50%, calc(-50% + ${yShift}px))`,
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
