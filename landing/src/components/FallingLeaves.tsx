"use client";

import { useEffect, useRef } from "react";

const LEAF_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M10 2C10 2 5 8 5 12C5 15.3 7.2 18 10 18C12.8 18 15 15.3 15 12C15 8 10 2 10 2Z' fill='%2348845c'/%3E%3Cpath d='M10 18C11.1 18 12 17.1 12 16C12 15.9 11.9 15.8 11.8 15.7C10.6 16.2 9.4 16.2 8.2 15.7C8.1 15.8 8 15.9 8 16C8 17.1 8.9 18 10 18Z' fill='%233d7149'/%3E%3C/svg%3E";

const DASHBOARD_CLIP_SELECTOR = ".hero-dashboard-panel-wrap";
const FRAME_INTERVAL = 2;
const SPAWN_INTERVAL = 110;
const INITIAL_SPAWN_GAP = 130;

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
  nextSpawnAt = 0;
  rafId = 0;
  paused = false;
  allowSpawnThisTick = true;
  resizeObserver: ResizeObserver | null = null;
  boundRender: () => void;
  boundMeasure: () => void;
  boundOnScroll: () => void;

  options = {
    numLeaves: 6,
    spawnInterval: SPAWN_INTERVAL,
    windDrift: 0.62,
  };

  constructor(el: HTMLDivElement) {
    this.viewport = el;
    this.world = document.createElement("div");
    this.boundRender = this.render.bind(this);
    this.boundMeasure = this.measureBounds.bind(this);
    this.boundOnScroll = this.onScroll.bind(this);
  }

  measureBounds = (): void => {
    this.width = this.viewport.offsetWidth;
    const vhCap = window.innerHeight * 1.14;
    this.height = Math.min(this.viewport.offsetHeight, vhCap);
    const containerRect = this.viewport.getBoundingClientRect();
    this.clipY = window.innerHeight * 0.85 - containerRect.top;
  };

  onScroll = (): void => {
    const pastHero = window.scrollY >= window.innerHeight;
    if (pastHero !== this.paused) {
      this.paused = pastHero;
      if (pastHero) {
        for (const leaf of this.leaves) {
          leaf.active = false;
          leaf.el.style.visibility = "hidden";
        }
      } else {
        this._staggerAllRespawns();
      }
    }
    this.measureBounds();
  };

  /** Avoid a burst of leaves when returning to the hero after scroll */
  _staggerAllRespawns = (): void => {
    let slot = this.timer + this.options.spawnInterval;
    for (const leaf of this.leaves) {
      leaf.active = false;
      leaf.spawnAt = slot;
      leaf.el.style.visibility = "hidden";
      slot += this.options.spawnInterval + 28;
    }
    this.nextSpawnAt = slot;
  };

  _applyLeafMotion = (leaf: Leaf): void => {
    leaf.rotationSpeed = (Math.random() - 0.5) * 3 + 1.8;
    leaf.xDrift = Math.random() * 0.45 - 0.35;
    leaf.ySpeed = Math.random() * 0.45 + 0.95;
    leaf.rotation = Math.random() * 360;
  };

  /** Spawn in separate lanes so leaves stay visually apart */
  _placeAtTopRight = (leaf: Leaf): void => {
    const lanes = this.options.numLeaves;
    const spread = Math.min(this.width * 0.55, 480);
    const laneWidth = spread / lanes;
    const startX = this.width - 8 - spread;
    leaf.x =
      startX +
      leaf.lane * laneWidth +
      Math.random() * laneWidth * 0.55;
    leaf.y = -(Math.random() * 16 + leaf.lane * 14 + 8);
  };

  _hideLeaf = (leaf: Leaf): void => {
    leaf.active = false;
    leaf.el.style.visibility = "hidden";
  };

  _activateLeaf = (leaf: Leaf): void => {
    this._applyLeafMotion(leaf);
    this._placeAtTopRight(leaf);
    leaf.active = true;
    leaf.el.style.visibility = "visible";
    this._applyTransform(leaf);
  };

  _scheduleRespawn = (leaf: Leaf): void => {
    const gap =
      this.options.spawnInterval + Math.floor(Math.random() * 24) + 12;
    leaf.spawnAt = Math.max(this.timer + 1, this.nextSpawnAt);
    this.nextSpawnAt = leaf.spawnAt + gap;
    this._hideLeaf(leaf);
  };

  _applyTransform = (leaf: Leaf): void => {
    leaf.el.style.transform = `translate3d(${leaf.x}px,${leaf.y}px,0) rotate(${leaf.rotation}deg)`;
  };

  _updateLeaf = (leaf: Leaf): void => {
    if (!leaf.active) {
      if (this.timer >= leaf.spawnAt && this.allowSpawnThisTick) {
        this.allowSpawnThisTick = false;
        this._activateLeaf(leaf);
      }
      return;
    }

    leaf.x -= this.options.windDrift + leaf.xDrift;
    leaf.y += leaf.ySpeed;
    leaf.rotation += leaf.rotationSpeed;
    this._applyTransform(leaf);

    if (leaf.x < -28 || leaf.y > this.clipY) {
      this._scheduleRespawn(leaf);
    }
  };

  init = (): void => {
    for (let i = 0; i < this.options.numLeaves; i++) {
      const size = 14 + Math.random() * 8;
      const leaf: Leaf = {
        el: document.createElement("div"),
        x: 0,
        y: 0,
        active: false,
        spawnAt: i * INITIAL_SPAWN_GAP,
        lane: i,
        rotation: 0,
        rotationSpeed: 0,
        xDrift: 0,
        ySpeed: 0,
      };

      leaf.el.style.width = `${size}px`;
      leaf.el.style.height = `${size}px`;
      leaf.el.style.backgroundImage = `url("${LEAF_SVG}")`;
      leaf.el.style.opacity = `${0.72 + Math.random() * 0.2}`;
      leaf.el.style.visibility = "hidden";

      this.leaves.push(leaf);
      this.world.appendChild(leaf.el);
    }

    this.nextSpawnAt = this.options.numLeaves * INITIAL_SPAWN_GAP;
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
    this.rafId = requestAnimationFrame(this.boundRender);

    if (this.paused) return;

    this.frame++;
    if (this.frame % FRAME_INTERVAL !== 0) return;

    this.timer++;
    this.allowSpawnThisTick = true;
    for (let i = 0; i < this.leaves.length; i++) {
      this._updateLeaf(this.leaves[i]);
    }
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
      "(prefers-reduced-motion: reduce)"
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
