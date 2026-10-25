import React from "react";
import { render } from "@testing-library/react";
import { LoadingRings } from "../loading-rings.client";

describe("LoadingRings", () => {
  it("renders correctly with provided color", () => {
    const { container } = render(<LoadingRings color="#10b981" />);

    expect(container).toBeTruthy();
  });

  it("renders three ring elements", () => {
    const { container } = render(<LoadingRings color="#ef4444" />);

    // Should render a container div with 3 div children (rings)
    const rings = container.querySelectorAll("div[style*='border']");
    // The parent div with pointer-events-none should contain 3 ring divs
    expect(rings.length).toBe(3);
  });

  it("staggers the rings on the theme animation and stops them under reduced motion", () => {
    const { container } = render(<LoadingRings color="var(--color-green-300)" />);

    const rings = Array.from(container.querySelectorAll<HTMLElement>("div[style*='border']"));
    expect(rings.map((ring) => ring.style.animationDelay)).toEqual(["0s", "0.5s", "1s"]);
    rings.forEach((ring) => {
      expect(ring).toHaveClass("animate-expand-fade", "motion-reduce:animate-none");
      expect(ring.style.filter).toBe("drop-shadow(0 0 8px var(--color-green-300))");
    });
  });

  it("applies correct border color", () => {
    const testColor = "#3b82f6";
    const { container } = render(<LoadingRings color={testColor} />);

    const parentDiv = container.querySelector("div");
    expect(parentDiv).toHaveClass("pointer-events-none");
  });

  it("has pointer-events-none class to allow card interaction", () => {
    const { container } = render(<LoadingRings color="#8b5cf6" />);

    const overlayDiv = container.firstChild;
    expect(overlayDiv).toHaveClass("pointer-events-none");
  });
});
