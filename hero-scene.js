// 주변 큐브 조절 — 저장 후 http://127.0.0.1:5175/ 에서 확인하세요.
// spreadX / spreadY: 작을수록 중앙으로 모임. size: 주변 큐브 크기 배율.
// 사용자가 마지막으로 저장한 값을 유지했습니다.
const SATELLITE_SETTINGS = { spreadX: 0.85, spreadY: 0.9, size: 1.6 };

import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
const container = document.getElementById("heroScene");
const stage = document.querySelector(".hero-sticky");
const heading = document.querySelector(".heading-first");
const hero = document.getElementById("heroScroll");
const about = document.getElementById("about");
const build = document.getElementById("how-we-build");
const business = document.getElementById("our-business");
// Business cube: viewport fraction; change .19 to adjust its size.
const BUSINESS_CUBE_SIZE = .19;
const businessPointer = { x: .76, y: .4 };
addEventListener('pointermove', event => {
  if (event.pointerType === 'touch') return;
  businessPointer.x = event.clientX / innerWidth;
  businessPointer.y = event.clientY / innerHeight;
}, {passive:true});
// One persistent canvas across both chapters: no cube remount or visual jump.
document.body.insertBefore(container, document.querySelector("main"));
const aboutAnchor = document.createElement("div");
aboutAnchor.className = "about-cube-anchor";
aboutAnchor.style.cssText =
  "position:fixed;left:var(--about-cube-x);top:var(--about-cube-y);width:100px;height:100px;transform:scale(var(--about-cube-scale));transform-origin:top left;visibility:hidden;pointer-events:none";
document.body.appendChild(aboutAnchor);
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
const isMobile = innerWidth < 768;
// Resolve CSS units through layout, so px/vw/vh/calc all work.
const cssAnchor = document.createElement("div");
cssAnchor.className = "cube-css-anchor";
cssAnchor.setAttribute("aria-hidden", "true");
stage.appendChild(cssAnchor);

