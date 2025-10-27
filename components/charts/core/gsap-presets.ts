import { gsap } from "gsap";

export function tweenLift(target: Element, x: number, y: number, active: boolean): void {
  gsap.to(target, {
    duration: 0.35,
    x: active ? x : 0,
    y: active ? y : 0,
    ease: "power3.out",
  });
}

export function tweenGlow(path: SVGPathElement, active: boolean): void {
  gsap.to(path, {
    duration: 0.35,
    filter: active ? "drop-shadow(0px 6px 12px rgba(139,213,255,.35))" : "none",
  });
}

export function countUp(el: HTMLElement, to: number, ease = "power2.out", duration = 0.9): void {
  gsap.killTweensOf(el);
  const obj = { v: 0 } as { v: number };
  gsap.to(obj, {
    v: to,
    duration,
    ease,
    onUpdate: () => {
      el.textContent = Math.round(obj.v).toLocaleString();
    },
  });
}


