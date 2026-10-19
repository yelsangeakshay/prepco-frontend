import { forwardRef, type AnchorHTMLAttributes, type ReactNode } from "react";

/** Storybook stand-in for next/link: a plain anchor. */
const Link = forwardRef<
  HTMLAnchorElement,
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
    prefetch?: boolean;
    children?: ReactNode;
  }
>(function Link({ href, prefetch: _prefetch, children, onClick, ...rest }, ref) {
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        // Stories are not a router: keep the iframe where it is.
        e.preventDefault();
        onClick?.(e);
      }}
      {...rest}
    >
      {children}
    </a>
  );
});

export default Link;
