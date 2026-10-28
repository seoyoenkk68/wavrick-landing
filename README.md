# WAVRICK static hero

The approved HTML/CSS hero is retained. Three.js cube, animated water and particle waves were extracted from the supplied Structured Flow Scene3D.tsx; no React runtime is required.

## Development
pnpm install
pnpm dev

## Static export
pnpm build
Upload the contents of dist/ to any static HTTP host. No Node server, React, API key or CDN dependency is required in production. Use an HTTP server to preview ES modules rather than opening index.html through file://.

## Files
- index.html / style.css / script.js: hero layout, 250vh scroll stage and existing typography interactions.
- hero-scene.js: standalone Three.js effects. This is the executable scene source.
- hero-scene.ts: intermediate source retained from the TS-to-JS extraction, for reference only.
- node_modules and pnpm-lock.yaml: pinned Three.js and development build tool.

## Motion and rendering
The cube follows the actual THE text bounds. Slow rotation and float are independent of scroll. Rendering pauses offscreen and in background tabs; reduced-motion renders a still frame and removes the extended sticky scroll. If WebGL is unavailable, the HTML content remains usable. GPU and software WebGL paths use different glass quality settings, matching the supplied implementation.

The source wave code credits Boris Šehovac / shader-program. Three.js license is retained in the production bundle and third-party license file.

## ABOUT (02) / v1.2
ABOUT replaces the temporary light section. It uses the same #090d14 scene and a 1600px text alignment with a 960px reading limit. The supplied copy is arranged into six scroll-linked sentence scenes over a 520vh desktop / 480vh mobile section. Scroll in either direction to reveal/hide each sentence.

One fixed Three.js canvas now spans the hero and ABOUT. The original hero CSS offsets are preserved. A cubic Bezier path moves the cube from its hero location into ABOUT; no second cube is created. ABOUT destination controls in style.css:
- --about-cube-x: viewport horizontal percentage
- --about-cube-y: viewport vertical percentage
- --about-cube-scale: size multiplier

Reduced motion presents every sentence in normal document flow and suppresses the cube journey. The existing hero-scene.ts is a legacy extraction reference; hero-scene.js is the authoritative edited runtime source.

## Smooth scrolling and satellite cubes
Lenis 1.3.27 handles mouse-wheel inertia and anchor links (lerp .085, wheel multiplier .85). Touch scrolling stays native; reduced-motion uses native scrolling and suppresses scatter. Lenis CSS is bundled locally with the static build.

At the first downward scroll inside ABOUT, the main cube eases to 58% of its prior scale while six satellites spread around the text. Three use a shared rounded geometry and non-transmissive material; three use a once-generated blurred canvas texture. Mobile displays only three satellites. Returning above ABOUT collapses the group. Full transmission and animated water remain exclusive to the main cube. This limits additional shader work; actual device frame rates still depend on GPU and screen resolution.

## Section 03 / block ring prototype
No copy is rendered in HOW WE BUILD yet. Entering the section gathers ABOUT satellites behind the main cube and removes them, then the main cube moves toward the next scene. Eight scroll-distance increments reveal a spiral of instanced blocks. Once complete, the blocks orbit the circle and independently rotate. Reversing the scroll restores earlier stages. Desktop uses 28 instances; mobile uses 18, sharing the rounded geometry and one non-transmissive material. Reduced motion shows a still ring and removes the long pinned stage.

## HOW WE BUILD copy sequence
The supplied v1.2 copy is now displayed. The left eyebrow, headline and description enter in order, then stay pinned. The existing ring moves into the right-hand visual area. Four process panels (DISCOVER / DESIGN / BUILD / EVOLVE) enter upward one at a time, with a small active-step index and restrained rules. The scroll stage is 600vh, reserving time for the gather/ring choreography before the process transitions. Mobile stacks the introduction above the object and panels. Reduced motion renders all copy in normal document flow.
