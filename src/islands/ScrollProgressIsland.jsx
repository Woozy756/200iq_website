import { useEffect, useRef } from 'react';
import { subscribeViewportRaf } from './viewportRaf';

export default function ScrollProgressIsland() {
	const barRef = useRef(null);

	useEffect(() => {
		const update = () => {
			if (!barRef.current) return;
			const scrollTop = window.scrollY;
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			const value = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / scrollable));
			barRef.current.style.transform = `scaleX(${value})`;
		};

		return subscribeViewportRaf(update);
	}, []);

	return (
		<div className="progress-wrap" aria-hidden="true">
			<div ref={barRef} className="progress-bar" style={{ transform: 'scaleX(0)' }} />
		</div>
	);
}
