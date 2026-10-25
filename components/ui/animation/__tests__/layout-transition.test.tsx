import React from "react";
import { render, screen } from "@testing-library/react";
import { LayoutTransition } from "../layout-transition.client";

let mockOnExitComplete: (() => void) | undefined;
const mockOnAnimationComplete = jest.fn();

jest.mock("motion/react", () => ({
  AnimatePresence: ({
    children,
    onExitComplete,
  }: {
    children: React.ReactNode;
    onExitComplete?: () => void;
  }) => {
    mockOnExitComplete = onExitComplete;
    return <>{children}</>;
  },
  motion: {
    div: ({
      children,
      onAnimationComplete,
    }: {
      children?: React.ReactNode;
      onAnimationComplete?: () => void;
    }) => {
      if (onAnimationComplete) mockOnAnimationComplete();
      return <div data-testid="page">{children}</div>;
    },
  },
}));

jest.mock("next/navigation", () => ({
  useSelectedLayoutSegment: () => "details",
}));

describe("LayoutTransition", () => {
  let scrollTo: jest.SpyInstance;

  beforeEach(() => {
    mockOnExitComplete = undefined;
    mockOnAnimationComplete.mockClear();
    scrollTo = jest.spyOn(window, "scrollTo").mockImplementation(() => {});
  });

  afterEach(() => {
    scrollTo.mockRestore();
  });

  it("renders the current page", () => {
    render(
      <LayoutTransition>
        <p>Details page</p>
      </LayoutTransition>
    );

    expect(screen.getByText("Details page")).toBeInTheDocument();
  });

  it("scrolls to the top after the old page exits, before the new one enters", () => {
    render(
      <LayoutTransition>
        <p>Details page</p>
      </LayoutTransition>
    );

    // The entering page no longer scrolls when its own animation completes.
    expect(mockOnAnimationComplete).not.toHaveBeenCalled();
    expect(scrollTo).not.toHaveBeenCalled();

    mockOnExitComplete!();
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "instant" });
  });
});
