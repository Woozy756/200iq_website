import { useEffect, useState } from 'react';

export default function ScrollProgressIsland() {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		const update = () => {
			const scrollTop = window.scrollY;
			const scrollable = document.documentElement.scrollHeight - window.innerHeight;
			const value = scrollable <= 0 ? 0 : Math.min(1, Math.max(0, scrollTop / scrollable));
			setProgress(value);
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
		<div className="progress-wrap" aria-hidden="true">
			<div className="progress-bar" style={{ transform: `scaleX(${progress})` }} />
		</div>
	);
}