try {
  let addPanel = function (x, y, w, h, color, blur = 0) {
      envCtx.save();
      envCtx.shadowColor = color;
      envCtx.shadowBlur = blur;
      envCtx.fillStyle = color;
      envCtx.fillRect(x, y, w, h);
      envCtx.restore();
    },
    updateWater = function (time, delta = 0.016, sloshMultiplier = 1) {
      const positions = waterGeometry.attributes.position;
      const step = Math.min(Math.max(delta, 1e-3), 0.033);
      if (
        waterMotion.lastRotationX !== null &&
        waterMotion.lastRotationY !== null &&
        waterMotion.lastRotationZ !== null
      ) {
        const dx = cubeGroup.rotation.x - waterMotion.lastRotationX;
        const dy = cubeGroup.rotation.y - waterMotion.lastRotationY;
        const dz = cubeGroup.rotation.z - waterMotion.lastRotationZ;
        waterMotion.spinX = dx / step;
        waterMotion.spinY = dy / step;
        waterMotion.spinZ = dz / step;
      }
      waterMotion.lastRotationX = cubeGroup.rotation.x;
      waterMotion.lastRotationY = cubeGroup.rotation.y;
      waterMotion.lastRotationZ = cubeGroup.rotation.z;
      const targetX = THREE.MathUtils.clamp(
        -waterMotion.spinX * 0.18 * sloshMultiplier,
        -0.65,
        0.65,
      );
      const targetZ = THREE.MathUtils.clamp(
        -(waterMotion.spinY * 0.12 + waterMotion.spinZ * 0.18) *
          sloshMultiplier,
        -0.65,
        0.65,
      );
      waterMotion.velocityX += (targetX - waterMotion.tiltX) * 14 * step;
      waterMotion.velocityZ += (targetZ - waterMotion.tiltZ) * 14 * step;
      waterMotion.velocityX *= Math.exp(-3 * step);
      waterMotion.velocityZ *= Math.exp(-3 * step);
      waterMotion.tiltX += waterMotion.velocityX * step;
      waterMotion.tiltZ += waterMotion.velocityZ * step;
      const motion = Math.min(
        1,
        (Math.abs(waterMotion.spinX) * 0.8 +
          Math.abs(waterMotion.spinY) * 0.5 +
          Math.abs(waterMotion.spinZ) * 0.8) *
          sloshMultiplier,
      );
      for (let i = 0; i < positions.count; i++) {
        const x = waterBasePositions[i * 3];
        const z = waterBasePositions[i * 3 + 2];
        const edgeDistance = Math.min(
          waterSize / 2 - Math.abs(x),
          waterSize / 2 - Math.abs(z),
        );
        const edgeFade = THREE.MathUtils.smoothstep(edgeDistance, 0, 0.28);
        const wave1 = Math.sin(x * 2.5 + time * 2.2) * 0.045;
        const wave2 = Math.cos(z * 3 - time * 1.8) * 0.035;
        const wave3 = Math.sin((x + z) * 2.4 + time * 2.7) * 0.025;
        const wave4 =
          Math.sin(x * 4 - z * 2.5 + time * 3.2) * (0.012 + motion * 0.045);
        const tilt = x * waterMotion.tiltX + z * waterMotion.tiltZ;
        const slosh = Math.sin(x * 1.6 - z * 1.1 + time * 2) * motion * 0.07;
        positions.setY(
          i,
          tilt + (wave1 + wave2 + wave3 + wave4 + slosh) * edgeFade,
        );
      }
      positions.needsUpdate = true;
      waterGeometry.computeVertexNormals();
    },
    resize = function () {
      const width = container.clientWidth,
        height = container.clientHeight;
      camera.aspect = width / height;
      camera.position.z = 7.2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(
        Math.min(devicePixelRatio, isSoftwareGl ? 1 : 1.5),
      );
      locate();
    },
    locate = function () {
      const rect = range.getBoundingClientRect(),
        bounds = stage.getBoundingClientRect();
      const height = container.clientHeight,
        width = container.clientWidth;
      const size =
        1.2 * Math.max(70, Math.min(width * 0.09, 165, height * 0.17));
      const x = rect.left + rect.width / 2 - bounds.left;
      const y = Math.max(130, rect.top - bounds.top + size * 0.12);
      const cssRect = cssAnchor.getBoundingClientRect();
      const cssOffsetX = cssRect.left - bounds.left;
      const cssOffsetY = cssRect.top - bounds.top;
      const cssScale = Math.max(0.05, cssRect.width / 100);
      const aboutRect = about.getBoundingClientRect();
      const travel = reduced.matches
        ? 0
        : Math.max(0, Math.min(1, 1 - aboutRect.top / height));
      const waveTravel = Math.max(
        0,
        Math.min(1, (height * 1.5 - aboutRect.top) / (height * 0.5)),
      );
      const waveFade = waveTravel * waveTravel * (3 - 2 * waveTravel);
      waveUniforms.uOpacity.value = 0.24 * (1 - waveFade);
      wavePoints.visible = waveLines.visible = waveFade < 0.999;
      const end = aboutAnchor.getBoundingClientRect();
      const startX = x + cssOffsetX;
      const startY = y + cssOffsetY;
      const u = travel * travel * (3 - 2 * travel);
      const v = 1 - u;
      // Cubic Bezier: right of hero -> low sweeping arc -> left/centre of ABOUT.
      const pathX =
        v * v * v * startX +
        3 * v * v * u * (width * 0.82) +
        3 * v * u * u * (width * 0.16) +
        u * u * u * end.left;
      const pathY =
        v * v * v * startY +
        3 * v * v * u * (height * 0.78) +
        3 * v * u * u * (height * 0.72) +
        u * u * u * end.top;
      const pathScale = cssScale * (1 - u) + (end.width / 100) * u;
      cubeGroup.visible = !reduced.matches || aboutRect.top > height * 0.6;
      const worldHeight =
        2 *
        Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
        camera.position.z;
      anchor.x = (pathX / width - 0.5) * worldHeight * camera.aspect;
      anchor.y = (0.5 - pathY / height) * worldHeight + camera.position.y;
      anchor.scale =
        (((size / height) * worldHeight) / cubeSize / 1.3) * pathScale;
    },
    draw = function (stamp) {
      frame = 0;
      if (!visible || document.hidden) {
        previous = 0;
        return;
      }
      const delta = previous ? Math.min((stamp - previous) / 1e3, 0.04) : 0.016;
      previous = stamp;
      if (!reduced.matches) elapsed += delta;
      const t = reduced.matches ? 0 : elapsed;
      locate();
      cubeGroup.position.set(anchor.x, anchor.y + Math.sin(t * 0.8) * 0.045, 0);
      const aboutTop = about.getBoundingClientRect().top;
      const scatterTarget = !reduced.matches && aboutTop < -8 ? 1 : 0;
      scatter = THREE.MathUtils.damp(scatter, scatterTarget, 4.2, delta);
      if (scatter < 0.001) scatter = 0;
      container.dataset.scatter = scatter.toFixed(2);
      cubeGroup.scale.setScalar(anchor.scale * (1 - 0.42 * scatter));
      updateSatellites(t, scatter);
      updateBuildRing(t, delta);
      updateBusinessCube(delta);
      const scrollDelta = scrollY - cubeLastScrollY;
      const scrollSpeed = Math.abs(scrollDelta) / Math.max(delta, .001);
      cubeLastScrollY = scrollY;
      const boostTarget = reduced.matches ? 0 : Math.min(scrollSpeed / 1400, 1);
      cubeScrollBoost = THREE.MathUtils.damp(cubeScrollBoost, boostTarget, boostTarget > cubeScrollBoost ? 7 : 3, delta);
      if (!reduced.matches) cubeSpin += delta * (.09 + cubeScrollBoost * .42);
      // Business only: scroll distance drives a spring, so each wheel movement
      // creates a clear turn, a little overshoot, then a gentle settling motion.
      if (!reduced.matches && businessCubeReveal > .01) {
        businessSpinTarget += THREE.MathUtils.clamp(scrollDelta, -180, 180) * .005;
        businessSpinVelocity += ((businessSpinTarget - businessSpinAngle) * 85 - businessSpinVelocity * 12) * delta;
        businessSpinVelocity = THREE.MathUtils.clamp(businessSpinVelocity, -4.5, 4.5);
        businessSpinAngle += businessSpinVelocity * delta;
      } else {
        businessSpinTarget = businessSpinAngle = businessSpinVelocity = 0;
      }
      cubeGroup.rotation.set(
        0.32 + Math.sin(t * 0.24) * 0.045 + businessSpinVelocity * .045 * businessCubeReveal,
        0.55 + cubeSpin + businessSpinAngle * businessCubeReveal,
        0.08 + Math.sin(t * 0.3) * 0.025 - businessSpinVelocity * .025 * businessCubeReveal,
      );
      container.dataset.businessSpin = businessSpinAngle.toFixed(3);

      const k = anchor.scale;
      const at = (light, x, y, z, power) => {
        light.position.set(
          anchor.x + x * k,
          cubeGroup.position.y + y * k,
          z * k,
        );
        light.intensity = power * k * k;
        light.distance = 12 * k;
      };
      at(
        cyanLight,
        -3.5 + Math.sin(t * 0.45) * 1.2,
        1.5 + Math.sin(t * 0.32) * 0.45,
        2.5 + Math.cos(t * 0.35) * 0.6,
        35,
      );
      at(
        blueLight,
        3 + Math.sin(t * 0.32) * 0.8,
        0.5 + Math.cos(t * 0.28) * 0.6,
        -3 + Math.cos(t * 0.3) * 0.5,
        45,
      );
      at(
        warmLight,
        3.5 + Math.sin(t * 0.22) * 0.5,
        2 + Math.cos(t * 0.26) * 0.35,
        2,
        16,
      );
      at(
        bottomLight,
        Math.sin(t * 0.25) * 0.7,
        -3,
        2 + Math.cos(t * 0.24) * 0.4,
        12,
      );

      updateWater(t, delta, 0.5);
      waveUniforms.uTime.value = t;
      waveUniforms.uSpeed.value = 1.6;
      waveUniforms.uScroll.value = 0;
      renderer.render(scene, camera);
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    },
    resume = function () {
      if (!frame) frame = requestAnimationFrame(draw);
    };
  const isSoftwareGl = (() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    if (!gl) return true;
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
    const gpu = String(gl.getParameter(param));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
  })();
  const scene = new THREE.Scene();
  // A real scene background is required by the glass transmission pass.
  scene.background = new THREE.Color(0x090d14);
  scene.fog = new THREE.FogExp2(329484, 0.032);
  const camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    100,
  );
  camera.position.set(0, 1.2, isMobile ? 9.8 : 7.2);
  const renderer = new THREE.WebGLRenderer({
    antialias: !isSoftwareGl,
    powerPreference: "high-performance",
    alpha: true,
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(
    isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2),
  );
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  container.appendChild(renderer.domElement);
  const envCanvas = document.createElement("canvas");
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const envCtx = envCanvas.getContext("2d");
  const bg = envCtx.createLinearGradient(0, 0, 0, 512);
  bg.addColorStop(0, "#29384c");
  bg.addColorStop(0.45, "#101a2a");
  bg.addColorStop(1, "#030711");
  envCtx.fillStyle = bg;
  envCtx.fillRect(0, 0, 1024, 512);
  addPanel(240, 45, 260, 95, "#ffffff", 18);
  addPanel(80, 105, 90, 280, "#36e6ff", 16);
  addPanel(430, 150, 80, 210, "#dcefff", 10);
  addPanel(690, 85, 110, 300, "#285cff", 18);
  addPanel(850, 145, 45, 185, "#ff765e", 10);
  const customEnv = new THREE.CanvasTexture(envCanvas);
  customEnv.mapping = THREE.EquirectangularReflectionMapping;
  customEnv.colorSpace = THREE.SRGBColorSpace;
  customEnv.needsUpdate = true;
  scene.environment = customEnv;
  scene.environmentIntensity = 0.55;
  const ambient = new THREE.HemisphereLight(14282751, 1054763, 1.2);
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight(15398911, 3.2);
  keyLight.position.set(-3, 6, 4);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(11984895, 1.5);
  fillLight.position.set(4, 1, 6);
  scene.add(fillLight);
  const cyanLight = new THREE.PointLight(1302527, 35, 10, 2);
  cyanLight.position.set(-3.5, 1.5, 2.5);
  scene.add(cyanLight);
  const blueLight = new THREE.PointLight(2643455, 45, 11, 2);
  blueLight.position.set(3, 0.5, -3);
  scene.add(blueLight);
  const warmLight = new THREE.PointLight(16738381, 16, 8, 2);
  warmLight.position.set(3.5, 2, 2);
  scene.add(warmLight);
  const bottomLight = new THREE.PointLight(3771391, 12, 8, 2);
  bottomLight.position.set(0, -3, 2);
  scene.add(bottomLight);
  const pointSize = 1.7;
  const waveTexture = new THREE.TextureLoader().load(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8v0wLRAAAAJHRSTlMAC/goGvDhmwcExrVjWzrm29TRqqSKenRXVklANSIUE8mRkGpv+HOfAAABCElEQVQ4y4VT13LDMAwLrUHteO+R9f/fWMfO6dLaPeKVEECRxOULWsEGpS9nULDwia2Y+ALqUNbAWeg775zv+sA4/FFRMxt8U2FZFCVWjR/YrH4/H9sarclSKdPMWKzb8VsEeHB3m0shkhVCyNzeXeAQ9Xl4opEieX2QCGnwGbj6GMyjw9t1K0fK9YZunPXeAGsfJtYjwzxaBnozGGorYz0ypK2HzQSYx1y8DgSRo2ewOiyh2QWOEk1Y9OrQV0a8TiBM1a8eMHWYnRMy7CZ4t1CmyRkhSUvP3gRXyHOCLBxNoC3IJv//ZrJ/kxxUHPUB+6jJZZHrpg6GOjnqaOmzp4NDR48OLxn/H27SRQ08S0ZJAAAAAElFTkSuQmCC",
  );
  const gridCols = isSoftwareGl || isMobile ? 64 : 100;
  const gridRows = isSoftwareGl || isMobile ? 64 : 100;
  const fieldWidth = 52;
  const fieldDepth = 46;
  const fieldHeight = 0.46;
  const halfW = fieldWidth / 2;
  const halfD = fieldDepth / 2;
  const pointPositions = [];
  const pointColors = [];
  const linePositions = [];
  for (let r = 0; r < gridRows; r++) {
    const z = (r / (gridRows - 1)) * fieldDepth - halfD;
    for (let c = 0; c < gridCols; c++) {
      const x = (c / (gridCols - 1)) * fieldWidth - halfW;
      pointPositions.push(x, 0, z);
      const nx = (x + halfW) / fieldWidth;
      const nz = (z + halfD) / fieldDepth;
      const cr = THREE.MathUtils.lerp(0.06, 0.28, nx);
      const cg = THREE.MathUtils.lerp(0.45, 0.88, 1 - nz * 0.7);
      const cb = THREE.MathUtils.lerp(0.75, 1, nx * 0.4 + 0.6);
      const ca = THREE.MathUtils.lerp(0.45, 0.9, 1 - nz * 0.55);
      pointColors.push(cr, cg, cb, ca);
      if (c < gridCols - 1) {
        const xNext = ((c + 1) / (gridCols - 1)) * fieldWidth - halfW;
        linePositions.push(x, 0, z, xNext, 0, z);
      }
      if (r < gridRows - 1) {
        const zNext = ((r + 1) / (gridRows - 1)) * fieldDepth - halfD;
        linePositions.push(x, 0, z, x, 0, zNext);
      }
    }
  }
  const wavePointsGeom = new THREE.BufferGeometry();
  wavePointsGeom.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(pointPositions, 3),
  );
  wavePointsGeom.setAttribute(
    "aColor",
    new THREE.Float32BufferAttribute(pointColors, 4),
  );
  const waveUniforms = {
    uTime: { value: 0 },
    uOpacity: { value: 0.24 },
    uSpeed: { value: 5 },
    uSize: { value: pointSize },
    uField: { value: new THREE.Vector3(fieldWidth, fieldHeight, fieldDepth) },
    uScroll: { value: 0 },
    uTexture: { value: waveTexture },
    uWireframeMode: { value: 0 },
  };
  const waveVertexShader = `
      #define M_PI 3.1415926535897932384626433832795

      attribute vec4 aColor;

      uniform float uTime;
      uniform float uSize;
      uniform float uSpeed;
      uniform vec3 uField;
      uniform float uScroll;
      uniform float uWireframeMode;
      uniform float uOpacity;

      varying vec4 vColor;
      varying float vElevation;
      varying float vDist;

      void main() {
        vec3 pos = position;

        // Exact Boris \u0160ehovac wave displacement formula with 20% reduced height:
        pos.y += (cos(pos.x / uField.x * M_PI * 8.0 + uTime * (uSpeed * 0.28)) +
                  sin(pos.z / uField.z * M_PI * 8.0 + uTime * (uSpeed * 0.28))) * uField.y;

        pos.y -= 2.0 + (uScroll * 0.8);
        vElevation = pos.y;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vDist = -mvPosition.z;
        gl_Position = projectionMatrix * mvPosition;

        // Smaller, crisper particle size with perspective depth attenuation
        float pSize = (uSize / -mvPosition.z) * 44.0;
        if (uWireframeMode > 0.5) {
          pSize *= 1.3;
        }
        gl_PointSize = max(1.0, pSize);

        vColor = aColor;
      }
    `;
  const waveFragmentShader = `
      precision highp float;

      uniform sampler2D uTexture;
      uniform float uWireframeMode;
      uniform float uOpacity;

      varying vec4 vColor;
      varying float vElevation;
      varying float vDist;

      void main() {
        vec4 texColor = texture2D(uTexture, gl_PointCoord);
        if (texColor.a < 0.05) discard;

        float fogFactor = smoothstep(4.0, 38.0, vDist);
        float alpha = mix(vColor.a, 0.0, fogFactor) * texColor.a;

        float crest = smoothstep(-2.4, -1.6, vElevation);
        vec3 col = mix(vColor.rgb, vec3(0.8, 0.95, 1.0), crest * 0.45);

        if (uWireframeMode > 0.5) {
          col = mix(col, vec3(0.5, 0.85, 1.0), 0.35);
          alpha = min(1.0, alpha * 1.3);
        }

        gl_FragColor = vec4(col, alpha * uOpacity);
      }
    `;
  const wavePointsMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: waveUniforms,
    vertexShader: waveVertexShader,
    fragmentShader: waveFragmentShader,
  });
  const wavePoints = new THREE.Points(wavePointsGeom, wavePointsMaterial);
  wavePoints.position.set(0, 0, -4);
  scene.add(wavePoints);
  const waveLinesGeom = new THREE.BufferGeometry();
  waveLinesGeom.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(linePositions, 3),
  );
  const waveLinesMaterial = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: waveUniforms,
    vertexShader: `
        #define M_PI 3.1415926535897932384626433832795

        uniform float uTime;
        uniform float uSpeed;
        uniform vec3 uField;
        uniform float uScroll;
        varying float vElevation;
        varying float vDist;

        void main() {
          vec3 pos = position;
          pos.y += (cos(pos.x / uField.x * M_PI * 8.0 + uTime * (uSpeed * 0.28)) +
                    sin(pos.z / uField.z * M_PI * 8.0 + uTime * (uSpeed * 0.28))) * uField.y;
          pos.y -= 2.0 + (uScroll * 0.8);
          vElevation = pos.y;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          vDist = -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
    fragmentShader: `
        precision highp float;
        uniform float uWireframeMode;
        uniform float uOpacity;
        varying float vElevation;
        varying float vDist;

        void main() {
          float fogFactor = smoothstep(4.0, 36.0, vDist);
          float alpha = mix(uWireframeMode > 0.5 ? 0.35 : 0.12, 0.0, fogFactor);
          float crest = smoothstep(-2.4, -1.6, vElevation);
          vec3 col = mix(vec3(0.08, 0.3, 0.55), vec3(0.4, 0.8, 1.0), crest);
          gl_FragColor = vec4(col, alpha * uOpacity);
        }
      `,
  });
  const waveLines = new THREE.LineSegments(waveLinesGeom, waveLinesMaterial);
  waveLines.position.set(0, 0, -4);
  scene.add(waveLines);
  const cubeGroup = new THREE.Group();
  scene.add(cubeGroup);
  const cubeSize = 2.5;
  const cubeGeometry = new RoundedBoxGeometry(
    cubeSize,
    cubeSize,
    cubeSize,
    8,
    0.11,
  );
  const glassMaterial = new THREE.MeshPhysicalMaterial({
    color: 16777215,
    metalness: 0,
    roughness: 0.055,
    transmission: 1,
    thickness: 0.28,
    ior: 1.25,
    envMapIntensity: 0.45,
    clearcoat: 0.65,
    clearcoatRoughness: 0.045,
    transparent: false,
    opacity: 1,
  });
  const cube = new THREE.Mesh(cubeGeometry, glassMaterial);
  cubeGroup.add(cube);
  const waterSize = 2.22;
  const waterBottom = -1.2;
  const waterLevel = 0.25;
  const waterDepth = waterLevel - waterBottom;
  const waterGroup = new THREE.Group();
  cube.add(waterGroup);
  const waterMaterial = new THREE.MeshPhysicalMaterial({
    color: 556974,
    metalness: 0.08,
    roughness: 0.2,
    transparent: true,
    opacity: 0.48,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const sideGeometry = new THREE.PlaneGeometry(waterSize, waterDepth);
  const sideY = waterBottom + waterDepth / 2;
  const sideDefinitions = [
    { x: 0, y: sideY, z: -waterSize / 2, ry: 0 },
    { x: 0, y: sideY, z: waterSize / 2, ry: Math.PI },
    { x: -waterSize / 2, y: sideY, z: 0, ry: -Math.PI / 2 },
    { x: waterSize / 2, y: sideY, z: 0, ry: Math.PI / 2 },
  ];
  sideDefinitions.forEach((p) => {
    const side = new THREE.Mesh(sideGeometry, waterMaterial);
    side.position.set(p.x, p.y, p.z);
    side.rotation.y = p.ry;
    waterGroup.add(side);
  });
  const bottomGeometry = new THREE.PlaneGeometry(waterSize, waterSize);
  const waterBottomMesh = new THREE.Mesh(bottomGeometry, waterMaterial);
  waterBottomMesh.rotation.x = -Math.PI / 2;
  waterBottomMesh.position.y = waterBottom + 5e-3;
  waterGroup.add(waterBottomMesh);
  const segments = isSoftwareGl ? 32 : 48;
  const waterGeometry = new THREE.PlaneGeometry(
    waterSize,
    waterSize,
    segments,
    segments,
  );
  waterGeometry.rotateX(-Math.PI / 2);
  const waterEdgePositions = waterGeometry.attributes.position;
  for (let i = 0; i < waterEdgePositions.count; i++) {
    const x = waterEdgePositions.getX(i);
    const z = waterEdgePositions.getZ(i);
    const half = waterSize / 2;
    const cornerRadius = 0.12;
    const innerX = Math.max(0, Math.abs(x) - (half - cornerRadius));
    const innerZ = Math.max(0, Math.abs(z) - (half - cornerRadius));
    if (innerX > 0 && innerZ > 0) {
      const distance = Math.sqrt(innerX * innerX + innerZ * innerZ);
      if (distance > cornerRadius) {
        const scale = cornerRadius / distance;
        waterEdgePositions.setX(i, x * scale);
        waterEdgePositions.setZ(i, z * scale);
      }
    }
  }
  const waterSurfaceMaterial = new THREE.MeshPhysicalMaterial({
    color: 143176,
    metalness: 0,
    roughness: 0.1,
    side: THREE.DoubleSide,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    ior: 1.333,
    specularIntensity: 1,
    specularColor: 16777215,
  });
  const waterSurface = new THREE.Mesh(waterGeometry, waterSurfaceMaterial);
  waterSurface.position.set(0, waterLevel, 0);
  waterSurface.renderOrder = 2;
  waterGroup.add(waterSurface);
  const waterBasePositions = waterGeometry.attributes.position.array.slice();
  const waterMotion = {
    tiltX: 0,
    tiltZ: 0,
    velocityX: 0,
    velocityZ: 0,
    lastRotationX: null,
    lastRotationY: null,
    lastRotationZ: null,
    spinX: 0,
    spinY: 0,
    spinZ: 0,
  };
  // Satellite cubes share the rounded geometry. Only the original cube uses
  // physical transmission and simulated water; distant cubes use baked blur.
  let scatter = 0;
  const farCanvas = document.createElement("canvas");
  farCanvas.width = farCanvas.height = 192;
  const farCtx = farCanvas.getContext("2d");
  farCtx.filter = "blur(5px)";
  function face(points, fill) {
    farCtx.beginPath();
    points.forEach(([x, y], i) =>
      i ? farCtx.lineTo(x, y) : farCtx.moveTo(x, y),
    );
    farCtx.closePath();
    farCtx.fillStyle = fill;
    farCtx.fill();
    farCtx.strokeStyle = "rgba(126,179,255,.55)";
    farCtx.lineWidth = 1.5;
    farCtx.stroke();
  }
  face(
    [
      [30, 55],
      [108, 26],
      [162, 60],
      [83, 91],
    ],
    "#17374c",
  );
  face(
    [
      [30, 55],
      [83, 91],
      [83, 164],
      [30, 126],
    ],
    "#0b4563",
  );
  const farGradient = farCtx.createLinearGradient(80, 70, 150, 160);
  farGradient.addColorStop(0, "#426fa3");
  farGradient.addColorStop(0.5, "#0c2442");
  farGradient.addColorStop(1, "#071122");
  face(
    [
      [83, 91],
      [162, 60],
      [162, 136],
      [83, 164],
    ],
    farGradient,
  );
  const farTexture = new THREE.CanvasTexture(farCanvas);
  farTexture.colorSpace = THREE.SRGBColorSpace;
  const satelliteLayout = [
    [0.23, 0.4, 0.22, false],
    [0.78, 0.5, 0.20, false],
    [0.6, 0.79, 0.19, false],
    [0.3, 0.7, 0.25, true],
    [0.4, 0.18, 0.2, true],
    [0.67, 0.4, 0.18, true],
  ];
  const satellites = satelliteLayout.map((spec, i) => {
    let object, material;
    if (spec[3]) {
      material = new THREE.SpriteMaterial({
        map: farTexture,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        toneMapped: false,
      });
      object = new THREE.Sprite(material);
    } else {
      material = new THREE.MeshStandardMaterial({
        color: i === 2 ? 0x0c1b30 : 0x183452,
        metalness: 0.65,
        roughness: 0.19,
        envMapIntensity: i === 2 ? 0.3 : 0.9,
        transparent: true,
        opacity: 0,
        depthWrite: false,
      });
      object = new THREE.Group();
      object.add(new THREE.Mesh(cubeGeometry, material));
      const inside = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.8, 2.2),
        new THREE.MeshBasicMaterial({
          color: 0x1765b0,
          transparent: true,
          opacity: i === 2 ? 0.12 : 0.3,
          depthWrite: false,
        }),
      );
      inside.position.y = -0.25;
      object.add(inside);
    }
    object.visible = false;
    scene.add(object);
    return { object, material, spec, index: i };
  });
  container.dataset.satelliteSettings = JSON.stringify(SATELLITE_SETTINGS);
  function updateSatellites(time, spread) {
    const mobile = innerWidth < 768;
    const h = container.clientHeight,
      w = container.clientWidth;
    const worldH =
      2 *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.position.z;
    satellites.forEach(({ object, material, spec, index }) => {
      const allowed = !mobile || [0, 1, 3].includes(index);
      const reveal = THREE.MathUtils.smoothstep(
        spread,
        index * 0.055,
        0.7 + index * 0.05,
      );
      object.visible = allowed && reveal > 0.005 && cubeGroup.visible;
      if (!object.visible) return;
      const nx = mobile
        ? index === 0
          ? 0.16
          : index === 1
            ? 0.84
            : 0.2
        : spec[0];
      const ny = mobile
        ? index === 0
          ? 0.27
          : index === 1
            ? 0.74
            : 0.76
        : spec[1];
      const targetX =
        (nx - 0.5) * SATELLITE_SETTINGS.spreadX * worldH * camera.aspect;
      const targetY =
        (0.5 - ny) * SATELLITE_SETTINGS.spreadY * worldH + camera.position.y;
      object.position.set(
        THREE.MathUtils.lerp(anchor.x, targetX, reveal),
        THREE.MathUtils.lerp(anchor.y, targetY, reveal) +
          Math.sin(time * 0.55 + index) * 0.035 * reveal,
        spec[3] ? -0.8 : 0,
      );
      const scale = anchor.scale * spec[2] * reveal * SATELLITE_SETTINGS.size;
      object.scale.setScalar(spec[3] ? scale * 4 : scale);
      if (!spec[3])
        object.rotation.set(
          0.35 + Math.sin(time * 0.2 + index) * 0.1,
          index + time * (index % 2 ? -0.06 : 0.07),
          0.15,
        );
      else material.rotation = Math.sin(time * 0.15 + index) * 0.1;
      material.opacity = reveal * (spec[3] ? 0.3 : index === 2 ? 0.48 : 0.8);
    });
  }
  // 03: gather -> handoff -> eight scroll-driven spiral increments -> orbit.
  // Ring blocks share ONE geometry and ONE non-transmissive material/draw call.
  const ringMaterial = new THREE.MeshStandardMaterial({
    color: 0x10233b,
    metalness: 0.3,
    roughness: 0.48,
    envMapIntensity: 0.25,
    transparent: true,
    opacity: 0.38,
  });
  const ringMesh = new THREE.InstancedMesh(cubeGeometry, ringMaterial, 9);
  ringMesh.visible = false;
  ringMesh.frustumCulled = false;
  ringMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  scene.add(ringMesh);
  const ringDummy = new THREE.Object3D();
  const ringCentre = new THREE.Vector3();
  let ringProgress = 0,
    orbitPhase = 0;
  const clamp01 = (n) => Math.max(0, Math.min(1, n));
  const ease01 = (n) => {
    n = clamp01(n);
    return n * n * (3 - 2 * n);
  };
  function updateBuildRing(time, delta) {
    const h = container.clientHeight,
      w = container.clientWidth;
    const top = build.getBoundingClientRect().top;
    // Match the page fade while retaining the glass transmission background.
    const businessReturn = ease01(
      (h -
        document.getElementById("our-business").getBoundingClientRect().top) /
        (h * 0.65),
    );
    const blackout = ease01((0.45 - top / h) / 0.5) * (1 - businessReturn);
    ringMaterial.opacity = 0.38 * (1 - businessReturn);
    scene.background
      .setRGB(9 / 255, 13 / 255, 20 / 255, THREE.SRGBColorSpace)
      .multiplyScalar(1 - blackout);
    const progress = clamp01((h - top) / (h * 3));
    const gather = ease01(progress / 0.15);
    const journey = ease01((progress - 0.15) / 0.18);
    const assembly = clamp01((progress - 0.33) / 0.32);
    // Each short scroll advances a portion; damp the step so there are no jumps.
    const target = Math.floor(assembly * 8 + 0.00001) / 8;
    if (reduced.matches) ringProgress = top < h * 0.75 ? 1 : 0;
    else ringProgress = THREE.MathUtils.damp(ringProgress, target, 5.5, delta);
    if (Math.abs(ringProgress - target) < 0.0005) ringProgress = target;
    const worldH =
      2 *
      Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) *
      camera.position.z;
    ringCentre.set(0, camera.position.y, 0);
    const startScale = cubeGroup.scale.x;
    if (progress > 0) {
      satellites.forEach(({ object, material }) => {
        object.position.lerp(cubeGroup.position, gather);
        object.position.z = -0.5 * gather;
        object.scale.multiplyScalar(1 - 0.7 * gather);
        material.opacity *= 1 - ease01((gather - 0.4) / 0.6);
        if (gather > 0.995) object.visible = false;
      });
      cubeGroup.position.lerp(ringCentre, journey);
      cubeGroup.scale.setScalar(
        startScale * (1 - 0.25 * journey) * Math.pow(1 - ringProgress, 1.4),
      );
      cubeGroup.visible = !reduced.matches && ringProgress < 0.995;
    }
    ringMesh.visible = ringProgress > 0.001;
    ringMesh.count = w < 768 ? 6 : 9;
    if (!ringMesh.visible) {
      container.dataset.buildPhase = progress > 0 ? "gather" : "about";
      container.dataset.ringProgress = "0.00";
      return;
    }
    if (!reduced.matches && ringProgress > 0.001) orbitPhase += delta * 0.16;
    const radius = Math.min(worldH * 0.3, worldH * camera.aspect * 0.34) * 1.3;
    const blockScale =
      (Math.min(worldH * 0.045, worldH * camera.aspect * 0.065) / cubeSize) *
      0.8;
    for (let i = 0; i < ringMesh.count; i++) {
      const local = reduced.matches
        ? 1
        : ease01((ringProgress - (i / ringMesh.count) * 0.8) / 0.2);
      const angle =
        (i / ringMesh.count) * Math.PI * 2 -
        Math.PI / 2 +
        orbitPhase +
        (1 - local) * Math.PI * 1.6;
      const r = radius * local;
      ringDummy.position.set(
        ringCentre.x + Math.cos(angle) * r,
        ringCentre.y + Math.sin(angle) * r,
        Math.sin(angle) * 0.16,
      );
      ringDummy.rotation.set(
        0.35 + time * 0.15 + i * 0.2,
        time * 0.22 + i * 0.4,
        0.18 + time * 0.1 + i * 0.13,
      );
      ringDummy.scale.setScalar(blockScale * local);
      ringDummy.updateMatrix();
      ringMesh.setMatrixAt(i, ringDummy.matrix);
    }
    ringMesh.instanceMatrix.needsUpdate = true;
    container.dataset.buildPhase = ringProgress > 0.98 ? "orbit" : "assemble";
    container.dataset.ringProgress = ringProgress.toFixed(2);
    container.dataset.ringBlocks = String(ringMesh.count);
  }
  let businessCubeReveal = 0;
  const businessCubePosition = new THREE.Vector2();
  function updateBusinessCube(delta) {
    const rect = business.getBoundingClientRect();
    const h = container.clientHeight, w = container.clientWidth;
    const entrance = ease01((h * .55 - rect.top) / (h * .4));
    const departure = ease01(rect.bottom / (h * .65));
    const target = entrance * departure;
    businessCubeReveal = reduced.matches ? target : THREE.MathUtils.damp(businessCubeReveal, target, 5, delta);
    const backgroundReturn = ease01((h - rect.top) / (h * .65));
    container.style.opacity = String(Math.max(1 - backgroundReturn, businessCubeReveal));
    container.style.zIndex='';container.style.maskImage='';container.style.webkitMaskImage='';
    if (businessCubeReveal < .001) return;
    const worldH = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const pointerX = reduced.matches || w < 768 ? .78 : businessPointer.x;
    const pointerY = reduced.matches || w < 768 ? .32 : businessPointer.y;
    const x = (Math.max(.08, Math.min(.92, pointerX)) - .5) * worldH * camera.aspect;
    const y = (.5 - Math.max(.12, Math.min(.88, pointerY))) * worldH + camera.position.y;
    if (businessCubeReveal < .02) businessCubePosition.set(x,y);
    businessCubePosition.x = THREE.MathUtils.damp(businessCubePosition.x,x,4.5,delta);
    businessCubePosition.y = THREE.MathUtils.damp(businessCubePosition.y,y,4.5,delta);
    cubeGroup.visible = true;
    cubeGroup.position.set(businessCubePosition.x,businessCubePosition.y,0);
    const pixels = Math.min(w * BUSINESS_CUBE_SIZE, h * .27, 290) * .8;
    const scale = pixels / h * worldH / cubeSize;
    cubeGroup.scale.setScalar(scale * (.35 + .65 * businessCubeReveal));
    anchor.x = businessCubePosition.x;
    anchor.scale = scale;
    // During the exit, composite just the cube above the final background.
    // A soft local mask preserves the original transmission lighting.
    if (rect.bottom < h && departure < 1) {
      const px=(cubeGroup.position.x/(worldH*camera.aspect)+.5)*w;
      const py=(.5-(cubeGroup.position.y-camera.position.y)/worldH)*h;
      const radius=pixels*(.35+.65*businessCubeReveal);
      const mask=`radial-gradient(circle at ${px}px ${py}px,#000 ${radius*.7}px,transparent ${radius*1.1}px)`;
      container.style.zIndex='2';container.style.maskImage=mask;container.style.webkitMaskImage=mask;
    }
    container.dataset.businessCube = businessCubeReveal.toFixed(2);
  }
  const range = document.createRange();
  range.setStart(heading.firstChild, heading.firstChild.length - 3);
  range.setEnd(heading.firstChild, heading.firstChild.length);
  let businessSpinTarget = 0, businessSpinAngle = 0, businessSpinVelocity = 0;
  let cubeSpin = 0, cubeScrollBoost = 0, cubeLastScrollY = scrollY;
  let elapsed = 0,
    previous = 0,
    frame = 0,
    visible = true;
  let anchor = { x: 0, y: 0, scale: 1 };
  const observer = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    if (visible) resume();
    else {
      cancelAnimationFrame(frame);
      frame = 0;
      previous = 0;
    }
  });
  observer.observe(document.querySelector("main"));
  addEventListener("resize", () => {
    resize();
    resume();
  });
  addEventListener(
    "scroll",
    () => {
      locate();
      if (reduced.matches) resume();
    },
    { passive: true },
  );
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) resume();
  });
  reduced.addEventListener("change", resume);
  heading.addEventListener("animationend", () => {
    locate();
    resume();
  });
  resize();
  resume();
  container.dataset.state = "ready";
  addEventListener(
    "pagehide",
    () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      scene.traverse((object) => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material)
          ? object.material
          : [object.material];
        materials.forEach((material) => material?.dispose());
      });
      farTexture.dispose();
      customEnv.dispose();
      waveTexture.dispose();
      renderer.dispose();
    },
    { once: true },
  );
} catch (error) {
  container.dataset.state = "unavailable";
  console.warn("Hero 3D unavailable; the HTML hero remains usable.", error);
}
