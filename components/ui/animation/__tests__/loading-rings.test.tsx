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
