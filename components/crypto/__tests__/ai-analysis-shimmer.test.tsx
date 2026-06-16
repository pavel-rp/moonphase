import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { AiAnalysisShimmer } from "@/components/crypto/ai-analysis-shimmer";

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
});
