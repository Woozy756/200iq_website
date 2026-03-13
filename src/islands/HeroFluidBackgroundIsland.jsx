import { useEffect, useRef } from 'react';

const CONFIG = {
        SIM_RESOLUTION: 128,
        DYE_RESOLUTION: 1024,
        DENSITY_DISSIPATION: 0.97,
        VELOCITY_DISSIPATION: 0.98,
        PRESSURE: 0.8,
        PRESSURE_ITERATIONS: 20,
        CURL: 30,
        SPLAT_RADIUS: 0.1,
        SPLAT_FORCE: 4200,
};

const PALETTE = [
	[0xc9 / 255, 0xa8 / 255, 0x4c / 255],
	[0xf5 / 255, 0xd5 / 255, 0x76 / 255],
	[0x9a / 255, 0x7d / 255, 0x2e / 255],
	[0xe8 / 255, 0xd5 / 255, 0xa3 / 255],
];

const BASE_VERTEX_SHADER = `
precision highp float;

attribute vec2 aPosition;
varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform vec2 texelSize;

void main () {
	vUv = aPosition * 0.5 + 0.5;
	vL = vUv - vec2(texelSize.x, 0.0);
	vR = vUv + vec2(texelSize.x, 0.0);
	vT = vUv + vec2(0.0, texelSize.y);
	vB = vUv - vec2(0.0, texelSize.y);
	gl_Position = vec4(aPosition, 0.0, 1.0);
}
`;

const CLEAR_SHADER = `
precision mediump float;

varying highp vec2 vUv;
uniform sampler2D uTexture;
uniform float value;

void main () {
	gl_FragColor = value * texture2D(uTexture, vUv);
}
`;

const DISPLAY_SHADER = `
precision highp float;

varying vec2 vUv;
uniform sampler2D uTexture;

void main () {
	vec3 c = texture2D(uTexture, vUv).rgb;
	float a = max(c.r, max(c.g, c.b));
	gl_FragColor = vec4(c, a);
}
`;

const SPLAT_SHADER = `
precision highp float;

varying vec2 vUv;
uniform sampler2D uTarget;
uniform float aspectRatio;
uniform vec3 color;
uniform vec2 point;
uniform float radius;

void main () {
	vec2 p = vUv - point.xy;
	p.x *= aspectRatio;
	vec3 splat = exp(-dot(p, p) / radius) * color;
	vec3 base = texture2D(uTarget, vUv).xyz;
	gl_FragColor = vec4(base + splat, 1.0);
}
`;

const ADVECTION_SHADER = `
precision highp float;

varying vec2 vUv;
uniform sampler2D uVelocity;
uniform sampler2D uSource;
uniform vec2 texelSize;
uniform vec2 dyeTexelSize;
uniform float dt;
uniform float dissipation;

vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
	vec2 st = uv / tsize - 0.5;
	vec2 iuv = floor(st);
	vec2 fuv = fract(st);
	vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
	vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
	vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
	vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);
	return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
}

void main () {
	vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
	vec4 result = bilerp(uSource, coord, dyeTexelSize);
	float decay = 1.0 + dissipation * dt;
	gl_FragColor = result / decay;
}
`;

const DIVERGENCE_SHADER = `
precision mediump float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uVelocity, vL).x;
	float R = texture2D(uVelocity, vR).x;
	float T = texture2D(uVelocity, vT).y;
	float B = texture2D(uVelocity, vB).y;
	vec2 C = texture2D(uVelocity, vUv).xy;

	if (vL.x < 0.0) { L = -C.x; }
	if (vR.x > 1.0) { R = -C.x; }
	if (vT.y > 1.0) { T = -C.y; }
	if (vB.y < 0.0) { B = -C.y; }

	float div = 0.5 * (R - L + T - B);
	gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
}
`;

const CURL_SHADER = `
precision mediump float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uVelocity, vL).y;
	float R = texture2D(uVelocity, vR).y;
	float T = texture2D(uVelocity, vT).x;
	float B = texture2D(uVelocity, vB).x;
	float vorticity = R - L - T + B;
	gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
}
`;

