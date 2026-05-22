"use client";

import { useEffect, useRef } from "react";

const LEAF_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M10 2C10 2 5 8 5 12C5 15.3 7.2 18 10 18C12.8 18 15 15.3 15 12C15 8 10 2 10 2Z' fill='%2348845c'/%3E%3Cpath d='M10 18C11.1 18 12 17.1 12 16C12 15.9 11.9 15.8 11.8 15.7C10.6 16.2 9.4 16.2 8.2 15.7C8.1 15.8 8 15.9 8 16C8 17.1 8.9 18 10 18Z' fill='%233d7149'/%3E%3C/svg%3E";

const DASHBOARD_CLIP_SELECTOR = ".hero-dashboard-panel-wrap";

/** Deterministic 0..1 from leaf index (stable per lane, no Math.random per frame). */
function hash01(index: number, salt: number): number {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Leaf {
  el: HTMLDivElement;
  x: number;
  y: number;
  active: boolean;
  spawnAt: number;
  lane: number;
  rotation: number;
  rotationSpeed: number;
  xDrift: number;
  ySpeed: number;
  windBias: number;
}

class LeafScene {
  viewport: HTMLDivElement;
  world: HTMLDivElement;
  leaves: Leaf[] = [];
  width = 0;
  height = 0;
  clipY = 0;
  timer = 0;
  frame = 0;
  rafId = 0;
  paused = false;
  /** Next frame index when a leaf may enter (evenly spaced queue). */
  spawnQueueTail = 0;
  resizeObserver: ResizeObserver | null = null;
  boundRender: () => void;
  boundMeasure: () => void;
  boundOnScroll: () => void;

  options = {
    numLeaves: 28,
    windDrift: 3.1,
    /** Filled in measureBounds from viewport height ÷ leaf count */
    spawnSpacing: 10,
  };

  constructor(el: HTMLDivElement) {
    this.viewport = el;
    this.world = document.createElement("div");
    this.boundRender = this.render.bind(this);
    this.boundMeasure = this.measureBounds.bind(this);
    this.boundOnScroll = this.onScroll.bind(this);
  }

  _updateSpawnSpacing = (): void => {
    const avgFallSpeed = 3.05;
    const fallDistance = Math.max(this.clipY + 48, 320);
    const fallFrames = Math.ceil(fallDistance / avgFallSpeed);
    this.options.spawnSpacing = Math.max(
      7,
      Math.round(fallFrames / this.options.numLeaves),
    );
  };

  _enqueueSpawn = (): number => {
    const at = Math.max(this.timer, this.spawnQueueTail);
    this.spawnQueueTail = at + this.options.spawnSpacing;
    return at;
  };

  measureBounds = (): void => {
    this.width = this.viewport.offsetWidth;
    const vhCap = window.innerHeight * 1.14;
    this.height = Math.min(this.viewport.offsetHeight, vhCap);
    const containerRect = this.viewport.getBoundingClientRect();
    this.clipY = window.innerHeight * 0.85 - containerRect.top;
    this._updateSpawnSpacing();
  };

  onScroll = (): void => {
    const pastHero = window.scrollY >= window.innerHeight;
    if (pastHero !== this.paused) {
      this.paused = pastHero;
      if (pastHero) {
        cancelAnimationFrame(this.rafId);
        this.rafId = 0;
        for (const leaf of this.leaves) {
          leaf.active = false;
          leaf.el.style.visibility = "hidden";
        }
      } else {
        this._staggerAllRespawns();
        this.render();
      }
    }
    this.measureBounds();
  };

  _staggerAllRespawns = (): void => {
    this.spawnQueueTail = this.timer;
    for (let i = 0; i < this.leaves.length; i++) {
      const leaf = this.leaves[i];
      leaf.active = false;
      leaf.spawnAt = this._enqueueSpawn();
      leaf.el.style.visibility = "hidden";
    }
  };

  _applyLeafMotion = (leaf: Leaf): void => {
    const i = leaf.lane;
    leaf.rotationSpeed = (hash01(i, 1) - 0.5) * 4.2 + 3.1;
    leaf.xDrift = hash01(i, 2) * 0.35 - 0.17;
    leaf.ySpeed = 2.15 + hash01(i, 3) * 1.95;
    leaf.windBias = (hash01(i, 4) - 0.5) * 1.4;
    leaf.rotation = hash01(i, 5) * 360;
  };

  _placeAtSpawn = (leaf: Leaf): void => {
    const n = this.options.numLeaves;
    const spread = Math.min(this.width * 0.9, 860);
    const zoneLeft = Math.max(8, this.width - spread);
    const laneT = (leaf.lane + hash01(leaf.lane, 6) * 0.72) / n;
    leaf.x = zoneLeft + laneT * spread;

    const verticalBand = Math.min(160, this.clipY * 0.22);
    const phase = (leaf.lane + 0.5) / n;
    leaf.y = -10 - phase * verticalBand - hash01(leaf.lane, 7) * 18;
  };

  _hideLeaf = (leaf: Leaf): void => {
    leaf.active = false;
    leaf.el.style.visibility = "hidden";
  };

  _activateLeaf = (leaf: Leaf): void => {
    this._applyLeafMotion(leaf);
    this._placeAtSpawn(leaf);
    leaf.active = true;
    leaf.el.style.visibility = "visible";
    this._applyTransform(leaf);
  };

  _scheduleRespawn = (leaf: Leaf): void => {
    leaf.spawnAt = this._enqueueSpawn();
    this._hideLeaf(leaf);
  };

  _applyTransform = (leaf: Leaf): void => {
    leaf.el.style.transform = `translate3d(${leaf.x}px,${leaf.y}px,0) rotate(${leaf.rotation}deg)`;
  };

  _updateLeaf = (leaf: Leaf): void => {
    if (!leaf.active) {
      if (this.timer >= leaf.spawnAt) {
        this._activateLeaf(leaf);
      }
      return;
    }

    leaf.x -= this.options.windDrift + leaf.windBias + leaf.xDrift;
    leaf.y += leaf.ySpeed;
    leaf.rotation += leaf.rotationSpeed;
    this._applyTransform(leaf);

    if (leaf.x < -28 || leaf.y > this.clipY) {
      this._scheduleRespawn(leaf);
    }
  };

  init = (): void => {
    this.spawnQueueTail = 0;
    for (let i = 0; i < this.options.numLeaves; i++) {
      const size = 14 + hash01(i, 8) * 8;
      const leaf: Leaf = {
        el: document.createElement("div"),
        x: 0,
        y: 0,
        active: false,
        spawnAt: this._enqueueSpawn(),
        lane: i,
        rotation: 0,
        rotationSpeed: 0,
        xDrift: 0,
        ySpeed: 0,
        windBias: 0,
      };

      leaf.el.style.width = `${size}px`;
      leaf.el.style.height = `${size}px`;
      leaf.el.style.backgroundImage = `url("${LEAF_SVG}")`;
      leaf.el.style.opacity = `${0.72 + hash01(i, 9) * 0.2}`;
      leaf.el.style.visibility = "hidden";

      this.leaves.push(leaf);
      this.world.appendChild(leaf.el);
    }

    this.world.className = "leaf-scene";
    this.viewport.appendChild(this.world);

    this.measureBounds();
    this.resizeObserver = new ResizeObserver(this.boundMeasure);
    this.resizeObserver.observe(this.viewport);

    const dashboard = document.querySelector(DASHBOARD_CLIP_SELECTOR);
    if (dashboard) {
      this.resizeObserver.observe(dashboard);
    }

    window.addEventListener("scroll", this.boundOnScroll, { passive: true });
    window.addEventListener("resize", this.boundMeasure, { passive: true });
    this.onScroll();
  };

  render = (): void => {
    if (this.paused) return;

    this.frame++;
    this.timer++;
    for (let i = 0; i < this.leaves.length; i++) {
      this._updateLeaf(this.leaves[i]);
    }

    this.rafId = requestAnimationFrame(this.boundRender);
  };

  destroy = (): void => {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    window.removeEventListener("scroll", this.boundOnScroll);
    window.removeEventListener("resize", this.boundMeasure);
    this.world.remove();
    this.leaves = [];
  };
}

type FallingLeavesProps = {
  className?: string;
};

export default function FallingLeaves({ className = "" }: FallingLeavesProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReducedMotion) return;

    const leafScene = new LeafScene(container);
    leafScene.init();
    leafScene.render();

    return () => {
      leafScene.destroy();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`falling-leaves ${className}`.trim()}
      aria-hidden
    />
  );
}
