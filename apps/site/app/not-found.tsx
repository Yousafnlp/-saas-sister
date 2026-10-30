import { ButtonLink } from '@/components/button';

export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
      <p className="text-sm font-semibold text-primary">404</p>
      <h1 className="mt-3 font-display text-5xl tracking-tight text-foreground">Page not found</h1>
      <p className="mt-4 text-muted-foreground">The page you’re looking for doesn’t exist or has moved.</p>
      <ButtonLink href="/" className="mt-8">
        Back to home
      </ButtonLink>
    </section>
  );
}