const VORTICITY_SHADER = `
precision highp float;

varying vec2 vUv;
varying vec2 vL;
varying vec2 vR;
varying vec2 vT;
varying vec2 vB;
uniform sampler2D uVelocity;
uniform sampler2D uCurl;
uniform float curl;
uniform float dt;

void main () {
	float L = texture2D(uCurl, vL).x;
	float R = texture2D(uCurl, vR).x;
	float T = texture2D(uCurl, vT).x;
	float B = texture2D(uCurl, vB).x;
	float C = texture2D(uCurl, vUv).x;
	vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
	force /= length(force) + 0.0001;
	force *= curl * C;
	force.y *= -1.0;

	vec2 velocity = texture2D(uVelocity, vUv).xy;
	velocity += force * dt;
	velocity = clamp(velocity, -1000.0, 1000.0);
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

const PRESSURE_SHADER = `
precision mediump float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uDivergence;

void main () {
	float L = texture2D(uPressure, vL).x;
	float R = texture2D(uPressure, vR).x;
	float T = texture2D(uPressure, vT).x;
	float B = texture2D(uPressure, vB).x;
	float divergence = texture2D(uDivergence, vUv).x;
	float pressure = (L + R + B + T - divergence) * 0.25;
	gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
}
`;

const GRADIENT_SUBTRACT_SHADER = `
precision mediump float;

varying highp vec2 vUv;
varying highp vec2 vL;
varying highp vec2 vR;
varying highp vec2 vT;
varying highp vec2 vB;
uniform sampler2D uPressure;
uniform sampler2D uVelocity;

