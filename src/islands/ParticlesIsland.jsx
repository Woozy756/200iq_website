import { useEffect, useRef } from 'react';

const hexToRgb = (hex) => {
	hex = hex.replace(/^#/, '');
	if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
	const int = parseInt(hex, 16);
	return [(int >> 16 & 255) / 255, (int >> 8 & 255) / 255, (int & 255) / 255];
};

const VERT = `
attribute vec3 position;
attribute vec4 random;
attribute vec3 color;
uniform mat4 uModel;
uniform mat4 uView;
uniform mat4 uProjection;
uniform float uTime;
uniform float uSpread;
uniform float uBaseSize;
uniform float uSizeRandomness;
varying vec4 vRandom;
varying vec3 vColor;
void main() {
  vRandom = random;
  vColor = color;
  vec3 pos = position * uSpread;
  pos.z *= 10.0;
  vec4 mPos = uModel * vec4(pos, 1.0);
  float t = uTime;
  mPos.x += sin(t * random.z + 6.28 * random.w) * mix(0.1, 1.5, random.x);
  mPos.y += sin(t * random.y + 6.28 * random.x) * mix(0.1, 1.5, random.w);
  mPos.z += sin(t * random.w + 6.28 * random.y) * mix(0.1, 1.5, random.z);
  vec4 mvPos = uView * mPos;
  gl_PointSize = (uBaseSize * (1.0 + uSizeRandomness * (random.x - 0.5))) / length(mvPos.xyz);
  gl_Position = uProjection * mvPos;
}`;

const FRAG = `
precision highp float;
uniform float uTime;
varying vec4 vRandom;
varying vec3 vColor;
void main() {
  vec2 uv = gl_PointCoord.xy;
  float d = length(uv - vec2(0.5));
  float circle = smoothstep(0.5, 0.4, d) * 0.8;
  gl_FragColor = vec4(vColor + 0.2 * sin(uv.yxx + uTime + vRandom.y * 6.28), circle);
}`;

function makeShader(gl, type, src) {
	const s = gl.createShader(type);
	gl.shaderSource(s, src);
	gl.compileShader(s);
	return s;
}

function makeProgram(gl, vert, frag) {
	const p = gl.createProgram();
	gl.attachShader(p, makeShader(gl, gl.VERTEX_SHADER, vert));
	gl.attachShader(p, makeShader(gl, gl.FRAGMENT_SHADER, frag));
	gl.linkProgram(p);
	return p;
}

// Column-major 4x4 matrix helpers
function perspective(fovY, aspect, near, far) {
	const f = 1 / Math.tan(fovY / 2);
	const nf = 1 / (near - far);
	return new Float32Array([
		f / aspect, 0, 0, 0,
		0, f, 0, 0,
		0, 0, (far + near) * nf, -1,
		0, 0, 2 * far * near * nf, 0,
	]);
}

function lookAt(eye, center, up) {
	const z = norm([eye[0]-center[0], eye[1]-center[1], eye[2]-center[2]]);
	const x = norm(cross(up, z));
	const y = cross(z, x);
	return new Float32Array([
		x[0], y[0], z[0], 0,
		x[1], y[1], z[1], 0,
		x[2], y[2], z[2], 0,
		-dot(x,eye), -dot(y,eye), -dot(z,eye), 1,
	]);
}

function identity() {
	return new Float32Array([1,0,0,0, 0,1,0,0, 0,0,1,0, 0,0,0,1]);
}

function rotateXYZ(rx, ry, rz) {
	const cx = Math.cos(rx), sx = Math.sin(rx);
	const cy = Math.cos(ry), sy = Math.sin(ry);
	const cz = Math.cos(rz), sz = Math.sin(rz);
	return new Float32Array([
		cy*cz, cx*sz+sx*sy*cz, sx*sz-cx*sy*cz, 0,
		-cy*sz, cx*cz-sx*sy*sz, sx*cz+cx*sy*sz, 0,
		sy, -sx*cy, cx*cy, 0,
		0, 0, 0, 1,
	]);
}

function cross(a, b) { return [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]]; }
function dot(a, b) { return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]; }
function norm(v) { const l = Math.hypot(...v); return v.map(x => x/l); }

