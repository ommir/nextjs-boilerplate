import "@testing-library/jest-dom";
import { createElement, type ImgHTMLAttributes } from "react";
import { vi } from "vitest";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

vi.mock("next/image", () => ({
  default: ({ fill: _fill, sizes: _sizes, ...rest }: ImgHTMLAttributes<HTMLImageElement> & { fill?: boolean }) =>
    createElement("img", rest),
}));
