import Link from "next/link";

/** Landing hero — states what the shop sells, then points at the catalog. */
export function Hero() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 py-20 text-center lg:px-6 lg:py-28">
      <h1 className="text-hero text-ink text-balance">Production-ready kits for design systems</h1>
      <p className="max-w-xl text-body text-ink-secondary">
        Templates, plugins, and assets built on the Studio design system. Buy once, own the source.
      </p>
      <Link
        href="#catalog"
        className="inline-flex h-9 items-center rounded-sm bg-brand px-4 text-body-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        Browse the catalog
      </Link>
    </section>
  );
}
