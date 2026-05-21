"use client";

import { useEffect, useRef } from "react";

const LEAF_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'%3E%3Cpath d='M10 2C10 2 5 8 5 12C5 15.3 7.2 18 10 18C12.8 18 15 15.3 15 12C15 8 10 2 10 2Z' fill='%2348845c'/%3E%3Cpath d='M10 18C11.1 18 12 17.1 12 16C12 15.9 11.9 15.8 11.8 15.7C10.6 16.2 9.4 16.2 8.2 15.7C8.1 15.8 8 15.9 8 16C8 17.1 8.9 18 10 18Z' fill='%233d7149'/%3E%3C/svg%3E";

interface Leaf {
  el: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  size: number;
  rotation: {
    axis: "X" | "Y" | "Z";
    value: number;
    speed: number;
    x: number;
  };
  xSpeedVariation: number;
  ySpeed: number;
}

interface WindConfig {
  magnitude: number;
  maxSpeed: number;
  duration: number;
  start: number;
  speed: (t: number, y: number) => number;
}

class LeafScene {
  viewport: HTMLDivElement;
  world: HTMLDivElement;
  leaves: Leaf[] = [];
  width: number;
  height: number;
  timer = 0;
  rafId = 0;
  resizeObserver: ResizeObserver | null = null;
  boundRender: () => void;

  options = {
    numLeaves: 22,
    wind: {
      magnitude: 0.8,
      maxSpeed: 6.5,
      duration: 300,
      start: 0,
      speed: () => 0,
    } as WindConfig,
  };

  constructor(el: HTMLDivElement) {
    this.viewport = el;
    this.world = document.createElement("div");
    this.width = el.offsetWidth;
    this.height = el.offsetHeight;
    this.boundRender = this.render.bind(this);
  }

  _resetLeaf = (leaf: Leaf): Leaf => {
    leaf.x = this.width * 2 - Math.random() * this.width * 1.75;
    leaf.y = -10;
    leaf.z = Math.random() * 160;

    if (leaf.x > this.width) {
      leaf.x = this.width + 10;
      leaf.y = (Math.random() * this.height) / 2;
    }

    if (this.timer === 0) {
      leaf.y = Math.random() * this.height;
    }

    leaf.rotation.speed = Math.random() * 2.2 + 0.4;
    const randomAxis = Math.random();

    if (randomAxis > 0.5) {
      leaf.rotation.axis = "X";
    } else if (randomAxis > 0.25) {
      leaf.rotation.axis = "Y";
      leaf.rotation.x = Math.random() * 180 + 90;
    } else {
      leaf.rotation.axis = "Z";
      leaf.rotation.x = Math.random() * 360 - 180;
      leaf.rotation.speed = Math.random() * 1.2 + 0.3;
    }

    leaf.xSpeedVariation = Math.random() * 0.28 - 0.14;
    leaf.ySpeed = Math.random() * 0.35 + 0.22;

    return leaf;
  };

  _updateLeaf = (leaf: Leaf): void => {
    const leafWindSpeed = this.options.wind.speed(
      this.timer - this.options.wind.start,
      leaf.y
    );

    const xSpeed = leafWindSpeed + leaf.xSpeedVariation;
    leaf.x -= xSpeed;
    leaf.y += leaf.ySpeed;
    leaf.rotation.value += leaf.rotation.speed;

    let t = `translateX(${leaf.x}px) translateY(${leaf.y}px) translateZ(${leaf.z}px) rotate${leaf.rotation.axis}(${leaf.rotation.value}deg)`;
    if (leaf.rotation.axis !== "X") {
      t += ` rotateX(${leaf.rotation.x}deg)`;
    }

    leaf.el.style.transform = t;

    if (leaf.x < -10 || leaf.y > this.height + 10) {
      this._resetLeaf(leaf);
    }
  };

  _updateWind = (): void => {
    if (
      this.timer === 0 ||
      this.timer > this.options.wind.start + this.options.wind.duration
    ) {
      this.options.wind.magnitude =
        Math.random() * this.options.wind.maxSpeed * 0.45 + 0.15;
      this.options.wind.duration =
        this.options.wind.magnitude * 80 + (Math.random() * 30 - 15);
      this.options.wind.start = this.timer;

      const screenHeight = this.height;
      const magnitude = this.options.wind.magnitude;
      const duration = this.options.wind.duration;

      this.options.wind.speed = (t: number, y: number) => {
        const a =
          (magnitude / 2) * ((screenHeight - (2 * y) / 3) / screenHeight);
        return (
          a * Math.sin(((2 * Math.PI) / duration) * t + (3 * Math.PI) / 2) + a
        );
      };
    }
  };

  init = (): void => {
    for (let i = 0; i < this.options.numLeaves; i++) {
      const size = 14 + Math.random() * 10;
      const leaf: Leaf = {
        el: document.createElement("div"),
        x: 0,
        y: 0,
        z: 0,
        size,
        rotation: {
          axis: "X",
          value: 0,
          speed: 0,
          x: 0,
        },
        xSpeedVariation: 0,
        ySpeed: 0,
      };

      leaf.el.style.width = `${size}px`;
      leaf.el.style.height = `${size}px`;
      leaf.el.style.backgroundImage = `url("${LEAF_SVG}")`;
      leaf.el.style.opacity = `${0.45 + Math.random() * 0.4}`;

      this._resetLeaf(leaf);
      this.leaves.push(leaf);
      this.world.appendChild(leaf.el);
    }

    this.world.className = "leaf-scene";
    this.viewport.appendChild(this.world);
    this.world.style.perspective = "400px";

    this.resizeObserver = new ResizeObserver(() => {
      this.width = this.viewport.offsetWidth;
      this.height = this.viewport.offsetHeight;
    });
    this.resizeObserver.observe(this.viewport);
  };

  render = (): void => {
    this._updateWind();
    for (let i = 0; i < this.leaves.length; i++) {
      this._updateLeaf(this.leaves[i]);
    }
    this.timer++;
    this.rafId = requestAnimationFrame(this.boundRender);
  };

  destroy = (): void => {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
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
