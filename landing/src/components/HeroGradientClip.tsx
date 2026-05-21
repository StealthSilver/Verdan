"use client";

import { useEffect } from "react";

const ABOUT_HEADING_SELECTOR = "#the-need h2";
const SCENE_SELECTOR = ".hero-dashboard-scene--gradient-preview";
const GAP_ABOVE_ABOUT_PX = 100;

function updateGradientBottom() {
  const scene = document.querySelector<HTMLElement>(SCENE_SELECTOR);
  const aboutHeading = document.querySelector<HTMLElement>(ABOUT_HEADING_SELECTOR);
  if (!scene || !aboutHeading) return;

  const sceneTop = scene.getBoundingClientRect().top + window.scrollY;
  const cutLine = aboutHeading.getBoundingClientRect().top + window.scrollY - GAP_ABOVE_ABOUT_PX;
  const maxHeight = Math.max(0, cutLine - sceneTop);

  scene.style.setProperty("--hero-gradient-max-height", `${maxHeight}px`);
}

/** Clips the hero gradient so it ends ~100px above the About heading. */
export default function HeroGradientClip() {
  useEffect(() => {
    updateGradientBottom();

    const ro = new ResizeObserver(updateGradientBottom);
    ro.observe(document.documentElement);

    window.addEventListener("resize", updateGradientBottom);
    window.addEventListener("load", updateGradientBottom);

    const fontsReady = document.fonts?.ready;
    if (fontsReady) fontsReady.then(updateGradientBottom);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateGradientBottom);
      window.removeEventListener("load", updateGradientBottom);
    };
  }, []);

  return null;
}
