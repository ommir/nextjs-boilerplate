import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Badge, StatusDot } from "./Badge";

describe("Badge", () => {
  it("renders its label", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies the tone's background class", () => {
    render(<Badge tone="danger">Overdue</Badge>);
    expect(screen.getByText("Overdue").className).toContain("bg-danger-soft");
  });

  it("defaults to the neutral tone", () => {
    render(<Badge>Default</Badge>);
    expect(screen.getByText("Default").className).toContain("bg-surface-muted");
  });

  it("renders a status dot when dot is true", () => {
    render(<Badge dot>Live</Badge>);
    const badge = screen.getByText("Live");
    expect(badge.querySelector("span[aria-hidden]")).toBeInTheDocument();
  });

  it("omits the status dot by default", () => {
    render(<Badge>Live</Badge>);
    const badge = screen.getByText("Live");
    expect(badge.querySelector("span[aria-hidden]")).not.toBeInTheDocument();
  });
});

describe("StatusDot", () => {
  it("renders with the tone's dot color class", () => {
    const { container } = render(<StatusDot tone="warning" />);
    expect(container.firstChild).toHaveClass("bg-warning");
  });
});