void main () {
	float L = texture2D(uPressure, vL).x;
	float R = texture2D(uPressure, vR).x;
	float T = texture2D(uPressure, vT).x;
	float B = texture2D(uPressure, vB).x;
	vec2 velocity = texture2D(uVelocity, vUv).xy;
	velocity.xy -= vec2(R - L, T - B);
	gl_FragColor = vec4(velocity, 0.0, 1.0);
}
`;

function createPointer() {
	return {
		id: -1,
		down: false,
		moved: false,
		texcoordX: 0.5,
		texcoordY: 0.5,
		prevTexcoordX: 0.5,
		prevTexcoordY: 0.5,
		deltaX: 0,
		deltaY: 0,
		color: { r: 0, g: 0, b: 0 },
	};
}

function compileShader(gl, type, source) {
	const shader = gl.createShader(type);
	if (!shader) return null;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		gl.deleteShader(shader);
		return null;
	}
	return shader;
}

function createProgram(gl, vertexShader, fragmentShaderSource) {
	const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
	if (!fragmentShader) return null;
	const program = gl.createProgram();
	if (!program) {
		gl.deleteShader(fragmentShader);
		return null;
	}

	gl.bindAttribLocation(program, 0, 'aPosition');
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.deleteShader(fragmentShader);

	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		gl.deleteProgram(program);
		return null;
	}

	const uniforms = {};
	const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for (let i = 0; i < uniformCount; i += 1) {
		const active = gl.getActiveUniform(program, i);
		if (active) {
			uniforms[active.name] = gl.getUniformLocation(program, active.name);
		}
	}

	return {
		program,
		uniforms,
	};
}

function supportRenderTextureFormat(gl, internalFormat, format, type) {
	const texture = gl.createTexture();
	const fbo = gl.createFramebuffer();
	if (!texture || !fbo) return false;

	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

	gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

	const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
	gl.deleteTexture(texture);
	gl.deleteFramebuffer(fbo);
	return status;
}

function getSupportedFormat(gl, internalFormat, format, type) {
	if (supportRenderTextureFormat(gl, internalFormat, format, type)) {
		return { internalFormat, format };
	}

	if (internalFormat === gl.R16F) {
		return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
	}
	if (internalFormat === gl.RG16F) {
		return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
	}
	return null;
}

function getWebGLContext(canvas) {
	const params = {
		alpha: true,
		depth: false,
		stencil: false,
		antialias: false,
		preserveDrawingBuffer: false,
	};

	let gl = canvas.getContext('webgl2', params);
	const isWebGL2 = Boolean(gl);

	if (!gl) {
		gl = canvas.getContext('webgl', params) || canvas.getContext('experimental-webgl', params);
	}

	if (!gl) return null;

	let halfFloat;
	let supportLinearFiltering;
	if (isWebGL2) {
		gl.getExtension('EXT_color_buffer_float');
		supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
	} else {
		halfFloat = gl.getExtension('OES_texture_half_float');
		supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
	}

	const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat && halfFloat.HALF_FLOAT_OES;
	if (!halfFloatTexType) return null;

	let formatRGBA;
	let formatRG;
	let formatR;

	if (isWebGL2) {
		formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
		formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
		formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
	} else {
		formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
		formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
		formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
	}

	gl.clearColor(0, 0, 0, 0);

	return {
		gl,
		ext: {
			formatRGBA,
			formatRG,
			formatR,
			halfFloatTexType,
			supportLinearFiltering: Boolean(supportLinearFiltering),
		},
	};
}

function getResolution(gl, resolution) {
	const aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
	if (aspectRatio < 1) {
		return {
			width: Math.round(resolution),
			height: Math.round(resolution / aspectRatio),
		};
	}

	return {
		width: Math.round(resolution * aspectRatio),
		height: Math.round(resolution),
	};
}

function randomColor() {
        const base = PALETTE[Math.floor(Math.random() * PALETTE.length)];
        const intensity = 0.17;
        return {
                r: base[0] * intensity,
                g: base[1] * intensity,
		b: base[2] * intensity,
	};
}

export default function HeroFluidBackgroundIsland() {
	const canvasRef = useRef(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return undefined;

		const context = getWebGLContext(canvas);
		if (!context) return undefined;

		const { gl, ext } = context;
		const host = canvas.closest('.hero') ?? canvas.parentElement;
		if (!host) return undefined;

		const vertexShader = compileShader(gl, gl.VERTEX_SHADER, BASE_VERTEX_SHADER);
		if (!vertexShader) return undefined;

		const programs = {
			clear: createProgram(gl, vertexShader, CLEAR_SHADER),
			display: createProgram(gl, vertexShader, DISPLAY_SHADER),
			splat: createProgram(gl, vertexShader, SPLAT_SHADER),
			advection: createProgram(gl, vertexShader, ADVECTION_SHADER),
			divergence: createProgram(gl, vertexShader, DIVERGENCE_SHADER),
			curl: createProgram(gl, vertexShader, CURL_SHADER),
			vorticity: createProgram(gl, vertexShader, VORTICITY_SHADER),
			pressure: createProgram(gl, vertexShader, PRESSURE_SHADER),
			gradientSubtract: createProgram(gl, vertexShader, GRADIENT_SUBTRACT_SHADER),
		};

		if (Object.values(programs).some((program) => !program)) {
			gl.deleteShader(vertexShader);
			return undefined;
		}

		const quadBuffer = gl.createBuffer();
		const indexBuffer = gl.createBuffer();
		if (!quadBuffer || !indexBuffer) {
			gl.deleteShader(vertexShader);
			return undefined;
		}

		const initBlit = () => {
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
		};

		const bindAttribute = (programInfo) => {
			gl.useProgram(programInfo.program);
			gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
			gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(0);
		};

		const createFBO = (width, height, internalFormat, format, type, filtering) => {
			const texture = gl.createTexture();
			const fbo = gl.createFramebuffer();
			if (!texture || !fbo) return null;

			gl.activeTexture(gl.TEXTURE0);
			gl.bindTexture(gl.TEXTURE_2D, texture);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filtering);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filtering);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
			gl.viewport(0, 0, width, height);
			gl.clear(gl.COLOR_BUFFER_BIT);

			return {
				texture,
				fbo,
				width,
				height,
				texelSizeX: 1 / width,
				texelSizeY: 1 / height,
				attach(id) {
					gl.activeTexture(gl.TEXTURE0 + id);
					gl.bindTexture(gl.TEXTURE_2D, texture);
					return id;
				},
			};
		};

		const createDoubleFBO = (width, height, internalFormat, format, type, filtering) => {
			let fbo1 = createFBO(width, height, internalFormat, format, type, filtering);
			let fbo2 = createFBO(width, height, internalFormat, format, type, filtering);

			return {
				width,
				height,
				get texelSizeX() {
					return fbo1.texelSizeX;
				},
				get texelSizeY() {
					return fbo1.texelSizeY;
				},
				get read() {
					return fbo1;
				},
				get write() {
					return fbo2;
				},
				swap() {
					const temp = fbo1;
					fbo1 = fbo2;
					fbo2 = temp;
				},
			};
		};

		const deleteFBO = (target) => {
			if (!target) return;
			gl.deleteTexture(target.texture);
			gl.deleteFramebuffer(target.fbo);
		};

		const deleteDoubleFBO = (target) => {
			if (!target) return;
			deleteFBO(target.read);
			deleteFBO(target.write);
		};

		const blit = (target) => {
			if (!target) {
				gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			} else {
				gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
				gl.viewport(0, 0, target.width, target.height);
			}
			gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
		};

		let dye;
		let velocity;
		let divergence;
		let curl;
		let pressure;
		let lastUpdateTime = Date.now();
		let animationFrame = 0;
		const pointers = [createPointer()];

		const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

		const initFramebuffers = () => {
			const simRes = getResolution(gl, CONFIG.SIM_RESOLUTION);
			const dyeRes = getResolution(gl, CONFIG.DYE_RESOLUTION);
			const texType = ext.halfFloatTexType;
			const rgba = ext.formatRGBA;
			const rg = ext.formatRG;
			const r = ext.formatR;

			deleteDoubleFBO(dye);
			deleteDoubleFBO(velocity);
			deleteFBO(divergence);
			deleteFBO(curl);
			deleteDoubleFBO(pressure);

			dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
			velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
			divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
			curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
			pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
		};

		const resizeCanvas = () => {
			const width = Math.max(2, canvas.clientWidth);
			const height = Math.max(2, canvas.clientHeight);
			if (width === canvas.width && height === canvas.height) return;
			canvas.width = width;
			canvas.height = height;
			gl.viewport(0, 0, width, height);
			initFramebuffers();
		};

		const correctDeltaX = (delta) => {
			const aspectRatio = canvas.width / canvas.height;
			return aspectRatio < 1 ? delta * aspectRatio : delta;
		};

		const correctDeltaY = (delta) => {
			const aspectRatio = canvas.width / canvas.height;
			return aspectRatio > 1 ? delta / aspectRatio : delta;
		};

		const updatePointerDownData = (pointer, id, posX, posY) => {
			pointer.id = id;
			pointer.down = true;
			pointer.moved = false;
			pointer.texcoordX = posX;
			pointer.texcoordY = posY;
			pointer.prevTexcoordX = posX;
			pointer.prevTexcoordY = posY;
			pointer.deltaX = 0;
			pointer.deltaY = 0;
			pointer.color = randomColor();
		};

		const updatePointerMoveData = (pointer, posX, posY) => {
			pointer.prevTexcoordX = pointer.texcoordX;
			pointer.prevTexcoordY = pointer.texcoordY;
			pointer.texcoordX = posX;
			pointer.texcoordY = posY;
			pointer.deltaX = correctDeltaX(posX - pointer.prevTexcoordX);
			pointer.deltaY = correctDeltaY(posY - pointer.prevTexcoordY);
			pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
		};

		const splat = (x, y, dx, dy, color) => {
			const aspectRatio = canvas.width / canvas.height;

			bindAttribute(programs.splat);
			gl.uniform1i(programs.splat.uniforms.uTarget, velocity.read.attach(0));
			gl.uniform1f(programs.splat.uniforms.aspectRatio, aspectRatio);
			gl.uniform2f(programs.splat.uniforms.point, x, y);
			gl.uniform3f(programs.splat.uniforms.color, dx, dy, 0);
			gl.uniform1f(
				programs.splat.uniforms.radius,
				aspectRatio > 1 ? CONFIG.SPLAT_RADIUS * aspectRatio : CONFIG.SPLAT_RADIUS,
			);
			blit(velocity.write);
			velocity.swap();

			gl.uniform1i(programs.splat.uniforms.uTarget, dye.read.attach(0));
			gl.uniform3f(programs.splat.uniforms.color, color.r, color.g, color.b);
			blit(dye.write);
			dye.swap();
		};

                const splatPointer = (pointer) => {
                        const speed = Math.hypot(pointer.deltaX, pointer.deltaY);
                        const ramp = Math.min(1, Math.max(0, (speed - 0.0022) / 0.02));
                        const easedRamp = ramp * ramp * ramp * ramp;
                        if (easedRamp <= 0) return;

                        const dx = pointer.deltaX * CONFIG.SPLAT_FORCE * easedRamp;
                        const dy = pointer.deltaY * CONFIG.SPLAT_FORCE * easedRamp;
                        splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
                };

		const calcDeltaTime = () => {
			const now = Date.now();
			let dt = (now - lastUpdateTime) / 1000;
			dt = Math.min(dt, 0.016666);
			lastUpdateTime = now;
			return dt;
		};

		const curlProgram = () => {
			bindAttribute(programs.curl);
			gl.uniform2f(programs.curl.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(programs.curl.uniforms.uVelocity, velocity.read.attach(0));
			blit(curl);
		};

		const vorticityProgram = (dt) => {
			bindAttribute(programs.vorticity);
			gl.uniform2f(programs.vorticity.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(programs.vorticity.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
			gl.uniform1f(programs.vorticity.uniforms.curl, CONFIG.CURL);
			gl.uniform1f(programs.vorticity.uniforms.dt, dt);
			blit(velocity.write);
			velocity.swap();
		};

		const divergenceProgram = () => {
			bindAttribute(programs.divergence);
			gl.uniform2f(programs.divergence.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(programs.divergence.uniforms.uVelocity, velocity.read.attach(0));
			blit(divergence);
		};

		const clearProgram = () => {
			bindAttribute(programs.clear);
			gl.uniform2f(programs.clear.uniforms.texelSize, pressure.texelSizeX, pressure.texelSizeY);
			gl.uniform1i(programs.clear.uniforms.uTexture, pressure.read.attach(0));
			gl.uniform1f(programs.clear.uniforms.value, CONFIG.PRESSURE);
			blit(pressure.write);
			pressure.swap();
		};

		const pressureProgram = () => {
			bindAttribute(programs.pressure);
			gl.uniform2f(programs.pressure.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(0));
			for (let i = 0; i < CONFIG.PRESSURE_ITERATIONS; i += 1) {
				gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(1));
				blit(pressure.write);
				pressure.swap();
			}
		};

		const gradientSubtractProgram = () => {
			bindAttribute(programs.gradientSubtract);
			gl.uniform2f(
				programs.gradientSubtract.uniforms.texelSize,
				velocity.texelSizeX,
				velocity.texelSizeY,
			);
			gl.uniform1i(programs.gradientSubtract.uniforms.uPressure, pressure.read.attach(0));
			gl.uniform1i(programs.gradientSubtract.uniforms.uVelocity, velocity.read.attach(1));
			blit(velocity.write);
			velocity.swap();
		};

		const advectionProgram = (dt) => {
			bindAttribute(programs.advection);
			gl.uniform2f(programs.advection.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform2f(programs.advection.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(programs.advection.uniforms.uSource, velocity.read.attach(0));
			gl.uniform1f(programs.advection.uniforms.dt, dt);
			gl.uniform1f(programs.advection.uniforms.dissipation, CONFIG.VELOCITY_DISSIPATION);
			blit(velocity.write);
			velocity.swap();

			gl.uniform2f(programs.advection.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
			gl.uniform1i(programs.advection.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(programs.advection.uniforms.uSource, dye.read.attach(1));
			gl.uniform1f(programs.advection.uniforms.dissipation, CONFIG.DENSITY_DISSIPATION);
			blit(dye.write);
			dye.swap();
		};

		const render = () => {
			bindAttribute(programs.display);
			gl.uniform2f(programs.display.uniforms.texelSize, 1 / canvas.width, 1 / canvas.height);
			gl.uniform1i(programs.display.uniforms.uTexture, dye.read.attach(0));
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
			blit(null);
		};

		const step = (dt) => {
			gl.disable(gl.BLEND);
			curlProgram();
			vorticityProgram(dt);
			divergenceProgram();
			clearProgram();
			pressureProgram();
			gradientSubtractProgram();
			advectionProgram(dt);

			for (const pointer of pointers) {
				if (pointer.moved) {
					pointer.moved = false;
					splatPointer(pointer);
				}
			}
		};

		const update = () => {
			const dt = calcDeltaTime();
			step(dt);
			render();
			animationFrame = requestAnimationFrame(update);
		};

		const getRelativePoint = (clientX, clientY) => {
			const rect = host.getBoundingClientRect();
			return {
				x: (clientX - rect.left) / rect.width,
				y: 1 - (clientY - rect.top) / rect.height,
			};
		};

		const onMouseEnter = () => {
			pointers[0].down = true;
			pointers[0].color = randomColor();
		};

		const onMouseLeave = () => {
			pointers[0].down = false;
		};

		const onMouseMove = (event) => {
			const pos = getRelativePoint(event.clientX, event.clientY);
			updatePointerMoveData(pointers[0], pos.x, pos.y);
		};

		const onTouchStart = (event) => {
			const { targetTouches } = event;
			while (targetTouches.length >= pointers.length) {
				pointers.push(createPointer());
			}
			for (let i = 0; i < targetTouches.length; i += 1) {
				const pos = getRelativePoint(targetTouches[i].clientX, targetTouches[i].clientY);
				updatePointerDownData(pointers[i], targetTouches[i].identifier, pos.x, pos.y);
			}
		};

		const onTouchMove = (event) => {
			const { targetTouches } = event;
			for (let i = 0; i < targetTouches.length; i += 1) {
				const pointer = pointers[i];
				if (!pointer || !pointer.down) continue;
				const pos = getRelativePoint(targetTouches[i].clientX, targetTouches[i].clientY);
				updatePointerMoveData(pointer, pos.x, pos.y);
			}
		};

		const onTouchEnd = (event) => {
			for (let i = 0; i < event.changedTouches.length; i += 1) {
				const pointer = pointers.find((item) => item.id === event.changedTouches[i].identifier);
				if (pointer) {
					pointer.down = false;
				}
			}
		};

		initBlit();
		resizeCanvas();

		host.addEventListener('mouseenter', onMouseEnter);
		host.addEventListener('mouseleave', onMouseLeave);
		host.addEventListener('mousemove', onMouseMove, { passive: true });
		host.addEventListener('touchstart', onTouchStart, { passive: true });
		host.addEventListener('touchmove', onTouchMove, { passive: true });
		host.addEventListener('touchend', onTouchEnd);
		window.addEventListener('resize', resizeCanvas);

		update();

		return () => {
			cancelAnimationFrame(animationFrame);
			host.removeEventListener('mouseenter', onMouseEnter);
			host.removeEventListener('mouseleave', onMouseLeave);
			host.removeEventListener('mousemove', onMouseMove);
			host.removeEventListener('touchstart', onTouchStart);
			host.removeEventListener('touchmove', onTouchMove);
			host.removeEventListener('touchend', onTouchEnd);
			window.removeEventListener('resize', resizeCanvas);

			deleteDoubleFBO(dye);
			deleteDoubleFBO(velocity);
			deleteFBO(divergence);
			deleteFBO(curl);
			deleteDoubleFBO(pressure);

			Object.values(programs).forEach((programInfo) => {
				if (programInfo) {
					gl.deleteProgram(programInfo.program);
				}
			});

			gl.deleteBuffer(quadBuffer);
			gl.deleteBuffer(indexBuffer);
			gl.deleteShader(vertexShader);
		};
	}, []);

	return (
		<div className="hero-fluid-layer" aria-hidden="true">
			<canvas ref={canvasRef} className="hero-fluid-canvas" />
		</div>
	);
}
