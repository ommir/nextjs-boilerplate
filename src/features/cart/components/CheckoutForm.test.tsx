import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CheckoutForm } from "./CheckoutForm";

describe("CheckoutForm", () => {
  it("shows the demo notice and never renders any payment fields", () => {
    render(<CheckoutForm onPlaceOrder={vi.fn()} />);
    expect(screen.getByText(/Demo checkout/)).toBeInTheDocument();
    expect(screen.queryByLabelText(/card/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/card number/i)).not.toBeInTheDocument();
  });

  it("rejects an invalid email and does not call onPlaceOrder", async () => {
    const onPlaceOrder = vi.fn();
    render(<CheckoutForm onPlaceOrder={onPlaceOrder} />);

    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));

    expect(screen.getByRole("alert")).toHaveTextContent("Enter a valid email address.");
    expect(onPlaceOrder).not.toHaveBeenCalled();
  });

  it("calls onPlaceOrder with the email when valid", async () => {
    const onPlaceOrder = vi.fn();
    render(<CheckoutForm onPlaceOrder={onPlaceOrder} />);

    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "buyer@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));

    expect(onPlaceOrder).toHaveBeenCalledWith("buyer@example.com");
  });

  it("clears a previous error once the user edits the email again", async () => {
    render(<CheckoutForm onPlaceOrder={vi.fn()} />);

    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "bad");
    await userEvent.click(screen.getByRole("button", { name: "Place order" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText("you@company.com"), "@example.com");
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});
