import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { StockSignal } from "./StockSignal";

describe("StockSignal", () => {
  it("reads 'In stock' above the low-stock threshold", () => {
    render(<StockSignal stock={12} />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("reads 'Only n left' at or below the low-stock threshold", () => {
    render(<StockSignal stock={3} />);
    expect(screen.getByText("Only 3 left")).toBeInTheDocument();
  });

  it("reads 'Only n left' exactly at the threshold boundary", () => {
    render(<StockSignal stock={10} />);
    expect(screen.getByText("Only 10 left")).toBeInTheDocument();
  });

  it("reads 'In stock' just above the threshold boundary", () => {
    render(<StockSignal stock={11} />);
    expect(screen.getByText("In stock")).toBeInTheDocument();
  });

  it("reads 'Sold out' at zero stock", () => {
    render(<StockSignal stock={0} />);
    expect(screen.getByText("Sold out")).toBeInTheDocument();
  });
});
