import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ProductForm } from "./ProductForm";
import type { Product } from "../types";

const VALID_PRODUCT: Product = {
  id: "prd_test",
  name: "Test Widget Kit",
  summary: "A widget kit for testing.",
  description: "Full description.",
  category: "template",
  price: 42,
  stock: 7,
  imageUrl: "https://example.com/widget.png",
  rating: 4.2,
};

async function fillValidForm() {
  await userEvent.type(screen.getByPlaceholderText("Horizon Dashboard Kit"), "Test Widget Kit");
  await userEvent.type(
    screen.getByPlaceholderText("One-line pitch shown on the catalog card"),
    "A widget kit for testing.",
  );
  await userEvent.type(screen.getByPlaceholderText("189"), "42");
  await userEvent.type(screen.getByPlaceholderText("12"), "7");
  await userEvent.type(screen.getByPlaceholderText("https://…"), "https://example.com/widget.png");
}

describe("ProductForm", () => {
  it("rejects submission when required fields are empty", async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} submitLabel="Create product" />);

    await userEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(screen.getByText("Name is required.")).toBeInTheDocument();
    expect(screen.getByText("Summary is required.")).toBeInTheDocument();
    expect(screen.getByText("Image URL is required.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a negative price", async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} submitLabel="Create product" />);

    await fillValidForm();
    await userEvent.type(screen.getByPlaceholderText("189"), "-5");
    await userEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(screen.getByText("Enter a price of 0 or more.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a negative or non-integer stock", async () => {
    const onSubmit = vi.fn();
    render(<ProductForm onSubmit={onSubmit} submitLabel="Create product" />);

    await fillValidForm();
    await userEvent.type(screen.getByPlaceholderText("12"), "-1");
    await userEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(screen.getByText("Enter a whole number of 0 or more.")).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits normalized values when the form is valid", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm onSubmit={onSubmit} submitLabel="Create product" />);

    await fillValidForm();
    await userEvent.click(screen.getByRole("button", { name: "Create product" }));

    expect(onSubmit).toHaveBeenCalledWith({
      name: "Test Widget Kit",
      summary: "A widget kit for testing.",
      description: "",
      category: "template",
      price: 42,
      stock: 7,
      imageUrl: "https://example.com/widget.png",
      rating: 0,
    });
  });

  it("pre-fills fields and preserves the rating when editing an existing product", async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    render(<ProductForm initialValue={VALID_PRODUCT} onSubmit={onSubmit} submitLabel="Save changes" />);

    expect(screen.getByDisplayValue("Test Widget Kit")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Save changes" }));

    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ rating: 4.2 }));
  });
});
