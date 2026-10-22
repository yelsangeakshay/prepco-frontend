import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Button } from "./button";

describe("Button loading", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("disables at once, keeps its accessible name, and marks itself busy", () => {
    render(<Button loading>Save draft</Button>);
    const b = screen.getByRole("button", { name: "Save draft" });
    expect(b).toBeDisabled();
    expect(b).toHaveAttribute("aria-busy", "true");
  });

  it("keeps the name for assistive tech once the spinner shows", () => {
    render(<Button loading>Save draft</Button>);
    act(() => void vi.advanceTimersByTime(200));
    expect(screen.getByRole("button", { name: "Save draft" })).toBeInTheDocument();
  });

  it("is a plain button when not loading", () => {
    render(<Button loading={false}>Go</Button>);
    const b = screen.getByRole("button", { name: "Go" });
    expect(b).toBeEnabled();
    expect(b).not.toHaveAttribute("aria-busy");
  });
});
