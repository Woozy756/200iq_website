import { useEffect, useRef } from 'react';
import { subscribeViewportRaf } from './viewportRaf';

export default function ScrollProgressIsland() {
	const barRef = useRef(null);
	const metricsRef = useRef({
		scrollable: 1,
		needsMeasure: true,
	});

	useEffect(() => {
		const markMeasureDirty = () => {
			metricsRef.current.needsMeasure = true;
		};

		const measureScrollable = () => {
			const doc = document.documentElement;
			const nextScrollable = Math.max((doc?.scrollHeight || 0) - window.innerHeight, 1);
			metricsRef.current.scrollable = nextScrollable;
			metricsRef.current.needsMeasure = false;
		};

		const update = () => {
			if (!barRef.current) return;
			if (metricsRef.current.needsMeasure) {
				measureScrollable();
			}
			const scrollTop = window.scrollY;
			const scrollable = metricsRef.current.scrollable;
			const value = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / scrollable));
			barRef.current.style.transform = `scaleX(${value})`;
		};

		let resizeObserver = null;
		if ('ResizeObserver' in window) {
			resizeObserver = new ResizeObserver(markMeasureDirty);
			resizeObserver.observe(document.documentElement);
			if (document.body) {
				resizeObserver.observe(document.body);
			}
		}

		const unsubscribe = subscribeViewportRaf(update);

		return () => {
			unsubscribe();
			if (resizeObserver) {
				resizeObserver.disconnect();
			}
		};
	}, []);

	return (
		<div className="progress-wrap" aria-hidden="true">
			<div ref={barRef} className="progress-bar" style={{ transform: 'scaleX(0)' }} />
		</div>
	);
}
