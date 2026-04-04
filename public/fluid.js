(function () {
  'use strict';

  var el = document.getElementById('hero-fluid-bg');
  if (!el) return;

  // ── Config ──
  var mouseForce = 6, cursorSize = 160, isViscous = true, viscous = 30;
  var iterationsViscous = 32, iterationsPoisson = 32, dt = 0.014, BFECC = true;
  var resolution = 0.5, isBounce = false;
  var colors = ['#c8962e', '#e1a140', '#efcfa0'];
  var autoDemo = true, autoSpeed = 0.08, autoIntensity = 0.2;
  var takeoverDur = 0.25, autoResumeDelay = 1000, autoRampDuration = 0.6;

  // ── WebGL canvas ──
  var canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;display:block;';
  var gl = canvas.getContext('webgl', { alpha: true, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false })
         || canvas.getContext('experimental-webgl', { alpha: true, depth: false, stencil: false });
  if (!gl) return;
  el.prepend(canvas);

  // ── Float texture support ──
  var texType;
  var extFloat = gl.getExtension('OES_texture_float');
  if (extFloat) {
    texType = gl.FLOAT;
    gl.getExtension('OES_texture_float_linear');
  } else {
    var extHalf = gl.getExtension('OES_texture_half_float');
    texType = extHalf ? extHalf.HALF_FLOAT_OES : gl.UNSIGNED_BYTE;
    if (extHalf) gl.getExtension('OES_texture_half_float_linear');
  }

  // ── Canvas / viewport ──
  var cw = 1, ch = 1;
  function resizeCanvas() {
    var r = el.getBoundingClientRect();
    cw = Math.max(1, Math.floor(r.width));
    ch = Math.max(1, Math.floor(r.height));
    canvas.width = cw; canvas.height = ch;
  }
  resizeCanvas();

  // ── Vec2 helpers ──
  function v2(x, y) { return { x: x || 0, y: y || 0 }; }
  function v2s(v, x, y) { v.x = x; v.y = y; return v; }
  function v2c(v, s) { v.x = s.x; v.y = s.y; return v; }
  function v2sub(v, a, b) { v.x = a.x - b.x; v.y = a.y - b.y; return v; }
  function v2len(v) { return Math.sqrt(v.x * v.x + v.y * v.y); }
  function v2norm(v) { var l = v2len(v); if (l > 0) { v.x /= l; v.y /= l; } return v; }
  function v2muls(v, s) { v.x *= s; v.y *= s; return v; }
  function v2adds(v, d, s) { v.x += d.x * s; v.y += d.y * s; return v; }

  // ── Color helper ──
  function hexRgb(h) {
    return { r: parseInt(h.slice(1,3),16)/255, g: parseInt(h.slice(3,5),16)/255, b: parseInt(h.slice(5,7),16)/255 };
  }

  // ── Shader compilation ──
  function mkShader(type, src) {
    var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s;
  }
  function mkProg(vs, fs) {
    var p = gl.createProgram();
    gl.attachShader(p, mkShader(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, mkShader(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(p); p._u = {}; return p;
  }
  function uloc(p, n) { if (!(n in p._u)) p._u[n] = gl.getUniformLocation(p, n); return p._u[n]; }
  function u1f(p,n,v){var l=uloc(p,n);if(l!=null)gl.uniform1f(l,v);}
  function u1i(p,n,v){var l=uloc(p,n);if(l!=null)gl.uniform1i(l,v);}
  function u2f(p,n,x,y){var l=uloc(p,n);if(l!=null)gl.uniform2f(l,x,y);}
  function u4f(p,n,x,y,z,w){var l=uloc(p,n);if(l!=null)gl.uniform4f(l,x,y,z,w);}

  // ── Geometry buffers ──
  // Fullscreen quad: vec3 position (z=0) matching existing shaders
  var quadBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0, 1,-1,0, -1,1,0, 1,1,0]), gl.STATIC_DRAW);

  // Boundary lines (4 edges of NDC square)
  var lineBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0,-1,1,0, -1,1,0,1,1,0, 1,1,0,1,-1,0, 1,-1,0,-1,-1,0]), gl.STATIC_DRAW);

  // Mouse quad: interleaved position(vec3) + uv(vec2), stride=20
  var mouseBuf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -0.5,-0.5,0, 0,0,
     0.5,-0.5,0, 1,0,
    -0.5, 0.5,0, 0,1,
     0.5, 0.5,0, 1,1
  ]), gl.STATIC_DRAW);

  // ── FBO helpers ──
  function mkFBO(w, h) {
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texType, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    var fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    return { texture: tex, framebuffer: fb, width: w, height: h };
  }
  function rezFBO(f, w, h) {
    gl.bindTexture(gl.TEXTURE_2D, f.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, texType, null);
    f.width = w; f.height = h;
  }
  function bindFBO(f) {
    if (f) { gl.bindFramebuffer(gl.FRAMEBUFFER, f.framebuffer); gl.viewport(0,0,f.width,f.height); }
    else   { gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0,0,cw,ch); }
  }

  // ── Palette texture ──
  function mkPalTex(stops) {
    var arr = (stops && stops.length) ? (stops.length===1 ? [stops[0],stops[0]] : stops) : ['#fff','#fff'];
    var data = new Uint8Array(arr.length * 4);
    for (var i = 0; i < arr.length; i++) {
      var c = hexRgb(arr[i]);
      data[i*4]=Math.round(c.r*255); data[i*4+1]=Math.round(c.g*255);
      data[i*4+2]=Math.round(c.b*255); data[i*4+3]=255;
    }
    var tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, arr.length, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return tex;
  }

  // ── Texture unit binding ──
  var texUnit = 0;
  function resetTex() { texUnit = 0; }
  function bindTex(p, name, tex) {
    var u = texUnit++;
    gl.activeTexture(gl.TEXTURE0 + u);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    u1i(p, name, u);
  }

  // ── Draw helpers ──
  function useQuad(p) {
    gl.useProgram(p);
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    var loc = gl.getAttribLocation(p, 'position');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 12, 0);
  }

  // ── Shaders (identical GLSL to original) ──
  var face_vert = 'attribute vec3 position;uniform vec2 px;uniform vec2 boundarySpace;varying vec2 uv;precision highp float;void main(){vec3 pos=position;vec2 scale=1.0-boundarySpace*2.0;pos.xy=pos.xy*scale;uv=vec2(0.5)+(pos.xy)*0.5;gl_Position=vec4(pos,1.0);}';
  var line_vert = 'attribute vec3 position;uniform vec2 px;precision highp float;varying vec2 uv;void main(){vec3 pos=position;uv=0.5+pos.xy*0.5;vec2 n=sign(pos.xy);pos.xy=abs(pos.xy)-px*1.0;pos.xy*=n;gl_Position=vec4(pos,1.0);}';
  var mouse_vert = 'precision highp float;attribute vec3 position;attribute vec2 uv;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 pos=position.xy*scale*2.0*px+center;vUv=uv;gl_Position=vec4(pos,0.0,1.0);}';
  var advection_frag = 'precision highp float;uniform sampler2D velocity;uniform float dt;uniform bool isBFECC;uniform vec2 fboSize;uniform vec2 px;varying vec2 uv;void main(){vec2 ratio=max(fboSize.x,fboSize.y)/fboSize;if(isBFECC==false){vec2 vel=texture2D(velocity,uv).xy;vec2 uv2=uv-vel*dt*ratio;vec2 nv=texture2D(velocity,uv2).xy;gl_FragColor=vec4(nv,0.0,0.0);}else{vec2 sn=uv;vec2 vo=texture2D(velocity,uv).xy;vec2 so=sn-vo*dt*ratio;vec2 vn1=texture2D(velocity,so).xy;vec2 sn2=so+vn1*dt*ratio;vec2 err=sn2-sn;vec2 sn3=sn-err/2.0;vec2 v2=texture2D(velocity,sn3).xy;vec2 so2=sn3-v2*dt*ratio;vec2 nv2=texture2D(velocity,so2).xy;gl_FragColor=vec4(nv2,0.0,0.0);}}';
  var color_frag = 'precision highp float;uniform sampler2D velocity;uniform sampler2D palette;uniform vec4 bgColor;varying vec2 uv;void main(){vec2 vel=texture2D(velocity,uv).xy;float lenv=clamp(length(vel),0.0,1.0);vec3 c=texture2D(palette,vec2(lenv,0.5)).rgb;vec3 rgb=mix(bgColor.rgb,c,lenv);float a=mix(bgColor.a,1.0,lenv);gl_FragColor=vec4(rgb,a);}';
  var divergence_frag = 'precision highp float;uniform sampler2D velocity;uniform float dt;uniform vec2 px;varying vec2 uv;void main(){float x0=texture2D(velocity,uv-vec2(px.x,0.0)).x;float x1=texture2D(velocity,uv+vec2(px.x,0.0)).x;float y0=texture2D(velocity,uv-vec2(0.0,px.y)).y;float y1=texture2D(velocity,uv+vec2(0.0,px.y)).y;float d=(x1-x0+y1-y0)/2.0;gl_FragColor=vec4(d/dt);}';
  var extForce_frag = 'precision highp float;uniform vec2 force;uniform vec2 center;uniform vec2 scale;uniform vec2 px;varying vec2 vUv;void main(){vec2 circle=(vUv-0.5)*2.0;float d=1.0-min(length(circle),1.0);d*=d;gl_FragColor=vec4(force*d,0.0,1.0);}';
  var poisson_frag = 'precision highp float;uniform sampler2D pressure;uniform sampler2D divergence;uniform vec2 px;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x*2.0,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x*2.0,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y*2.0)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y*2.0)).r;float div=texture2D(divergence,uv).r;gl_FragColor=vec4((p0+p1+p2+p3)/4.0-div);}';
  var pressure_frag = 'precision highp float;uniform sampler2D pressure;uniform sampler2D velocity;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){float p0=texture2D(pressure,uv+vec2(px.x,0.0)).r;float p1=texture2D(pressure,uv-vec2(px.x,0.0)).r;float p2=texture2D(pressure,uv+vec2(0.0,px.y)).r;float p3=texture2D(pressure,uv-vec2(0.0,px.y)).r;vec2 v=texture2D(velocity,uv).xy;v=v-vec2(p0-p1,p2-p3)*0.5*dt;gl_FragColor=vec4(v,0.0,1.0);}';
  var viscous_frag = 'precision highp float;uniform sampler2D velocity;uniform sampler2D velocity_new;uniform float v;uniform vec2 px;uniform float dt;varying vec2 uv;void main(){vec2 old=texture2D(velocity,uv).xy;vec2 n0=texture2D(velocity_new,uv+vec2(px.x*2.0,0.0)).xy;vec2 n1=texture2D(velocity_new,uv-vec2(px.x*2.0,0.0)).xy;vec2 n2=texture2D(velocity_new,uv+vec2(0.0,px.y*2.0)).xy;vec2 n3=texture2D(velocity_new,uv-vec2(0.0,px.y*2.0)).xy;vec2 nv=4.0*old+v*dt*(n0+n1+n2+n3);nv/=4.0*(1.0+v*dt);gl_FragColor=vec4(nv,0.0,0.0);}';

  // ── Compile programs ──
  var pAdv   = mkProg(face_vert,  advection_frag);
  var pAdvL  = mkProg(line_vert,  advection_frag);
  var pForce = mkProg(mouse_vert, extForce_frag);
  var pVisc  = mkProg(face_vert,  viscous_frag);
  var pDiv   = mkProg(face_vert,  divergence_frag);
  var pPoi   = mkProg(face_vert,  poisson_frag);
  var pPrs   = mkProg(face_vert,  pressure_frag);
  var pColor = mkProg(face_vert,  color_frag);

  // ── FBOs ──
  var simW, simH, cs, fs;
  var vel0, vel1, velV0, velV1, divFBO, prs0, prs1;

  function calcSim() {
    simW = Math.max(1, Math.round(resolution * cw));
    simH = Math.max(1, Math.round(resolution * ch));
    cs = v2(1/simW, 1/simH);
    fs = v2(simW, simH);
  }
  function initFBOs() {
    calcSim();
    vel0=mkFBO(simW,simH); vel1=mkFBO(simW,simH);
    velV0=mkFBO(simW,simH); velV1=mkFBO(simW,simH);
    divFBO=mkFBO(simW,simH); prs0=mkFBO(simW,simH); prs1=mkFBO(simW,simH);
  }
  function resizeFBOs() {
    calcSim();
    [vel0,vel1,velV0,velV1,divFBO,prs0,prs1].forEach(function(f){ rezFBO(f,simW,simH); });
  }
  initFBOs();

  var palTex = mkPalTex(colors);

  // ── Mouse state ──
  var M = {
    coords: v2(), coords_old: v2(), diff: v2(),
    isHover: false, hasUser: false, isAuto: false,
    autoIntensity: autoIntensity,
    takeoverActive: false, takeoverStart: 0,
    takeoverFrom: v2(), takeoverTo: v2(),
    onInteract: null
  };

  function inside(x, y) {
    var r = el.getBoundingClientRect();
    return r.width > 0 && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }
  function setCoords(x, y) {
    var r = el.getBoundingClientRect();
    if (!r.width || !r.height) return;
    v2s(M.coords, (x-r.left)/r.width*2-1, -((y-r.top)/r.height*2-1));
  }
  function onMM(e) {
    M.isHover = inside(e.clientX, e.clientY);
    if (!M.isHover) return;
    if (M.onInteract) M.onInteract();
    if (M.isAuto && !M.hasUser && !M.takeoverActive) {
      var r = el.getBoundingClientRect();
      v2c(M.takeoverFrom, M.coords);
      v2s(M.takeoverTo, (e.clientX-r.left)/r.width*2-1, -((e.clientY-r.top)/r.height*2-1));
      M.takeoverStart = performance.now();
      M.takeoverActive = true; M.hasUser = true; M.isAuto = false;
      return;
    }
    setCoords(e.clientX, e.clientY); M.hasUser = true;
  }
  function onTS(e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    if (!inside(t.clientX, t.clientY)) return;
    if (M.onInteract) M.onInteract();
    setCoords(t.clientX, t.clientY); M.hasUser = true;
  }
  function onTM(e) {
    if (e.touches.length !== 1) return;
    var t = e.touches[0];
    if (inside(t.clientX, t.clientY)) setCoords(t.clientX, t.clientY);
  }
  window.addEventListener('mousemove', onMM);
  window.addEventListener('touchstart', onTS, { passive: true });
  window.addEventListener('touchmove', onTM, { passive: true });
  window.addEventListener('touchend', function() { M.isHover = false; });
  document.addEventListener('mouseleave', function() { M.isHover = false; });

  function updateMouse() {
    if (M.takeoverActive) {
      var t = (performance.now() - M.takeoverStart) / (takeoverDur * 1000);
      if (t >= 1) {
        M.takeoverActive = false;
        v2c(M.coords, M.takeoverTo); v2c(M.coords_old, M.coords); v2s(M.diff, 0, 0);
      } else {
        var k = t*t*(3-2*t);
        v2s(M.coords,
          M.takeoverFrom.x + (M.takeoverTo.x - M.takeoverFrom.x) * k,
          M.takeoverFrom.y + (M.takeoverTo.y - M.takeoverFrom.y) * k);
      }
    }
    v2sub(M.diff, M.coords, M.coords_old);
    v2c(M.coords_old, M.coords);
    if (M.coords_old.x === 0 && M.coords_old.y === 0) v2s(M.diff, 0, 0);
    if (M.isAuto && !M.takeoverActive) v2muls(M.diff, M.autoIntensity);
  }

  // ── AutoDriver ──
  var A = {
    enabled: autoDemo, speed: autoSpeed, resumeDelay: autoResumeDelay,
    rampMs: autoRampDuration * 1000,
    active: false, cur: v2(), tgt: v2(), lastT: performance.now(),
    actT: 0, margin: 0.2, dir: v2()
  };
  var lastInteract = performance.now();

  function pickTgt() { v2s(A.tgt, (Math.random()*2-1)*(1-A.margin), (Math.random()*2-1)*(1-A.margin)); }
  pickTgt();

  function updateAuto() {
    if (!A.enabled) return;
    var now = performance.now();
    if (now - lastInteract < A.resumeDelay) { if (A.active) { A.active = false; M.isAuto = false; } return; }
    if (M.isHover) { if (A.active) { A.active = false; M.isAuto = false; } return; }
    if (!A.active) { A.active = true; v2c(A.cur, M.coords); A.lastT = now; A.actT = now; }
    M.isAuto = true;
    var dts = Math.min((now - A.lastT) / 1000, 0.2); A.lastT = now;
    v2sub(A.dir, A.tgt, A.cur);
    var dist = v2len(A.dir);
    if (dist < 0.01) { pickTgt(); return; }
    v2norm(A.dir);
    var ramp = 1;
    if (A.rampMs > 0) { var tp = Math.min(1, (now-A.actT)/A.rampMs); ramp = tp*tp*(3-2*tp); }
    v2adds(A.cur, A.dir, Math.min(A.speed*dts*ramp, dist));
    v2s(M.coords, A.cur.x, A.cur.y);
  }

  M.onInteract = function() { lastInteract = performance.now(); A.active = false; M.isAuto = false; };

  // ── Simulation ──
  function simStep() {
    var bsX = isBounce ? 0 : cs.x, bsY = isBounce ? 0 : cs.y;

    // Advection (face quad)
    bindFBO(vel1); resetTex(); useQuad(pAdv);
    u2f(pAdv,'boundarySpace',cs.x,cs.y); u2f(pAdv,'px',cs.x,cs.y);
    u2f(pAdv,'fboSize',fs.x,fs.y); bindTex(pAdv,'velocity',vel0.texture);
    u1f(pAdv,'dt',dt); u1i(pAdv,'isBFECC',BFECC?1:0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Boundary lines (only when isBounce)
    if (isBounce) {
      gl.useProgram(pAdvL);
      gl.bindBuffer(gl.ARRAY_BUFFER, lineBuf);
      var lp = gl.getAttribLocation(pAdvL,'position');
      gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp,3,gl.FLOAT,false,12,0);
      resetTex(); u2f(pAdvL,'px',cs.x,cs.y); u2f(pAdvL,'fboSize',fs.x,fs.y);
      bindTex(pAdvL,'velocity',vel0.texture); u1f(pAdvL,'dt',dt); u1i(pAdvL,'isBFECC',BFECC?1:0);
      gl.drawArrays(gl.LINES, 0, 8);
    }

    // External force (additive blend)
    bindFBO(vel1);
    gl.useProgram(pForce); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
    gl.bindBuffer(gl.ARRAY_BUFFER, mouseBuf);
    var fp = gl.getAttribLocation(pForce,'position'), fu = gl.getAttribLocation(pForce,'uv');
    gl.enableVertexAttribArray(fp); gl.vertexAttribPointer(fp,3,gl.FLOAT,false,20,0);
    if (fu>=0) { gl.enableVertexAttribArray(fu); gl.vertexAttribPointer(fu,2,gl.FLOAT,false,20,12); }
    var fx=(M.diff.x/2)*mouseForce, fy=(M.diff.y/2)*mouseForce;
    var csx=cursorSize*cs.x, csy=cursorSize*cs.y;
    var cx=Math.min(Math.max(M.coords.x,-1+csx+cs.x*2),1-csx-cs.x*2);
    var cy=Math.min(Math.max(M.coords.y,-1+csy+cs.y*2),1-csy-cs.y*2);
    resetTex(); u2f(pForce,'px',cs.x,cs.y); u2f(pForce,'force',fx,fy);
    u2f(pForce,'center',cx,cy); u2f(pForce,'scale',cursorSize,cursorSize);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.disable(gl.BLEND);

    // Viscous iterations
    var velR = vel1;
    if (isViscous) {
      var vIn, vOut;
      for (var vi=0; vi<iterationsViscous; vi++) {
        vIn = (vi%2===0)?velV0:velV1; vOut = (vi%2===0)?velV1:velV0;
        bindFBO(vOut); resetTex(); useQuad(pVisc);
        u2f(pVisc,'boundarySpace',bsX,bsY); u2f(pVisc,'px',cs.x,cs.y);
        bindTex(pVisc,'velocity',vel1.texture); bindTex(pVisc,'velocity_new',vIn.texture);
        u1f(pVisc,'v',viscous); u1f(pVisc,'dt',dt);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      velR = vOut;
    }

    // Divergence
    bindFBO(divFBO); resetTex(); useQuad(pDiv);
    u2f(pDiv,'boundarySpace',bsX,bsY); u2f(pDiv,'px',cs.x,cs.y);
    bindTex(pDiv,'velocity',velR.texture); u1f(pDiv,'dt',dt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Poisson pressure solve
    var prIn, prOut;
    for (var pi=0; pi<iterationsPoisson; pi++) {
      prIn=(pi%2===0)?prs0:prs1; prOut=(pi%2===0)?prs1:prs0;
      bindFBO(prOut); resetTex(); useQuad(pPoi);
      u2f(pPoi,'boundarySpace',bsX,bsY); u2f(pPoi,'px',cs.x,cs.y);
      bindTex(pPoi,'pressure',prIn.texture); bindTex(pPoi,'divergence',divFBO.texture);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    // Pressure gradient subtract → vel0
    bindFBO(vel0); resetTex(); useQuad(pPrs);
    u2f(pPrs,'boundarySpace',bsX,bsY); u2f(pPrs,'px',cs.x,cs.y);
    bindTex(pPrs,'pressure',prOut.texture); bindTex(pPrs,'velocity',velR.texture);
    u1f(pPrs,'dt',dt);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Output to canvas
    bindFBO(null); resetTex(); useQuad(pColor);
    u2f(pColor,'boundarySpace',0,0);
    bindTex(pColor,'velocity',vel0.texture); bindTex(pColor,'palette',palTex);
    u4f(pColor,'bgColor',0,0,0,0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ── Inactivity pause (stops after 2s of no interaction, like 200iq site) ──
  var INACTIVITY_MS = 1000;
  var inactivityTimer = null;

  function scheduleInactivityPause() {
    if (inactivityTimer) clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(function() { pause(); }, INACTIVITY_MS);
  }

  function onUserActivity() {
    lastInteract = performance.now();
    A.active = false; M.isAuto = false;
    if (!running && isVis && !document.hidden) start();
    scheduleInactivityPause();
  }

  window.addEventListener('mousemove', onUserActivity, { passive: true });
  window.addEventListener('touchstart', onUserActivity, { passive: true });
  window.addEventListener('touchmove', onUserActivity, { passive: true });

  // ── Loop ──
  var raf = null, running = false, isVis = true;

  function loop() {
    if (!running) return;
    updateAuto(); updateMouse(); simStep();
    raf = requestAnimationFrame(loop);
  }
  function start() { if (running) return; running = true; loop(); scheduleInactivityPause(); }
  function pause() { running = false; if (raf) { cancelAnimationFrame(raf); raf = null; } if (inactivityTimer) { clearTimeout(inactivityTimer); inactivityTimer = null; } }

  // ── Resize ──
  var rezRaf = null;
  window.addEventListener('resize', function() {
    if (rezRaf) cancelAnimationFrame(rezRaf);
    rezRaf = requestAnimationFrame(function() { resizeCanvas(); resizeFBOs(); });
  });

  // ── Visibility / intersection ──
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) pause(); else if (isVis) start();
  });
  new IntersectionObserver(function(entries) {
    isVis = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
    isVis && !document.hidden ? start() : pause();
  }, { threshold: [0, 0.01, 0.1] }).observe(el);

  requestAnimationFrame(function() { resizeCanvas(); resizeFBOs(); start(); });
})();
