import { render, screen, fireEvent } from "@testing-library/react";
import PageError from "../error";

const mockRefresh = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: mockRefresh }),
}));

describe("PageError", () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => errorSpy.mockRestore());

  it("shows a message and a retry button", () => {
    render(<PageError error={new Error("boom")} reset={jest.fn()} />);

    expect(screen.getByText("Something went wrong loading this page.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Try again" })).toBeInTheDocument();
  });

  it("logs the error", () => {
    const error = new Error("boom");
    render(<PageError error={error} reset={jest.fn()} />);

    expect(errorSpy).toHaveBeenCalledWith("Unhandled page error:", error);
  });

  it("re-runs the server components and resets the boundary on retry", () => {
    const reset = jest.fn();
    render(<PageError error={new Error("boom")} reset={reset} />);

    fireEvent.click(screen.getByRole("button", { name: "Try again" }));

    expect(mockRefresh).toHaveBeenCalledTimes(1);
    expect(reset).toHaveBeenCalledTimes(1);
  });
});
