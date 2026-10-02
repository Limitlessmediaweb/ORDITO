"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { glBus } from "@/lib/glbus";

const GLRoot = dynamic(() => import("./GLRoot"), { ssr: false });

/** Monta il canvas WebGL (e scarica three.js) solo quando una sezione lo chiede. */
export default function GLMount() {
  const needed = useSyncExternalStore(
    glBus.subscribe,
    () => glBus.needed,
    () => false,
  );
  return needed ? <GLRoot /> : null;
}
