/**
 * Navigation link helpers.
 */

/** Normalises a path for comparisons ("/blog/" -> "/blog") */
export function normalizePath(path: string): string {
  const clean = path.split(/[?#]/)[0];
  return clean.length > 1 ? clean.replace(/\/+$/, '') : clean;
}

/**
 * Link attributes for a navigation link. A link that points to the current page gets
 * `aria-current="page"` and the `w--current` class (the template's active link style).
 */
export function currentLink(href: string, pathname: string, className: string) {
  const isCurrent = href.startsWith('/') && normalizePath(href) === normalizePath(pathname);
  return {
    href,
    class: isCurrent ? `${className} w--current` : className,
    'aria-current': isCurrent ? ('page' as const) : undefined,
  };
}
