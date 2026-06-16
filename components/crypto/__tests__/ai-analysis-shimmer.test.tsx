import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AiAnalysisShimmer } from "@/components/crypto/ai-analysis-shimmer";

// The base-breakpoint floor value; present in the generating skeleton's height
// class (`h-[680px]`) and absent from the compact neutral fallback.
const FLOOR_TOKEN = "680px";

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

  it("carries the no-shrink height floor only in the generating variant", () => {
    // The generating skeleton follows the (taller) idle state, so it must hold
    // the height floor to avoid shrinking; the neutral fallback precedes idle
    // and should stay compact and grow into it.
    const { container, rerender } = render(
      <AiAnalysisShimmer footer="generating" />,
    );
    const card = () => container.querySelector('[data-slot="card"]');
    expect(card()?.className).toContain(FLOOR_TOKEN);

    rerender(<AiAnalysisShimmer footer="neutral" />);
    expect(card()?.className ?? "").not.toContain(FLOOR_TOKEN);
  });
});
