const subscribers = new Set();

let isBound = false;
let rafId = 0;
let pending = false;

function flush() {
	rafId = 0;
	if (!pending) return;
	pending = false;

	for (const subscriber of subscribers) {
		subscriber();
	}
}

function queue() {
	pending = true;
	if (rafId) return;
	rafId = requestAnimationFrame(flush);
}

function bindWindowEvents() {
	if (isBound || typeof window === 'undefined') return;
	isBound = true;

	window.addEventListener('scroll', queue, { passive: true });
	window.addEventListener('resize', queue);
	window.addEventListener('orientationchange', queue);
	window.addEventListener('load', queue);
	window.addEventListener('pageshow', queue);
	document.addEventListener('astro:after-swap', queue);
	document.addEventListener('astro:page-load', queue);
}

function unbindWindowEvents() {
	if (!isBound || subscribers.size > 0 || typeof window === 'undefined') return;
	isBound = false;

	window.removeEventListener('scroll', queue);
	window.removeEventListener('resize', queue);
	window.removeEventListener('orientationchange', queue);
	window.removeEventListener('load', queue);
	window.removeEventListener('pageshow', queue);
	document.removeEventListener('astro:after-swap', queue);
	document.removeEventListener('astro:page-load', queue);

	if (rafId) {
		cancelAnimationFrame(rafId);
		rafId = 0;
	}
	pending = false;
}

export function subscribeViewportRaf(subscriber, { immediate = true } = {}) {
	if (typeof window === 'undefined') {
		return () => {};
	}

	bindWindowEvents();
	subscribers.add(subscriber);

	if (immediate) {
		subscriber();
	}

	return () => {
		subscribers.delete(subscriber);
		unbindWindowEvents();
	};
}
