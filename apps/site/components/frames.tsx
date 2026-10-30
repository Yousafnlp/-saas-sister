import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { Lock } from 'lucide-react';
import type { Screenshot } from '@/lib/screenshots';
import { cn } from '@/lib/utils';

/** A desktop browser window around a screenshot. */
export function BrowserFrame({ url, children, className }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-xl border border-border bg-card shadow-frame', className)}>
      <div className="flex items-center gap-3 border-b border-border bg-muted/70 px-3 py-2 sm:px-4 sm:py-2.5" aria-hidden="true">
        <div className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="mx-auto flex min-w-0 items-center gap-1.5 rounded-md border border-border bg-background px-3 py-1 text-[11px] text-muted-foreground sm:text-xs">
          <Lock className="size-3 shrink-0" />
          <span className="truncate">{url}</span>
        </div>
        <div className="w-[42px]" />
      </div>
      {children}
    </div>
  );
}

/** A phone around a mobile screenshot. */
export function PhoneFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('relative rounded-[2.4rem] bg-neutral-900 p-[3.5%] shadow-frame ring-1 ring-neutral-700/60', className)}>
      <div className="relative overflow-hidden rounded-[2rem] bg-background">{children}</div>
    </div>
  );
}

/** Part of a screenshot, as fractions of its width and height. */
export interface Crop {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** The app's content area: everything right of the sidebar and below the top bar. */
export const CONTENT_AREA: Crop = { x: 0.168, y: 0.062, w: 0.832, h: 0.92 };

interface ShotProps {
  shot: Screenshot;
  alt: string;
  /** Rendered width of the whole image; with a crop that is wider than the box. */
  sizes: string;
  className?: string;
  preload?: boolean;
  eager?: boolean;
  crop?: Crop;
}

export function Shot({ shot, alt, sizes, className, preload, eager, crop }: ShotProps) {
  if (!crop) {
    return (
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={alt}
        sizes={sizes}
        preload={preload}
        loading={eager ? 'eager' : undefined}
        className={cn('block h-auto w-full', className)}
      />
    );
  }

  // The box keeps the crop's proportions; the full image is scaled up and shifted so only the crop shows.
  const style: CSSProperties = {
    position: 'absolute',
    maxWidth: 'none',
    width: `${100 / crop.w}%`,
    height: 'auto',
    left: `${(-crop.x / crop.w) * 100}%`,
    top: `${(-crop.y / crop.h) * 100}%`,
  };
  return (
    <div
      className={cn('relative w-full overflow-hidden', className)}
      style={{ aspectRatio: (crop.w * shot.width) / (crop.h * shot.height) }}
    >
      <Image
        src={shot.src}
        width={shot.width}
        height={shot.height}
        alt={alt}
        sizes={sizes}
        preload={preload}
        loading={eager ? 'eager' : undefined}
        style={style}
      />
    </div>
  );
}
