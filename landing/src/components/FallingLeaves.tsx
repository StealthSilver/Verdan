"use client";

import { useEffect, useRef } from "react";

interface Leaf {
  el: HTMLDivElement;
  x: number;
  y: number;
  z: number;
  rotation: {
    axis: "X" | "Y" | "Z";
    value: number;
    speed: number;
    x: number;
  };
  xSpeedVariation: number;
  ySpeed: number;
  path: {
    type: number;
    start: number;
  };
  image: number;
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
  timer: number = 0;

  options = {
    numLeaves: 20,
    wind: {
      magnitude: 1.2,
      maxSpeed: 12,
      duration: 300,
      start: 0,
      speed: (t: number, y: number) => 0,
    } as WindConfig,
  };

  constructor(el: HTMLDivElement) {
    this.viewport = el;
    this.world = document.createElement("div");
    this.width = this.viewport.offsetWidth;
    this.height = this.viewport.offsetHeight;
  }

  _resetLeaf = (leaf: Leaf): Leaf => {
    leaf.x = this.width * 2 - Math.random() * this.width * 1.75;
    leaf.y = -10;
    leaf.z = Math.random() * 200;

    if (leaf.x > this.width) {
      leaf.x = this.width + 10;
      leaf.y = (Math.random() * this.height) / 2;
    }

    if (this.timer === 0) {
      leaf.y = Math.random() * this.height;
    }

    leaf.rotation.speed = Math.random() * 10;
    const randomAxis = Math.random();

    if (randomAxis > 0.5) {
      leaf.rotation.axis = "X";
    } else if (randomAxis > 0.25) {
      leaf.rotation.axis = "Y";
      leaf.rotation.x = Math.random() * 180 + 90;
    } else {
      leaf.rotation.axis = "Z";
      leaf.rotation.x = Math.random() * 360 - 180;
      leaf.rotation.speed = Math.random() * 3;
    }

    leaf.xSpeedVariation = Math.random() * 0.8 - 0.4;
    leaf.ySpeed = Math.random() + 1.5;

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
    leaf.el.style.webkitTransform = t;

    if (leaf.x < -10 || leaf.y > this.height + 10) {
      this._resetLeaf(leaf);
    }
  };

  _updateWind = (): void => {
    if (
      this.timer === 0 ||
      this.timer > this.options.wind.start + this.options.wind.duration
    ) {
      this.options.wind.magnitude = Math.random() * this.options.wind.maxSpeed;
      this.options.wind.duration =
        this.options.wind.magnitude * 50 + (Math.random() * 20 - 10);
      this.options.wind.start = this.timer;

      const screenHeight = this.height;

      this.options.wind.speed = ((magnitude, duration) => {
        return (t: number, y: number) => {
          const a =
            (magnitude / 2) * ((screenHeight - (2 * y) / 3) / screenHeight);
          return (
            a * Math.sin(((2 * Math.PI) / duration) * t + (3 * Math.PI) / 2) + a
          );
        };
      })(this.options.wind.magnitude, this.options.wind.duration);
    }
  };

  init = (): void => {
    for (let i = 0; i < this.options.numLeaves; i++) {
      const leaf: Leaf = {
        el: document.createElement("div"),
        x: 0,
        y: 0,
        z: 0,
        rotation: {
          axis: "X",
          value: 0,
          speed: 0,
          x: 0,
        },
        xSpeedVariation: 0,
        ySpeed: 0,
        path: {
          type: 1,
          start: 0,
        },
        image: 1,
      };

      this._resetLeaf(leaf);
      this.leaves.push(leaf);
      this.world.appendChild(leaf.el);
    }

    this.world.className = "leaf-scene";
    this.viewport.appendChild(this.world);

    this.world.style.webkitPerspective = "400px";
    this.world.style.perspective = "400px";

    const self = this;
    window.addEventListener("resize", () => {
      self.width = self.viewport.offsetWidth;
      self.height = self.viewport.offsetHeight;
    });
  };

  render = (): void => {
    this._updateWind();
    for (let i = 0; i < this.leaves.length; i++) {
      this._updateLeaf(this.leaves[i]);
    }

    this.timer++;

    requestAnimationFrame(this.render);
  };
}

export default function FallingLeaves() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const leafScene = new LeafScene(containerRef.current);
    leafScene.init();
    leafScene.render();

    return () => {
      // Cleanup if needed
    };
  }, []);

  return <div ref={containerRef} className="falling-leaves" />;
}
