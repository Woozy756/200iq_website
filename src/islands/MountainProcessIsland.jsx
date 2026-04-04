import { useRef, useEffect } from 'react';

const DOT_POS = [
	{ cx: 0,   cy: 30  },
	{ cx: 258, cy: 117 },
	{ cx: 512, cy: 155 },
	{ cx: 770, cy: 137 },
];

const CURVE = 'M 0 30 C 100 30 233 130 333 130 C 433 130 567 182 667 164 C 767 146 900 85 1000 85';
const SVG_H = 200;
const DOT_FRACTIONS = DOT_POS.map(d => d.cx / 1000);

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }
function easeOut(t) { return 1 - (1 - t) ** 3; }

function runPulse(dot, content, isSvgDot, cx, cy) {
	let cancelled = false;
	const DURATION = 750;
	const start = performance.now();

	function frame(now) {
		if (cancelled) return;
		const t = Math.min((now - start) / DURATION, 1);

		let dotScale, glowPx, contentScale;
		if (t < 0.35) {
			const s = easeOut(t / 0.35);
			dotScale     = 1 + s * 1.8;
			glowPx       = s * 28;
			contentScale = 1 + s * 0.12;
		} else {
			const s = easeOut((t - 0.35) / 0.65);
			dotScale     = 2.8 - s * 1.8;
			glowPx       = (1 - s) * 28;
			contentScale = 1.12 - s * 0.12;
		}

		if (dot) {
			if (isSvgDot) {
				dot.style.transform       = `scale(${dotScale})`;
				dot.style.transformOrigin = `${cx}px ${cy}px`;
			} else {
				dot.style.transform = `scale(${dotScale})`;
			}
			dot.style.filter = glowPx > 0.5
				? `drop-shadow(0 0 ${glowPx.toFixed(1)}px #f4b44d)`
				: '';
		}
		if (content) {
			content.style.transform       = `scale(${contentScale})`;
			content.style.transformOrigin = 'left top';
		}

		if (t < 1) {
			requestAnimationFrame(frame);
		} else {
			if (dot)     { dot.style.transform = isSvgDot ? 'scale(1)' : 'scale(1)'; dot.style.filter = ''; }
			if (content) { content.style.transform = 'scale(1)'; }
		}
	}

	requestAnimationFrame(frame);
	return () => { cancelled = true; };
}

