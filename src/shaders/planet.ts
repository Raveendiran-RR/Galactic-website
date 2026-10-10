import { noiseGLSL } from './noise'

export const planetVertex = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
void main(){
  vObjPos = normalize(position);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`

export const planetFragment = /* glsl */ `
uniform float uTime;
uniform float uStyle;     // 0 = neural, 1 = industrial
uniform float uGlow;      // hover/focus glow 0..1
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform vec3 uAccent;
uniform vec3 uLightDir;
uniform int uOctaves;
varying vec3 vObjPos;
varying vec3 vWorldNormal;
varying vec3 vViewDir;
${noiseGLSL}
void main(){
  vec3 n = normalize(vWorldNormal);
  float lambert = clamp(dot(n, normalize(uLightDir)), 0.0, 1.0);
  float night = 1.0 - smoothstep(0.0, 0.35, lambert);
  vec3 col;
  vec3 emissive = vec3(0.0);
  if(uStyle < 0.5){
    float base = fbm(vObjPos * 2.2, uOctaves) * 0.5 + 0.5;
    col = mix(uColorA, uColorB, smoothstep(0.35, 0.8, base));
    float ridge = 1.0 - abs(snoise(vObjPos * 5.0 + vec3(0.0, uTime * 0.03, 0.0)));
    ridge = pow(ridge, 7.0);
    float pulse = 0.55 + 0.45 * sin(uTime * 1.6 + base * 12.0);
    emissive = uAccent * ridge * (0.55 + 0.9 * pulse);
  } else {
    float warp = fbm(vObjPos * 3.0, uOctaves) * 0.35;
    float bands = 0.5 + 0.5 * sin((vObjPos.y + warp) * 14.0);
    col = mix(uColorA, uColorB, bands);
    float grid = smoothstep(0.78, 0.9, snoise(vObjPos * 11.0));
    emissive = uAccent * grid * (0.5 + 0.5 * sin(uTime * 0.8 + vObjPos.x * 9.0)) * (0.35 + night);
  }
  vec3 lit = col * (0.12 + lambert * 1.15);
  float rim = pow(1.0 - clamp(dot(n, normalize(vViewDir)), 0.0, 1.0), 2.6);
  vec3 outCol = lit + emissive * (0.35 + 0.65 * night) + uAccent * rim * (0.25 + uGlow * 0.55);
  outCol += uAccent * uGlow * 0.04;
  gl_FragColor = vec4(outCol, 1.0);
}
`

export const atmosphereVertex = /* glsl */ `
varying vec3 vN;
varying vec3 vV;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`
export const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;
varying vec3 vN;
varying vec3 vV;
void main(){
  float f = pow(clamp(1.0 - dot(normalize(vN), normalize(vV)), 0.0, 1.0), uPower);
  gl_FragColor = vec4(uColor * f * uIntensity, f * uIntensity);
}
`

export const nebulaVertex = /* glsl */ `
varying vec3 vDir;
void main(){
  vDir = normalize(position);
  vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  gl_Position = p;
}
`
export const nebulaFragment = /* glsl */ `
uniform float uTime;
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uStrength;
uniform int uOctaves;
varying vec3 vDir;
${noiseGLSL}
void main(){
  vec3 d = normalize(vDir);
  float n1 = fbm(d * 2.1 + vec3(uTime * 0.004, 0.0, 0.0), uOctaves) * 0.5 + 0.5;
  float n2 = fbm(d * 3.7 + vec3(11.0, uTime * 0.006, 3.0), uOctaves) * 0.5 + 0.5;
  float cloud = smoothstep(0.48, 0.95, n1);
  vec3 col = mix(uColorA, uColorB, n2) * cloud * uStrength;
  col += vec3(0.01, 0.015, 0.03);
  gl_FragColor = vec4(col, 1.0);
}
`
