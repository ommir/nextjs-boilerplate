import { siteConfig } from "@/config/site";

/** Public storefront footer. */
export function StorefrontFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center gap-1 px-4 py-8 text-center lg:px-6">
        <p className="text-body-sm font-semibold text-ink">{siteConfig.name}</p>
        <p className="text-caption text-ink-muted">{siteConfig.description}</p>
      </div>
    </footer>
  );
}
