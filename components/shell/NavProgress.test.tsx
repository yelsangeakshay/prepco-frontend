import { act, render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { startNav, stopNav } from "@/lib/nav/progress";
import { NavProgress } from "./NavProgress";

vi.mock("next/navigation", () => ({
  usePathname: () => "/home",
  useSearchParams: () => new URLSearchParams(),
}));

const bar = (c: HTMLElement) => c.querySelector(".nav-progress-run");

describe("NavProgress", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    act(() => stopNav());
    vi.useRealTimers();
  });

  it("never shows for a navigation that finishes inside 150 ms", () => {
    const { container } = render(<NavProgress />);
    act(() => startNav());
    act(() => void vi.advanceTimersByTime(100));
    act(() => stopNav());
    act(() => void vi.advanceTimersByTime(1000));
    expect(bar(container)).toBeNull();
  });

  it("shows after 150 ms, stays at least 300 ms, then clears", () => {
    const { container } = render(<NavProgress />);
    act(() => startNav());
    act(() => void vi.advanceTimersByTime(160));
    expect(bar(container)).not.toBeNull();
    act(() => stopNav());
    act(() => void vi.advanceTimersByTime(200));
    expect(container.querySelector("[aria-hidden]")).not.toBeNull();
    act(() => void vi.advanceTimersByTime(600));
    expect(container.querySelector("[aria-hidden]")).toBeNull();
  });

  it("stops by itself after 10 s when the URL never changes", () => {
    const { container } = render(<NavProgress />);
    act(() => startNav());
    act(() => void vi.advanceTimersByTime(200));
    expect(bar(container)).not.toBeNull();
    act(() => void vi.advanceTimersByTime(10_500));
    act(() => void vi.advanceTimersByTime(300));
    expect(bar(container)).toBeNull();
  });

  it("announces once after 1 s", () => {
    const { getByRole } = render(<NavProgress />);
    act(() => startNav());
    expect(getByRole("status")).toHaveTextContent("");
    act(() => void vi.advanceTimersByTime(1100));
    expect(getByRole("status")).toHaveTextContent("Loading page");
  });
});
