import { useEffect, useRef, useState } from 'react';

const MAX_OFFSET = 10;

function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

export default function RobotHeadIsland() {
	const rootRef = useRef(null);
	const [offset, setOffset] = useState({ x: 0, y: 0 });

	useEffect(() => {
		const onMove = (event) => {
			if (!rootRef.current) {
				return;
			}

			const rect = rootRef.current.getBoundingClientRect();
			const centerX = rect.left + rect.width / 2;
			const centerY = rect.top + rect.height / 2;
			const dx = event.clientX - centerX;
			const dy = event.clientY - centerY;
			const distance = Math.hypot(dx, dy) || 1;

			setOffset({
				x: clamp((dx / distance) * MAX_OFFSET, -MAX_OFFSET, MAX_OFFSET),
				y: clamp((dy / distance) * MAX_OFFSET, -MAX_OFFSET, MAX_OFFSET),
			});
		};

		window.addEventListener('mousemove', onMove);
		return () => window.removeEventListener('mousemove', onMove);
	}, []);

	return (
		<div className="robot-head" ref={rootRef}>
			<div className="robot-shell">
				<div className="robot-visor">
					<div className="robot-eye">
						<div className="robot-pupil" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
					</div>
					<div className="robot-eye">
						<div className="robot-pupil" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }} />
					</div>
				</div>
				<div className="robot-leds">
					<span className="robot-led" />
					<span className="robot-led is-live" />
					<span className="robot-led" />
				</div>
			</div>
		</div>
	);
}
