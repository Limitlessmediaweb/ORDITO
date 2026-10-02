"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { View, useTexture } from "@react-three/drei";
import * as THREE from "three";

export type FabricState = {
  /** 0..3: quale tessuto (con transizione tra uno e l'altro) */
  progress: number;
  /** puntatore in coordinate uv della vista (0..1) */
  mx: number;
  my: number;
  /** intensità della "mano" che passa sul tessuto (0..1) */
  strength: number;
  /** velocità di scroll normalizzata (per il touch) */
  vel: number;
};

const vert = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);
  }
`;

const frag = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform sampler2D t0;
  uniform sampler2D t1;
  uniform sampler2D t2;
  uniform sampler2D t3;
  uniform float uProgress;
  uniform vec2 uMouse;
  uniform float uStrength;
  uniform float uVel;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uImg;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
  }

  vec2 cover(vec2 uv) {
    float rs = uRes.x / uRes.y, ri = uImg.x / uImg.y;
    vec2 s = rs > ri ? vec2(1.0, ri / rs) : vec2(rs / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  vec3 pick(float i, vec2 uv) {
    if (i < 0.5) return texture2D(t0, uv).rgb;
    if (i < 1.5) return texture2D(t1, uv).rgb;
    if (i < 2.5) return texture2D(t2, uv).rgb;
    return texture2D(t3, uv).rgb;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / uRes.y;

    // la "mano": un rigonfiamento gaussiano attorno al puntatore che spinge il tessuto
    vec2 d = uv - uMouse;
    d.x *= aspect;
    float r2 = dot(d, d);
    float bump = exp(-r2 * 22.0) * uStrength;
    vec2 dir = d / (sqrt(r2) + 1e-4);
    vec2 disp = -dir * bump * 0.045;
    // pieghe sottili che scorrono attorno alla mano
    disp += vec2(sin(uv.y * 38.0 + uTime * 2.4), cos(uv.x * 34.0 - uTime * 2.0)) * 0.004 * bump;
    // ondulazione allo scroll (touch)
    disp.y += sin(uv.x * 9.0 + uTime * 1.6) * 0.012 * uVel;
    disp.x += cos(uv.y * 7.0 + uTime * 1.3) * 0.006 * uVel;

    vec2 tuv = cover(uv + disp);

    // passaggio tra tessuti lungo le fibre (rumore stirato in verticale)
    float idx = floor(uProgress);
    float f = smoothstep(0.0, 1.0, fract(uProgress));
    float n = noise(uv * vec2(110.0, 5.0)) * 0.65 + noise(uv * vec2(3.0, 2.0)) * 0.35;
    float m = smoothstep(n - 0.05, n + 0.05, f * 1.12 - 0.06);
    vec3 col = mix(pick(idx, tuv), pick(min(idx + 1.0, 3.0), tuv), m);

    // luce radente sul tessuto sollevato
    col += bump * 0.09;
    col *= 1.0 - bump * 0.05 * dot(dir, vec2(0.7, -0.7));
    // vignettatura
    float v = smoothstep(1.15, 0.35, length((uv - 0.5) * vec2(aspect, 1.0)));
    col *= mix(0.55, 1.0, v);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function FabricMesh({ urls, state, onReady }: { urls: string[]; state: React.RefObject<FabricState>; onReady?: () => void }) {
  const tex = useTexture(urls);
  useEffect(() => onReady?.(), [onReady]);
  const size = useThree((s) => s.size);
  const mat = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(() => {
    tex.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.minFilter = THREE.LinearFilter;
      t.generateMipmaps = false;
    });
    const img = tex[0].image as { width: number; height: number };
    return {
      t0: { value: tex[0] },
      t1: { value: tex[1] },
      t2: { value: tex[2] },
      t3: { value: tex[3] },
      uProgress: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
      uStrength: { value: 0 },
      uVel: { value: 0 },
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImg: { value: new THREE.Vector2(img.width, img.height) },
    };
  }, [tex]);

  useFrame((_, dt) => {
    const u = mat.current?.uniforms;
    const s = state.current;
    if (!u || !s) return;
    u.uTime.value += dt;
    u.uProgress.value = s.progress;
    // il puntatore viene inseguito con un leggero ritardo, come un tessuto che reagisce
    u.uMouse.value.x += (s.mx - u.uMouse.value.x) * Math.min(1, dt * 8);
    u.uMouse.value.y += (s.my - u.uMouse.value.y) * Math.min(1, dt * 8);
    u.uStrength.value += (s.strength - u.uStrength.value) * Math.min(1, dt * 5);
    u.uVel.value += (s.vel - u.uVel.value) * Math.min(1, dt * 4);
    u.uRes.value.set(size.width, size.height);
  });

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial ref={mat} vertexShader={vert} fragmentShader={frag} uniforms={uniforms} depthTest={false} />
    </mesh>
  );
}

/** Vista WebGL del tessuto: vive nel DOM, viene disegnata dall'unico <Canvas> condiviso. */
export default function FabricGL({
  urls,
  state,
  className,
  onReady,
}: {
  urls: string[];
  state: React.RefObject<FabricState>;
  className?: string;
  onReady?: () => void;
}) {
  return (
    <View className={className}>
      <Suspense fallback={null}>
        <FabricMesh urls={urls} state={state} onReady={onReady} />
      </Suspense>
    </View>
  );
}
