// Cube, water and particle-wave implementation adapted from the supplied
// WAVRICK Structured Flow Scene3D.tsx. Wave formula credits: Boris Šehovac.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
const container = document.getElementById('heroScene');
const stage = document.querySelector('.hero-sticky');
const heading = document.querySelector('.heading-first');
const hero = document.getElementById('heroScroll');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const isMobile = innerWidth < 768;
// Resolve CSS units through layout, so px/vw/vh/calc all work.
const cssAnchor = document.createElement('div');
cssAnchor.className = 'cube-css-anchor';
cssAnchor.setAttribute('aria-hidden', 'true');
stage.appendChild(cssAnchor);

try {
    // Detect software WebGL to balance performance
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // Initialize Scene, Camera, Renderer
    const scene = new THREE.Scene();
    // A real scene background is required by the glass transmission pass.
  scene.background = new THREE.Color(0x090d14);
    scene.fog = new THREE.FogExp2(0x05070c, 0.032);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 1.2, isMobile ? 9.8 : 7.2);

    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      alpha: true,
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    container.appendChild(renderer.domElement);

    // =============================================================
    // 01. CUSTOM REFLECTION ENVIRONMENT (From CodePen)
    // =============================================================
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 1024;
    envCanvas.height = 512;
    const envCtx = envCanvas.getContext('2d')!;

    const bg = envCtx.createLinearGradient(0, 0, 0, 512);
    bg.addColorStop(0, '#29384c');
    bg.addColorStop(0.45, '#101a2a');
    bg.addColorStop(1, '#030711');
    envCtx.fillStyle = bg;
    envCtx.fillRect(0, 0, 1024, 512);

    function addPanel(x: number, y: number, w: number, h: number, color: string, blur = 0) {
      envCtx.save();
      envCtx.shadowColor = color;
      envCtx.shadowBlur = blur;
      envCtx.fillStyle = color;
      envCtx.fillRect(x, y, w, h);
      envCtx.restore();
    }

    addPanel(240, 45, 260, 95, '#ffffff', 18);
    addPanel(80, 105, 90, 280, '#36e6ff', 16);
    addPanel(430, 150, 80, 210, '#dcefff', 10);
    addPanel(690, 85, 110, 300, '#285cff', 18);
    addPanel(850, 145, 45, 185, '#ff765e', 10);

    const customEnv = new THREE.CanvasTexture(envCanvas);
    customEnv.mapping = THREE.EquirectangularReflectionMapping;
    customEnv.colorSpace = THREE.SRGBColorSpace;
    customEnv.needsUpdate = true;

    scene.environment = customEnv;
    scene.environmentIntensity = 0.55;

    // =============================================================
    // 02. STUDIO LIGHTING RIG
    // =============================================================
    const ambient = new THREE.HemisphereLight(0xd9efff, 0x10182b, 1.2);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight(0xeaf7ff, 3.2);
    keyLight.position.set(-3, 6, 4);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xb6dfff, 1.5);
    fillLight.position.set(4, 1, 6);
    scene.add(fillLight);

    // Dynamic accent point lights orbiting the cube
    const cyanLight = new THREE.PointLight(0x13dfff, 35, 10, 2);
    cyanLight.position.set(-3.5, 1.5, 2.5);
    scene.add(cyanLight);

    const blueLight = new THREE.PointLight(0x2855ff, 45, 11, 2);
    blueLight.position.set(3, 0.5, -3);
    scene.add(blueLight);

    const warmLight = new THREE.PointLight(0xff684d, 16, 8, 2);
    warmLight.position.set(3.5, 2, 2);
    scene.add(warmLight);

    const bottomLight = new THREE.PointLight(0x398bff, 12, 8, 2);
    bottomLight.position.set(0, -3, 2);
    scene.add(bottomLight);

    // =============================================================
    // 03. BORIS ŠEHOVAC PARTICLE WAVE BACKGROUND SHADER
    // (https://github.com/bsehovac/shader-program - Waves)
    // =============================================================
    const pointSize = 1.7;
    const waveTexture = new THREE.TextureLoader().load(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAb1BMVEUAAAD///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////8v0wLRAAAAJHRSTlMAC/goGvDhmwcExrVjWzrm29TRqqSKenRXVklANSIUE8mRkGpv+HOfAAABCElEQVQ4y4VT13LDMAwLrUHteO+R9f/fWMfO6dLaPeKVEECRxOULWsEGpS9nULDwia2Y+ALqUNbAWeg775zv+sA4/FFRMxt8U2FZFCVWjR/YrH4/H9sarclSKdPMWKzb8VsEeHB3m0shkhVCyNzeXeAQ9Xl4opEieX2QCGnwGbj6GMyjw9t1K0fK9YZunPXeAGsfJtYjwzxaBnozGGorYz0ypK2HzQSYx1y8DgSRo2ewOiyh2QWOEk1Y9OrQV0a8TiBM1a8eMHWYnRMy7CZ4t1CmyRkhSUvP3gRXyHOCLBxNoC3IJv//ZrJ/kxxUHPUB+6jJZZHrpg6GOjnqaOmzp4NDR48OLxn/H27SRQ08S0ZJAAAAAElFTkSuQmCC'
    );

    // Denser particle grid (140 x 140) for fine, silk-like fluid waves
    const gridCols = isSoftwareGl || isMobile ? 64 : 100;
    const gridRows = isSoftwareGl || isMobile ? 64 : 100;
    const fieldWidth = 52.0;
    const fieldDepth = 46.0;
    // Further 60% reduced amplitude (1.16 * 0.4 = 0.464)
    const fieldHeight = 0.46;
    const halfW = fieldWidth / 2;
    const halfD = fieldDepth / 2;

    const pointPositions: number[] = [];
    const pointColors: number[] = [];
    const linePositions: number[] = [];

    for (let r = 0; r < gridRows; r++) {
      const z = (r / (gridRows - 1)) * fieldDepth - halfD;
      for (let c = 0; c < gridCols; c++) {
        const x = (c / (gridCols - 1)) * fieldWidth - halfW;
        pointPositions.push(x, 0, z);

        const nx = (x + halfW) / fieldWidth;
        const nz = (z + halfD) / fieldDepth;
        const cr = THREE.MathUtils.lerp(0.06, 0.28, nx);
        const cg = THREE.MathUtils.lerp(0.45, 0.88, 1.0 - nz * 0.7);
        const cb = THREE.MathUtils.lerp(0.75, 1.0, nx * 0.4 + 0.6);
        const ca = THREE.MathUtils.lerp(0.45, 0.9, 1.0 - nz * 0.55);
        pointColors.push(cr, cg, cb, ca);

        // Grid lines connecting points
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
      'position',
      new THREE.Float32BufferAttribute(pointPositions, 3)
    );
    wavePointsGeom.setAttribute(
      'aColor',
      new THREE.Float32BufferAttribute(pointColors, 4)
    );

    const waveUniforms = {
      uTime: { value: 0 },
      uOpacity: { value: 0.24 },
      uSpeed: { value: 5.0 },
      uSize: { value: pointSize },
      uField: { value: new THREE.Vector3(fieldWidth, fieldHeight, fieldDepth) },
      uScroll: { value: 0 },
      uTexture: { value: waveTexture },
      uWireframeMode: { value: 0.0 },
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

        // Exact Boris Šehovac wave displacement formula with 20% reduced height:
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

    // Subtle connecting grid lines using the exact same formula
    const waveLinesGeom = new THREE.BufferGeometry();
    waveLinesGeom.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(linePositions, 3)
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

    // =============================================================
    // 04. NEW GLASS CUBE (RoundedBoxGeometry from CodePen)
    // =============================================================
    const cubeGroup = new THREE.Group();
    scene.add(cubeGroup);

    const cubeSize = 2.5;
    const cubeGeometry = new RoundedBoxGeometry(cubeSize, cubeSize, cubeSize, 8, 0.11);

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      metalness: 0,
      roughness: 0.055,
      transmission: 1.0,
      thickness: 0.28,
      ior: 1.25,
      envMapIntensity: 0.45,
      clearcoat: 0.65,
      clearcoatRoughness: 0.045,
      transparent: false,
      opacity: 1.0,
    });

    const cube = new THREE.Mesh(cubeGeometry, glassMaterial);
    cubeGroup.add(cube);

    // =============================================================
    // 05. WATER BODY (From CodePen)
    // =============================================================
    const waterSize = 2.22;
    const waterBottom = -1.2;
    const waterLevel = 0.25;
    const waterDepth = waterLevel - waterBottom;

    const waterGroup = new THREE.Group();
    cube.add(waterGroup);

    const waterMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x087fae,
      metalness: 0.08,
      roughness: 0.2,
      transparent: true,
      opacity: 0.48,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // 4 side planes
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

    // Bottom plane
    const bottomGeometry = new THREE.PlaneGeometry(waterSize, waterSize);
    const waterBottomMesh = new THREE.Mesh(bottomGeometry, waterMaterial);
    waterBottomMesh.rotation.x = -Math.PI / 2;
    waterBottomMesh.position.y = waterBottom + 0.005;
    waterGroup.add(waterBottomMesh);

    // =============================================================
    // 06. ANIMATED WATER SURFACE (From CodePen)
    // =============================================================
    const segments = isSoftwareGl ? 32 : 48;
    const waterGeometry = new THREE.PlaneGeometry(
      waterSize,
      waterSize,
      segments,
      segments
    );
    waterGeometry.rotateX(-Math.PI / 2);

    // Rounded corner mask applied to vertex coordinates
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
      color: 0x022f48,
      metalness: 0.0,
      roughness: 0.1,
      side: THREE.DoubleSide,
      clearcoat: 1.0,
      clearcoatRoughness: 0.06,
      ior: 1.333,
      specularIntensity: 1.0,
      specularColor: 0xffffff,
    });

    const waterSurface = new THREE.Mesh(waterGeometry, waterSurfaceMaterial);
    waterSurface.position.set(0, waterLevel, 0);
    waterSurface.renderOrder = 2;
    waterGroup.add(waterSurface);

    // Store base positions for dynamic wave displacement
    const waterBasePositions = (waterGeometry.attributes.position.array as Float32Array).slice();

    // Water inertia & slosh state
    const waterMotion = {
      tiltX: 0,
      tiltZ: 0,
      velocityX: 0,
      velocityZ: 0,
      lastRotationX: null as number | null,
      lastRotationY: null as number | null,
      lastRotationZ: null as number | null,
      spinX: 0,
      spinY: 0,
      spinZ: 0,
    };

    function updateWater(time: number, delta: number = 0.016, sloshMultiplier: number = 1.0) {
      const positions = waterGeometry.attributes.position;
      const step = Math.min(Math.max(delta, 0.001), 0.033);

      // Detect rotation velocity from cubeGroup
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

      // Inertial tilt force
      const targetX = THREE.MathUtils.clamp(-waterMotion.spinX * 0.18 * sloshMultiplier, -0.65, 0.65);
      const targetZ = THREE.MathUtils.clamp(
        -(waterMotion.spinY * 0.12 + waterMotion.spinZ * 0.18) * sloshMultiplier,
        -0.65,
        0.65
      );

      waterMotion.velocityX += (targetX - waterMotion.tiltX) * 14 * step;
      waterMotion.velocityZ += (targetZ - waterMotion.tiltZ) * 14 * step;

      waterMotion.velocityX *= Math.exp(-3.0 * step);
      waterMotion.velocityZ *= Math.exp(-3.0 * step);

      waterMotion.tiltX += waterMotion.velocityX * step;
      waterMotion.tiltZ += waterMotion.velocityZ * step;

      const motion = Math.min(
        1,
        (Math.abs(waterMotion.spinX) * 0.8 +
          Math.abs(waterMotion.spinY) * 0.5 +
          Math.abs(waterMotion.spinZ) * 0.8) *
          sloshMultiplier
      );

      for (let i = 0; i < positions.count; i++) {
        const x = waterBasePositions[i * 3];
        const z = waterBasePositions[i * 3 + 2];

        // Softly reduce wave amplitude toward the glass perimeter
        const edgeDistance = Math.min(
          waterSize / 2 - Math.abs(x),
          waterSize / 2 - Math.abs(z)
        );

        const edgeFade = THREE.MathUtils.smoothstep(edgeDistance, 0.0, 0.28);

        const wave1 = Math.sin(x * 2.5 + time * 2.2) * 0.045;
        const wave2 = Math.cos(z * 3.0 - time * 1.8) * 0.035;
        const wave3 = Math.sin((x + z) * 2.4 + time * 2.7) * 0.025;
        const wave4 =
          Math.sin(x * 4.0 - z * 2.5 + time * 3.2) * (0.012 + motion * 0.045);

        const tilt = x * waterMotion.tiltX + z * waterMotion.tiltZ;
        const slosh = Math.sin(x * 1.6 - z * 1.1 + time * 2.0) * motion * 0.07;

        positions.setY(i, tilt + (wave1 + wave2 + wave3 + wave4 + slosh) * edgeFade);
      }

      positions.needsUpdate = true;
      waterGeometry.computeVertexNormals();
    }


    // Anchor the cube to the actual THE glyphs, independently of viewport size.
    const range = document.createRange();
    range.setStart(heading.firstChild, heading.firstChild.length - 3);
    range.setEnd(heading.firstChild, heading.firstChild.length);
    let elapsed = 0, previous = 0, frame = 0, visible = true;
    let anchor = {x: 0, y: 0, scale: 1};
    function resize() {
      const width = container.clientWidth, height = container.clientHeight;
      camera.aspect = width / height;
      camera.position.z = 7.2;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(devicePixelRatio, isSoftwareGl ? 1 : 1.5));
      locate();
    }
    function locate() {
      const rect = range.getBoundingClientRect(), bounds = stage.getBoundingClientRect();
      const height = container.clientHeight, width = container.clientWidth;
      const size = 1.2 * Math.max(70, Math.min(width * .09, 165, height * .17));
      const x = rect.left + rect.width / 2 - bounds.left;
      const y = Math.max(130, rect.top - bounds.top + size * .12);
      const cssRect = cssAnchor.getBoundingClientRect();
    const cssOffsetX = cssRect.left - bounds.left;
    const cssOffsetY = cssRect.top - bounds.top;
    const cssScale = Math.max(.05, cssRect.width / 100);
    const worldHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
      anchor.x = ((x + cssOffsetX) / width - .5) * worldHeight * camera.aspect;
      anchor.y = (.5 - (y + cssOffsetY) / height) * worldHeight + camera.position.y;
      anchor.scale = size / height * worldHeight / cubeSize / 1.3 * cssScale;
    }
    function draw(stamp) {
      frame = 0;
      if (!visible || document.hidden) { previous = 0; return; }
      const delta = previous ? Math.min((stamp - previous) / 1000, .04) : .016;
      previous = stamp;
      if (!reduced.matches) elapsed += delta;
      const t = reduced.matches ? 0 : elapsed;
      locate();
    cubeGroup.position.set(anchor.x, anchor.y + Math.sin(t * .8) * .045, 0);
      cubeGroup.scale.setScalar(anchor.scale);
      cubeGroup.rotation.set(.32 + Math.sin(t * .24) * .045, .55 + t * .09, .08 + Math.sin(t * .3) * .025);

      const k = anchor.scale;
      const at = (light, x, y, z, power) => {
        light.position.set(anchor.x + x * k, cubeGroup.position.y + y * k, z * k);
        light.intensity = power * k * k;
        light.distance = 12 * k;
      };
      at(cyanLight, -3.5 + Math.sin(t * .45) * 1.2, 1.5 + Math.sin(t * .32) * .45, 2.5 + Math.cos(t * .35) * .6, 35);
      at(blueLight, 3 + Math.sin(t * .32) * .8, .5 + Math.cos(t * .28) * .6, -3 + Math.cos(t * .3) * .5, 45);
      at(warmLight, 3.5 + Math.sin(t * .22) * .5, 2 + Math.cos(t * .26) * .35, 2, 16);
      at(bottomLight, Math.sin(t * .25) * .7, -3, 2 + Math.cos(t * .24) * .4, 12);

      updateWater(t, delta, .5);
      waveUniforms.uTime.value = t;
      waveUniforms.uSpeed.value = 1.6;
      waveUniforms.uScroll.value = 0;
      renderer.render(scene, camera);
      if (!reduced.matches) frame = requestAnimationFrame(draw);
    }
    function resume() { if (!frame) frame = requestAnimationFrame(draw); }
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      if (visible) resume();
      else { cancelAnimationFrame(frame); frame = 0; previous = 0; }
    });
    observer.observe(hero);
    addEventListener('resize', () => { resize(); resume(); });
    addEventListener('scroll', () => { locate(); if (reduced.matches) resume(); }, {passive:true});
    document.addEventListener('visibilitychange', () => { if (!document.hidden) resume(); });
    reduced.addEventListener('change', resume);
    // Re-measure after the existing title entrance animation settles.
    heading.addEventListener('animationend', () => { locate(); resume(); });
    resize();
    resume();
    container.dataset.state = 'ready';
    addEventListener('pagehide', () => {
      cancelAnimationFrame(frame); observer.disconnect();
      scene.traverse(object => {
        object.geometry?.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.forEach(material => material?.dispose());
      });
      customEnv.dispose(); waveTexture.dispose(); renderer.dispose();
    }, {once:true});
} catch (error) {
  container.dataset.state = 'unavailable';
  console.warn('Hero 3D unavailable; the HTML hero remains usable.', error);
}
