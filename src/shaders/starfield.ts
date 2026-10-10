export const starVertex = /* glsl */ `
attribute float aSize;
attribute float aSeed;
attribute vec3 aColor;
uniform float uDist;
uniform float uDepth;
uniform float uPx;
uniform float uTime;
uniform float uTunnel;
varying vec3 vCol;
varying float vAlpha;
void main(){
  vec3 p = position;
  float fade = 1.0;
  if(uTunnel > 0.5){
    p.z = -mod(position.z - uDist, uDepth);
    fade = smoothstep(1.0, 14.0, -p.z) * (1.0 - smoothstep(uDepth*0.8, uDepth, -p.z));
  }
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  float tw = 0.75 + 0.25 * sin(uTime * (0.6 + aSeed * 2.2) + aSeed * 60.0);
  gl_PointSize = clamp(aSize * uPx * (260.0 / max(-mv.z, 1.0)), 1.0, 9.0 * uPx);
  vCol = aColor;
  vAlpha = fade * tw;
}
`
export const starFragment = /* glsl */ `
uniform float uOpacity;
varying vec3 vCol;
varying float vAlpha;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float d = length(c);
  float a = smoothstep(0.5, 0.0, d);
  a = pow(a, 1.6);
  gl_FragColor = vec4(vCol, a * vAlpha * uOpacity);
}
`

export const streakVertex = /* glsl */ `
attribute vec3 aOffset;   // xy: radial position, z: 0..1 depth phase
attribute float aSeed;
uniform float uDist;
uniform float uDepth;
uniform float uSpeed;
uniform float uLen;
uniform float uAspect;
uniform float uWidth;
varying float vAlpha;
varying vec3 vCol;
varying vec2 vUv;
void main(){
  float z = -mod(aOffset.z * uDepth - uDist, uDepth);
  float len = (0.15 + (0.4 + aSeed) * uSpeed * uLen);
  vec4 head = modelViewMatrix * vec4(aOffset.xy, z, 1.0);
  vec4 tail = modelViewMatrix * vec4(aOffset.xy, z - len, 1.0);
  vec4 hc = projectionMatrix * head;
  vec4 tc = projectionMatrix * tail;
  vec2 hn = hc.xy / hc.w;
  vec2 tn = tc.xy / tc.w;
  vec2 dir = (hn - tn) * vec2(uAspect, 1.0);
  float dl = length(dir);
  dir = dl > 1e-5 ? dir / dl : vec2(0.0, 1.0);
  vec2 perp = vec2(-dir.y, dir.x) / vec2(uAspect, 1.0);
  vec4 base = position.y > 0.5 ? hc : tc;
  float w = uWidth * (0.6 + aSeed * 0.9);
  base.xy += perp * position.x * w * base.w;
  gl_Position = base;
  float near = smoothstep(0.4, 4.0, -z);
  float far = 1.0 - smoothstep(uDepth * 0.78, uDepth, -z);
  vAlpha = near * far * (0.35 + 0.65 * smoothstep(0.0, 0.25, uSpeed));
  vCol = mix(vec3(1.0), vec3(0.30, 0.72, 1.0), smoothstep(0.25, 0.9, aSeed));
  vUv = vec2(position.x, position.y);
}
`
export const streakFragment = /* glsl */ `
varying float vAlpha;
varying vec3 vCol;
varying vec2 vUv;
void main(){
  float edge = 1.0 - abs(vUv.x);
  float along = 0.25 + 0.75 * vUv.y;
  gl_FragColor = vec4(vCol * (0.8 + 0.6 * vUv.y), vAlpha * edge * along);
}
`
