import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

describe("Button", () => {
  it("renders its children", () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole("button", { name: "Save changes" })).toBeInTheDocument();
  });

  it("applies the variant and size classes", () => {
    render(
      <Button variant="danger" size="sm">
        Delete
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Delete" });
    expect(button.className).toContain("bg-danger");
    expect(button.className).toContain("h-8");
  });

  it("keeps the primary variant's text-color utility alongside the size's custom font-size utility", () => {
    // Regression test: tailwind-merge doesn't know this project's custom
    // @theme font-size scale (text-body-sm, text-caption, ...), so its
    // default text-color catch-all used to misclassify them as colors and
    // silently drop text-ink-inverse — rendering invisible dark-on-dark text
    // on the primary button. Locks in the extendTailwindMerge fix in utils.ts.
    render(<Button variant="primary">Sign in</Button>);
    const button = screen.getByRole("button", { name: "Sign in" });
    expect(button.className).toContain("text-ink-inverse");
    expect(button.className).toContain("text-body-sm");
  });

  it("disables the button and shows a spinner while isLoading", () => {
    render(<Button isLoading>Submit</Button>);
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toBeDisabled();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onClick when clicked", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Go</Button>);
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Go
      </Button>,
    );
    await userEvent.click(screen.getByRole("button", { name: "Go" }));
    expect(onClick).not.toHaveBeenCalled();
  });
});