export default function ParticlesIsland({
	particleCount = 300,
	particleSpread = 20,
	speed = 0.5,
	particleColors = ['#c98c36'],
	particleBaseSize = 200,
	sizeRandomness = 1,
	cameraDistance = 20,
}) {
	const containerRef = useRef(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container) return;

		const canvas = document.createElement('canvas');
		canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block;';
		container.appendChild(canvas);

		const gl = canvas.getContext('webgl', { alpha: true, depth: false, antialias: false });
		if (!gl) return;

		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

		const prog = makeProgram(gl, VERT, FRAG);
		const locs = {
			position: gl.getAttribLocation(prog, 'position'),
			random: gl.getAttribLocation(prog, 'random'),
			color: gl.getAttribLocation(prog, 'color'),
			uModel: gl.getUniformLocation(prog, 'uModel'),
			uView: gl.getUniformLocation(prog, 'uView'),
			uProjection: gl.getUniformLocation(prog, 'uProjection'),
			uTime: gl.getUniformLocation(prog, 'uTime'),
			uSpread: gl.getUniformLocation(prog, 'uSpread'),
			uBaseSize: gl.getUniformLocation(prog, 'uBaseSize'),
			uSizeRandomness: gl.getUniformLocation(prog, 'uSizeRandomness'),
		};

		const dpr = window.devicePixelRatio || 1;
		let w = 1, h = 1;
		const resize = () => {
			w = container.clientWidth; h = container.clientHeight;
			canvas.width = w * dpr; canvas.height = h * dpr;
			gl.viewport(0, 0, canvas.width, canvas.height);
		};
		window.addEventListener('resize', resize);
		resize();

		// Build geometry
		const positions = new Float32Array(particleCount * 3);
		const randoms = new Float32Array(particleCount * 4);
		const colors = new Float32Array(particleCount * 3);
		const palette = particleColors.length > 0 ? particleColors : ['#ffffff'];

		for (let i = 0; i < particleCount; i++) {
			let x, y, z, len;
			do {
				x = Math.random() * 2 - 1; y = Math.random() * 2 - 1; z = Math.random() * 2 - 1;
				len = x*x + y*y + z*z;
			} while (len > 1 || len === 0);
			const r = Math.cbrt(Math.random());
			positions.set([x*r, y*r, z*r], i*3);
			randoms.set([Math.random(), Math.random(), Math.random(), Math.random()], i*4);
			colors.set(hexToRgb(palette[Math.floor(Math.random() * palette.length)]), i*3);
		}

		const mkBuf = (data) => {
			const b = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, b);
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
			return b;
		};
		const posBuf = mkBuf(positions);
		const rndBuf = mkBuf(randoms);
		const colBuf = mkBuf(colors);

		let rafId, lastTime = performance.now(), elapsed = 0, rz = 0;

		const view = lookAt([0, 0, cameraDistance], [0, 0, 0], [0, 1, 0]);

		const draw = (now) => {
			rafId = requestAnimationFrame(draw);
			const delta = now - lastTime; lastTime = now;
			elapsed += delta * speed;
			rz += 0.01 * speed * (delta / 16.67);

			const rx = Math.sin(elapsed * 0.0002) * 0.1;
			const ry = Math.cos(elapsed * 0.0005) * 0.15;
			const model = rotateXYZ(rx, ry, rz);
			const proj = perspective((15 * Math.PI) / 180, w / h, 0.1, 100);

			gl.clear(gl.COLOR_BUFFER_BIT);
			gl.useProgram(prog);

			gl.uniformMatrix4fv(locs.uModel, false, model);
			gl.uniformMatrix4fv(locs.uView, false, view);
			gl.uniformMatrix4fv(locs.uProjection, false, proj);
			gl.uniform1f(locs.uTime, elapsed * 0.001);
			gl.uniform1f(locs.uSpread, particleSpread);
			gl.uniform1f(locs.uBaseSize, particleBaseSize * dpr);
			gl.uniform1f(locs.uSizeRandomness, sizeRandomness);

			const bind = (buf, loc, size) => {
				gl.bindBuffer(gl.ARRAY_BUFFER, buf);
				gl.enableVertexAttribArray(loc);
				gl.vertexAttribPointer(loc, size, gl.FLOAT, false, 0, 0);
			};
			bind(posBuf, locs.position, 3);
			bind(rndBuf, locs.random, 4);
			bind(colBuf, locs.color, 3);

			gl.drawArrays(gl.POINTS, 0, particleCount);
		};

		rafId = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(rafId);
			window.removeEventListener('resize', resize);
			if (container.contains(canvas)) container.removeChild(canvas);
		};
	}, []);

	return <div ref={containerRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}
