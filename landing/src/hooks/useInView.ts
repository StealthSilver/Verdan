"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type UseInViewOptions = IntersectionObserverInit & {
  /** Fire only the first time the element enters view */
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLElement>(
  options?: UseInViewOptions
): { ref: (node: T | null) => void; isInView: boolean } {
  const [node, setNode] = useState<T | null>(null);
  const [isInView, setIsInView] = useState(false);
  const optsRef = useRef(options);
  optsRef.current = options;

  useEffect(() => {
    if (!node) return;
    const { once = true, ...io } = optsRef.current ?? {};

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (entry.isIntersecting) {
          setIsInView(true);
          if (once) obs.disconnect();
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold: 0.12,
        rootMargin: "0px 0px -6% 0px",
        ...io,
      }
    );

    obs.observe(node);
    return () => obs.disconnect();
  }, [node]);

  const ref = useCallback((el: T | null) => {
    setNode(el);
  }, []);

  return { ref, isInView };
}
