/**
 * Silk — Vanilla WebGL port of the React Bits Silk component.
 * Renders a procedural silk-like shader on a canvas element.
 *
 * Usage:
 *   Silk(canvasElement, {
 *     speed: 5,
 *     scale: 1,
 *     color: '#7B7481',
 *     noiseIntensity: 1.5,
 *     rotation: 0
 *   });
 */
function Silk(canvas, options = {}) {
  const {
    speed = 5,
    scale = 1,
    color = '#7B7481',
    noiseIntensity = 1.5,
    rotation = 0
  } = options;

  /* ---- colour helper ---- */
  const hexToRGB = (hex) => {
    hex = hex.replace('#', '');
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255
    ];
  };

  /* ---- shaders ---- */
  const vertSrc = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const fragSrc = `
    precision mediump float;
    varying vec2 vUv;

    uniform float uTime;
    uniform vec3  uColor;
    uniform float uSpeed;
    uniform float uScale;
    uniform float uRotation;
    uniform float uNoiseIntensity;

    const float e = 2.71828182845904523536;

    float noise(vec2 texCoord) {
      float G = e;
      vec2  r = (G * sin(G * texCoord));
      return fract(r.x * r.y * (1.0 + texCoord.x));
    }

    vec2 rotateUvs(vec2 uv, float angle) {
      float c = cos(angle);
      float s = sin(angle);
      mat2  rot = mat2(c, -s, s, c);
      return rot * uv;
    }

    void main() {
      float rnd     = noise(gl_FragCoord.xy);
      vec2  uv      = rotateUvs(vUv * uScale, uRotation);
      vec2  tex     = uv * uScale;
      float tOffset = uSpeed * uTime;

      tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

      float pattern = 0.6 +
                      0.4 * sin(5.0 * (tex.x + tex.y +
                                       cos(3.0 * tex.x + 5.0 * tex.y) +
                                       0.02 * tOffset) +
                               sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

      vec4 col = vec4(uColor, 1.0) * vec4(vec3(pattern), 1.0) - rnd / 15.0 * uNoiseIntensity;
      col.a = 1.0;
      gl_FragColor = col;
    }
  `;

  /* ---- WebGL setup ---- */
  const gl = canvas.getContext('webgl', { alpha: false, antialias: false });
  if (!gl) { console.warn('Silk: WebGL not available'); return; }

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      console.error('Silk shader error:', gl.getShaderInfoLog(s));
    }
    return s;
  };

  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, vertSrc));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, fragSrc));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  /* full-screen quad (-1…1) */
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

  const aPos = gl.getAttribLocation(prog, 'aPosition');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  /* uniforms */
  const uTime           = gl.getUniformLocation(prog, 'uTime');
  const uColor          = gl.getUniformLocation(prog, 'uColor');
  const uSpeed          = gl.getUniformLocation(prog, 'uSpeed');
  const uScale          = gl.getUniformLocation(prog, 'uScale');
  const uRotation       = gl.getUniformLocation(prog, 'uRotation');
  const uNoiseIntensity = gl.getUniformLocation(prog, 'uNoiseIntensity');

  const rgb = hexToRGB(color);
  gl.uniform3f(uColor, rgb[0], rgb[1], rgb[2]);
  gl.uniform1f(uSpeed, speed);
  gl.uniform1f(uScale, scale);
  gl.uniform1f(uRotation, rotation);
  gl.uniform1f(uNoiseIntensity, noiseIntensity);

  let time = 0;
  let animId = null;

  /* ---- resize ---- */
  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * dpr;
    canvas.height = rect.height * dpr;
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  /* ---- render loop ---- */
  const render = () => {
    time += 0.016;            // ~60 fps tick
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    animId = requestAnimationFrame(render);
  };

  resize();
  render();

  let resizeTimer;
  const onResize = () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 100);
  };
  window.addEventListener('resize', onResize);

  /* ---- cleanup ---- */
  return function destroy() {
    cancelAnimationFrame(animId);
    window.removeEventListener('resize', onResize);
  };
}
