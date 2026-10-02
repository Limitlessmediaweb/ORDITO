"use client";

import { useSyncExternalStore } from "react";
import { Canvas } from "@react-three/fiber";
import { View } from "@react-three/drei";
import { glBus } from "@/lib/glbus";

/** L'unico <Canvas> del sito: fisso a tutto schermo, disegna solo dentro le <View> attive. */
export default function GLRoot() {
  const active = useSyncExternalStore(glBus.subscribe, () => glBus.active, () => false);
  return (
    <Canvas
      eventSource={typeof document !== "undefined" ? document.body : undefined}
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.75]}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 1, visibility: active ? "visible" : "hidden" }}
      aria-hidden="true"
    >
      <View.Port />
    </Canvas>
  );
}
