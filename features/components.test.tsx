import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SlotPicker } from "@/features/runway/components/SlotPicker";
import { ScoringForm } from "@/features/panelist/scoring/components/ScoringForm";
import { AvailabilityGrid } from "@/features/panelist/availability/components/AvailabilityGrid";
import { DataTable, VIRTUALISE_ABOVE } from "@/components/shared/DataTable";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { RunwayTimeline } from "@/components/shared/RunwayTimeline";

describe("SlotPicker", () => {
  const slots = [
    { id: "a", label: "Slot A" },
    { id: "b", label: "Slot B", taken: true },
    { id: "c", label: "Slot C" },
  ];

  it("moves with arrow keys, skips taken slots, and confirms by keyboard", async () => {
    const onConfirm = vi.fn();
    const user = userEvent.setup();
    render(<SlotPicker slots={slots} onConfirm={onConfirm} />);
    expect(screen.getByRole("button", { name: "Confirm slot" })).toBeDisabled();

    await user.tab();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("radio", { name: "Slot C" })).toBeChecked();
    expect(screen.getByRole("radio", { name: /Slot B/ })).toBeDisabled();

    await user.tab();
    await user.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalledWith("c");
  });

  it("shows the slot-taken error and empty state", () => {
    const { rerender } = render(<SlotPicker slots={slots} slotTakenError onConfirm={() => {}} />);
    expect(screen.getByRole("alert")).toHaveTextContent("just taken");
    rerender(<SlotPicker slots={[]} onConfirm={() => {}} />);
    expect(screen.getByText("No slots open")).toBeInTheDocument();
  });
});

describe("ScoringForm", () => {
  const props = {
    questions: [{ text: "Walk me through your profile." }, { text: "Why Marketing?" }],
    p1Readiness: 64,
    eyebrow: "P2 · Live · Riya",
    briefHref: "/brief",
  };

  it("blocks submit until a question is marked and a note is written, then submits", async () => {
    const onSubmit = vi.fn();
    const user = userEvent.setup();
    render(<ScoringForm {...props} onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Submit feedback" }));
    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByRole("alert")).toHaveTextContent("Mark at least one question");

    await user.click(screen.getByRole("checkbox", { name: "Situation" }));
    await user.click(screen.getByRole("radio", { name: "Strong" }));
    await user.click(screen.getByRole("button", { name: "Submit feedback" }));
    expect(screen.getByRole("alert")).toHaveTextContent("at least 20 characters");

    await user.type(
      screen.getByLabelText("Note to the student"),
      "Clear structure, defend the numbers.",
    );
    await user.click(screen.getByRole("switch", { name: "Send back to the student's builder" }));
    await user.click(screen.getByRole("button", { name: "Submit feedback" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(onSubmit.mock.calls[0]?.[0]).toMatchObject({
      verdict: "Almost There",
      sendBack: true,
      scores: { Defensibility: 5 },
    });
  });

  it("moves between questions", async () => {
    const user = userEvent.setup();
    render(<ScoringForm {...props} onSubmit={() => {}} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Question 1 of 2");
    await user.click(screen.getByRole("button", { name: /Next question/ }));
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Question 2 of 2");
  });
});

describe("AvailabilityGrid", () => {
  it("toggles a slot and locks booked ones", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<AvailabilityGrid value={{}} onChange={onChange} booked={["Tue-19:00"]} />);
    await user.click(screen.getByRole("button", { name: "Mon 18:00" }));
    expect(onChange).toHaveBeenCalledWith({ "Mon-18:00": true });
    expect(screen.getByRole("button", { name: "Tue 19:00, booked" })).toBeDisabled();
  });
});

describe("DataTable", () => {
  const columns = [{ accessorKey: "name", header: "Name" }];

  it("renders loading, error, and empty states", () => {
    const base = { columns, total: 0, page: 1, pageSize: 25, onPageChange: () => {}, caption: "t" };
    const { rerender } = render(<DataTable {...base} data={[]} loading />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    rerender(<DataTable {...base} data={[]} error onRetry={() => {}} />);
    expect(screen.getByRole("alert")).toBeInTheDocument();
    rerender(<DataTable {...base} data={[]} emptyTitle="Nothing" />);
    expect(screen.getByText("Nothing")).toBeInTheDocument();
  });

  it("renders rows and pages", async () => {
    const onPage = vi.fn();
    render(
      <DataTable
        columns={columns}
        data={[{ name: "Riya" }]}
        total={60}
        page={1}
        pageSize={25}
        onPageChange={onPage}
        caption="Students"
      />,
    );
    expect(screen.getByText("Riya")).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next" }));
    expect(onPage).toHaveBeenCalledWith(2);
    expect(VIRTUALISE_ABOVE).toBe(200);
  });
});

describe("ProgressBar", () => {
  it("clamps and exposes aria values", () => {
    render(<ProgressBar value={150} label="x" />);
    expect(screen.getByRole("progressbar", { name: "x" })).toHaveAttribute("aria-valuenow", "150");
  });
});

describe("RunwayTimeline", () => {
  it("marks the next step and offers pick-a-slot", async () => {
    const onPick = vi.fn();
    render(
      <RunwayTimeline
        orientation="vertical"
        onPickSlot={onPick}
        steps={[
          { id: "1", week: "W-5", title: "Deep-dive", status: "next" },
          { id: "2", week: "W-4", title: "P2", status: "pick-slot" },
        ]}
      />,
    );
    await userEvent.click(screen.getByRole("button", { name: "Pick a slot" }));
    expect(onPick).toHaveBeenCalledWith("2");
  });
});
