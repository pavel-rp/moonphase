import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import {
  AiAnalysisShimmer,
  AI_CARD_MIN_H,
} from "@/components/crypto/ai-analysis-shimmer";

// The min-height floor is the first class in the shared token; any one of its
// classes is enough to detect that the floor was applied.
const MIN_H_CLASS = AI_CARD_MIN_H.split(" ")[0];

describe("AiAnalysisShimmer", () => {
  it("renders the AI-shaped skeleton with aria-busy", () => {
    render(<AiAnalysisShimmer />);

    const root = screen.getByTestId("ai-analysis-shimmer");
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute("aria-busy", "true");
  });

  it("announces via a polite status only in the generating variant", () => {
    const { rerender } = render(<AiAnalysisShimmer footer="generating" />);

    expect(screen.getByRole("status")).toHaveTextContent(/generating analysis/i);

    // The neutral default makes no claim — it resolves into the idle card, so
    // announcing "generating" would be false.
    rerender(<AiAnalysisShimmer footer="neutral" />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("defaults to the neutral footer with no announcement", () => {
    render(<AiAnalysisShimmer />);

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    expect(screen.queryByText(/generating analysis/i)).not.toBeInTheDocument();
  });

  it("carries the no-shrink min-height floor only in the generating variant", () => {
    // The generating skeleton follows the (taller) idle state, so it must hold
    // the floor to avoid shrinking; the neutral fallback precedes idle and
    // should stay compact and grow into it.
    const { container, rerender } = render(
      <AiAnalysisShimmer footer="generating" />,
    );
    expect(container.querySelector(`.${CSS.escape(MIN_H_CLASS)}`)).not.toBeNull();

    rerender(<AiAnalysisShimmer footer="neutral" />);
    expect(container.querySelector(`.${CSS.escape(MIN_H_CLASS)}`)).toBeNull();
  });
});
