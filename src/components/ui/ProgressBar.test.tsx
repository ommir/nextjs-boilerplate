import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ProgressBar } from "./ProgressBar";

describe("ProgressBar", () => {
  it("sets aria-valuenow to the rounded value and caps the visual width at 100%", () => {
    render(<ProgressBar value={68} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "68");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
    expect(bar.firstElementChild).toHaveStyle({ width: "68%" });
  });

  it("never lets aria-valuenow exceed aria-valuemax when value is over 100", () => {
    render(<ProgressBar value={124} />);
    const bar = screen.getByRole("progressbar");
    const valueNow = Number(bar.getAttribute("aria-valuenow"));
    const valueMax = Number(bar.getAttribute("aria-valuemax"));
    expect(valueNow).toBeLessThanOrEqual(valueMax);
    expect(bar).toHaveAttribute("aria-valuenow", "124");
    expect(bar).toHaveAttribute("aria-valuemax", "124");
  });

  it("caps the visual fill width at 100% even when the value exceeds it", () => {
    render(<ProgressBar value={118} />);
    const bar = screen.getByRole("progressbar");
    expect(bar.firstElementChild).toHaveStyle({ width: "100%" });
  });

  it("includes the label in aria-valuetext and aria-label", () => {
    render(<ProgressBar value={92} label="utilization" />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuetext", "92% utilization");
    expect(bar).toHaveAttribute("aria-label", "utilization");
  });

  it("escalates tone to danger at or above 100 when no explicit tone is given", () => {
    render(<ProgressBar value={100} />);
    const fill = screen.getByRole("progressbar").firstElementChild;
    expect(fill).toHaveClass("bg-danger");
  });

  it("escalates tone to warning between 85 and 99", () => {
    render(<ProgressBar value={90} />);
    const fill = screen.getByRole("progressbar").firstElementChild;
    expect(fill).toHaveClass("bg-warning");
  });

  it("uses success tone below 85", () => {
    render(<ProgressBar value={50} />);
    const fill = screen.getByRole("progressbar").firstElementChild;
    expect(fill).toHaveClass("bg-success");
  });

  it("respects an explicit tone override regardless of value", () => {
    render(<ProgressBar value={10} tone="info" />);
    const fill = screen.getByRole("progressbar").firstElementChild;
    expect(fill).toHaveClass("bg-info");
  });
});
