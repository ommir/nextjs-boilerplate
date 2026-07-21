import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-metric text-ink-muted tabular">404</p>
      <div>
        <h1 className="text-section text-ink">Page not found</h1>
        <p className="mt-1 text-body-sm text-ink-muted">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
      </div>
      <Link
        href="/dashboard"
        className="inline-flex h-9 items-center rounded-sm bg-brand px-3 text-body-sm font-semibold text-ink-inverse transition-colors hover:bg-brand-hover"
      >
        Back to dashboard
      </Link>
    </div>
  );
}
