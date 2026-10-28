// Glass Fold shader from GradFlow — https://gradflow.meerbahadin.dev
// Vanilla JavaScript adaptation of the user-provided component.
const SETTINGS = {color1:'#214cad',color2:'#090d14',color3:'#9ed8ff',speed:.24,scale:1,noise:.07};
const VERTEX = `
  attribute vec2 position;
  varying vec2 vUv;
  void main() {
    vUv = position * 0.5 + 0.5;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;
const FRAGMENT = `
  precision highp float;

  uniform float u_time;
  uniform vec3 u_color1;
  uniform vec3 u_color2;
  uniform vec3 u_color3;
  uniform float u_scale;
  uniform float u_noise;
  uniform vec2 u_resolution;
  varying vec2 vUv;

  float grain(vec2 st) {
    return fract(sin(dot(st, vec2(12.9898, 78.233))) * 43758.5453);
  }

  // WAVRICK: low, overlapping currents with open space above.
  vec3 shade(vec2 uv, float time) {
    float aspect = u_resolution.x / max(u_resolution.y, 1.0);
    float x = (uv.x - .5) * min(aspect, 2.2) * u_scale;
    float pixel = 1.25 / max(u_resolution.y, 1.0);
    vec3 color = u_color2;
    float atmosphere = exp(-pow((uv.y - .38) / .30, 2.0)) * exp(-x*x*.5);
    color += u_color1 * atmosphere * .26;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float breathing = sin(time * .22 + fi * .7);
      float centre = .13 + fi * .084
        + .105 * sin(x * (1.55 + fi * .12) + time * .17 + fi * .62)
        + .038 * sin(x * 3.1 - time * .13 + fi * 1.3)
        + breathing * .014;
      float distance = uv.y - centre;
      float edge = exp(-abs(distance) / max(pixel, .0032));
      float halo = exp(-abs(distance) * 36.0);
      float under = (1.0 - smoothstep(-pixel, pixel, distance));
      float body = under * exp(-abs(distance) * (5.2 + fi * .45));
      float inner = exp(-abs(distance + .009) * 380.0) * under;
      float along = .48 + .52 * pow(.5 + .5 * sin(x * 1.4 + fi * .9 - time * .12), 2.0);
      vec3 light = u_color1 * body * .48
        + u_color3 * along * (edge * .72 + halo * .15 + inner * .10);
      color += light * (1.0 - color);
    }
    // All light dissolves before reaching the top or the next chapter.
    float envelope = smoothstep(.0,.10,uv.y) * (1.0-smoothstep(.62,.88,uv.y));
    return mix(u_color2,clamp(color,0.0,1.0),envelope);
  }

  void main() {
    vec3 color = shade(vUv, u_time);
    if (u_noise > 0.001) {
      float g = grain(vUv * 200.0 + u_time * 0.1);
      color *= 1.0 - u_noise * 0.4 + u_noise * g * 0.4;
    }
    gl_FragColor = vec4(color, 1.0);
  }
`;

const section = document.getElementById('glass-fold');
const canvas = section.querySelector('canvas');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const gl = canvas.getContext('webgl', {antialias:false,alpha:false});
if (gl) {
  const shaders = [];
  const compile = (type,source) => {
    const shader = gl.createShader(type);
    gl.shaderSource(shader,source); gl.compileShader(shader);
    if (!gl.getShaderParameter(shader,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    shaders.push(shader); return shader;
  };
  const program = gl.createProgram();
  try {
    gl.attachShader(program,compile(gl.VERTEX_SHADER,VERTEX));
    gl.attachShader(program,compile(gl.FRAGMENT_SHADER,FRAGMENT));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program,'position');
    gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
    const uniform = name => gl.getUniformLocation(program,name);
    const u = Object.fromEntries(['time','color1','color2','color3','scale','noise','resolution'].map(name=>[name,uniform('u_'+name)]));
    const rgb = hex => [1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255);
    let elapsed=0,last=0,frame=0,inView=false;
    function draw(now) {
      frame=0;
      if (last && !reduced.matches) elapsed+=Math.min((now-last)/1000,.1)*SETTINGS.speed;
      last=now;
      const dpr=Math.min(devicePixelRatio||1,1.5);
      const width=Math.max(1,Math.round(canvas.clientWidth*dpr)),height=Math.max(1,Math.round(canvas.clientHeight*dpr));
      if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
      gl.viewport(0,0,width,height);
      gl.uniform1f(u.time,elapsed);
      gl.uniform3fv(u.color1,rgb(SETTINGS.color1));gl.uniform3fv(u.color2,rgb(SETTINGS.color2));gl.uniform3fv(u.color3,rgb(SETTINGS.color3));
      gl.uniform1f(u.scale,SETTINGS.scale);gl.uniform1f(u.noise,SETTINGS.noise);gl.uniform2f(u.resolution,width,height);
      gl.drawArrays(gl.TRIANGLES,0,6);
      section.dataset.state='ready';
      if(inView&&!document.hidden&&!reduced.matches) frame=requestAnimationFrame(draw);
    }
    function resume(){cancelAnimationFrame(frame);last=0;if(inView&&!document.hidden)frame=requestAnimationFrame(draw);}
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;resume();},{rootMargin:'100px'});
    observer.observe(section);
    const resizeObserver=new ResizeObserver(resume);resizeObserver.observe(canvas);
    reduced.addEventListener('change',resume);document.addEventListener('visibilitychange',resume);
    addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();resizeObserver.disconnect();gl.deleteBuffer(buffer);gl.deleteProgram(program);shaders.forEach(shader=>gl.deleteShader(shader));},{once:true});
  } catch(error) {section.dataset.state='unavailable';console.warn('Glass Fold unavailable',error);}
} else section.dataset.state='unavailable';