export default function MountainProcessIsland({ steps = [] }) {
	// ── Desktop refs ──────────────────────────────────────────────
	const vizRef      = useRef(null);
	const pathRef     = useRef(null);
	const circleRefs  = useRef([]);
	const lineRefs    = useRef([]);
	const stepRefs    = useRef([]);
	const dPulse      = useRef(DOT_POS.map(() => null));

	// ── Mobile refs ───────────────────────────────────────────────
	const mobRef         = useRef(null);
	const mobRailFillRef = useRef(null);
	const mobDotRefs     = useRef([]);
	const mobContentRefs = useRef([]);
	const mPulse         = useRef(steps.map(() => null));
	const mobDotFracs    = useRef(null); // cached dot fractions (0‑1 along rail)

	useEffect(() => {
		const path = pathRef.current;
		const viz  = vizRef.current;
		const mob  = mobRef.current;

		// Desktop: measure path length
		let pathLen = 0;
		if (path) {
			pathLen = path.getTotalLength();
			path.style.strokeDasharray  = pathLen;
			path.style.strokeDashoffset = pathLen;
		}

		function isMobile() {
			return window.innerWidth < 768;
		}

		// ── Desktop update ─────────────────────────────────────────
		function updateDesktop(p) {
			if (!path) return;
			path.style.strokeDashoffset = pathLen * (1 - p);

			DOT_FRACTIONS.forEach((frac, i) => {
				const triggerAt = frac + 0.03;
				const raw = clamp((p - triggerAt) / 0.09, 0, 1);
				const dp  = easeOut(raw);

				const circle = circleRefs.current[i];
				const line   = lineRefs.current[i];
				const step   = stepRefs.current[i];
				const pulsing = typeof dPulse.current[i] === 'function';

				if (!pulsing) {
					if (circle) {
						circle.style.opacity         = dp;
						circle.style.transform       = `scale(${0.2 + dp * 0.8})`;
						circle.style.transformOrigin = `${DOT_POS[i].cx}px ${DOT_POS[i].cy}px`;
						circle.style.filter          = '';
					}
					if (line) line.style.opacity = dp;
					if (step) {
						step.style.opacity   = dp;
						step.style.transform = `translateY(${(1 - dp) * 16}px)`;
					}
				} else {
					if (circle) circle.style.opacity = dp;
					if (line)   line.style.opacity   = dp;
					if (step)   step.style.opacity   = dp;
				}

				if (dp >= 0.98 && dPulse.current[i] === null) {
					if (circle) { circle.style.opacity = '1'; circle.style.transform = 'scale(1)'; }
					if (line)   { line.style.opacity   = '1'; }
					if (step)   { step.style.opacity   = '1'; step.style.transform = 'translateY(0)'; }
					const cancel = runPulse(circle, step, true, DOT_POS[i].cx, DOT_POS[i].cy);
					dPulse.current[i] = cancel;
					setTimeout(() => { if (dPulse.current[i] === cancel) dPulse.current[i] = true; }, 800);
				}

				if (dp < 0.1 && dPulse.current[i] !== null) {
					if (typeof dPulse.current[i] === 'function') dPulse.current[i]();
					dPulse.current[i] = null;
					if (circle) { circle.style.transform = `scale(${0.2 + dp * 0.8})`; circle.style.filter = ''; }
					if (step)   { step.style.transform = `translateY(${(1 - dp) * 16}px)`; }
				}
			});
		}

		// Cache dot fractions once (avoids getBoundingClientRect on every scroll tick)
		function cacheMobDotFracs() {
			const railFill = mobRailFillRef.current;
			if (!railFill) return;
			const rail = railFill.parentElement;
			if (!rail) return;
			const railRect = rail.getBoundingClientRect();
			const railH = railRect.height;
			mobDotFracs.current = mobDotRefs.current.map(dot => {
				if (!dot) return 0;
				const dotRect = dot.getBoundingClientRect();
				return railH > 0 ? clamp((dotRect.top - railRect.top) / railH, 0, 1) : 0;
			});
		}

		// ── Mobile update ──────────────────────────────────────────
		function updateMobile(p) {
			const railFill = mobRailFillRef.current;
			if (!railFill) return;

			// Use scaleY instead of height — compositor-only, no layout reflow
			railFill.style.transform = `scaleY(${p})`;

			// Use cached fractions; recache if not yet set
			if (!mobDotFracs.current) cacheMobDotFracs();
			const fracs = mobDotFracs.current || [];

			mobDotRefs.current.forEach((dot, i) => {
				const content = mobContentRefs.current[i];
				if (!dot) return;

				const dotFrac = fracs[i] ?? i / Math.max(steps.length - 1, 1);

				const raw = clamp((p - dotFrac - 0.04) / 0.08, 0, 1);
				const dp  = easeOut(raw);
				const pulsing = typeof mPulse.current[i] === 'function';

				if (!pulsing) {
					if (dot) {
						dot.style.opacity   = dp;
						dot.style.transform = `scale(${0.2 + dp * 0.8})`;
						dot.style.filter    = '';
					}
					if (content) {
						content.style.opacity   = dp;
						content.style.transform = `translateY(${(1 - dp) * 12}px)`;
					}
				} else {
					if (dot)     dot.style.opacity   = dp;
					if (content) content.style.opacity = dp;
				}

				if (dp >= 0.98 && mPulse.current[i] === null) {
					if (dot)     { dot.style.opacity = '1'; dot.style.transform = 'scale(1)'; }
					if (content) { content.style.opacity = '1'; content.style.transform = 'translateY(0)'; }
					const cancel = runPulse(dot, content, false, 0, 0);
					mPulse.current[i] = cancel;
					setTimeout(() => { if (mPulse.current[i] === cancel) mPulse.current[i] = true; }, 800);
				}

				if (dp < 0.1 && mPulse.current[i] !== null) {
					if (typeof mPulse.current[i] === 'function') mPulse.current[i]();
					mPulse.current[i] = null;
					if (dot)     { dot.style.transform = 'scale(0.2)'; dot.style.filter = ''; }
					if (content) { content.style.transform = 'translateY(12px)'; }
				}
			});
		}

		// ── Shared scroll handler ─────────────────────────────────
		function update() {
			if (isMobile()) {
				if (!mob) return;
				const rect = mob.getBoundingClientRect();
				const vh   = window.innerHeight;
				const p    = clamp((vh * 0.85 - rect.top) / (vh * 0.75), 0, 1);
				updateMobile(p);
			} else {
				if (!viz) return;
				const rect = viz.getBoundingClientRect();
				const vh   = window.innerHeight;
				const p    = clamp((vh * 0.85 - rect.top) / (vh * 0.6), 0, 1);
				updateDesktop(p);
			}
		}

		window.addEventListener('scroll', update, { passive: true });
		window.addEventListener('resize', () => { mobDotFracs.current = null; update(); }, { passive: true });
		update();
		return () => {
			window.removeEventListener('scroll', update);
			window.removeEventListener('resize', update);
		};
	}, []);

	return (
		<>
			{/* ── Desktop ────────────────────────────────────────── */}
			<div className="pc-viz" ref={vizRef}>
				<svg className="pc-svg" viewBox={`0 0 1000 ${SVG_H}`} aria-hidden="true">
					<defs>
						<linearGradient id="pcCurveGrad" x1="0" y1="0" x2="1" y2="0">
							<stop offset="0%"   stopColor="rgba(255,255,255,0)" />
							<stop offset="6%"   stopColor="rgba(255,255,255,0.18)" />
							<stop offset="94%"  stopColor="rgba(255,255,255,0.18)" />
							<stop offset="100%" stopColor="rgba(255,255,255,0)" />
						</linearGradient>
						{DOT_POS.map((d, i) => (
							<linearGradient key={i} id={`pcVG${i}`}
								x1={d.cx} y1={d.cy} x2={d.cx} y2={SVG_H}
								gradientUnits="userSpaceOnUse">
								<stop offset="0%"   stopColor="rgba(255,255,255,0.22)" />
								<stop offset="100%" stopColor="rgba(255,255,255,0)" />
							</linearGradient>
						))}
					</defs>
					<path ref={pathRef} d={CURVE} fill="none" stroke="url(#pcCurveGrad)" strokeWidth="1.5" />
					{DOT_POS.map((d, i) => (
						<line key={i} ref={el => { lineRefs.current[i] = el; }}
							x1={d.cx} y1={d.cy} x2={d.cx} y2={SVG_H}
							stroke={`url(#pcVG${i})`} strokeWidth="1"
							style={{ opacity: 0 }} />
					))}
					{DOT_POS.map((d, i) => (
						<circle key={i} ref={el => { circleRefs.current[i] = el; }}
							cx={d.cx} cy={d.cy} r="5" fill="#f4b44d"
							style={{ opacity: 0, transform: 'scale(0.2)', transformOrigin: `${d.cx}px ${d.cy}px` }} />
					))}
				</svg>
				<div className="pc-steps">
					{steps.map((step, i) => (
						<div key={`${step.title}-${i}`} ref={el => { stepRefs.current[i] = el; }}
							className="pc-step"
							style={{ paddingTop: `calc(${DOT_POS[i].cy / 10}% + 5rem)`, opacity: 0, transform: 'translateY(16px)' }}>
							<span className="pc-step-num">{String(i + 1).padStart(2, '0')}</span>
							<h3 className="pc-step-title">{step.title}</h3>
							<p className="pc-step-desc">{step.desc}</p>
						</div>
					))}
				</div>
			</div>

			{/* ── Mobile ─────────────────────────────────────────── */}
			<div className="pc-mob" ref={mobRef}>
				<div className="pc-mob-rail">
					<div className="pc-mob-rail-fill" ref={mobRailFillRef} />
				</div>
				{steps.map((step, i) => (
					<div key={`mob-${step.title}-${i}`} className="pc-mob-step">
						<div
							ref={el => { mobDotRefs.current[i] = el; }}
							className="pc-mob-dot"
							style={{ opacity: 0, transform: 'scale(0.2)' }}
						/>
						<div
							ref={el => { mobContentRefs.current[i] = el; }}
							className="pc-mob-content"
							style={{ opacity: 0, transform: 'translateY(12px)' }}
						>
							<span className="pc-step-num">{String(i + 1).padStart(2, '0')}</span>
							<h3 className="pc-step-title">{step.title}</h3>
							<p className="pc-step-desc">{step.desc}</p>
						</div>
					</div>
				))}
			</div>
		</>
	);
}
